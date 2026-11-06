import { prisma } from '@/lib/prisma';
import { generateGrammarQuestionsBatch } from '@/lib/ai/generator';
import { QuestionPayload, CefrLevel } from '@/types';

const BATCH_SIZE = 10;
const BUFFER_REFILL_THRESHOLD = 3;

/**
 * Background worker to replenish QuestionBuffer with a batch of questions.
 * 1 single API call stores 10 questions in the buffer.
 */
export async function refillQuestionBuffer(
  userId: string,
  topicId: string,
  level: CefrLevel,
  topicTitle: string,
  topicRules: string
) {
  try {
    const questions = await generateGrammarQuestionsBatch({
      topicTitle,
      topicRules,
      level,
      count: BATCH_SIZE,
    });

    // Save batch into buffer
    await prisma.$transaction(
      questions.map((q) =>
        prisma.questionBuffer.create({
          data: {
            userId,
            topicId,
            questionType: q.questionType,
            payload: JSON.stringify(q),
            isServed: false,
          },
        })
      )
    );
  } catch (error) {
    console.error('[Buffer] Failed to refill question buffer:', error);
  }
}

/**
 * Retrieves the next question instantly from the local buffer.
 * If buffer is low or empty, batches are requested safely through the rate limiter.
 */
export async function getNextQuestion(userId: string, topicId: string, userLevel: CefrLevel) {
  const topic = await prisma.grammarTopic.findUnique({
    where: { id: topicId },
  });

  if (!topic) {
    throw new Error('Topic not found');
  }

  // 1. Check unserved questions in buffer
  const unservedQuestions = await prisma.questionBuffer.findMany({
    where: {
      userId,
      topicId,
      isServed: false,
    },
    orderBy: { createdAt: 'asc' },
    take: 2,
  });

  let currentQuestion: QuestionPayload;

  if (unservedQuestions.length > 0) {
    // Serve the first available question from buffer
    const buffered = unservedQuestions[0];
    await prisma.questionBuffer.update({
      where: { id: buffered.id },
      data: { isServed: true },
    });

    currentQuestion = typeof buffered.payload === 'string'
      ? JSON.parse(buffered.payload)
      : (buffered.payload as unknown as QuestionPayload);

    // If buffer count is below threshold, trigger background batch refill
    const remainingCount = await prisma.questionBuffer.count({
      where: { userId, topicId, isServed: false },
    });

    if (remainingCount < BUFFER_REFILL_THRESHOLD) {
      refillQuestionBuffer(
        userId,
        topicId,
        topic.level as CefrLevel,
        topic.title,
        topic.systemPromptRules
      ).catch(() => {});
    }
  } else {
    // 2. Buffer is empty: generate a batch of 10 in 1 single API call
    const batch = await generateGrammarQuestionsBatch({
      topicTitle: topic.title,
      topicRules: topic.systemPromptRules,
      level: topic.level as CefrLevel,
      count: BATCH_SIZE,
    });

    // Serve the first question immediately
    currentQuestion = batch[0];

    // Store remaining 9 questions into QuestionBuffer for subsequent instant practice
    if (batch.length > 1) {
      await prisma.$transaction(
        batch.slice(1).map((q) =>
          prisma.questionBuffer.create({
            data: {
              userId,
              topicId,
              questionType: q.questionType,
              payload: JSON.stringify(q),
              isServed: false,
            },
          })
        )
      );
    }
  }

  return {
    question: currentQuestion,
    topic: {
      id: topic.id,
      title: topic.title,
      level: topic.level as CefrLevel,
    },
  };
}

/**
 * 100% LOCAL verification of student answer.
 * ZERO API calls are consumed for checking multiple-choice / fill-blank answers!
 * Explanations and rules are taken directly from the pre-generated exercise payload.
 */
export async function submitStudentAnswer(params: {
  userId: string;
  topicId: string;
  questionPayload: QuestionPayload;
  studentAnswer: string;
}) {
  const { userId, topicId, questionPayload, studentAnswer } = params;

  // Local strict and case-insensitive equality check
  let isCorrect =
    studentAnswer.trim().toLowerCase() === questionPayload.correctAnswer.trim().toLowerCase();

  // Safeguard against prompt ambiguity:
  // If the sentence does NOT specify negation (no "(not)" or "never") and user provided
  // a grammatically sound affirmative form matching the subject, do not penalize them.
  if (!isCorrect) {
    const hasNegativeClue = /\b(not|never|\(not\))\b/i.test(questionPayload.question);
    if (!hasNegativeClue) {
      const s = studentAnswer.trim().toLowerCase();
      const c = questionPayload.correctAnswer.trim().toLowerCase();
      if (
        (s === 'am' && c === 'am not') ||
        (s === 'is' && (c === "isn't" || c === 'is not')) ||
        (s === 'are' && (c === "aren't" || c === 'are not')) ||
        (s === 'was' && (c === "wasn't" || c === 'was not')) ||
        (s === 'were' && (c === "weren't" || c === 'were not')) ||
        (s === 'do' && (c === "don't" || c === 'do not')) ||
        (s === 'does' && (c === "doesn't" || c === 'does not'))
      ) {
        isCorrect = true;
      }
    }
  }

  // Use pre-generated explanation - saves 100% of LLM tokens on evaluation!
  let explanation = questionPayload.explanationRu;

  if (!isCorrect) {
    explanation = `❌ Неверно. Правильный ответ: "${questionPayload.correctAnswer}".\n\n📖 Правило: ${questionPayload.explanationRu}`;
  } else if (studentAnswer.trim().toLowerCase() !== questionPayload.correctAnswer.trim().toLowerCase()) {
    explanation = `✅ Верно! Предложение грамматически корректно как в утвердительной форме ("${studentAnswer}"), так и в отрицательной ("${questionPayload.correctAnswer}").`;
  }

  // 1. Record attempt in DB
  await prisma.studentAttempt.create({
    data: {
      userId,
      topicId,
      questionPayload: JSON.stringify(questionPayload),
      studentAnswer,
      isCorrect,
      aiExplanation: explanation,
    },
  });

  // 2. Update Progress & Bottlenecks
  const currentProgress = await prisma.studentTopicProgress.findUnique({
    where: {
      userId_topicId: {
        userId,
        topicId,
      },
    },
  });

  const totalAttempts = (currentProgress?.totalAttempts ?? 0) + 1;
  const consecutiveCorrect = isCorrect ? (currentProgress?.consecutiveCorrect ?? 0) + 1 : 0;
  const failedAttempts = isCorrect
    ? (currentProgress?.failedAttempts ?? 0)
    : (currentProgress?.failedAttempts ?? 0) + 1;
  const isMastered = consecutiveCorrect >= 3 || (currentProgress?.isMastered ?? false);
  const isBottleneck = failedAttempts >= 5;

  await prisma.studentTopicProgress.upsert({
    where: {
      userId_topicId: {
        userId,
        topicId,
      },
    },
    create: {
      userId,
      topicId,
      totalAttempts,
      consecutiveCorrect,
      failedAttempts,
      isMastered,
      isBottleneck,
      lastPracticedAt: new Date(),
    },
    update: {
      totalAttempts,
      consecutiveCorrect,
      failedAttempts,
      isMastered,
      isBottleneck,
      lastPracticedAt: new Date(),
    },
  });

  return {
    isCorrect,
    correctAnswer: questionPayload.correctAnswer,
    explanation,
    isMastered,
    isBottleneck,
    consecutiveCorrect,
  };
}

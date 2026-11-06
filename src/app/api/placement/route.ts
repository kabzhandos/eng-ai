import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CefrLevel, QuestionPayload } from '@/types';

// Curated baseline diagnostic questions bank for 20 questions (5 per level: A1, A2, B1, B2)
const BASELINE_PLACEMENT_QUESTIONS: Record<CefrLevel, QuestionPayload[]> = {
  A1: [
    {
      question: 'She _____ a student at our local high school.',
      questionType: 'multiple_choice',
      options: ['is', 'are', 'am', 'be'],
      correctAnswer: 'is',
      explanationRu: 'С местоимением she в Present Simple используется форма глагола to be — is.',
      cefrVocabularyLevel: 'A1',
    },
    {
      question: 'Every morning, my brother _____ his bike to school.',
      questionType: 'multiple_choice',
      options: ['rides', 'ride', 'riding', 'is ride'],
      correctAnswer: 'rides',
      explanationRu: 'В Present Simple для 3-го лица ед. числа (my brother = he) к глаголу добавляется окончание -s/-es.',
      cefrVocabularyLevel: 'A1',
    },
    {
      question: 'They _____ speak French, but they speak English very well.',
      questionType: 'multiple_choice',
      options: ["don't", "doesn't", "aren't", 'not'],
      correctAnswer: "don't",
      explanationRu: 'Для отрицания с местоимением they в Present Simple используется вспомогательный глагол don\'t.',
      cefrVocabularyLevel: 'A1',
    },
    {
      question: 'There is _____ apple and two oranges on the table.',
      questionType: 'multiple_choice',
      options: ['an', 'a', 'the', 'some'],
      correctAnswer: 'an',
      explanationRu: 'Перед существительными в ед. числе, начинающимися с гласного звука (apple), ставится артикль an.',
      cefrVocabularyLevel: 'A1',
    },
    {
      question: 'Where _____ your parents live?',
      questionType: 'multiple_choice',
      options: ['do', 'does', 'are', 'is'],
      correctAnswer: 'do',
      explanationRu: 'Подлежащее your parents во множественном числе (they), поэтому вопросительное слово требует do.',
      cefrVocabularyLevel: 'A1',
    },
  ],
  A2: [
    {
      question: 'Yesterday, we _____ an interesting movie in history class.',
      questionType: 'multiple_choice',
      options: ['watched', 'watch', 'are watching', 'watches'],
      correctAnswer: 'watched',
      explanationRu: 'Маркер yesterday указывает на Past Simple, правильный глагол watch получает окончание -ed.',
      cefrVocabularyLevel: 'A2',
    },
    {
      question: 'He didn\'t _____ to the football training yesterday afternoon.',
      questionType: 'multiple_choice',
      options: ['go', 'went', 'gone', 'going'],
      correctAnswer: 'go',
      explanationRu: 'После отрицательного вспомогательного глагола didn\'t смысловой глагол используется в начальной форме (go).',
      cefrVocabularyLevel: 'A2',
    },
    {
      question: 'This smartphone is _____ than the one I bought last year.',
      questionType: 'multiple_choice',
      options: ['faster', 'more fast', 'fastest', 'as fast'],
      correctAnswer: 'faster',
      explanationRu: 'Для коротких прилагательных (fast) сравнительная степень образуется добавлением суффикса -er: faster than.',
      cefrVocabularyLevel: 'A2',
    },
    {
      question: 'You _____ wear a uniform at our school; it is a strict rule.',
      questionType: 'multiple_choice',
      options: ['must', 'might', 'can', 'could'],
      correctAnswer: 'must',
      explanationRu: 'Модальный глагол must выражает строгое правило и обязательство.',
      cefrVocabularyLevel: 'A2',
    },
    {
      question: 'Look at the sky! It _____ rain soon.',
      questionType: 'multiple_choice',
      options: ['is going to', 'will', 'is raining', 'rains'],
      correctAnswer: 'is going to',
      explanationRu: 'Конструкция to be going to используется для предсказания будущего на основе очевидных признаков в настоящем (Look at the sky!).',
      cefrVocabularyLevel: 'A2',
    },
  ],
  B1: [
    {
      question: 'I _____ my homework yet, so I cannot go out with my friends.',
      questionType: 'multiple_choice',
      options: ["haven't finished", "didn't finish", "don't finish", "hadn't finished"],
      correctAnswer: "haven't finished",
      explanationRu: 'Маркер yet в конце отрицательного предложения указывает на Present Perfect (haven\'t finished).',
      cefrVocabularyLevel: 'B1',
    },
    {
      question: 'If it _____ tomorrow, we will cancel the picnic in the park.',
      questionType: 'multiple_choice',
      options: ['rains', 'will rain', 'rained', 'is raining'],
      correctAnswer: 'rains',
      explanationRu: 'В First Conditional в придаточном условия (после if) используется Present Simple (rains), а не will.',
      cefrVocabularyLevel: 'B1',
    },
    {
      question: 'If I _____ more free time, I would learn how to play the guitar.',
      questionType: 'multiple_choice',
      options: ['had', 'have', 'would have', 'will have'],
      correctAnswer: 'had',
      explanationRu: 'В Second Conditional для нереального условия в настоящем используется If + Past Simple (had), would + глагол.',
      cefrVocabularyLevel: 'B1',
    },
    {
      question: 'The new school library _____ by the mayor last Monday.',
      questionType: 'multiple_choice',
      options: ['was opened', 'is opened', 'opened', 'has been opened'],
      correctAnswer: 'was opened',
      explanationRu: 'Действие в прошлом с указанием времени (last Monday) в страдательном залоге требует Past Simple Passive (was opened).',
      cefrVocabularyLevel: 'B1',
    },
    {
      question: 'She has lived in this city _____ 2018.',
      questionType: 'multiple_choice',
      options: ['since', 'for', 'from', 'in'],
      correctAnswer: 'since',
      explanationRu: 'С точной точкой отсчета во времени (2018) в Present Perfect используется предлог since.',
      cefrVocabularyLevel: 'B1',
    },
  ],
  B2: [
    {
      question: 'If you had listened to my advice, you _____ into trouble yesterday.',
      questionType: 'multiple_choice',
      options: ["wouldn't have got", "won't get", "wouldn't get", "hadn't got"],
      correctAnswer: "wouldn't have got",
      explanationRu: 'В Third Conditional для сожалений о прошлом используется If + Past Perfect, would have + V3.',
      cefrVocabularyLevel: 'B2',
    },
    {
      question: 'She looks very tired. She _____ all night preparing for the exam.',
      questionType: 'multiple_choice',
      options: ['must have studied', 'can\'t have studied', 'should study', 'might study'],
      correctAnswer: 'must have studied',
      explanationRu: 'Модальный глагол must have + V3 выражает высокую уверенность и логический вывод о прошедшем действии.',
      cefrVocabularyLevel: 'B2',
    },
    {
      question: 'Seldom _____ such an impressive performance by young actors.',
      questionType: 'multiple_choice',
      options: ['have I seen', 'I have seen', 'I saw', 'did I saw'],
      correctAnswer: 'have I seen',
      explanationRu: 'Отрицательные наречия в начале предложения (Seldom, Rarely, Never) вызывают инверсию: вспомогательный глагол перед подлежащим.',
      cefrVocabularyLevel: 'B2',
    },
    {
      question: 'He denied _____ the confidential files without permission.',
      questionType: 'multiple_choice',
      options: ['having downloaded', 'to download', 'download', 'to have downloaded'],
      correctAnswer: 'having downloaded',
      explanationRu: 'После глагола deny используется герундий или Perfect Gerund (having downloaded) для подчеркивания предшествования действия.',
      cefrVocabularyLevel: 'B2',
    },
    {
      question: 'Had I known about the changes in the schedule, I _____ earlier.',
      questionType: 'multiple_choice',
      options: ['would have arrived', 'will arrive', 'arrived', 'had arrived'],
      correctAnswer: 'would have arrived',
      explanationRu: 'Инверсия условного предложения 3-го типа (Had I known = If I had known) сочетается с would have + V3 в главной части.',
      cefrVocabularyLevel: 'B2',
    },
  ],
};

// GET: Returns all 20 diagnostic placement questions
export async function GET() {
  const allQuestions: Array<QuestionPayload & { levelBlock: CefrLevel; questionNumber: number }> = [];

  let counter = 1;
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2'];

  levels.forEach((lvl) => {
    BASELINE_PLACEMENT_QUESTIONS[lvl].forEach((q) => {
      allQuestions.push({
        ...q,
        levelBlock: lvl,
        questionNumber: counter++,
      });
    });
  });

  return NextResponse.json({
    totalQuestions: allQuestions.length,
    questions: allQuestions,
  });
}

// POST: Evaluates the 20 questions, computes CEFR breakdown, and updates the user's level if logged in
export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    const { answers } = await req.json();

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Результаты теста не переданы' }, { status: 400 });
    }

    const a1Score = answers.filter((a) => a.levelBlock === 'A1' && a.isCorrect).length;
    const a2Score = answers.filter((a) => a.levelBlock === 'A2' && a.isCorrect).length;
    const b1Score = answers.filter((a) => a.levelBlock === 'B1' && a.isCorrect).length;
    const b2Score = answers.filter((a) => a.levelBlock === 'B2' && a.isCorrect).length;
    const totalCorrect = a1Score + a2Score + b1Score + b2Score;

    // Strict CEFR Determination based on 20 questions:
    let determinedLevel: CefrLevel = 'A1';

    if (b1Score >= 3 && b2Score >= 3) {
      determinedLevel = 'B2';
    } else if (a2Score >= 3 && b1Score >= 3) {
      determinedLevel = 'B1';
    } else if (a1Score >= 3 && a2Score >= 3) {
      determinedLevel = 'A2';
    } else {
      determinedLevel = 'A1';
    }

    // If student is logged in, update confirmed level in DB
    if (session?.userId) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { currentLevel: determinedLevel },
      });
    }

    return NextResponse.json({
      success: true,
      assignedLevel: determinedLevel,
      totalQuestions: answers.length,
      totalCorrect,
      breakdown: {
        A1: { correct: a1Score, total: 5 },
        A2: { correct: a2Score, total: 5 },
        B1: { correct: b1Score, total: 5 },
        B2: { correct: b2Score, total: 5 },
      },
    });
  } catch (err: any) {
    console.error('Placement submission error:', err);
    return NextResponse.json(
      { error: err.message || 'Ошибка обработки результатов теста' },
      { status: 500 }
    );
  }
}

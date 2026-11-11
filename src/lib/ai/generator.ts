import { generateObject } from 'ai';
import { z } from 'zod';
import { getLanguageModel } from './client';
import { buildBatchQuestionsPrompt, buildSmartRetryExplanationPrompt } from './prompts';
import { geminiRateLimiter } from './rate-limiter';
import { QuestionPayload, ErrorExplanationResponse, CefrLevel } from '@/types';

// Zod schema for a single question
export const QuestionSchema = z.object({
  question: z.string().describe('The sentence containing "_____" as a blank to be filled in'),
  questionType: z.enum(['multiple_choice', 'fill_blank', 'sentence_rewrite']).default('multiple_choice'),
  options: z.array(z.string()).length(4).describe('4 options for the student to choose from'),
  correctAnswer: z.string().describe('The exact correct option from the options list'),
  explanationRu: z.string().describe('Detailed explanation in Russian why this option is correct and which marker or rule is applied'),
  cefrVocabularyLevel: z.enum(['A1', 'A2', 'B1', 'B2']),
  contextHint: z.string().optional().describe('Short optional hint or clue'),
});

// Zod schema for batch generation (10 questions per request)
export const BatchQuestionsSchema = z.object({
  questions: z.array(QuestionSchema).min(3).max(10).describe('List of generated questions'),
});

// Zod schema for in-depth error explanation (used only when requested)
export const ErrorExplanationSchema = z.object({
  explanationRu: z.string().describe('Clear explanation in Russian why the student answer is wrong and the correct one is right'),
  tipRu: z.string().describe('A short mnemonic or memory marker tip in Russian'),
  correctAnswerAnalysis: z.string().describe('Grammar breakdown of the correct choice'),
});

// Zod schema for AI Class Report
export const ClassReportSchema = z.object({
  executiveSummary: z.string().describe('Comprehensive pedagogical overview in Russian (2-3 paragraphs) assessing the class performance, progress, and overall dynamic.'),
  rootCauseAnalysis: z.array(z.object({
    topicTitle: z.string().describe('Topic title'),
    topicLevel: z.string().describe('CEFR Level e.g. A2, B1'),
    pedagogicalDiagnosis: z.string().describe('Why students struggle with this topic, psychological/linguistic reasons, e.g. interference with Russian grammar'),
    recommendation: z.string().describe('Practical classroom instruction or memory hook'),
  })).describe('In-depth diagnostic breakdown of key problematic grammar rules'),
  actionPlan: z.array(z.object({
    week: z.string().describe('Timeframe, e.g. "Неделя 1", "Неделя 2"'),
    focusArea: z.string().describe('Main grammar focus'),
    warmupActivity: z.string().describe('Specific 5-10 minute starter drill or communicative task for lesson beginning'),
    keySignalsToEmphasize: z.string().describe('Key time markers, trigger words, or auxiliary patterns to reinforce'),
  })).describe('Actionable 2-week remedial lesson plan'),
  differentiationAdvice: z.string().describe('Recommendations for differentiated instruction: supporting struggling students vs challenging advanced learners in Russian'),
});

export type ClassAiReportData = z.infer<typeof ClassReportSchema>;

/**
 * Batch pre-generates 5 to 10 questions in a SINGLE API call.
 * Routed through Gemini Rate Limiter to guarantee staying within Free Tier limits.
 */
export async function generateGrammarQuestionsBatch(params: {
  topicTitle: string;
  topicRules: string;
  level: CefrLevel;
  count?: number;
  difficultyModifier?: string;
}): Promise<QuestionPayload[]> {
  return geminiRateLimiter.schedule(async () => {
    const model = getLanguageModel();
    const prompt = buildBatchQuestionsPrompt(params);

    const result = await generateObject({
      model,
      schema: BatchQuestionsSchema,
      prompt,
      temperature: 0.7,
    });

    return result.object.questions as QuestionPayload[];
  });
}

/**
 * Convenience single generator: generates a batch of 10 and returns the first,
 * or can be used when only 1 is needed.
 */
export async function generateGrammarQuestion(params: {
  topicTitle: string;
  topicRules: string;
  level: CefrLevel;
  difficultyModifier?: string;
}): Promise<QuestionPayload> {
  const batch = await generateGrammarQuestionsBatch({ ...params, count: 5 });
  return batch[0];
}

/**
 * Optional deep explanation for complex mistakes.
 * Also routed through rate limiter.
 */
export async function explainStudentError(params: {
  topicTitle: string;
  sentence: string;
  correctAnswer: string;
  studentAnswer: string;
  level: CefrLevel;
}): Promise<ErrorExplanationResponse> {
  return geminiRateLimiter.schedule(async () => {
    const model = getLanguageModel();
    const prompt = buildSmartRetryExplanationPrompt(params);

    const result = await generateObject({
      model,
      schema: ErrorExplanationSchema,
      prompt,
      temperature: 0.4,
    });

    return result.object;
  });
}

/**
 * Generate comprehensive AI Pedagogical Class Report
 */
export async function generateClassAiReport(params: {
  className: string;
  totalStudents: number;
  averageAccuracy: number;
  blindspots: Array<{ topicTitle: string; topicLevel: string; errorCount: number; percentAffected: number }>;
  riskStudentsCount: number;
  pendingQuestionsCount: number;
}): Promise<ClassAiReportData> {
  return geminiRateLimiter.schedule(async () => {
    const model = getLanguageModel();
    const prompt = `Ты — ведущий методист и эксперт по преподаванию английского языка (ELT / CEFR).
Твоя задача — составить официальный, профессиональный педагогический отчёт по успеваемости учебной группы для преподавателя и администрации школы.

Данные группы:
- Название класса: "${params.className}"
- Количество учеников в группе: ${params.totalStudents}
- Средняя точность выполнения заданий: ${params.averageAccuracy}%
- Учеников в группе риска (зависание на темах / низкая точность): ${params.riskStudentsCount}
- Нерешенных вопросов от учеников ("Спросить учителя"): ${params.pendingQuestionsCount}
- Ключевые слепые зоны класса (темы с максимальным количеством ошибок):
${params.blindspots.length > 0 ? params.blindspots.map(b => `  * [${b.topicLevel}] "${b.topicTitle}": затронуло ${b.percentAffected}% учеников группы, суммарно ${b.errorCount} ошибок`).join('\n') : '  * Ошибок практически нет, группа решает стабильно.'}

Требования к содержанию отчета:
1. executiveSummary: объективное, поддерживающее и строгое резюме (2-3 связных абзаца на чистом русском языке) о текущем уровне готовности группы, динамике усвоения материала и ключевых тенденциях.
2. rootCauseAnalysis: для каждой проблемной темы дай лингвистический диагноз (почему русскоязычные школьники спотыкаются здесь — например, интерференция с русским языком, ложные аналогии, путаница вспомогательных глаголов) и конкретный практический совет учителю.
3. actionPlan: поурочный план коррекции на 2 недели (Неделя 1 и Неделя 2) с 5-10 минутными разминками в начале каждого урока и ключевыми сигнальными маркерами.
4. differentiationAdvice: практические советы учителю, как дифференцировать подачу (поддержать группу риска без снижения планки для сильных учеников).

Сформируй ответ строго в соответствии с JSON-схемой.`;

    const result = await generateObject({
      model,
      schema: ClassReportSchema,
      prompt,
      temperature: 0.5,
    });

    return result.object;
  });
}

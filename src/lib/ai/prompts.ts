import { CefrLevel } from '@/types';

export const CEFR_VOCABULARY_GUIDELINES: Record<CefrLevel, string> = {
  A1: 'Strictly basic vocabulary (family, school, everyday routine, numbers, colors, common food, simple adjectives). Sentence length: 6-10 words. Simple structures only.',
  A2: 'Elementary vocabulary (hobbies, shopping, travel, basic feelings, daily tasks). Sentence length: 8-14 words. Common conjunctions (because, when, if, but).',
  B1: 'Intermediate vocabulary (opinions, future plans, experiences, emotions, technology, simple idioms). Sentence length: 12-18 words. Relative clauses and compound sentences.',
  B2: 'Upper-intermediate vocabulary (abstract ideas, social issues, career, culture, nuanced adjectives/adverbs). Sentence length: 15-22 words. Varied sentence structure.',
};

export function buildBatchQuestionsPrompt(params: {
  topicTitle: string;
  topicRules: string;
  level: CefrLevel;
  count?: number;
  difficultyModifier?: string;
}) {
  const count = params.count || 10;
  const vocabGuideline = CEFR_VOCABULARY_GUIDELINES[params.level];

  return `You are an expert English Language Grammar Engine designed specifically for high school students.
Your task is to generate a BATCH OF ${count} UNIQUE high-quality grammar exercises strictly aligned with the student's level.

TARGET SPECIFICATIONS:
- CEFR Grammar Level: ${params.level}
- Grammar Topic: ${params.topicTitle}
- Rule Focus: ${params.topicRules}
- Vocabulary Constraints: ${vocabGuideline}
${params.difficultyModifier ? `- Additional focus: ${params.difficultyModifier}` : ''}

CRITICAL RULES:
1. Generate EXACTLY ${count} distinct, engaging sentences. Do NOT repeat sentence templates or contexts.
2. Ensure ALL vocabulary words in the sentence strictly belong to CEFR ${params.level}. The student must not struggle with unknown words while learning grammar.
3. The contexts must be relatable for teenagers (school life, friendships, sports, hobbies, technology, travel, pets).
4. ABSOLUTE DISAMBIGUATION (STRICTLY ONE VALID ANSWER):
   - Under NO circumstances should two options both be grammatically correct.
   - FATAL ERROR TO AVOID: In sentences like "I _____ late for class", BOTH "am" and "am not" make complete grammatical sense! A student choosing "am" must NOT be penalized if the intended answer was "am not".
   - IF YOU ARE TESTING A NEGATIVE FORM (e.g. 'am not', 'isn\'t', 'aren\'t', 'didn\'t', 'haven\'t'):
     You MUST explicitly put "(not)" in the question text!
     Example: "I _____ (not) late for my morning computer class." -> Correct answer: "am not".
     Distractors: ["am", "is not", "aren't"].
   - IF THE SENTENCE IS AFFIRMATIVE:
     Do NOT include the negative counterpart as a trap unless context strictly forbids it (e.g. "Hurry up! I _____ late!").
   - Every incorrect option (distractor) MUST contain an objective grammatical error (e.g. wrong subject agreement like 'is' for 'I', wrong tense marker, or malformed verb).
5. For each exercise:
   - Provide "question" using "_____" (5 underscores) to represent the missing word/phrase. If testing negation or base verbs, include prompt brackets e.g. "_____ (not / be)".
   - Provide 4 distinct options ("options"). Exactly ONE must be grammatically correct.
   - "correctAnswer" must exactly match the right option.
   - Provide "explanationRu" in Russian explaining the grammar rule clearly, pointing out signal words/markers so the student understands the rule even without re-querying the AI.
   - Provide "cefrVocabularyLevel": "${params.level}".

Return the result strictly according to the JSON schema containing the "questions" array.`;
}

export function buildSmartRetryExplanationPrompt(params: {
  topicTitle: string;
  sentence: string;
  correctAnswer: string;
  studentAnswer: string;
  level: CefrLevel;
}) {
  return `You are an empathetic, encouraging English tutor.
A high school student made a specific mistake in a grammar exercise and requested an in-depth breakdown.

Context:
- CEFR Level: ${params.level}
- Topic: ${params.topicTitle}
- Exercise Sentence: "${params.sentence}"
- Correct Answer: "${params.correctAnswer}"
- Student's Mistake: "${params.studentAnswer}"

Task:
Provide a friendly, helpful explanation in RUSSIAN (max 3-4 sentences):
1. Politely and clearly explain why "${params.studentAnswer}" is grammatically incorrect in this sentence.
2. Explain the grammatical rule that makes "${params.correctAnswer}" the correct choice.
3. Give one practical memory tip (лайфхак / маркер) to easily remember and avoid this mistake in the future.`;
}

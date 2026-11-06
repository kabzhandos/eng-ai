export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface AuthSession {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  currentLevel: CefrLevel;
}

export type QuestionType = 'multiple_choice' | 'fill_blank' | 'sentence_rewrite';

export interface QuestionPayload {
  question: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string;
  explanationRu: string;
  cefrVocabularyLevel: CefrLevel;
  contextHint?: string;
}

export interface ErrorExplanationResponse {
  explanationRu: string;
  tipRu: string;
  correctAnswerAnalysis: string;
}

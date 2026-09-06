export type QuestionType = 'QCU' | 'QCM' | 'OPEN' | 'DEFINITION' | 'CASE_STUDY' | 'ANALYSIS';

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[]; // Optional for open/essay questions
  correct?: number[]; // Optional for open/essay questions
  expected_answer?: string; // For OPEN, DEFINITION, CASE_STUDY, ANALYSIS
  scenario?: string; // For CASE_STUDY
  category?: string;
}

export interface OpenQuestionGrade {
  score: number; // 0 to 20
  percentage: number; // 0 to 100
  feedback: string;
  strengths: string[];
  missing_points: string[];
}

export interface ExamSettings {
  enableTimer: boolean;
  duration: number; // in minutes
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  passingScore?: number; // e.g. 50 (percentage required to pass)
}

export interface UserAnswer {
  questionId: number;
  selectedIndices?: number[];
  textAnswer?: string;
  isCorrect?: boolean;
}

export interface ExamResult {
  score: number; // Combined total score points (e.g. 76)
  totalQuestions: number;
  percentage: number; // Combined success percentage (e.g. 76%)
  goodAnswers: number; // MCQs correct + open-ended scores >= 10
  badAnswers: number;
  timeSpent: number; // in seconds
  categoryStats: Record<string, { total: number; correct: number; percentage: number }>;
  
  // Advanced dashboard statistics
  mcqScore: number;
  mcqTotal: number;
  openScore: number; // sum of open questions scores out of 20
  openTotal: number; // sum of max open questions points (count * 20)
  
  // AI Evaluations mapping
  openGrades: Record<number, OpenQuestionGrade>;
  teacherAdjustments?: Record<number, Partial<OpenQuestionGrade>>; // manual changes by tutor
  mcqExplanations?: Record<number, string>; // AI-generated explanations for incorrect MCQs
}

export interface Attempt {
  id: string;
  timestamp: number;
  questions: Question[];
  answers: Record<number, number[] | string>;
  result: ExamResult;
  settings: ExamSettings;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, number[] | string>; // questionId -> selectedIndices (number[]) or essay text (string)
  settings: ExamSettings;
  startTime: number | null;
  timeRemaining: number | null;
  isExamStarted: boolean;
  isExamSubmitted: boolean;
  examResult: ExamResult | null;
}export interface AIGenerateOptions {
  difficulty: 'facile' | 'moyen' | 'difficile';
  numQuestions: number;
  pctQcm: number;
  pctQcu: number;
  pctOpen: number;
  isTpMode: boolean;
  tpPrompt?: string;
}

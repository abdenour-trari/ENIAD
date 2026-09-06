import type { Question, ExamResult, OpenQuestionGrade } from '../types';

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * Returns a new shuffled array without mutating the original.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Compares two number arrays to check if they have the exact same elements (regardless of order).
 */
export function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((val, index) => val === sortedB[index]);
}

/**
 * Calculates results score, accuracy, category-wise stats (legacy version for QCM-only).
 */
export function calculateResults(
  questions: Question[],
  answers: Record<number, number[] | string>,
  timeSpent: number
): ExamResult {
  return calculateResultsWithOpenGrades(questions, answers, {}, timeSpent);
}

/**
 * Calculates unified results score combining MCQ exact matching and AI Open evaluation grades.
 */
export function calculateResultsWithOpenGrades(
  questions: Question[],
  answers: Record<number, number[] | string>,
  openGrades: Record<number, OpenQuestionGrade>,
  timeSpent: number,
  teacherAdjustments: Record<number, Partial<OpenQuestionGrade>> = {},
  mcqExplanations: Record<number, string> = {}
): ExamResult {
  let goodAnswers = 0;
  let badAnswers = 0;
  
  let mcqScore = 0;
  let mcqTotal = 0;
  
  let openScore = 0;
  let openTotal = 0;

  const categoryMap: Record<string, { total: number; correct: number }> = {};

  questions.forEach((q) => {
    const userAnswer = answers[q.id];
    const cat = q.category || 'Général';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { total: 0, correct: 0 };
    }
    categoryMap[cat].total += 1;

    const isOpen = ['OPEN', 'DEFINITION', 'CASE_STUDY', 'ANALYSIS'].includes(q.type);

    if (!isOpen) {
      // QCM / QCU evaluation
      const selIndices = userAnswer as number[] || [];
      const isCorrect = arraysEqual(selIndices, q.correct || []);
      
      mcqTotal += 10; // normal weight: 10 points per MCQ
      if (isCorrect) {
        goodAnswers++;
        mcqScore += 10;
        categoryMap[cat].correct += 1;
      } else {
        badAnswers++;
      }
    } else {
      // Open ended essay questions graded by AI or manual teacher overrides
      const originalGrade = openGrades[q.id];
      const adjustment = teacherAdjustments[q.id];
      
      const score = adjustment?.score !== undefined ? adjustment.score : (originalGrade?.score || 0);
      const isPassing = score >= 10;
      
      openTotal += 20; // weight of 20 points per essay question
      openScore += score;
      
      if (isPassing) {
        goodAnswers++;
        categoryMap[cat].correct += 1;
      } else {
        badAnswers++;
      }
    }
  });

  const totalMaxScore = mcqTotal + openTotal;
  const score = mcqScore + openScore;
  const percentage = totalMaxScore > 0 ? Math.round((score / totalMaxScore) * 100) : 0;

  const categoryStats: ExamResult['categoryStats'] = {};
  Object.keys(categoryMap).forEach((cat) => {
    const { total, correct } = categoryMap[cat];
    categoryStats[cat] = {
      total,
      correct,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });

  return {
    score,
    totalQuestions: questions.length,
    percentage,
    goodAnswers,
    badAnswers,
    timeSpent,
    categoryStats,
    mcqScore,
    mcqTotal,
    openScore,
    openTotal,
    openGrades,
    teacherAdjustments,
    mcqExplanations,
  };
}

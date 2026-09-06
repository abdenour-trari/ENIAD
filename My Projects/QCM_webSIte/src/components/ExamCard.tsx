import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question } from '../types';
import { Check, Info, BookOpen } from 'lucide-react';

interface ExamCardProps {
  question: Question;
  selectedIndices?: number[];
  textAnswer?: string;
  onOptionToggle?: (optionIndex: number) => void;
  onTextAnswerChange?: (text: string) => void;
  questionNumber: number;
  totalQuestions: number;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  question,
  selectedIndices = [],
  textAnswer = '',
  onOptionToggle,
  onTextAnswerChange,
  questionNumber,
  totalQuestions,
}) => {
  const isQCM = question.type === 'QCM';
  const isOpen = ['OPEN', 'DEFINITION', 'ANALYSIS', 'CASE_STUDY'].includes(question.type);

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.25 } },
  } as const;

  const typeLabels: Record<string, string> = {
    QCU: 'Choix Unique (QCU)',
    QCM: 'Choix Multiple (QCM)',
    OPEN: 'Question Ouverte',
    DEFINITION: 'Définition',
    ANALYSIS: 'Analyse',
    CASE_STUDY: 'Cas Pratique',
  };

  const typeColors: Record<string, string> = {
    QCU: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    QCM: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    OPEN: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    DEFINITION: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    ANALYSIS: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    CASE_STUDY: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-sm"
      >
        {/* Card Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg border ${typeColors[question.type] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              {typeLabels[question.type] || question.type}
            </span>
            <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg bg-slate-800 dark:bg-slate-800 light:bg-slate-200/60 border border-slate-700 dark:border-slate-700 light:border-slate-300 text-slate-400 dark:text-slate-400 light:text-slate-600">
              {question.category || 'Général'}
            </span>
          </div>
          <span className="text-sm font-semibold text-slate-400">
            Question {questionNumber} sur {totalQuestions}
          </span>
        </div>

        {/* Case Study Scenario Panel */}
        {question.type === 'CASE_STUDY' && question.scenario && (
          <div className="mb-6 p-5 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 border border-slate-850 dark:border-slate-850 light:border-slate-250 text-slate-300 dark:text-slate-300 light:text-slate-700 text-sm leading-relaxed shadow-inner">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2.5">
              <BookOpen className="h-3.5 w-3.5" />
              Situation / Scénario
            </span>
            <p className="whitespace-pre-line">{question.scenario}</p>
          </div>
        )}

        {/* Question Statement */}
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-100 dark:text-slate-100 light:text-slate-800 mb-8 leading-snug">
          {question.question}
        </h3>

        {/* Question Options or Essay Field */}
        {isOpen ? (
          // Free-text field for essay/definition answers
          <div className="space-y-3 mt-4">
            <textarea
              value={textAnswer}
              onChange={(e) => onTextAnswerChange?.(e.target.value)}
              placeholder="Rédigez votre réponse détaillée ici..."
              className="w-full min-h-[180px] p-4.5 rounded-2xl bg-slate-950/40 dark:bg-slate-950/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-250 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 dark:text-slate-100 light:text-slate-950 text-base leading-relaxed placeholder-slate-600 resize-y focus:outline-none transition-all custom-scrollbar"
            />
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
              <span className="tabular-nums">{textAnswer.length} caractères</span>
              <span className="text-emerald-500/80">Sauvegarde automatique</span>
            </div>
          </div>
        ) : (
          // Option choices for QCU/QCM
          <div className="space-y-4">
            {question.options?.map((option, idx) => {
              const isSelected = selectedIndices.includes(idx);
              
              return (
                <button
                  key={idx}
                  onClick={() => onOptionToggle?.(idx)}
                  className={`w-full text-left flex items-start gap-4 p-4.5 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500 text-slate-100 dark:text-slate-100 light:text-blue-900 shadow-md shadow-blue-500/5'
                      : 'bg-slate-900/30 dark:bg-slate-900/30 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isQCM ? (
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-slate-600 dark:border-slate-600 light:border-slate-400 group-hover:border-slate-500 dark:group-hover:border-slate-450'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-blue-500 text-blue-500'
                            : 'border-slate-600 dark:border-slate-600 light:border-slate-400 group-hover:border-slate-500 dark:group-hover:border-slate-450'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <span className="text-base sm:text-lg font-medium leading-relaxed">
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* QCM hint */}
        {isQCM && (
          <div className="flex items-center gap-2 mt-6 text-xs text-slate-500 dark:text-slate-500 light:text-slate-400">
            <Info className="h-3.5 w-3.5" />
            <span>Plusieurs réponses sont possibles pour cette question.</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

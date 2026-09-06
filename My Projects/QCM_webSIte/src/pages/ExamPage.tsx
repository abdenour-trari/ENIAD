import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Menu, HelpCircle, Save, Brain, RefreshCw } from 'lucide-react';
import type { Question, ExamSettings } from '../types';
import { ExamCard } from '../components/ExamCard';
import { Button } from '../components/Button';
import { Timer } from '../components/Timer';
import { FullscreenToggle } from '../components/FullscreenToggle';

interface ExamPageProps {
  questions: Question[];
  settings: ExamSettings;
  answers: Record<number, number[] | string>;
  onOptionToggle: (questionId: number, optionIndex: number) => void;
  onTextAnswerChange: (questionId: number, text: string) => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onJumpToQuestion: (index: number) => void;
  currentQuestionIndex: number;
  timeRemaining: number | null;
  onTick: (nextTime: number) => void;
  onSubmitExam: () => void;
  onQuitExam: () => void;
  
  // AI Grading Loading States
  isGrading?: boolean;
  gradedCount?: number;
  totalOpenQuestions?: number;
  gradingStatusMessage?: string;
}

export const ExamPage: React.FC<ExamPageProps> = ({
  questions,
  settings,
  answers,
  onOptionToggle,
  onTextAnswerChange,
  onPrevQuestion,
  onNextQuestion,
  onJumpToQuestion,
  currentQuestionIndex,
  timeRemaining,
  onTick,
  onSubmitExam,
  onQuitExam,
  
  isGrading = false,
  gradedCount = 0,
  totalOpenQuestions = 0,
  gradingStatusMessage = '',
}) => {
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const progressPercentage = questions.length > 0 
    ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) 
    : 0;

  const handleToggle = (optionIdx: number) => {
    onOptionToggle(currentQuestion.id, optionIdx);
  };

  const handleTextChange = (text: string) => {
    onTextAnswerChange(currentQuestion.id, text);
  };

  const handleFinishExam = () => {
    setShowConfirmSubmit(true);
  };

  const isQuestionAnswered = (qId: number) => {
    const ans = answers[qId];
    if (ans === undefined || ans === null) return false;
    if (typeof ans === 'string') {
      return ans.trim().length > 0;
    }
    return ans.length > 0;
  };

  const answeredCount = questions.filter(q => isQuestionAnswered(q.id)).length;

  const isCurrentOpen = ['OPEN', 'DEFINITION', 'ANALYSIS', 'CASE_STUDY'].includes(currentQuestion.type);
  const selectedIndices = !isCurrentOpen ? (answers[currentQuestion.id] as number[] || []) : [];
  const textAnswer = isCurrentOpen ? (answers[currentQuestion.id] as string || '') : '';

  // AI Grading Progress calculations
  const gradingProgress = totalOpenQuestions > 0 
    ? Math.round((gradedCount / totalOpenQuestions) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 w-full flex-1 flex flex-col gap-6 relative">
      {/* AI Grading Stream Progress Overlay */}
      <AnimatePresence>
        {isGrading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/95 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 relative z-10 shadow-2xl flex flex-col items-center justify-center text-center gap-6"
            >
              {/* Pulsing Brain Icon */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-ping" />
                <div className="p-5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full text-white relative shadow-lg shadow-blue-500/20">
                  <Brain className="h-10 w-10 animate-pulse" />
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-extrabold text-slate-100 tracking-tight">Correction IA en cours...</h4>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-sm mx-auto">
                  L'intelligence artificielle évalue vos réponses ouvertes et génère des explications détaillées pour vos erreurs.
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="w-full space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Progression : {gradedCount} / {totalOpenQuestions} question(s)</span>
                  <span className="tabular-nums text-blue-400">{gradingProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${gradingProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Live Status Ticks */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/60 border border-slate-850 rounded-2xl w-full text-left text-xs">
                <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin flex-shrink-0" />
                <span className="text-slate-350 font-mono truncate">
                  {gradingStatusMessage || "Initialisation de la connexion sécurisée Groq..."}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/40 dark:bg-slate-950/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-4.5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-100 px-2"
            onClick={onQuitExam}
            leftIcon={<ArrowLeft className="h-4.5 w-4.5" />}
          >
            Abandonner
          </Button>
          <div className="h-4 w-px bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm font-semibold">
            <Save className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span>Sauvegarde auto active</span>
          </div>
        </div>

        {/* Action badges: Timer, Fullscreen, Sidebar */}
        <div className="flex items-center gap-3">
          {settings.enableTimer && (
            <Timer
              initialSeconds={timeRemaining !== null ? timeRemaining : settings.duration * 60}
              isActive={!isGrading}
              isCountDown={true}
              onTimeUp={onSubmitExam}
              onTick={onTick}
            />
          )}
          <FullscreenToggle />
          <Button
            variant="secondary"
            size="sm"
            className="lg:hidden"
            leftIcon={<Menu className="h-4 w-4" />}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            Questions
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-200 h-2 rounded-full overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Layout Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch flex-1">
        {/* Left/Center Column: Quiz Card & Nav */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-6">
          <ExamCard
            question={currentQuestion}
            selectedIndices={selectedIndices}
            textAnswer={textAnswer}
            onOptionToggle={handleToggle}
            onTextAnswerChange={handleTextChange}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />

          {/* Navigation Controls Footer */}
          <div className="flex items-center justify-between gap-4 p-4.5 bg-slate-950/20 border border-slate-800/80 rounded-2xl">
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={onPrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Précédent
            </Button>
            
            <span className="text-sm font-semibold text-slate-400">
              {answeredCount} répondues sur {questions.length}
            </span>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                variant="outline"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={onNextQuestion}
              >
                Suivant
              </Button>
            ) : (
              <Button
                variant="success"
                size="md"
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                onClick={handleFinishExam}
              >
                Terminer
              </Button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Grid list of question statuses (Desktop View) */}
        <div className="hidden lg:block bg-slate-900/40 dark:bg-slate-900/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 shadow-xl h-fit">
          <h3 className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-800 mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-400" />
            Navigation
          </h3>

          <div className="grid grid-cols-5 gap-2.5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
            {questions.map((q, idx) => {
              const active = idx === currentQuestionIndex;
              const answered = isQuestionAnswered(q.id);

              return (
                <button
                  key={q.id}
                  onClick={() => onJumpToQuestion(idx)}
                  className={`aspect-square w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${
                    active
                      ? 'bg-blue-600 border-blue-500 text-white ring-2 ring-blue-500/20 scale-105'
                      : answered
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 hover:border-emerald-500 hover:bg-emerald-950/40'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100 dark:bg-slate-950/50 dark:border-slate-800 light:bg-slate-55 light:border-slate-200 light:text-slate-600 light:hover:bg-slate-100'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 border-t border-slate-850 pt-5 space-y-4">
            <Button
              variant="primary"
              size="md"
              className="w-full shadow-lg shadow-blue-500/10"
              onClick={handleFinishExam}
            >
              Terminer l'examen
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-over Sidebar Drawer */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-slate-900 border-l border-slate-800 z-50 p-6 flex flex-col justify-between shadow-2xl lg:hidden"
            >
              <div>
                <h3 className="font-bold text-slate-100 mb-6 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-indigo-400" />
                  Navigation examen
                </h3>
                <div className="grid grid-cols-4 gap-2.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {questions.map((q, idx) => {
                    const active = idx === currentQuestionIndex;
                    const answered = isQuestionAnswered(q.id);

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          onJumpToQuestion(idx);
                          setShowSidebar(false);
                        }}
                        className={`aspect-square rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${
                          active
                            ? 'bg-blue-600 border-blue-500 text-white ring-2 ring-blue-500/20'
                            : answered
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 mt-8">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={handleFinishExam}
                >
                  Terminer l'examen
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => setShowSidebar(false)}
                >
                  Fermer
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Submit Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmSubmit(false)}
              className="fixed inset-0 bg-slate-950"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative z-10 shadow-2xl flex flex-col gap-5 text-center"
            >
              <div className="mx-auto p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full w-fit">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-100">Soumettre l'examen ?</h4>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                  Vous avez répondu à {answeredCount} question(s) sur {questions.length}. Êtes-vous sûr de vouloir terminer l'examen ?
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => setShowConfirmSubmit(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="success"
                  size="md"
                  className="flex-1 shadow-lg shadow-emerald-500/10"
                  onClick={() => {
                    setShowConfirmSubmit(false);
                    onSubmitExam();
                  }}
                >
                  Soumettre
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

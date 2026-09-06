import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, FileDown, RotateCcw, PlusCircle, CheckCircle, 
  AlertTriangle, Clock, Layers, ShieldAlert, Award, 
  ChevronDown, ChevronUp, History, Trash2, Save, Brain 
} from 'lucide-react';
import type { Question, ExamResult, Attempt, OpenQuestionGrade } from '../types';
import { ProgressGauge } from '../components/ProgressGauge';
import { Button } from '../components/Button';
import { exportToPDF } from '../utils/pdfExporter';
import { arraysEqual } from '../utils/helpers';

interface ResultsPageProps {
  questions: Question[];
  answers: Record<number, number[] | string>;
  result: ExamResult;
  onRestart: () => void;
  onNewExam: () => void;
  
  // Advanced Features Props
  attempts?: Attempt[];
  onLoadAttempt?: (attempt: Attempt) => void;
  onDeleteAttempt?: (attemptId: string) => void;
  onUpdateResultWithTeacherAdjustments?: (adjustments: Record<number, Partial<OpenQuestionGrade>>) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  questions,
  answers,
  result,
  onRestart,
  onNewExam,
  attempts = [],
  onLoadAttempt,
  onDeleteAttempt,
  onUpdateResultWithTeacherAdjustments,
}) => {
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [collapsedModelAnswers, setCollapsedModelAnswers] = useState<Record<number, boolean>>({});
  const [localAdjustments, setLocalAdjustments] = useState<Record<number, Partial<OpenQuestionGrade>>>(
    result.teacherAdjustments || {}
  );
  const [showHistory, setShowHistory] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return mins > 0 ? `${mins} min ${secs} s` : `${secs} s`;
  };

  const handleExportPDF = () => {
    // Generate PDF report with both MCQ and AI comments
    exportToPDF(questions, answers, result);
  };

  const toggleModelAnswer = (qId: number) => {
    setCollapsedModelAnswers(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Handle Teacher Mode overrides
  const handleTeacherScoreChange = (qId: number, score: number) => {
    const scoreVal = Math.max(0, min(20, score));
    const newAdj = {
      ...localAdjustments,
      [qId]: {
        ...localAdjustments[qId],
        score: scoreVal,
        percentage: Math.round((scoreVal / 20) * 100),
      }
    };
    setLocalAdjustments(newAdj);
  };

  const handleTeacherFeedbackChange = (qId: number, feedback: string) => {
    const newAdj = {
      ...localAdjustments,
      [qId]: {
        ...localAdjustments[qId],
        feedback,
      }
    };
    setLocalAdjustments(newAdj);
  };

  const handleTeacherArrayChange = (qId: number, key: 'strengths' | 'missing_points', index: number, value: string) => {
    const currentArray = [...(localAdjustments[qId]?.[key] || result.openGrades[qId]?.[key] || [])];
    currentArray[index] = value;
    const newAdj = {
      ...localAdjustments,
      [qId]: {
        ...localAdjustments[qId],
        [key]: currentArray,
      }
    };
    setLocalAdjustments(newAdj);
  };

  const addTeacherArrayItem = (qId: number, key: 'strengths' | 'missing_points') => {
    const currentArray = [...(localAdjustments[qId]?.[key] || result.openGrades[qId]?.[key] || [])];
    currentArray.push('');
    const newAdj = {
      ...localAdjustments,
      [qId]: {
        ...localAdjustments[qId],
        [key]: currentArray,
      }
    };
    setLocalAdjustments(newAdj);
  };

  const removeTeacherArrayItem = (qId: number, key: 'strengths' | 'missing_points', index: number) => {
    const currentArray = [...(localAdjustments[qId]?.[key] || result.openGrades[qId]?.[key] || [])];
    currentArray.splice(index, 1);
    const newAdj = {
      ...localAdjustments,
      [qId]: {
        ...localAdjustments[qId],
        [key]: currentArray,
      }
    };
    setLocalAdjustments(newAdj);
  };

  const handleSaveTeacherAdjustments = () => {
    if (onUpdateResultWithTeacherAdjustments) {
      onUpdateResultWithTeacherAdjustments(localAdjustments);
      alert("Les modifications de l'enseignant ont été appliquées avec succès ! Le score global a été recalculé.");
    }
  };

  const min = (a: number, b: number) => (a < b ? a : b);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  } as const;

  const categories = Object.keys(result.categoryStats);
  const openQuestionsCount = questions.filter(q => !['QCU', 'QCM'].includes(q.type)).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto px-4 py-8 w-full flex-1 flex flex-col gap-8"
    >
      {/* Top Banner Actions */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-slate-950/40 dark:bg-slate-950/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl shadow-md"
      >
        <div className="flex flex-col text-center md:text-left">
          <h2 className="text-xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-950">Examen Terminé</h2>
          <p className="text-xs text-slate-400 mt-1">Vous pouvez exporter vos résultats, activer le mode enseignant ou revoir vos tentatives.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<History className="h-4 w-4" />}
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Masquer Historique" : "Historique"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<PlusCircle className="h-4 w-4" />}
            onClick={onNewExam}
          >
            Nouveau QCM
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={onRestart}
          >
            Recommencer
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FileDown className="h-4 w-4" />}
            onClick={handleExportPDF}
          >
            Exporter PDF
          </Button>
        </div>
      </motion.div>

      {/* Attempts History Section */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-6 overflow-hidden shadow-xl"
          >
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-4">
              <History className="h-4.5 w-4.5 text-indigo-400" />
              Historique des Tentatives ({attempts.length})
            </h3>
            
            {attempts.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Aucune tentative précédente enregistrée.</p>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">Date / Heure</th>
                      <th className="py-2.5 px-3">Score Global</th>
                      <th className="py-2.5 px-3">Détail (QCM / IA)</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((att) => (
                      <tr key={att.id} className="border-b border-slate-850 hover:bg-slate-950/20 transition-colors">
                        <td className="py-3 px-3 font-medium text-slate-350">
                          {new Date(att.timestamp).toLocaleString('fr-FR', {
                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-bold ${att.result.percentage >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {att.result.score} / {att.result.mcqTotal + att.result.openTotal / 20 * 20} ({att.result.percentage}%)
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-xs">
                          QCM: {att.result.mcqScore}/{att.result.mcqTotal} | IA: {att.result.openScore}/{att.result.openTotal}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => onLoadAttempt?.(att)}
                              className="text-xs px-2.5 py-1 rounded bg-indigo-950/30 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-950/60"
                            >
                              Charger
                            </button>
                            <button
                              onClick={() => onDeleteAttempt?.(att.id)}
                              className="text-xs p-1 rounded bg-rose-950/30 border border-rose-500/20 text-rose-400 hover:bg-rose-950/60"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Grading Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Radial Progress Circle */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-1 bg-slate-900/40 dark:bg-slate-900/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl backdrop-blur-sm"
        >
          <ProgressGauge
            percentage={result.percentage}
            score={result.score}
            total={result.mcqTotal + (openQuestionsCount * 20)}
            size={190}
          />
        </motion.div>

        {/* Stats Dashboard segment */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-2 bg-slate-900/40 dark:bg-slate-900/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 flex flex-col gap-5 shadow-xl backdrop-blur-sm justify-between"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 pb-3">
            <h3 className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-950 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-400" />
              Répartition des Scores
            </h3>
            
            {/* Teacher Mode Trigger */}
            <button
              onClick={() => setIsTeacherMode(!isTeacherMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isTeacherMode
                  ? 'bg-amber-600/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/5'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Mode Enseignant</span>
            </button>
          </div>

          {/* Scores Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* MCQ Block */}
            <div className="p-4 rounded-2xl bg-slate-950/30 border border-slate-800/60 dark:bg-slate-950/30 dark:border-slate-800/60 light:bg-slate-50 light:border-slate-250">
              <span className="text-slate-400 text-xs font-bold block mb-1">Partie QCM / QCU</span>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-100 dark:text-slate-100 light:text-slate-900 font-extrabold text-2xl">
                  {result.mcqScore} / {result.mcqTotal}
                </span>
                <span className="text-slate-500 text-xs">
                  ({result.mcqTotal > 0 ? Math.round((result.mcqScore / result.mcqTotal) * 100) : 0}%)
                </span>
              </div>
            </div>

            {/* Essay questions AI graded block */}
            <div className="p-4 rounded-2xl bg-slate-950/30 border border-slate-800/60 dark:bg-slate-950/30 dark:border-slate-800/60 light:bg-slate-50 light:border-slate-250">
              <span className="text-slate-400 text-xs font-bold block mb-1">Partie Questions Ouvertes (IA)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-100 dark:text-slate-100 light:text-slate-900 font-extrabold text-2xl">
                  {result.openScore} / {result.openTotal}
                </span>
                <span className="text-slate-500 text-xs">
                  ({result.openTotal > 0 ? Math.round((result.openScore / result.openTotal) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>

          {/* General Metadata */}
          <div className="grid grid-cols-3 gap-3 border-t border-slate-850 dark:border-slate-850 light:border-slate-200 pt-4 text-xs font-semibold text-slate-450">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-400" />
              <span>Temps : <span className="text-slate-200 dark:text-slate-200 light:text-slate-850 tabular-nums">{formatTime(result.timeSpent)}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-400" />
              <span>Questions : <span className="text-slate-200 dark:text-slate-200 light:text-slate-850">{result.totalQuestions}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Validées : <span className="text-slate-200 dark:text-slate-200 light:text-slate-850">{result.goodAnswers}</span></span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category breakdown bar meters */}
      {categories.length > 0 && !(categories.length === 1 && categories[0] === 'Général') && (
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/40 dark:bg-slate-900/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 shadow-xl backdrop-blur-sm"
        >
          <h3 className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-950 border-b border-slate-800 pb-3 mb-5">
            Performance par Catégorie
          </h3>
          <div className="space-y-4">
            {categories.map((cat) => {
              const stat = result.categoryStats[cat];
              let barColor = 'bg-rose-500';
              let textColor = 'text-rose-400';
              if (stat.percentage >= 80) {
                barColor = 'bg-emerald-500';
                textColor = 'text-emerald-400';
              } else if (stat.percentage >= 50) {
                barColor = 'bg-blue-500';
                textColor = 'text-blue-400';
              }

              return (
                <div key={cat} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="sm:w-1/3">
                    <span className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-700 text-sm block">{cat}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{stat.correct} / {stat.total}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 bg-slate-950 dark:bg-slate-950 light:bg-slate-200 h-2 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${barColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                    <span className={`text-sm font-bold w-12 text-right ${textColor}`}>
                      {stat.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Teacher Mode Control Panel Bar */}
      {isTeacherMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-950/20 border-2 border-dashed border-amber-500/40 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-slate-100 font-bold text-base">Panneau d'Ajustement Enseignant</h4>
              <p className="text-xs text-amber-450 mt-0.5">
                Vous modifiez manuellement les notes et appréciations fournies par l'IA. Cliquez sur sauvegarder pour recalculer les scores finaux.
              </p>
            </div>
          </div>
          <Button
            variant="success"
            size="md"
            leftIcon={<Save className="h-4.5 w-4.5" />}
            onClick={handleSaveTeacherAdjustments}
            className="w-full sm:w-auto shadow-md shadow-emerald-500/10"
          >
            Sauvegarder les notes
          </Button>
        </motion.div>
      )}

      {/* Correction section list */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-6"
      >
        <h3 className="font-extrabold text-2xl text-slate-100 dark:text-slate-100 light:text-slate-900 mt-4 mb-2">
          Correction Détaillée
        </h3>

        {questions.map((q, idx) => {
          const userAnswer = answers[q.id];
          const isMCQ = ['QCU', 'QCM'].includes(q.type);

          if (isMCQ) {
            // MCQ Correction cards (original exact logic)
            const selIndices = userAnswer as number[] || [];
            const isCorrect = arraysEqual(selIndices, q.correct || []);

            return (
              <motion.div
                key={q.id}
                className={`border rounded-3xl p-6 sm:p-8 flex flex-col gap-5 bg-slate-900/20 dark:bg-slate-900/20 light:bg-white transition-colors duration-200 ${
                  isCorrect 
                    ? 'border-emerald-500/20 hover:border-emerald-500/40 shadow-md shadow-emerald-500/2' 
                    : 'border-rose-500/20 hover:border-rose-500/40 shadow-md shadow-rose-500/2'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-850 dark:bg-slate-800 light:bg-slate-150 border border-slate-800 dark:border-slate-700 light:border-slate-200 text-slate-400">
                      Question {idx + 1}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-850 dark:bg-slate-800 light:bg-slate-150 border border-slate-800 dark:border-slate-700 light:border-slate-200 text-slate-400">
                      {q.type}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-850 dark:bg-slate-800 light:bg-slate-150 border border-slate-800 dark:border-slate-700 light:border-slate-200 text-slate-400">
                      {q.category || 'Général'}
                    </span>
                  </div>

                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-400'
                  }`}>
                    {isCorrect ? (
                      <>
                        <Check className="h-4 w-4 stroke-[2.5]" />
                        <span>Correct (10/10)</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 stroke-[2.5]" />
                        <span>Incorrect (0/10)</span>
                      </>
                    )}
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-slate-100 dark:text-slate-100 light:text-slate-850 leading-relaxed">
                  {q.question}
                </h4>

                <div className="space-y-3 mt-1">
                  {q.options?.map((opt, optIdx) => {
                    const isSelected = selIndices.includes(optIdx);
                    const isOptionCorrect = q.correct?.includes(optIdx);

                    let optionBorder = 'border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-950/20 dark:bg-slate-950/20 light:bg-slate-50 text-slate-400';
                    let statusBadge = null;

                    if (isOptionCorrect) {
                      optionBorder = 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400';
                      statusBadge = (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 uppercase tracking-wider ml-auto flex-shrink-0">
                          Réponse attendue
                        </span>
                      );
                    } else if (isSelected && !isOptionCorrect) {
                      optionBorder = 'border-rose-500/40 bg-rose-500/5 text-rose-400';
                      statusBadge = (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-400 uppercase tracking-wider ml-auto flex-shrink-0">
                          Votre choix (faux)
                        </span>
                      );
                    } else if (isSelected && isOptionCorrect) {
                      optionBorder = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-start sm:items-center gap-3.5 p-3.5 rounded-xl border text-sm font-medium transition-all ${optionBorder}`}
                      >
                        <div className="mt-0.5 sm:mt-0 flex-shrink-0">
                          {q.type === 'QCU' ? (
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected 
                                ? isOptionCorrect ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500' 
                                : 'border-slate-700'
                            }`}>
                              {isSelected && <div className={`w-2 h-2 rounded-full ${isOptionCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />}
                            </div>
                          ) : (
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected 
                                ? isOptionCorrect ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-rose-500 border-rose-500 text-slate-950' 
                                : 'border-slate-700'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                          )}
                        </div>
                        
                        <span className="flex-1 leading-relaxed text-slate-200 dark:text-slate-200 light:text-slate-800">
                          {opt}
                        </span>
                        {statusBadge}
                      </div>
                    );
                  })}
                </div>

                {/* AI Explanation for Incorrect MCQ */}
                {result.mcqExplanations && result.mcqExplanations[q.id] && (
                  <div className="mt-2 p-5 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-l-4 border-blue-500 bg-slate-950/40 flex gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 self-start">
                      <Brain className="h-5 w-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-extrabold text-blue-400 tracking-wider uppercase">Explication de l'IA</span>
                      <p className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed font-medium">
                        {result.mcqExplanations[q.id]}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          }

          // Open-ended essay Correction cards
          const essayAnswer = userAnswer as string || '';
          const originalGrade = result.openGrades[q.id];
          const adjustedGrade = localAdjustments[q.id];

          // Merged values (adjusted overrides AI values)
          const score = adjustedGrade?.score !== undefined ? adjustedGrade.score : (originalGrade?.score || 0);
          const feedback = adjustedGrade?.feedback !== undefined ? adjustedGrade.feedback : (originalGrade?.feedback || '');
          const strengths = adjustedGrade?.strengths !== undefined ? adjustedGrade.strengths : (originalGrade?.strengths || []);
          const missingPoints = adjustedGrade?.missing_points !== undefined ? adjustedGrade.missing_points : (originalGrade?.missing_points || []);

          const isPassing = score >= 10;
          const isModelAnswerCollapsed = collapsedModelAnswers[q.id] !== false; // collapsed by default

          return (
            <motion.div
              key={q.id}
              className={`border rounded-3xl p-6 sm:p-8 flex flex-col gap-5 bg-slate-900/20 dark:bg-slate-900/20 light:bg-white transition-colors duration-200 ${
                isPassing 
                  ? 'border-emerald-500/20 hover:border-emerald-500/40 shadow-md shadow-emerald-500/2' 
                  : 'border-rose-500/20 hover:border-rose-500/40 shadow-md shadow-rose-500/2'
              }`}
            >
              {/* Question metadata header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-850 dark:bg-slate-800 light:bg-slate-150 border border-slate-800 dark:border-slate-700 light:border-slate-200 text-slate-400">
                    Question {idx + 1}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-850 dark:bg-slate-800 light:bg-slate-150 border border-slate-800 dark:border-slate-700 light:border-slate-200 text-slate-400">
                    {q.type}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-850 dark:bg-slate-800 light:bg-slate-150 border border-slate-800 dark:border-slate-700 light:border-slate-200 text-slate-400">
                    {q.category || 'Général'}
                  </span>
                </div>

                {/* Score rating display */}
                <div className="flex items-center gap-3">
                  {isTeacherMode ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-600/10 border border-amber-500/35 text-amber-400 text-sm font-extrabold animate-pulse">
                      <span>Note Enseignant :</span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={score}
                        onChange={(e) => handleTeacherScoreChange(q.id, parseInt(e.target.value) || 0)}
                        className="w-14 bg-slate-950 border border-amber-500/30 rounded px-1 text-center font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <span>/ 20</span>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      isPassing
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-400'
                    }`}>
                      <span>Note : {score} / 20</span>
                      {adjustedGrade?.score !== undefined && (
                        <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 ml-1.5">
                          Corrigé
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Case Scenario if CASE_STUDY */}
              {q.type === 'CASE_STUDY' && q.scenario && (
                <div className="p-4 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-100 border border-slate-850 dark:border-slate-850 light:border-slate-200 rounded-2xl text-slate-350 dark:text-slate-350 light:text-slate-650 text-sm leading-relaxed">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">Scénario du cas</span>
                  {q.scenario}
                </div>
              )}

              {/* Question text */}
              <h4 className="text-lg font-semibold text-slate-100 dark:text-slate-100 light:text-slate-850 leading-relaxed">
                {q.question}
              </h4>

              {/* Student text response container */}
              <div className="bg-slate-950/30 border border-slate-850 rounded-2xl p-4 flex flex-col gap-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Votre Réponse</span>
                <p className="text-slate-250 dark:text-slate-200 light:text-slate-800 whitespace-pre-wrap leading-relaxed text-sm">
                  {essayAnswer.trim() || <span className="text-slate-600 italic">Aucune réponse rédigée.</span>}
                </p>
              </div>

              {/* Collapsed Expected Model Answer */}
              {q.expected_answer && (
                <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/15">
                  <button
                    onClick={() => toggleModelAnswer(q.id)}
                    className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <span>RÉPONSE MODÈLE ATTENDUE</span>
                    {isModelAnswerCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                  
                  <AnimatePresence>
                    {!isModelAnswerCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 text-xs text-slate-400 border-t border-slate-850 pt-3 whitespace-pre-wrap leading-relaxed"
                      >
                        {q.expected_answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* AI Evaluation Box Card */}
              <div className="bg-slate-950/20 border border-slate-800/60 rounded-3xl p-5 sm:p-6 flex flex-col gap-4.5">
                <div className="flex items-center gap-2">
                  <Brain className="h-4.5 w-4.5 text-indigo-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-350">
                    Évaluation de l'IA (Groq Corrector)
                  </span>
                </div>

                {/* Feedback Comment */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Appréciation Générale</span>
                  {isTeacherMode ? (
                    <textarea
                      value={feedback}
                      onChange={(e) => handleTeacherFeedbackChange(q.id, e.target.value)}
                      className="w-full min-h-[80px] text-xs p-3 border border-amber-500/20 rounded-xl bg-slate-950 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 custom-scrollbar resize-y"
                    />
                  ) : (
                    <p className="text-slate-300 dark:text-slate-300 light:text-slate-700 text-sm leading-relaxed">
                      {feedback}
                    </p>
                  )}
                </div>

                {/* Strengths and missing points split columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-850 pt-4.5">
                  {/* Strengths list */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide block">Points Forts</span>
                    
                    <div className="space-y-2">
                      {strengths.map((str, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          {isTeacherMode ? (
                            <div className="flex-1 flex gap-1">
                              <input
                                type="text"
                                value={str}
                                onChange={(e) => handleTeacherArrayChange(q.id, 'strengths', idx, e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 text-xs px-2 py-1 rounded text-slate-100"
                              />
                              <button
                                onClick={() => removeTeacherArrayItem(q.id, 'strengths', idx)}
                                className="text-rose-500 hover:text-rose-400 p-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-350 dark:text-slate-300 light:text-slate-750 text-xs">{str}</span>
                          )}
                        </div>
                      ))}

                      {isTeacherMode && (
                        <button
                          onClick={() => addTeacherArrayItem(q.id, 'strengths')}
                          className="text-[11px] font-bold text-amber-500 hover:text-amber-400 mt-1 flex items-center gap-1"
                        >
                          + Ajouter un point fort
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Missing points list */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide block">Éléments manquants ou imprécisions</span>
                    
                    <div className="space-y-2">
                      {missingPoints.map((mis, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                          {isTeacherMode ? (
                            <div className="flex-1 flex gap-1">
                              <input
                                type="text"
                                value={mis}
                                onChange={(e) => handleTeacherArrayChange(q.id, 'missing_points', idx, e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 text-xs px-2 py-1 rounded text-slate-100"
                              />
                              <button
                                onClick={() => removeTeacherArrayItem(q.id, 'missing_points', idx)}
                                className="text-rose-500 hover:text-rose-400 p-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-350 dark:text-slate-300 light:text-slate-750 text-xs">{mis}</span>
                          )}
                        </div>
                      ))}

                      {isTeacherMode && (
                        <button
                          onClick={() => addTeacherArrayItem(q.id, 'missing_points')}
                          className="text-[11px] font-bold text-amber-500 hover:text-amber-400 mt-1 flex items-center gap-1"
                        >
                          + Ajouter un élément manquant
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom control buttons */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-center gap-4 border-t border-slate-850 pt-8 pb-12"
      >
        <Button
          variant="outline"
          size="lg"
          leftIcon={<PlusCircle className="h-5 w-5" />}
          onClick={onNewExam}
        >
          Créer un autre examen
        </Button>
        <Button
          variant="secondary"
          size="lg"
          leftIcon={<RotateCcw className="h-5 w-5" />}
          onClick={onRestart}
        >
          Recommencer l'examen
        </Button>
      </motion.div>
    </motion.div>
  );
};

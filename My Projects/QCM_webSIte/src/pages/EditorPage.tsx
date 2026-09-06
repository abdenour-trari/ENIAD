import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Trash2, Upload, Settings } from 'lucide-react';
import { CodeEditor } from '../components/CodeEditor';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { parsePythonQuestions } from '../parser/pythonParser';
import type { Question, ExamSettings } from '../types';

interface EditorPageProps {
  initialCode: string;
  onGenerateExam: (questions: Question[], settings: ExamSettings) => void;
  onBack: () => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({
  initialCode,
  onGenerateExam,
  onBack,
}) => {
  const [code, setCode] = useState(initialCode);
  const [errors, setErrors] = useState<string[]>([]);
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exam Settings State
  const [enableTimer, setEnableTimer] = useState(false);
  const [duration, setDuration] = useState(15); // Default 15 minutes
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  // Validate python code on change or on mount
  useEffect(() => {
    const { questions, errors } = parsePythonQuestions(code);
    setErrors(errors);
    setParsedQuestions(questions);
  }, [code]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (window.confirm("Voulez-vous vraiment effacer tout le code de l'éditeur ?")) {
      setCode('');
    }
  };

  const handleStartExam = () => {
    if (parsedQuestions.length === 0) return;
    
    onGenerateExam(parsedQuestions, {
      enableTimer,
      duration,
      shuffleQuestions,
      shuffleOptions,
    });
  };

  const qcuCount = parsedQuestions.filter(q => q.type === 'QCU').length;
  const qcmCount = parsedQuestions.filter(q => q.type === 'QCM').length;
  const uniqueCategories = Array.from(new Set(parsedQuestions.map(q => q.category || 'Général')));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 w-full flex-1 flex flex-col gap-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 font-medium transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Retour</span>
        </button>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".py,.txt"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Charger fichier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-500 hover:bg-rose-950/20 hover:text-rose-400"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={handleClear}
          >
            Effacer
          </Button>
        </div>
      </div>

      {/* Editor & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch">
        {/* Left Column: Monaco Editor */}
        <div className="lg:col-span-2 flex flex-col h-[500px] lg:h-auto min-h-[450px]">
          <CodeEditor value={code} onChange={setCode} />
        </div>

        {/* Right Column: Settings & Validation info */}
        <div className="flex flex-col gap-6 lg:h-auto">
          {/* Validation Status Panel */}
          <div className="bg-slate-900/40 dark:bg-slate-900/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
            <h3 className="font-bold text-lg text-slate-100 dark:text-slate-100 light:text-slate-800 flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-400" />
              Analyse & Statuts
            </h3>

            {errors.length > 0 ? (
              <Alert
                type="error"
                title="Erreurs d'analyse détectées"
                errorsList={errors}
              />
            ) : parsedQuestions.length > 0 ? (
              <div className="space-y-4">
                <Alert
                  type="success"
                  title="Code Python valide !"
                  message={`${parsedQuestions.length} question(s) correctement chargée(s).`}
                />
                
                {/* Stats Breakdown */}
                <div className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-slate-50 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 p-4 rounded-2xl grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block mb-1">Choix Unique (QCU)</span>
                    <span className="text-slate-100 dark:text-slate-100 light:text-slate-800 text-lg font-bold">{qcuCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Choix Multiple (QCM)</span>
                    <span className="text-slate-100 dark:text-slate-100 light:text-slate-800 text-lg font-bold">{qcmCount}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 pt-3">
                    <span className="text-slate-400 block mb-1">Catégories détectées</span>
                    <span className="text-slate-100 dark:text-slate-100 light:text-slate-800 font-bold block max-h-20 overflow-y-auto custom-scrollbar">
                      {uniqueCategories.join(', ') || 'Aucune'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <Alert
                type="warning"
                title="Éditeur vide"
                message="Collez du code questions ou importez un fichier Python pour générer l'examen."
              />
            )}
          </div>

          {/* Exam Settings Panel */}
          <div className="bg-slate-900/40 dark:bg-slate-900/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 flex flex-col gap-5 shadow-xl">
            <h3 className="font-bold text-lg text-slate-100 dark:text-slate-100 light:text-slate-800 flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-400" />
              Options de l'examen
            </h3>

            <div className="space-y-4">
              {/* Shuffling Questions */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 group-hover:text-slate-100 transition-colors">
                    Mélanger les questions
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
                    Affiche les questions dans un ordre aléatoire
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 bg-slate-950 border-slate-700 focus:ring-blue-500"
                />
              </label>

              {/* Shuffling Options */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 group-hover:text-slate-100 transition-colors">
                    Mélanger les réponses
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
                    Mélange l'ordre des options de chaque question
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 bg-slate-950 border-slate-700 focus:ring-blue-500"
                />
              </label>

              {/* Timer Config */}
              <div className="border-t border-slate-800 dark:border-slate-800 light:border-slate-200 pt-4 flex flex-col gap-3">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 group-hover:text-slate-100 transition-colors">
                      Minuterie (Temps Limité)
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
                      Soumet l'examen automatiquement à la fin du temps
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableTimer}
                    onChange={(e) => setEnableTimer(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500 bg-slate-950 border-slate-700 focus:ring-blue-500"
                  />
                </label>

                {enableTimer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-3 pl-2 mt-1"
                  >
                    <span className="text-xs font-semibold text-slate-400">Durée (minutes) :</span>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={duration}
                      onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-950 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-250 text-slate-100 dark:text-slate-100 light:text-slate-950 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Launch Exam Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-2 py-3.5 shadow-lg shadow-blue-500/20"
              leftIcon={<Play className="h-5 w-5 fill-current" />}
              disabled={parsedQuestions.length === 0 || errors.length > 0}
              onClick={handleStartExam}
            >
              Générer l'examen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

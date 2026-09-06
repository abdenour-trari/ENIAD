"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, HelpCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  chapterId: number;
  onComplete?: () => void;
}

export default function Quiz({ questions, chapterId, onComplete }: QuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleOptionClick = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isSubmitted) return;

    const isCorrect = selectedOption === questions[currentIdx].correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setIsSubmitted(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setShowResults(true);
      if (score + (selectedOption === questions[currentIdx].correctIndex ? 1 : 0) === questions.length) {
        // Perfect score confetti!
        triggerConfetti();
      }
      if (onComplete) onComplete();
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResults(false);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#a78bfa", "#22d3ee", "#818cf8", "#f472b6"],
    });
  };

  const currentQuestion = questions[currentIdx];

  if (showResults) {
    const isPerfect = score === questions.length;
    return (
      <div className="glass-panel p-8 text-center border-violet-500/30 bg-gradient-to-br from-[#0f0933] to-[#040114] max-w-xl mx-auto my-6">
        <Award className={`mx-auto w-16 h-16 mb-4 ${isPerfect ? "text-yellow-400" : "text-violet-400"}`} />
        <h3 className="text-2xl font-bold text-white mb-2">Quiz Terminé !</h3>
        <p className="text-gray-300 mb-6">
          Votre score : <span className="font-bold text-cyan-400 text-xl">{score}</span> / {questions.length}
        </p>

        <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
          {isPerfect ? (
            <p className="text-green-400 font-medium">Excellente performance ! Vous maîtrisez parfaitement les concepts de cette partie.</p>
          ) : score >= questions.length / 2 ? (
            <p className="text-cyan-300 font-medium">Bien joué ! Quelques points méritent une relecture, mais les bases sont acquises.</p>
          ) : (
            <p className="text-rose-400 font-medium font-semibold">Prenez le temps de relire la théorie et retentez votre chance !</p>
          )}
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 mx-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all focus:outline-none"
        >
          <RotateCcw size={16} /> Recommencer le Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 border-violet-500/20 bg-gradient-to-br from-[#0b0728] to-[#040114] my-6 max-w-2xl mx-auto">
      {/* Progress header */}
      <div className="flex justify-between items-center text-xs font-semibold text-violet-400 uppercase tracking-wider mb-4">
        <span>Quiz de la Partie {chapterId}</span>
        <span>Question {currentIdx + 1} sur {questions.length}</span>
      </div>

      <div className="w-full bg-white/5 h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-400 to-violet-500 h-1.5 transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <h3 className="text-lg font-bold text-white mb-6 leading-snug">{currentQuestion.question}</h3>

      {/* Answer options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, idx) => {
          let optionClass = "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-violet-500/40";
          let icon = null;

          if (isSubmitted) {
            if (idx === currentQuestion.correctIndex) {
              optionClass = "bg-emerald-950/40 border-emerald-500/60 text-emerald-300";
              icon = <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />;
            } else if (idx === selectedOption) {
              optionClass = "bg-rose-950/40 border-rose-500/60 text-rose-300";
              icon = <XCircle size={18} className="text-rose-400 shrink-0" />;
            } else {
              optionClass = "bg-white/5 border-white/5 text-gray-500 opacity-60";
            }
          } else if (idx === selectedOption) {
            optionClass = "bg-violet-950/40 border-violet-500/80 text-violet-200 shadow-md shadow-violet-500/10";
          }

          return (
            <button
              key={idx}
              disabled={isSubmitted}
              onClick={() => handleOptionClick(idx)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left text-sm transition-all focus:outline-none ${optionClass}`}
            >
              <span className="pr-4">{option}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex justify-end gap-3 items-center">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg shadow-md transition-all focus:outline-none"
          >
            Valider la réponse
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-violet-500/15 transition-all focus:outline-none"
          >
            {currentIdx < questions.length - 1 ? (
              <>
                Question suivante <ArrowRight size={16} />
              </>
            ) : (
              "Terminer le Quiz"
            )}
          </button>
        )}
      </div>

      {/* Explanations section */}
      {isSubmitted && (
        <div className="mt-6 bg-white/5 border border-white/10 p-4 rounded-xl animate-fadeIn">
          <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HelpCircle size={14} /> Explication de la réponse
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">{currentQuestion.explanation}</p>
        </div>
      )}
    </div>
  );
}

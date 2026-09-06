"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Play, Code, CheckSquare, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { ChapterData } from "@/data/courseData";
import { useProgress } from "@/hooks/useProgress";
import Quiz from "./Quiz";

interface ChapterLayoutProps {
  chapter: ChapterData;
  nextChapterId: number | null;
  prevChapterId: number | null;
  visualization: React.ReactNode;
}

type TabType = "theory" | "sim" | "code" | "quiz";

export default function ChapterLayout({
  chapter,
  nextChapterId,
  prevChapterId,
  visualization,
}: ChapterLayoutProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("theory");
  const { completed, markChapterComplete } = useProgress();

  const isCompleted = completed.includes(chapter.id);

  // Scroll to top when active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab, chapter.id]);

  const tabs = [
    { id: "theory" as TabType, label: "Théorie & Analogies", icon: <BookOpen size={16} /> },
    { id: "sim" as TabType, label: "Simulation Live", icon: <Play size={16} /> },
    { id: "code" as TabType, label: "Code & Script", icon: <Code size={16} /> },
    { id: "quiz" as TabType, label: "Quiz Interactif", icon: <CheckSquare size={16} /> },
  ];

  const handleNextChapter = () => {
    if (nextChapterId) {
      setActiveTab("theory");
      router.push(`/parties/${nextChapterId}`);
    }
  };

  const handlePrevChapter = () => {
    if (prevChapterId) {
      setActiveTab("theory");
      router.push(`/parties/${prevChapterId}`);
    }
  };

  const handleQuizComplete = () => {
    markChapterComplete(chapter.id);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 md:px-8">
      {/* Chapter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 font-semibold uppercase tracking-wider border border-violet-500/20">
              Module Académique
            </span>
            {isCompleted && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold flex items-center gap-1 border border-emerald-500/20">
                <Check size={12} /> Terminé
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {chapter.title}
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-3xl leading-relaxed">
            {chapter.shortDescription}
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto gap-2 border-b border-white/5 pb-px mb-8 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-medium border-b-2 whitespace-nowrap transition-all focus:outline-none ${
                isActive
                  ? "border-cyan-400 text-cyan-400 bg-cyan-950/10"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + "_" + chapter.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "theory" && (
              <div className="space-y-6">
                <div className="glass-panel p-6 border-white/5 bg-[#0b0826]/20">
                  <h3 className="text-lg font-bold text-white mb-4">Introduction Intuitive</h3>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {chapter.introduction}
                  </p>
                </div>

                <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
                  {/* Process formatting of Theory markup */}
                  <div className="text-sm md:text-base leading-relaxed space-y-4 text-gray-300">
                    {/* Render theory text segments using simple HTML elements helper or dangerouslySetInnerHTML. 
                        Since KaTeX block math will be rendered by the caller or special tags, we structure theory beautifully. */}
                    <div 
                      className="markdown-content space-y-4"
                      dangerouslySetInnerHTML={{ 
                        __html: formatTheoryMarkdown(chapter.theory) 
                      }} 
                    />
                  </div>
                </div>

                {chapter.pointsImportants && chapter.pointsImportants.length > 0 && (
                  <div className="glass-panel p-6 border-amber-500/20 bg-amber-950/5 mt-8">
                    <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-3">
                      ⚠️ Points Importants à Retenir
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                      {chapter.pointsImportants.map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {chapter.comparisons && chapter.comparisons.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-md font-bold text-white mb-4">
                      Comparaison des Méthodes
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/10 text-gray-300 font-semibold">
                            <th className="p-4">Caractéristique</th>
                            <th className="p-4">Méthode A</th>
                            <th className="p-4">Méthode B</th>
                            <th className="p-4">Observation / Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-400">
                          {chapter.comparisons.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-all">
                              <td className="p-4 font-medium text-white">{row.feature}</td>
                              <td className="p-4">{row.methodA}</td>
                              <td className="p-4 text-cyan-300">{row.methodB}</td>
                              <td className="p-4 text-xs italic">{row.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Synthesis list */}
                <div className="glass-panel p-6 border-cyan-500/20 bg-cyan-950/5 mt-8">
                  <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-4">
                    Résumé Pédagogique
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chapter.summary.map((sum, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-sm text-gray-300">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>{sum}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sim" && (
              <div className="space-y-6">
                <div className="glass-panel p-6 border-white/5 bg-[#0b0826]/20 mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">Simulateur Interactif & Dénouement Visuel</h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    Manipulez les curseurs, cliquez sur les éléments ou lancez l'entraînement pour observer les concepts de la partie se matérialiser en temps réel.
                  </p>
                </div>
                {visualization}
              </div>
            )}

            {activeTab === "code" && (
              <div className="space-y-6">
                <div className="glass-panel p-6 border-white/5 bg-[#0b0826]/20">
                  <h3 className="text-lg font-bold text-white mb-2">Implémentation de Référence</h3>
                  <p className="text-sm text-gray-300">
                    Voici l'architecture du modèle codée en PyTorch (Python). Lisez les commentaires pour comprendre le flux des données à travers les tenseurs.
                  </p>
                </div>

                <div className="relative rounded-2xl border border-white/10 bg-black/60 overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-6 py-3.5 bg-white/5 border-b border-white/5">
                    <span className="text-xs font-mono text-cyan-400">model_drl.py</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(chapter.code);
                        alert("Code copié dans le presse-papier !");
                      }}
                      className="text-xs text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all focus:outline-none"
                    >
                      Copier le code
                    </button>
                  </div>
                  <pre className="p-6 overflow-x-auto text-xs md:text-sm font-mono text-cyan-300 leading-relaxed bg-[#02000c]">
                    <code>{chapter.code}</code>
                  </pre>
                </div>
              </div>
            )}

            {activeTab === "quiz" && (
              <Quiz
                questions={chapter.quiz}
                chapterId={chapter.id}
                onComplete={handleQuizComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Chapter Navigation Footer */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10">
        {prevChapterId ? (
          <button
            onClick={handlePrevChapter}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-xl transition-all focus:outline-none"
          >
            <ChevronLeft size={16} />
            <span>Partie précédente</span>
          </button>
        ) : (
          <div />
        )}

        {nextChapterId ? (
          <button
            onClick={handleNextChapter}
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 bg-cyan-950/20 border border-cyan-800/30 hover:border-cyan-500/50 px-4 py-2.5 rounded-xl transition-all focus:outline-none"
          >
            <span>Partie suivante</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// Simple parser to convert headers and lists to basic styled HTML to avoid complex md libraries
function formatTheoryMarkdown(text: string): string {
  let html = text;

  // Convert h3
  html = html.replace(/###\s+(.*)/g, '<h3 class="text-lg font-bold text-white mt-6 mb-3 border-l-2 border-cyan-400 pl-2">$1</h3>');

  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-300 font-semibold">$1</strong>');

  // Convert list items
  html = html.replace(/^\s*-\s+(.*)/gm, '<li class="text-gray-300 ml-4">$1</li>');
  html = html.replace(/^\s*\d\.\s+(.*)/gm, '<li class="text-gray-300 list-decimal ml-6">$1</li>');

  // Wrap lists in ul/ol if needed, but simple list items with margins work well.
  
  // Format math expressions temporarily - they will be formatted by KaTeX in the component if block, 
  // but for inline math like $V(s)$ we can wrap them in a styled code block.
  html = html.replace(/\$(.*?)\$/g, '<code class="bg-[#110b30] border border-violet-500/20 px-1.5 py-0.5 rounded font-mono text-cyan-400 text-xs">$1</code>');

  return html;
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { courseChapters } from "@/data/courseData";
import { Brain, Sparkles, BookOpen, Award, CheckCircle, ArrowRight, Play } from "lucide-react";

export default function Home() {
  const { completed } = useProgress();
  const [mounted, setMounted] = useState(false);

  // Avoid SSR mismatch for localStorage checkmarks
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalChapters = courseChapters.length;
  const completedCount = mounted ? completed.length : 0;
  const progressPercent = Math.round((completedCount / totalChapters) * 100);

  return (
    <div className="w-full min-h-screen py-10 px-6 md:px-12 relative overflow-hidden bg-[#030014]">
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-violet-900/10 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-900/10 blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <Sparkles size={14} /> Formation Académique Supérieure
        </div>
        
        <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-none mb-6">
          Maîtrisez le <br />
          <span className="text-shimmer">Deep Reinforcement Learning</span>
        </h2>
        
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          Explorez les secrets de l'apprentissage par renforcement profond à travers des théories rigoureuses, des codes PyTorch industriels et des simulations interactives en temps réel dans votre navigateur.
        </p>

        <div className="flex flex-wrap gap-4 justify-center items-center">
          <Link
            href="/parties/1"
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-violet-500/25 transition-all text-sm focus:outline-none"
          >
            <Play size={16} /> Commencer le cours
          </Link>
          <a
            href="#chapters"
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-bold px-6 py-4 rounded-xl transition-all text-sm focus:outline-none"
          >
            Voir le programme
          </a>
        </div>
      </div>

      {/* Progress Dashboard Banner */}
      {mounted && (
        <div className="max-w-5xl mx-auto glass-panel p-6 border-violet-500/15 bg-gradient-to-r from-[#0d092d] to-[#040114] mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex items-center gap-4 border-r border-white/5 pr-4">
              <div className="p-3.5 rounded-xl bg-violet-500/10 text-violet-400">
                <Brain size={24} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-semibold">Statut</span>
                <span className="text-sm font-bold text-white">Apprenti Chercheur</span>
              </div>
            </div>

            <div className="flex items-center gap-4 border-r border-white/5 pr-4">
              <div className="p-3.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <CheckCircle size={24} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-semibold">Parties Validées</span>
                <span className="text-sm font-bold text-white">
                  {completedCount} sur {totalChapters} ({progressPercent}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-yellow-500/10 text-yellow-400">
                <Award size={24} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-semibold">Distinction</span>
                <span className="text-sm font-bold text-white">
                  {progressPercent === 100 ? "Maîtrise Complète ✨" : progressPercent >= 50 ? "Avancé" : "Débutant"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapters Grid Section */}
      <div id="chapters" className="max-w-5xl mx-auto scroll-mt-20">
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-cyan-400" size={20} /> Programme d'études (M1/M2)
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Un parcours progressif et académique structuré en 11 parties complètes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courseChapters.map((chapter) => {
            const isCompleted = mounted && completed.includes(chapter.id);
            return (
              <Link
                key={chapter.id}
                href={`/parties/${chapter.id}`}
                className="group glass-panel p-5 border-white/5 bg-[#0b0826]/20 flex flex-col justify-between hover:border-violet-500/30 hover:bg-[#0b0826]/40 text-left min-h-[190px]"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider bg-violet-950/40 px-2 py-0.5 rounded border border-violet-800/30">
                      Partie {chapter.id}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/30 flex items-center gap-1">
                        ✓ Validé
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {chapter.title.split(".")[1]?.trim() || chapter.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                    {chapter.shortDescription}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 mt-4 group-hover:gap-2 transition-all uppercase tracking-wider">
                  Étudier <ArrowRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "@/hooks/useProgress";
import { courseChapters } from "@/data/courseData";
import ProgressBar from "./ProgressBar";
import { Brain, Menu, X, BookOpen, CheckCircle, Circle, Home, GraduationCap } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { completed, toggleChapter } = useProgress();
  const [isOpen, setIsOpen] = useState(false);

  const totalChapters = courseChapters.length;
  const progressPercent = (completed.length / totalChapters) * 100;

  const toggleMobileSidebar = () => setIsOpen(!isOpen);
  const closeMobileSidebar = () => setIsOpen(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#04021a]/95 backdrop-blur-xl border-r border-violet-500/10 p-6">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <Brain size={22} className="text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-extrabold text-md text-white tracking-wider flex items-center gap-1.5">
            DeepRL <span className="text-xs px-1.5 py-0.5 rounded bg-violet-600/30 text-violet-300 font-normal">Académique</span>
          </h1>
          <p className="text-[10px] text-gray-400">Plateforme Premium IA</p>
        </div>
      </div>

      {/* Progress tracker */}
      <ProgressBar progress={progressPercent} />

      {/* Navigation */}
      <div className="flex flex-col gap-1 overflow-y-auto flex-1 pr-2">
        <Link
          href="/"
          onClick={closeMobileSidebar}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            pathname === "/"
              ? "bg-violet-950/40 border border-violet-500/40 text-violet-200 shadow-md shadow-violet-500/5"
              : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          <Home size={18} />
          <span>Tableau de bord</span>
        </Link>

        <div className="mt-4 mb-2 px-4 text-[10px] font-semibold text-violet-400 uppercase tracking-widest">
          Parties (1 - 11)
        </div>

        {courseChapters.map((chapter) => {
          const isCompleted = completed.includes(chapter.id);
          const isActive = pathname === `/parties/${chapter.id}`;

          return (
            <div
              key={chapter.id}
              className={`group flex items-center justify-between rounded-xl transition-all border ${
                isActive
                  ? "bg-gradient-to-r from-violet-950/40 to-indigo-950/20 border-violet-500/30 text-white"
                  : "border-transparent hover:bg-white/5 hover:border-white/5"
              }`}
            >
              <Link
                href={`/parties/${chapter.id}`}
                onClick={closeMobileSidebar}
                className="flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-medium flex-1 overflow-hidden"
              >
                <BookOpen size={16} className={isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-gray-300"} />
                <span className="truncate text-left text-gray-300 group-hover:text-white">
                  {chapter.title.split(".")[1]?.trim() || chapter.title}
                </span>
              </Link>

              {/* Toggle manual completion */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleChapter(chapter.id);
                }}
                className="p-3 text-gray-500 hover:text-cyan-400 transition-colors focus:outline-none"
                title={isCompleted ? "Marquer comme non terminé" : "Marquer comme terminé"}
              >
                {isCompleted ? (
                  <CheckCircle size={16} className="text-emerald-400" />
                ) : (
                  <Circle size={16} className="text-gray-600 hover:border-cyan-400" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="mt-auto pt-6 border-t border-white/5 text-[10px] text-gray-500 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <GraduationCap size={12} /> ENIAD 2éme année cycle IA
          </span>
          <span>v1.0.0</span>
        </div>
        <p className="text-[9px] text-gray-400 font-medium leading-relaxed text-left border-t border-white/5 pt-2">
          Développé à l'aide de l'IA, sources et informations par <strong className="text-violet-300">TRARI Abdenour</strong>
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="md:hidden w-full h-16 bg-[#030014]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 fixed top-0 left-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <Brain className="text-violet-500" size={20} />
          <span className="font-extrabold text-sm text-white tracking-wider">DeepRL</span>
        </Link>
        <button
          onClick={toggleMobileSidebar}
          className="p-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:block w-72 h-screen sticky top-0 left-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={closeMobileSidebar}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Mobile Drawer Content */}
      <aside
        className={`md:hidden fixed top-0 left-0 w-80 h-full z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

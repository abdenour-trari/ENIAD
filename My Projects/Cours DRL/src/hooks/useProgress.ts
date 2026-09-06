"use client";

import { useState, useEffect } from "react";

const PROGRESS_KEY = "drl_course_progress_v1";
const PROGRESS_EVENT = "drl_progress_changed";

export function getCompletedChapters(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading progress", e);
    return [];
  }
}

export function useProgress() {
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    // Initial load
    setCompleted(getCompletedChapters());

    const handleProgressChange = () => {
      setCompleted(getCompletedChapters());
    };

    window.addEventListener(PROGRESS_EVENT, handleProgressChange);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, handleProgressChange);
    };
  }, []);

  const toggleChapter = (chapterId: number) => {
    try {
      const current = getCompletedChapters();
      let updated: number[];
      if (current.includes(chapterId)) {
        updated = current.filter((id) => id !== chapterId);
      } else {
        updated = [...current, chapterId];
      }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(PROGRESS_EVENT));
    } catch (e) {
      console.error("Error saving progress", e);
    }
  };

  const markChapterComplete = (chapterId: number) => {
    try {
      const current = getCompletedChapters();
      if (!current.includes(chapterId)) {
        const updated = [...current, chapterId];
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event(PROGRESS_EVENT));
      }
    } catch (e) {
      console.error("Error saving progress", e);
    }
  };

  return {
    completed,
    toggleChapter,
    markChapterComplete,
  };
}

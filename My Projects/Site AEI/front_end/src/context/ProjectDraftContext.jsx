import React, { createContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import {
  saveLocalDraft,
  getLocalDraft,
  clearLocalDraft,
  saveRemoteDraft,
  getRemoteDraft,
  clearRemoteDraft
} from "../services/draftStorage";

export const ProjectDraftContext = createContext(null);

const INITIAL_FORM_STATE = {
  title: "",
  slug: "",
  slogan: "",
  category: "Web",
  shortDescription: "",
  fullDescription: "",
  readmeMarkdown: "",
  coverUrl: "",
  logoUrl: "",
  githubLink: "",
  websiteLink: "",
  figmaLink: "",
  docsLink: "",
  youtubeLink: "",
  status: "public",
  tags: []
};

export function ProjectDraftProvider({ children }) {
  const { user } = useAuth();
  
  const [draft, setDraft] = useState(INITIAL_FORM_STATE);
  const [step, setStep] = useState(1);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Refs for debouncing and tracking current states
  const draftRef = useRef(draft);
  const stepRef = useRef(step);
  const userRef = useRef(user);
  const debounceTimer = useRef(null);

  // Sync refs to avoid stale closures in listeners
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Synchronous saving helper to trigger on demand
  const saveImmediately = async () => {
    const currentDraft = draftRef.current;
    const currentStep = stepRef.current;
    const currentUser = userRef.current;

    // Only save if dirty
    if (!draftRef.current || Object.keys(currentDraft).every(k => currentDraft[k] === INITIAL_FORM_STATE[k])) {
      return;
    }

    setSaveStatus("saving");
    try {
      // Save local
      saveLocalDraft({ draft: currentDraft, step: currentStep });

      // Save remote if logged in
      if (currentUser?.id) {
        await saveRemoteDraft(currentUser.id, currentStep, currentDraft);
      }
      setSaveStatus("saved");
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save draft:", err);
      setSaveStatus("error");
    }
  };

  // Debounced auto-save hook
  useEffect(() => {
    if (!isDirty) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setSaveStatus("saving");
    debounceTimer.current = setTimeout(() => {
      saveImmediately();
    }, 1000); // 1s debounce for db safety

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [draft, step, isDirty]);

  // Handle visibilitychange to save immediately when changing tab/exiting
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isDirty) {
        saveImmediately();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isDirty]);

  // Handle beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Votre brouillon de projet est en cours de sauvegarde.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // Expose field updating helper
  const updateDraftField = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  // Restore draft (hybride)
  const restoreDraft = async (userId) => {
    let restoredDraft = null;
    let restoredStep = 1;

    try {
      // 1. Try remote draft
      if (userId) {
        const remote = await getRemoteDraft(userId);
        if (remote && remote.form_data) {
          restoredDraft = remote.form_data;
          restoredStep = remote.current_step || 1;
        }
      }

      // 2. Try local fallback if remote failed
      if (!restoredDraft) {
        const local = getLocalDraft();
        if (local && local.draft) {
          restoredDraft = local.draft;
          restoredStep = local.step || 1;
        }
      }

      if (restoredDraft) {
        setDraft(restoredDraft);
        setStep(restoredStep);
        setIsDirty(false);
        setSaveStatus("saved");
        setLastSaved(new Date());
        return { draft: restoredDraft, step: restoredStep };
      }
    } catch (err) {
      console.error("Error restoring project draft:", err);
    }
    return null;
  };

  // Clear drafts on submission or reset
  const discardDraft = async (userId) => {
    clearLocalDraft();
    if (userId) {
      await clearRemoteDraft(userId);
    }
    setDraft(INITIAL_FORM_STATE);
    setStep(1);
    setIsDirty(false);
    setSaveStatus("idle");
    setLastSaved(null);
  };

  return (
    <ProjectDraftContext.Provider
      value={{
        draft,
        step,
        setStep: (s) => { setStep(s); setIsDirty(true); },
        updateDraftField,
        saveStatus,
        lastSaved,
        isDirty,
        saveImmediately,
        restoreDraft,
        discardDraft,
        resetForm: () => { setDraft(INITIAL_FORM_STATE); setStep(1); setIsDirty(false); }
      }}
    >
      {children}
    </ProjectDraftContext.Provider>
  );
}

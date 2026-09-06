// src/context/HousingContext.jsx
import React, { createContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import {
  saveLocalHousingDraft,
  getLocalHousingDraft,
  clearLocalHousingDraft,
  saveRemoteHousingDraft,
  getRemoteHousingDraft,
  clearRemoteHousingDraft
} from "../services/draftStorage";

export const HousingContext = createContext(null);

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  type: "Appartement", // Appartement, Studio, Chambre, Colocation
  ville: "Berkane",
  quartier: "",
  exactAddress: "",
  distanceToCampus: 1, // in km
  closeToSchool: false,
  images: [], // array of objects: { id, url, name, isCover }
  price: "",
  chargesIncluded: false,
  roomsAvailable: 1,
  roommatesCount: 0,
  surface: "",
  gender: "mixte", // mixte, homme, femme
  wifi: false,
  parking: false,
  clim: false,
  cuisine: false,
  washingMachine: false,
};

export function HousingProvider({ children }) {
  const { user } = useAuth();
  
  const [draft, setDraft] = useState(INITIAL_FORM_STATE);
  const [step, setStep] = useState(1);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Refs to avoid stale closures in listeners/timeouts
  const draftRef = useRef(draft);
  const stepRef = useRef(step);
  const userRef = useRef(user);
  const debounceTimer = useRef(null);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Synchronous saving function
  const saveImmediately = async () => {
    const currentDraft = draftRef.current;
    const currentStep = stepRef.current;
    const currentUser = userRef.current;

    // Check if the current state is still equal to initial state (no edits)
    const isInitial = Object.keys(currentDraft).every(
      (k) => JSON.stringify(currentDraft[k]) === JSON.stringify(INITIAL_FORM_STATE[k])
    );
    if (isInitial) return;

    setSaveStatus("saving");
    try {
      // Save locally
      saveLocalHousingDraft({ draft: currentDraft, step: currentStep });

      // Save remotely if authenticated
      if (currentUser?.id) {
        await saveRemoteHousingDraft(currentUser.id, currentStep, currentDraft);
      }
      setSaveStatus("saved");
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save housing draft:", err);
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
    }, 1000); // 1 second debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [draft, step, isDirty]);

  // Tab visibility changes
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

  // Window exit warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Votre brouillon de logement est en cours de sauvegarde automatique.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // Update a single draft field
  const updateDraftField = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  // Restore draft from Supabase or LocalStorage
  const restoreDraft = async (userId) => {
    let restoredDraft = null;
    let restoredStep = 1;

    try {
      if (userId) {
        const remote = await getRemoteHousingDraft(userId);
        if (remote && remote.draft_data) {
          restoredDraft = remote.draft_data;
          restoredStep = remote.current_step || 1;
        }
      }

      if (!restoredDraft) {
        const local = getLocalHousingDraft();
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
      console.error("Error restoring housing draft:", err);
    }
    return null;
  };

  // Clear drafts (after success publish or manual drop)
  const discardDraft = async (userId) => {
    clearLocalHousingDraft();
    if (userId) {
      await clearRemoteHousingDraft(userId);
    }
    setDraft(INITIAL_FORM_STATE);
    setStep(1);
    setIsDirty(false);
    setSaveStatus("idle");
    setLastSaved(null);
  };

  return (
    <HousingContext.Provider
      value={{
        draft,
        step,
        setStep: (s) => { setStep(s); setIsDirty(true); },
        updateDraftField,
        saveStatus,
        lastSaved,
        isDirty,
        isOpen,
        setIsOpen,
        saveImmediately,
        restoreDraft,
        discardDraft,
        resetForm: () => { setDraft(INITIAL_FORM_STATE); setStep(1); setIsDirty(false); }
      }}
    >
      {children}
    </HousingContext.Provider>
  );
}

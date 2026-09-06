import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

const INITIAL_FORM_DATA = {
  title: "",
  description: "",
  price: "",
  category: "",
  condition: "bon",
  city: "Berkane",
  images: [], // Max 8 items. Array of base64 images or url strings
  isNegotiable: false,
  transactionType: "vente", // 'vente', 'échange', 'gratuit'
  deliveryOptions: ["remise"], // 'remise' (main propre), 'livraison' (envoi)
  availability: "disponible",
  contactDetails: ""
};

export function useProductDraft(isOpen = false) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isRestored, setIsRestored] = useState(false);
  const debounceTimerRef = useRef(null);

  // Restore draft on open
  useEffect(() => {
    if (!isOpen) {
      setIsRestored(false);
      return;
    }

    const restoreDraft = async () => {
      // 1. Try restoring from Supabase if logged in
      if (user) {
        try {
          const { data, error } = await supabase
            .from("marketplace_drafts")
            .select("current_step, draft_data")
            .eq("user_id", user.id)
            .single();

          if (!error && data) {
            setCurrentStep(data.current_step || 1);
            setFormData({ ...INITIAL_FORM_DATA, ...data.draft_data });
            setIsRestored(true);
            return;
          }
        } catch (err) {
          console.error("Failed to restore draft from DB:", err);
        }
      }

      // 2. Fallback to localStorage
      try {
        const localDraft = localStorage.getItem("marketplace_draft");
        if (localDraft) {
          const parsed = JSON.parse(localDraft);
          setCurrentStep(parsed.currentStep || 1);
          setFormData({ ...INITIAL_FORM_DATA, ...parsed.formData });
        }
      } catch (err) {
        console.error("Failed to restore draft from localStorage:", err);
      }
      setIsRestored(true);
    };

    restoreDraft();
  }, [isOpen, user]);

  // Debounced Autosave (500ms)
  useEffect(() => {
    if (!isOpen || !isRestored) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      // Save locally
      try {
        localStorage.setItem(
          "marketplace_draft",
          JSON.stringify({ currentStep, formData })
        );
      } catch (err) {
        console.error("LocalStorage save error:", err);
      }

      // Save to database if user is authenticated
      if (user) {
        try {
          await supabase.from("marketplace_drafts").upsert(
            [
              {
                user_id: user.id,
                current_step: currentStep,
                draft_data: formData,
                updated_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
              }
            ],
            { onConflict: "user_id" }
          );
        } catch (err) {
          console.error("DB autosave error:", err);
        }
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData, currentStep, isOpen, isRestored, user]);

  // Actions
  const updateDraftField = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const resetDraft = useCallback(async () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
    try {
      localStorage.removeItem("marketplace_draft");
      if (user) {
        await supabase
          .from("marketplace_drafts")
          .delete()
          .eq("user_id", user.id);
      }
    } catch (err) {
      console.error("Error clearing draft:", err);
    }
  }, [user]);

  // Validations per step
  const validateStep = useCallback((step) => {
    if (step === 1) {
      return (
        formData.title.trim().length >= 3 &&
        formData.description.trim().length >= 5 &&
        formData.category !== ""
      );
    }
    if (step === 2) {
      if (formData.transactionType === "gratuit") return true;
      const parsedPrice = parseFloat(formData.price);
      return !isNaN(parsedPrice) && parsedPrice >= 0;
    }
    if (step === 3) {
      // Must upload at least one image
      return formData.images.length > 0 && formData.images.length <= 8;
    }
    if (step === 4) {
      return (
        formData.city.trim() !== "" &&
        formData.deliveryOptions.length > 0 &&
        formData.contactDetails.trim() !== ""
      );
    }
    return true;
  }, [formData]);

  return {
    currentStep,
    formData,
    isRestored,
    updateDraftField,
    nextStep,
    prevStep,
    resetDraft,
    validateStep,
    setCurrentStep
  };
}

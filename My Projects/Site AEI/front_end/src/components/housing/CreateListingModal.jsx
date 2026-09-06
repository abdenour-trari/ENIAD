// src/components/housing/CreateListingModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, ArrowLeft, ArrowRight, Check, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHousingDraft } from "../../hooks/useHousingDraft";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import { supabase } from "../../lib/supabaseClient";
import ListingWizard from "./ListingWizard";
import PublishSuccess from "./PublishSuccess";

export default function CreateListingModal() {
  const { user } = useAuth();
  const {
    draft,
    step,
    setStep,
    isOpen,
    setIsOpen,
    isDirty,
    saveStatus,
    lastSaved,
    restoreDraft,
    discardDraft,
    resetForm
  } = useHousingDraft();

  const [isPublished, setIsPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [newPostId, setNewPostId] = useState(null);

  // Focus trap ref
  const modalRef = useRef(null);

  // Handle open modal restoration prompt
  useEffect(() => {
    if (isOpen && user) {
      // Check if a draft exists in LocalStorage or Supabase
      const checkDrafts = async () => {
        const local = localStorage.getItem("aei_housing_draft");
        let remoteHasDraft = false;

        try {
          const remote = await supabase
            .from("housing_drafts")
            .select("updated_at")
            .eq("user_id", user.id)
            .maybeSingle();
          if (remote?.data) {
            remoteHasDraft = true;
          }
        } catch {
          // ignore
        }

        if (local || remoteHasDraft) {
          setShowRestorePrompt(true);
        } else {
          resetForm();
        }
      };
      checkDrafts();
      setIsPublished(false);
    }
  }, [isOpen, user]);

  // Handle Accessibility Escape key and Focus confinement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleCloseAttempt();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Disable scroll behind
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isDirty]);

  const handleCloseAttempt = () => {
    if (isDirty && !isPublished) {
      const confirmClose = window.confirm(
        "Voulez-vous vraiment quitter ? Vos modifications sont sauvegardées automatiquement dans votre brouillon."
      );
      if (confirmClose) {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  // Step validation rules
  const validateCurrentStep = () => {
    if (step === 1) {
      if (!draft.title || draft.title.trim().length < 5) {
        alert("Le titre doit contenir au moins 5 caractères.");
        return false;
      }
      if (!draft.description || draft.description.trim().length < 10) {
        alert("La description doit contenir au moins 10 caractères.");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!draft.quartier || draft.quartier.trim() === "") {
        alert("Le quartier est requis pour la localisation.");
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!draft.images || draft.images.length === 0) {
        alert("Veuillez téléverser au moins 1 photo pour illustrer votre logement.");
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!draft.price || draft.price <= 0) {
        alert("Veuillez renseigner un prix valide supérieur à 0 DH.");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(step + 1);
    }
  };

  const handlePublish = async () => {
    if (!user) return;
    setPublishing(true);

    try {
      // 1. Create main housing post
      const res = await apiFetch("/api/housing", {
        method: "POST",
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          price: draft.price,
          location: draft.ville,
          rooms_available: draft.roomsAvailable,
          // Premium extensions
          quartier: draft.quartier,
          exact_address: draft.exactAddress,
          roommates_count: draft.roommatesCount,
          surface: draft.surface || null,
          gender: draft.gender,
          wifi: draft.wifi,
          parking: draft.parking,
          clim: draft.clim,
          cuisine: draft.cuisine,
          washing_machine: draft.washingMachine,
          distance_to_campus: draft.distanceToCampus,
          close_to_school: draft.closeToSchool,
          charges_included: draft.chargesIncluded,
          image_url: draft.cover_url || (draft.images[0] ? draft.images[0].url : ""),
          image_blur: draft.cover_blur || null
        })
      });

      if (!res?.id) throw new Error("Échec de création du post");
      setNewPostId(res.id);

      // 2. Insert secondary gallery photos if any
      const otherImages = draft.images.filter(img => img.url !== res.image_url && img.url);
      if (otherImages.length > 0) {
        // Insert secondary images using supabase directly
        await supabase.from("housing_images").insert(
          otherImages.map((img, idx) => ({
            post_id: res.id,
            image_url: img.url,
            position: idx
          }))
        );
      }

      // 3. Clear draft and transition
      await discardDraft(user.id);
      setIsPublished(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la publication : " + err.message);
    } finally {
      setPublishing(false);
    }
  };

  // Sync label text
  const getSaveStatusMessage = () => {
    if (saveStatus === "saving") return "Sauvegarde...";
    if (saveStatus === "saved") {
      return lastSaved
        ? `Sauvegardé`
        : "Sauvegardé";
    }
    if (saveStatus === "error") return "Erreur de sauvegarde";
    return "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 transition-all">
      <AnimatePresence>
        
        {/* RESTORE DRAFT POPUP OVERLAY */}
        {showRestorePrompt && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl flex flex-col space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-500">
                <div className="p-2.5 bg-amber-50 rounded-2xl">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Brouillon en cours détecté</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sauvegarde automatique</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Vous avez un brouillon non publié pour une annonce de logement. Souhaitez-vous restaurer votre travail ou recommencer à zéro ?
              </p>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={async () => {
                    await discardDraft(user?.id);
                    setShowRestorePrompt(false);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition"
                >
                  Recommencer à zéro
                </button>
                <button
                  onClick={async () => {
                    await restoreDraft(user?.id);
                    setShowRestorePrompt(false);
                  }}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Restaurer mon travail
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MAIN WIZARD DIALOG CONTAINER */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="relative w-full h-full sm:h-auto sm:max-w-4xl md:max-w-5xl bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          
          {/* MODAL HEADER */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">
                {isPublished ? "Annonce en ligne" : "Publier une annonce"}
              </h2>
              {!isPublished && (
                <p className="text-[10px] text-slate-550 font-semibold mt-1">
                  Étape {step} sur 5 — Trouvez rapidement votre futur colocataire.
                </p>
              )}
            </div>

            {/* Sync & Close controls */}
            <div className="flex items-center gap-4">
              {/* Autosave HUD */}
              {!isPublished && getSaveStatusMessage() && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200/60 rounded-lg text-[9px] font-bold text-slate-500 shadow-2xs">
                  {saveStatus === "saving" ? (
                    <RefreshCw size={10} className="animate-spin text-sky-500" />
                  ) : (
                    <CheckCircle2 size={10} className="text-green-500" />
                  )}
                  <span>{getSaveStatusMessage()}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCloseAttempt}
                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-400 hover:text-slate-800 transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* PROGRESSION LEVEL BAR */}
          {!isPublished && (
            <div className="h-1 w-full bg-slate-100">
              <div
                className="h-full bg-linear-to-r from-sky-500 to-blue-600 transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          )}

          {/* MODAL BODY */}
          <div className="p-6 md:p-8 overflow-y-auto flex-1 max-h-[calc(100vh-140px)] sm:max-h-[520px] md:max-h-[600px] min-h-[300px]">
            {isPublished ? (
              <PublishSuccess onClose={() => setIsOpen(false)} newPostId={newPostId} />
            ) : (
              <ListingWizard />
            )}
          </div>

          {/* MODAL FOOTER */}
          {!isPublished && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              
              {/* Back button */}
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-4 py-2 border border-slate-200 hover:bg-white text-xs font-bold rounded-xl text-slate-650 disabled:opacity-30 disabled:hover:bg-transparent transition shadow-2xs"
              >
                <ArrowLeft size={14} />
                <span>Retour</span>
              </button>

              {/* Step indicator (responsive helper) */}
              <div className="hidden sm:block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Étape {step} / 5
              </div>

              {/* Next or Publish button */}
              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-xs font-bold rounded-xl text-white shadow-md shadow-sky-500/10 transition"
                >
                  <span>Suivant</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={publishing}
                  onClick={handlePublish}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-95 text-xs font-bold rounded-xl text-white shadow-md shadow-green-500/10 disabled:opacity-50 transition"
                >
                  {publishing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Publication...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Publier l'annonce</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

        </motion.div>

      </AnimatePresence>
    </div>
  );
}

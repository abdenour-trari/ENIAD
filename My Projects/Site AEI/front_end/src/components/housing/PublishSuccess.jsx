// src/components/housing/PublishSuccess.jsx
import React, { useEffect, useState } from "react";
import { Check, ArrowRight, PlusCircle, Home } from "lucide-react";
import { useHousingDraft } from "../../hooks/useHousingDraft";
import { useNavigate } from "react-router-dom";

export default function PublishSuccess({ onClose, newPostId }) {
  const { discardDraft, resetForm } = useHousingDraft();
  const navigate = useNavigate();
  const [confettis, setConfettis] = useState([]);

  // Generate lightweight CSS confetti particles
  useEffect(() => {
    const colors = ["#38bdf8", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#f87171"];
    const particles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${1.5 + Math.random() * 2}s`,
      size: `${6 + Math.random() * 8}px`,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: `${Math.random() * 360}deg`
    }));
    setConfettis(particles);
  }, []);

  const handleCreateAnother = async () => {
    resetForm();
    onClose();
    setTimeout(() => {
      // Re-trigger modal opening via parent trigger or setting state
      // (The parent controls isOpen, so since we reset state and closed,
      // the user can trigger it again cleanly).
    }, 100);
  };

  const handleGoToAnnonces = () => {
    discardDraft();
    onClose();
    navigate("/mes-annonces");
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-10 px-4 overflow-hidden text-center max-w-lg mx-auto space-y-6">
      
      {/* CSS Confetti Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettis.map((c) => (
          <div
            key={c.id}
            className="absolute top-0 animate-[fall_linear_infinite]"
            style={{
              left: c.left,
              animationDelay: c.delay,
              animationDuration: c.duration,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              borderRadius: c.id % 2 === 0 ? "50%" : "0%",
              transform: `rotate(${c.rotate})`,
              opacity: 0.8
            }}
          ></div>
        ))}
      </div>

      {/* Animated Checkmark Bubble */}
      <div className="relative flex items-center justify-center w-20 h-20 bg-green-50 rounded-full border border-green-100 shadow-md">
        <div className="absolute w-full h-full bg-green-500/10 rounded-full animate-ping"></div>
        <div className="p-4 bg-green-500 rounded-full text-white shadow-sm">
          <Check size={36} className="animate-[scaleIn_0.3s_ease-out]" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Annonce publiée avec succès ! 🎉</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
          Félicitations, votre annonce de colocation est désormais visible pour tous les étudiants du portail AEI.
        </p>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 z-10">
        <button
          onClick={handleGoToAnnonces}
          className="flex-1 px-5 py-3.5 bg-linear-to-r from-sky-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
        >
          <Home size={14} />
          <span>Voir mes annonces</span>
        </button>

        <button
          onClick={handleCreateAnother}
          className="flex-1 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-250 flex items-center justify-center gap-1.5 transition"
        >
          <PlusCircle size={14} />
          <span>Créer une autre annonce</span>
        </button>
      </div>

      {/* CSS Keyframes inline inject style */}
      <style>{`
        @keyframes fall {
          0% {
            top: -10%;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            top: 110%;
            transform: translateY(100vh) rotate(360deg);
          }
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

    </div>
  );
}

// src/components/housing/PreviewCard.jsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, User, MapPin, Sparkles } from "lucide-react";
import { useHousingDraft } from "../../hooks/useHousingDraft";
import { useAuth } from "../../context/AuthContext";
import { LazyImage } from "../ui/LazyImage";

export default function PreviewCard() {
  const { draft } = useHousingDraft();
  const { user } = useAuth();
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const images = draft.images || [];
  
  // Choose images to display
  const imageUrls = images.length > 0 
    ? images.map(img => img.url).filter(Boolean)
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"]; // placeholder

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveImageIdx(prev => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveImageIdx(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  // User details fallback
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Étudiant AEI";
  const userAvatar = user?.user_metadata?.avatar_url || `https://i.pravatar.cc/150?img=33`;

  // Get selected cover or use first image
  const coverObj = images.find(img => img.isCover && img.url);
  const activeImage = coverObj ? coverObj.url : imageUrls[activeImageIdx];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-amber-500" />
        <h3 className="text-lg font-bold text-slate-800">Aperçu de votre annonce</h3>
      </div>

      <div className="flex justify-center">
        {/* Exact replica of the colocation card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[480px] w-full max-w-[360px] transition-transform hover:scale-[1.01]">
          
          {/* Image Container with Slider HUD */}
          <div className="relative h-48 w-full overflow-hidden shrink-0 bg-slate-100">
            <LazyImage
              src={activeImage}
              alt="Preview Cover"
              className="w-full h-full object-cover"
              width={800}
              quality={75}
              priority={true}
            />

            {/* Carousel navigation controls (rendered if multiple photos) */}
            {imageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-md backdrop-blur-xs transition"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-md backdrop-blur-xs transition"
                >
                  <ChevronRight size={14} />
                </button>

                {/* Slideshow dots count */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 px-2 py-0.5 bg-black/40 rounded-full">
                  {imageUrls.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        idx === activeImageIdx ? "bg-white" : "bg-white/40"
                      }`}
                    ></div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 flex flex-col justify-between flex-1">
            <div>
              {/* Profile details */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 shadow-sm shrink-0">
                  <LazyImage
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                    width={80}
                    quality={75}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm line-clamp-1 leading-snug">
                    {userName}
                  </h4>
                  <p className="text-slate-500 text-[11px] flex items-center gap-0.5">
                    <MapPin size={10} className="text-sky-500" />
                    <span>{draft.ville || "Berkane"}{draft.quartier ? `, ${draft.quartier}` : ""}</span>
                  </p>
                </div>
              </div>

              {/* Type tag */}
              <div className="mb-3">
                <span className="px-2.5 py-0.5 bg-sky-100 text-sky-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                  {draft.type || "Appartement"}
                </span>
              </div>

              {/* Title & description */}
              <h5 className="font-bold text-slate-800 text-md line-clamp-1 leading-snug mb-1.5">
                {draft.title || "Titre de votre colocation"}
              </h5>
              <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                {draft.description || "Entrez une description claire dans les premières étapes pour attirer l'attention des candidats."}
              </p>
            </div>

            {/* Price & footer buttons */}
            <div>
              <div className="text-lg font-black text-sky-600 mb-1 leading-none">
                {draft.price || "---"} DH <span className="text-[10px] text-slate-400 font-semibold">/ mois {draft.chargesIncluded && "(Charges inc.)"}</span>
              </div>

              <p className="text-[10px] text-slate-400 font-semibold mb-3">
                🕒 Il y a quelques secondes
              </p>

              <button
                type="button"
                className="w-full bg-linear-to-r from-sky-500 to-blue-600 text-white py-2 rounded-xl font-bold text-xs hover:opacity-95 transition shadow-sm pointer-events-none"
              >
                Voir l’annonce
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// src/components/housing/ListingWizard.jsx
import React from "react";
import { useHousingDraft } from "../../hooks/useHousingDraft";
import LocationSelector from "./LocationSelector";
import ImageUploader from "./ImageUploader";
import PriceInput from "./PriceInput";
import PreviewCard from "./PreviewCard";
import { Home, Compass, UserCheck, Layers } from "lucide-react";

export default function ListingWizard() {
  const { draft, step, updateDraftField } = useHousingDraft();

  const title = draft.title || "";
  const description = draft.description || "";
  const type = draft.type || "Appartement";

  const typeOptions = [
    { key: "Appartement", label: "Appartement entier", desc: "Un logement complet privé", icon: Home },
    { key: "Studio", label: "Studio meublé", desc: "Studio privé à pièce unique", icon: Compass },
    { key: "Chambre", label: "Chambre privée", desc: "Chambre seule dans une maison/résidence", icon: UserCheck },
    { key: "Colocation", label: "Colocation étudiante", desc: "Logement partagé à plusieurs", icon: Layers }
  ];

  return (
    <div className="w-full">
      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Informations générales</h3>
            <p className="text-xs text-slate-500">
              Commencez par nommer votre annonce et décrire brièvement le logement.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">Titre de l'annonce *</label>
              <input
                type="text"
                placeholder="Ex: Belle colocation meublée proche campus"
                value={title}
                onChange={(e) => updateDraftField("title", e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">Description du logement *</label>
              <textarea
                placeholder="Décrivez l'appartement, l'ambiance, les colocataires idéaux, la proximité des transports..."
                value={description}
                onChange={(e) => updateDraftField("description", e.target.value)}
                rows={5}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition font-medium"
              />
            </div>

            {/* Type Selector Cards (Airbnb-style) */}
            <div className="space-y-2.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Type de bien *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {typeOptions.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = type === opt.key;

                  return (
                    <button
                      type="button"
                      key={opt.key}
                      onClick={() => updateDraftField("type", opt.key)}
                      className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "border-sky-500 bg-sky-50/15 shadow-sm ring-1 ring-sky-500/20"
                          : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/20"
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border ${
                        isSelected ? "bg-sky-500 text-white border-sky-400" : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        <IconComp size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 leading-tight">{opt.label}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Location form */}
      {step === 2 && <LocationSelector />}

      {/* STEP 3: Images Drag & Drop */}
      {step === 3 && <ImageUploader />}

      {/* STEP 4: Amenities & Pricing */}
      {step === 4 && <PriceInput />}

      {/* STEP 5: Final Preview Card */}
      {step === 5 && <PreviewCard />}
    </div>
  );
}

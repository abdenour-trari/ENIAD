// src/components/housing/PriceInput.jsx
import React from "react";
import { Wifi, Disc, Wind, ShieldAlert, Users, Layers, Award } from "lucide-react";
import { useHousingDraft } from "../../hooks/useHousingDraft";

const AMENITIES = [
  { key: "wifi", label: "Connexion WiFi", icon: Wifi },
  { key: "parking", label: "Parking sécurisé", icon: Award },
  { key: "clim", label: "Climatisation", icon: Wind },
  { key: "cuisine", label: "Cuisine équipée", icon: Disc },
  { key: "washingMachine", label: "Machine à laver", icon: Layers }
];

export default function PriceInput() {
  const { draft, updateDraftField } = useHousingDraft();

  const price = draft.price || "";
  const chargesIncluded = draft.chargesIncluded || false;
  const roomsAvailable = draft.roomsAvailable || 1;
  const roommatesCount = draft.roommatesCount || 0;
  const surface = draft.surface || "";
  const gender = draft.gender || "mixte";

  const toggleAmenity = (key) => {
    updateDraftField(key, !draft[key]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800">Détails et Tarification</h3>
        <p className="text-xs text-slate-500">
          Renseignez le prix de la colocation, sa superficie et les équipements fournis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Price input */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-500">Loyer mensuel *</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              placeholder="Ex: 1200"
              value={price}
              onChange={(e) => updateDraftField("price", e.target.value ? parseFloat(e.target.value) : "")}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs pr-12 focus:outline-none focus:border-sky-500 transition font-semibold"
            />
            <div className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">
              DH/mois
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="chargesIncluded"
              checked={chargesIncluded}
              onChange={(e) => updateDraftField("chargesIncluded", e.target.checked)}
              className="w-4 h-4 rounded border-slate-350 text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="chargesIncluded" className="text-[10px] text-slate-500 font-bold cursor-pointer">
              Charges incluses (eau, électricité, syndic)
            </label>
          </div>
        </div>

        {/* Surface input */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-500">Superficie habitable</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              placeholder="Ex: 75"
              value={surface}
              onChange={(e) => updateDraftField("surface", e.target.value ? parseFloat(e.target.value) : "")}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs pr-10 focus:outline-none focus:border-sky-500 transition font-semibold"
            />
            <div className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">
              m²
            </div>
          </div>
        </div>

        {/* Gender rule */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-500">Genre autorisé *</label>
          <select
            value={gender}
            onChange={(e) => updateDraftField("gender", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition font-semibold"
          >
            <option value="mixte">Mixte (Garçons & Filles)</option>
            <option value="homme">Réservé Hommes</option>
            <option value="femme">Réservé Femmes</option>
          </select>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        
        {/* Room configuration */}
        <div className="space-y-4">
          <label className="text-[10px] uppercase font-bold text-slate-500 block">Capacité et colocataires</label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-450 font-bold block">Chambres dispo.</span>
              <select
                value={roomsAvailable}
                onChange={(e) => updateDraftField("roomsAvailable", parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition font-semibold"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} {n > 1 ? "chambres" : "chambre"}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-450 font-bold block">Déjà sur place</span>
              <select
                value={roommatesCount}
                onChange={(e) => updateDraftField("roommatesCount", parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition font-semibold"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} {n > 1 ? "personnes" : n === 1 ? "personne" : "aucune"}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Equipment Checkboxes */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase font-bold text-slate-500 block">Équipements inclus</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((amenity) => {
              const IconComp = amenity.icon;
              const isSelected = !!draft[amenity.key];

              return (
                <button
                  type="button"
                  key={amenity.key}
                  onClick={() => toggleAmenity(amenity.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-sky-550/10 border-sky-400 text-sky-700 dark:text-sky-400"
                      : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <IconComp size={14} />
                  <span>{amenity.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

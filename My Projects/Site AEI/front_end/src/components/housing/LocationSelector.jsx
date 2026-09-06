// src/components/housing/LocationSelector.jsx
import React from "react";
import { MapPin, Navigation } from "lucide-react";
import { useHousingDraft } from "../../hooks/useHousingDraft";
import { motion } from "framer-motion";

export default function LocationSelector() {
  const { draft, updateDraftField } = useHousingDraft();

  const ville = draft.ville || "Berkane";
  const quartier = draft.quartier || "";
  const exactAddress = draft.exactAddress || "";
  const distanceToCampus = draft.distanceToCampus || 1;
  const closeToSchool = draft.closeToSchool || false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Inputs Form */}
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Localisation</h3>
          <p className="text-xs text-slate-500">
            Indiquez où se situe votre logement par rapport au campus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500">Ville *</label>
            <select
              value={ville}
              onChange={(e) => updateDraftField("ville", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition font-semibold"
            >
              <option value="Berkane">Berkane</option>
              <option value="Oujda">Oujda</option>
              <option value="Saidia">Saïdia</option>
              <option value="Nador">Nador</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500">Quartier / Zone *</label>
            <input
              type="text"
              placeholder="Ex: Hay Al Quds, Centre-ville"
              value={quartier}
              onChange={(e) => updateDraftField("quartier", e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition font-semibold"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-500">Adresse approximative</label>
          <input
            type="text"
            placeholder="Ex: Près de la mosquée, Rue Mohamed V"
            value={exactAddress}
            onChange={(e) => updateDraftField("exactAddress", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition font-semibold"
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-bold text-slate-500">Distance au campus : {distanceToCampus} km</label>
            <span className="text-[10px] px-2 py-0.5 bg-sky-100 text-sky-700 font-bold rounded-full">
              {distanceToCampus <= 1 ? "Très proche" : distanceToCampus <= 3 ? "Proche" : "Éloigné"}
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="15"
            step="0.1"
            value={distanceToCampus}
            onChange={(e) => updateDraftField("distanceToCampus", parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-150 transition hover:bg-slate-100/50">
          <input
            type="checkbox"
            id="closeToSchool"
            checked={closeToSchool}
            onChange={(e) => updateDraftField("closeToSchool", e.target.checked)}
            className="w-4.5 h-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <div className="leading-tight">
            <label htmlFor="closeToSchool" className="text-xs font-bold text-slate-800 cursor-pointer block">
              Logement proche de l'école (AEI)
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Cochez si le trajet peut s'effectuer facilement à pied en moins de 10 min.</span>
          </div>
        </div>
      </div>

      {/* Dynamic CSS Simulated Map Mockup */}
      <div className="flex flex-col justify-center">
        <div className="relative w-full h-[280px] rounded-3xl bg-slate-100 border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
          
          {/* Simulated grid map lines */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          {/* Simulated Campus Circle */}
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-sky-200/40 rounded-full border border-sky-300 flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 bg-sky-500/20 rounded-full border border-sky-500/60 flex items-center justify-center">
              <span className="text-[9px] font-black text-sky-700">CAMPUS</span>
            </div>
          </div>

          {/* Animated map marker representing listing location */}
          <motion.div
            animate={{ 
              x: 120 + distanceToCampus * 8, 
              y: 100 + (distanceToCampus % 3) * 15,
              scale: [1, 1.1, 1]
            }}
            transition={{ type: "spring", stiffness: 100 }}
            className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
          >
            <div className="px-2.5 py-1 bg-slate-900 text-white text-[9px] font-extrabold rounded-md shadow-md flex items-center gap-1 mb-1 whitespace-nowrap">
              <MapPin size={9} className="text-orange-400" />
              <span>{quartier || "Votre logement"}</span>
            </div>
            
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 bg-orange-500/20 rounded-full animate-ping"></div>
              <MapPin size={28} className="text-orange-500 drop-shadow-md fill-orange-500/20" />
            </div>
          </motion.div>

          {/* Map Compass HUD UI */}
          <div className="absolute top-4 right-4 p-2 bg-white/90 rounded-xl shadow-md border border-slate-100 flex flex-col gap-2">
            <button className="text-slate-500 hover:text-slate-800"><Navigation size={14} className="rotate-45" /></button>
          </div>

          {/* Map HUD Info overlay footer */}
          <div className="z-10 bg-white/95 backdrop-blur-xs border-t border-slate-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl text-orange-600 shadow-xs">
              <MapPin size={18} />
            </div>
            <div>
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Localisation confirmée</span>
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {ville} {quartier ? `— ${quartier}` : ""}
              </p>
              <p className="text-[10px] text-slate-500">
                {distanceToCampus} km du campus ({closeToSchool ? "Accès direct à pied" : `${Math.round(distanceToCampus * 3)} min en vélo`})
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

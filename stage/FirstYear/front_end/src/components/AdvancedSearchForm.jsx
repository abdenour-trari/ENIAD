// src/components/AdvancedSearchForm.jsx
import { useState } from "react";

export default function AdvancedSearchForm({ darkMode, onSearch }) {
  const [reference, setReference] = useState("");
  const [objet, setObjet] = useState("");
  const [acheteur, setAcheteur] = useState("");
  const [lieu, setLieu] = useState("");
  const [procedure, setProcedure] = useState("");
  const [categorie, setCategorie] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      reference,
      objet,
      acheteur,
      lieu,
      procedure,
      categorie,
      dateFrom,
      dateTo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 `}>
      {/* Référence */}
      <div>
        <label className="block mb-1 font-medium text-white">Référence</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Ex: 51/2024/ABHBC"
          className={`w-full p-2 rounded-md border focus:outline-none ${
            darkMode
              ? "bg-[#21262d] border-[#30363d] text-gray-200"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        />
      </div>

      {/* Objet */}
      <div>
        <label className="block mb-1 font-medium text-white">Objet</label>
        <input
          type="text"
          value={objet}
          onChange={(e) => setObjet(e.target.value)}
          placeholder="Ex: Audit, Construction..."
          className={`w-full p-2 rounded-md border focus:outline-none ${
            darkMode
              ? "bg-[#21262d] border-[#30363d] text-gray-200"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        />
      </div>

      {/* Acheteur */}
      <div>
        <label className="block mb-1 font-medium text-white">Acheteur</label>
        <input
          type="text"
          value={acheteur}
          onChange={(e) => setAcheteur(e.target.value)}
          placeholder="Ex: Ministère, Agence..."
          className={`w-full p-2 rounded-md border focus:outline-none ${
            darkMode
              ? "bg-[#21262d] border-[#30363d] text-gray-200"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        />
      </div>

      {/* Lieu */}
      <div>
        <label className="block mb-1 font-medium text-white">Lieu</label>
        <input
          type="text"
          value={lieu}
          onChange={(e) => setLieu(e.target.value)}
          placeholder="Ex: Rabat, Casablanca..."
          className={`w-full p-2 rounded-md border focus:outline-none ${
            darkMode
              ? "bg-[#21262d] border-[#30363d] text-gray-200"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        />
      </div>

      {/* Procédure */}
      <div>
        <label className="block mb-1 font-medium text-white">Procédure</label>
        <input
          type="text"
          value={procedure}
          onChange={(e) => setProcedure(e.target.value)}
          placeholder="Ex: Appel d'offres ouvert"
          className={`w-full p-2 rounded-md border focus:outline-none ${
            darkMode
              ? "bg-[#21262d] border-[#30363d] text-gray-200"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        />
      </div>

      {/* Catégorie */}
      <div>
        <label className="block mb-1 font-medium text-white">Catégorie</label>
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className={`w-full p-2 rounded-md border focus:outline-none ${
            darkMode
              ? "bg-[#21262d] border-[#30363d] text-gray-200"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="">-- Choisir --</option>
          <option value="Services">Services</option>
          <option value="Travaux">Travaux</option>
          <option value="Fournitures">Fournitures</option>
        </select>
      </div>

      {/* Dates */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block mb-1 font-medium text-white">Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={`w-full p-2 rounded-md border focus:outline-none ${
              darkMode
                ? "bg-[#21262d] border-[#30363d] text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        🔎 Rechercher
      </button>
    </form>
  );
}

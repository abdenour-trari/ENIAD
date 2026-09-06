import React, { useState } from 'react';
import { Calendar, MapPin, Check, Plus, X } from 'lucide-react';
import type { ForumConfig } from '../types';

interface ForumConfigFormProps {
  forumConfig: ForumConfig;
  onSaveConfig: (config: ForumConfig) => void;
}

export const ForumConfigForm: React.FC<ForumConfigFormProps> = ({
  forumConfig,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<ForumConfig>(forumConfig);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData({
        ...formData,
        engineeringSpecialties: [...formData.engineeringSpecialties, newSpecialty.trim()]
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setFormData({
      ...formData,
      engineeringSpecialties: formData.engineeringSpecialties.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Paramètres du Forum Entreprises</h2>
            <p className="text-xs text-slate-400">
              Ces informations alimentent le modèle de l'IA pour présenter les atouts de votre association et de vos étudiants.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        
        {/* Identité de l'Association & Établissement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nom de l'Association</label>
            <input
              type="text"
              required
              value={formData.associationName}
              onChange={(e) => setFormData({ ...formData, associationName: e.target.value })}
              placeholder="Ex: AEI - Association des Étudiants Ingénieurs ENIAD"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nom de l'École / Établissement</label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              placeholder="Ex: École Nationale de L'intelligence Artificielle et du digitale"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Expéditeur & Signataire de l'email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-brand-500/20">
          <div>
            <label className="block text-xs font-semibold text-brand-300 mb-1">Nom de l'Expéditeur connecté</label>
            <input
              type="text"
              value={formData.senderName || ''}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
              placeholder="Ex: TRARI Abdenour ou Mohamed SAIDI"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-300 mb-1">Titre & Signature Complète (Dans le Mail & SMTP)</label>
            <input
              type="text"
              value={formData.senderTitle || ''}
              onChange={(e) => setFormData({ ...formData, senderTitle: e.target.value })}
              placeholder="Ex: Responsable de relations externes et Forum : TRARI Abdenour"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Détails de l'Événement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Titre Officiel du Forum</label>
            <input
              type="text"
              required
              value={formData.forumTitle}
              onChange={(e) => setFormData({ ...formData, forumTitle: e.target.value })}
              placeholder="Ex: Forum Entreprises & PFE 2026"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date de l'Événement</label>
            <input
              type="text"
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              placeholder="Ex: 15 Novembre 2026"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Lieu / Salle d'exposition</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={formData.eventLocation}
              onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
              placeholder="Ex: Amphi Principal & Grand Hall d'Exposition, Campus ENIAD"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Spécialités d'ingénierie */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Filières & Spécialités d'Ingénierie
          </label>
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              placeholder="Ajouter une spécialité (ex: Génie Informatique & IA)..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty(); } }}
            />
            <button
              type="button"
              onClick={addSpecialty}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.engineeringSpecialties.map((spec, i) => (
              <span key={i} className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs">
                <span>{spec}</span>
                <button type="button" onClick={() => removeSpecialty(i)} className="text-slate-400 hover:text-red-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tonalité & Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tonalité du Message IA</label>
            <select
              value={formData.tone}
              onChange={(e: any) => setFormData({ ...formData, tone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="formal">Formelle & Élégante (Entreprises traditionnelles)</option>
              <option value="dynamic">Dynamique & Persuasive (Startups & Tech - Recommandé)</option>
              <option value="persuasive">Fortement Persuasive & Commerciale</option>
              <option value="direct">Directe & Synthétique</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Opportunités Offertes</label>
            <div className="space-y-2 text-xs text-slate-300">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.offersPFE}
                  onChange={(e) => setFormData({ ...formData, offersPFE: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-brand-500 focus:ring-0"
                />
                <span>Projets de Fin d'Études (PFE)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.offersInternship}
                  onChange={(e) => setFormData({ ...formData, offersInternship: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-brand-500 focus:ring-0"
                />
                <span>Stages d'Application / Immersion</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.offersJobs}
                  onChange={(e) => setFormData({ ...formData, offersJobs: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-brand-500 focus:ring-0"
                />
                <span>Emplois Premier Emploi</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasBooth}
                  onChange={(e) => setFormData({ ...formData, hasBooth: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-brand-500 focus:ring-0"
                />
                <span>Stand d'Exposition pour Recrutement Direct</span>
              </label>
            </div>
          </div>
        </div>

        {/* Instructions libres pour l'IA */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Instructions Supplémentaires pour le Prompt IA</label>
          <textarea
            rows={3}
            value={formData.customPromptInstructions}
            onChange={(e) => setFormData({ ...formData, customPromptInstructions: e.target.value })}
            placeholder="Ex: Proposer un entretien téléphonique direct ou une rencontre au stand..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Paramètres du Forum sauvegardés avec succès !</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Enregistrer la Configuration Forum</span>
          </button>
        </div>
      </form>
    </div>
  );
};

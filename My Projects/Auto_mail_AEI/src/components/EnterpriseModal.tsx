import React, { useState, useEffect } from 'react';
import { X, Building2, User, Mail, Globe, FileText, Check } from 'lucide-react';
import type { Enterprise } from '../types';

interface EnterpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (enterprise: Enterprise) => void;
  initialData?: Enterprise | null;
}

const DOMAIN_SUGGESTIONS = [
  "Intelligence Artificielle & Data Science",
  "Développement Logiciel & Cloud",
  "Génie Civil, BTP & Architecture",
  "Automobile & Transports Intelligents",
  "Aéronautique & Électronique de Puissance",
  "Génie Industriel, Logistique & Supply Chain",
  "Énergie Renouvelable & Smart Grids",
  "Finance, Banques & Fintech",
  "Conseil en Ingénierie & Transformation Numérique",
  "Télécommunications & Réseaux IoT"
];

export const EnterpriseModal: React.FC<EnterpriseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<Enterprise>>({
    name: '',
    domain: 'Intelligence Artificielle & Data Science',
    contactName: '',
    contactTitle: 'Responsable Recrutement / RH',
    email: '',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        domain: 'Intelligence Artificielle & Data Science',
        contactName: '',
        contactTitle: 'Responsable Recrutement / RH',
        email: '',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newOrUpdated: Enterprise = {
      id: initialData?.id || `ent-${Date.now()}`,
      name: formData.name,
      domain: formData.domain || 'Ingénierie & Technologie',
      contactName: formData.contactName || 'Responsable',
      contactTitle: formData.contactTitle || '',
      email: formData.email,
      notes: formData.notes || '',
      status: initialData?.status || 'pending',
      generatedSubject: initialData?.generatedSubject,
      generatedBody: initialData?.generatedBody,
      sentAt: initialData?.sentAt,
    };

    onSave(newOrUpdated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialData ? "Modifier l'Entreprise" : "Ajouter une Entreprise Cible"}
              </h3>
              <p className="text-xs text-slate-400">Renseignez les détails pour permettre à l'IA de personnaliser le message.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nom de l'Entreprise <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: TechNova Solutions"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email du Responsable <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ex: r.contact@technova.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Secteur / Domaine d'Activité <span className="text-brand-400 text-[10px]">(Crucial pour l'IA)</span>
            </label>
            <div className="relative mb-2">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="Saisissez ou choisissez un secteur..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            
            {/* Rapid domain chips */}
            <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto">
              {DOMAIN_SUGGESTIONS.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setFormData({ ...formData, domain: d })}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    formData.domain === d 
                      ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 font-semibold' 
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nom du Responsable</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Ex: Mme. Sarah Benali"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Poste / Titre</label>
              <input
                type="text"
                value={formData.contactTitle}
                onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
                placeholder="Ex: Directrice RH"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Axe Spécifique pour l'IA</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ex: Recherche des profils PFE en Machine Learning et Cloud."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? "Enregistrer les modifications" : "Ajouter l'Entreprise"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

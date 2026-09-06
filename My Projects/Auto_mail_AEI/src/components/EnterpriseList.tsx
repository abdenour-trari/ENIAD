import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Bot, 
  Mail, 
  Edit3, 
  Trash2, 
  CheckSquare, 
  Square,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Download
} from 'lucide-react';
import type { Enterprise } from '../types';

interface EnterpriseListProps {
  enterprises: Enterprise[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onOpenAddModal: () => void;
  onEditEnterprise: (ent: Enterprise) => void;
  onDeleteEnterprise: (id: string) => void;
  onOpenImportCsv: () => void;
  onGenerateSingle: (ent: Enterprise) => void;
  onPreviewEmail: (ent: Enterprise) => void;
  onSendEmailSingle: (ent: Enterprise) => void;
  onBatchGenerate: () => void;
}

export const EnterpriseList: React.FC<EnterpriseListProps> = ({
  enterprises,
  selectedIds,
  setSelectedIds,
  onOpenAddModal,
  onEditEnterprise,
  onDeleteEnterprise,
  onOpenImportCsv,
  onGenerateSingle,
  onPreviewEmail,
  onSendEmailSingle,
  onBatchGenerate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');

  // List of domains for filtering
  const domains = Array.from(new Set(enterprises.map(e => e.domain))).filter(Boolean);

  const filteredEnterprises = enterprises.filter((e) => {
    const matchesSearch = 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.domain.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDomain = selectedDomainFilter === 'all' || e.domain === selectedDomainFilter;

    return matchesSearch && matchesDomain;
  });

  const isAllSelected = filteredEnterprises.length > 0 && filteredEnterprises.every(e => selectedIds.includes(e.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEnterprises.map(e => e.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Nom Entreprise', 'Domaine', 'Responsable', 'Email', 'Statut', 'Objet Généré', 'Corps Généré'];
    const rows = enterprises.map(e => [
      `"${e.name}"`,
      `"${e.domain}"`,
      `"${e.contactName}"`,
      `"${e.email}"`,
      `"${e.status}"`,
      `"${(e.generatedSubject || '').replace(/"/g, '""')}"`,
      `"${(e.generatedBody || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `entreprises_forum_aei_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        
        {/* Search & Domain Filter */}
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une entreprise, email, responsable ou domaine..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={selectedDomainFilter}
            onChange={(e) => setSelectedDomainFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">Tous les domaines ({domains.length})</option>
            {domains.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Entreprise</span>
          </button>

          <button
            onClick={onOpenImportCsv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm border border-slate-700 transition-all"
            title="Exporter la liste en CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Batch Selector Banner if any selected */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-sm">
          <div className="flex items-center space-x-2 font-medium">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>{selectedIds.length} entreprise(s) sélectionnée(s)</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onBatchGenerate}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-amber-500 text-white font-semibold text-xs shadow hover:opacity-90 transition-all"
            >
              Générer & Envoyer Sélection ({selectedIds.length})
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Désélectionner
            </button>
          </div>
        </div>
      )}

      {/* Enterprise Cards / Table */}
      {filteredEnterprises.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Aucune entreprise trouvée</h3>
          <p className="text-slate-400 text-xs mt-1">Ajoutez votre première entreprise ou importez un fichier CSV.</p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Entreprise</span>
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-xs font-bold uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                      {isAllSelected ? <CheckSquare className="w-4 h-4 text-brand-400" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="p-4">Entreprise & Domaine</th>
                  <th className="p-4">Contact Responsable</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Statut IA</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEnterprises.map((ent) => {
                  const isSelected = selectedIds.includes(ent.id);
                  return (
                    <tr key={ent.id} className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-brand-500/5' : ''}`}>
                      
                      {/* Checkbox */}
                      <td className="p-4">
                        <button onClick={() => toggleSelectOne(ent.id)} className="text-slate-400 hover:text-white">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-brand-400" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Name & Domain */}
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-white">{ent.name}</p>
                          <span className="inline-block mt-0.5 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-brand-300 border border-slate-700">
                            {ent.domain}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <p className="font-medium text-slate-200">{ent.contactName}</p>
                        {ent.contactTitle && <p className="text-xs text-slate-500">{ent.contactTitle}</p>}
                      </td>

                      {/* Email */}
                      <td className="p-4 text-slate-400 font-mono text-xs">
                        {ent.email}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {ent.status === 'sent' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Envoyé</span>
                          </span>
                        )}
                        {ent.status === 'generated' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Mail IA Prêt</span>
                          </span>
                        )}
                        {ent.status === 'generating' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-medium border border-brand-500/20 animate-pulse">
                            <Bot className="w-3.5 h-3.5" />
                            <span>Génération...</span>
                          </span>
                        )}
                        {ent.status === 'pending' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                            <span>En attente</span>
                          </span>
                        )}
                        {ent.status === 'error' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20" title={ent.errorMessage}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Erreur</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          
                          {/* Generate or Preview */}
                          {ent.generatedSubject ? (
                            <button
                              onClick={() => onPreviewEmail(ent)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center space-x-1"
                              title="Voir et modifier le message IA"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Voir Mail</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onGenerateSingle(ent)}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30 flex items-center space-x-1"
                              title="Générer avec Groq IA"
                            >
                              <Bot className="w-3.5 h-3.5" />
                              <span>Générer IA</span>
                            </button>
                          )}

                          {/* Quick Send */}
                          <button
                            onClick={() => onSendEmailSingle(ent)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                            title="Envoyer l'email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditEnterprise(ent)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteEnterprise(ent.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

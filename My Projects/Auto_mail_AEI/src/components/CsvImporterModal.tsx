import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import type { Enterprise } from '../types';

interface CsvImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newEnterprises: Enterprise[]) => void;
}

export const CsvImporterModal: React.FC<CsvImporterModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFile(file);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.warn("Avertissements d'analyse CSV:", results.errors);
        }
        if (results.data && results.data.length > 0) {
          setParsedData(results.data);
        } else {
          setError("Le fichier CSV semble vide ou n'est pas correctement formaté.");
        }
      },
      error: (err) => {
        setError(`Erreur de lecture du fichier: ${err.message}`);
      }
    });
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;

    const mappedEnterprises: Enterprise[] = parsedData.map((row, index) => {
      const findVal = (keys: string[]) => {
        const rowKeys = Object.keys(row);
        for (const k of rowKeys) {
          const cleanK = k.toLowerCase().trim();
          if (keys.some(key => cleanK.includes(key))) {
            return row[k]?.toString().trim() || '';
          }
        }
        return '';
      };

      const name = findVal(['entreprise', 'company', 'societe', 'nom']) || `Entreprise ${index + 1}`;
      const email = findVal(['email', 'mail', 'courriel', 'contact_email']) || '';
      const domain = findVal(['domaine', 'domaine_activite', 'secteur', 'industry', 'domain']) || 'Ingénierie & Technologie';
      const contactName = findVal(['responsable', 'nom_responsable', 'contact', 'personne', 'contact_name']) || 'Responsable Recrutement';
      const contactTitle = findVal(['titre', 'poste', 'fonction', 'title', 'role']) || 'Responsable RH / Partenariats';
      const notes = findVal(['notes', 'remarques', 'commentaire', 'axe', 'description']) || '';

      return {
        id: `csv-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        email,
        domain,
        contactName,
        contactTitle,
        notes,
        status: 'pending' as const
      };
    }).filter(e => e.email !== '');

    if (mappedEnterprises.length === 0) {
      setError("Aucun email valide trouvé dans le fichier. Assurez-vous d'avoir une colonne 'email' ou 'mail'.");
      return;
    }

    onImport(mappedEnterprises);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        
        {/* En-tête */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Importation CSV / Excel</h3>
              <p className="text-xs text-slate-400">Importez directement votre liste d'entreprises à contacter.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zone de Drag and Drop */}
        <div className="mt-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragOver 
                ? 'border-brand-400 bg-brand-500/10' 
                : file 
                ? 'border-emerald-500/50 bg-emerald-500/5' 
                : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
            }`}
          >
            <input
              type="file"
              accept=".csv, .txt"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer block">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              {file ? (
                <div>
                  <p className="font-semibold text-emerald-400 text-sm flex items-center justify-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Fichier sélectionné: {file.name}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{parsedData.length} ligne(s) détectée(s)</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-white">Glissez votre fichier CSV ici ou cliquez pour choisir</p>
                  <p className="text-xs text-slate-400 mt-1">Colonnes supportées: Entreprise, Email, Domaine, Responsable, Notes</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Erreur éventuelle */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Prévisualisation rapide des données */}
        {parsedData.length > 0 && !error && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Aperçu des 3 premières entrées ({parsedData.length} au total)
            </h4>
            <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs text-slate-300">
              {parsedData.slice(0, 3).map((row, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-950/60 border border-slate-800 flex justify-between">
                  <span className="font-medium text-white">{row.entreprise || row.company || row.nom || `Ligne ${idx + 1}`}</span>
                  <span className="text-brand-400">{row.email || row.mail || 'Email manquant'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedData.length === 0}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-brand-500 text-white disabled:opacity-50 hover:opacity-90 transition-all"
          >
            Importer {parsedData.length > 0 ? `(${parsedData.length} entreprises)` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

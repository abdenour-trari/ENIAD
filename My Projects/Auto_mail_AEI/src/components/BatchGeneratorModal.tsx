import React, { useState } from 'react';
import { X, Send, Sparkles, StopCircle } from 'lucide-react';
import type { Enterprise, ForumConfig, GroqConfig, SmtpConfig } from '../types';
import { generateEmailWithGroq } from '../services/groqService';
import { sendEmailViaSmtp } from '../services/emailService';

interface BatchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterprises: Enterprise[];
  selectedIds: string[];
  forumConfig: ForumConfig;
  groqConfig: GroqConfig;
  smtpConfig: SmtpConfig;
  onUpdateEnterprise: (updated: Enterprise) => void;
}

export const BatchGeneratorModal: React.FC<BatchGeneratorModalProps> = ({
  isOpen,
  onClose,
  enterprises,
  selectedIds,
  forumConfig,
  groqConfig,
  smtpConfig,
  onUpdateEnterprise,
}) => {
  const [autoSend, setAutoSend] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [logs, setLogs] = useState<{ text: string; type: 'info' | 'success' | 'error' }[]>([]);

  if (!isOpen) return null;

  const targetList = selectedIds.length > 0
    ? enterprises.filter(e => selectedIds.includes(e.id))
    : enterprises;

  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { text, type }]);
  };

  const startBatchProcess = async () => {
    if (!groqConfig.apiKey || groqConfig.apiKey.trim() === '') {
      addLog("Erreur: Clé API Groq manquante. Configurez d'abord votre clé API.", "error");
      return;
    }

    setIsRunning(true);
    setLogs([]);
    addLog(`Début du traitement groupé pour ${targetList.length} entreprise(s)...`, 'info');

    for (let i = 0; i < targetList.length; i++) {
      const ent = targetList[i];
      setProgressIndex(i + 1);

      addLog(`[${i + 1}/${targetList.length}] Génération du mail IA pour ${ent.name} (${ent.domain})...`, 'info');

      try {
        const genResult = await generateEmailWithGroq(ent, forumConfig, groqConfig);

        let updatedEnt: Enterprise = {
          ...ent,
          generatedSubject: genResult.subject,
          generatedBody: genResult.body,
          status: 'generated'
        };

        addLog(`✓ Email généré avec succès pour ${ent.name}`, 'success');

        if (autoSend) {
          addLog(`Envoi en cours via SMTP à ${ent.email}...`, 'info');
          const sendRes = await sendEmailViaSmtp(updatedEnt, smtpConfig);

          if (sendRes.success) {
            updatedEnt = {
              ...updatedEnt,
              status: 'sent',
              sentAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            };
            addLog(`✓ Mail envoyé à ${ent.email}`, 'success');
          } else {
            updatedEnt = {
              ...updatedEnt,
              status: 'error',
              errorMessage: sendRes.message
            };
            addLog(`✗ Échec d'envoi à ${ent.email}: ${sendRes.message}`, 'error');
          }
        }

        onUpdateEnterprise(updatedEnt);
      } catch (err: any) {
        addLog(`✗ Erreur pour ${ent.name}: ${err.message}`, 'error');
        onUpdateEnterprise({
          ...ent,
          status: 'error',
          errorMessage: err.message
        });
      }

      await new Promise(res => setTimeout(res, 800));
    }

    addLog(`✨ Traitement groupé terminé avec succès !`, 'success');
    setIsRunning(false);
  };

  const progressPercent = targetList.length > 0 ? Math.round((progressIndex / targetList.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-r from-brand-500 to-amber-500 text-white rounded-xl shadow-md shadow-brand-500/20">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Traitement Groupé IA & Envoi</h3>
              <p className="text-xs text-slate-400">
                Génération en série pour {targetList.length} entreprise(s) sélectionnée(s).
              </p>
            </div>
          </div>
          {!isRunning && (
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Options */}
        <div className="my-4 space-y-4 flex-shrink-0">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Activer l'envoi automatique SMTP après génération</p>
              <p className="text-xs text-slate-400">Si activé, le serveur SMTP enverra le mail directement après la réponse de l'IA.</p>
            </div>
            <input
              type="checkbox"
              disabled={isRunning}
              checked={autoSend}
              onChange={(e) => setAutoSend(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Progress bar */}
          {isRunning && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Progression : {progressIndex} / {targetList.length}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-brand-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Real-time Console Log */}
        <div className="flex-1 bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-y-auto font-mono text-xs space-y-1.5 min-h-[180px]">
          {logs.length === 0 ? (
            <p className="text-slate-500 italic">Cliquez sur "Démarrer la Génération Groupée" pour lancer le processus...</p>
          ) : (
            logs.map((log, i) => (
              <p key={i} className={`flex items-start space-x-2 ${
                log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-red-400' : 'text-slate-300'
              }`}>
                <span>{log.text}</span>
              </p>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800 flex-shrink-0 mt-4">
          <button
            disabled={isRunning}
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white disabled:opacity-50"
          >
            Fermer
          </button>

          {!isRunning ? (
            <button
              onClick={startBatchProcess}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 text-white font-semibold text-xs shadow-lg hover:opacity-90 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Démarrer la Génération Groupée ({targetList.length})</span>
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-xs shadow-lg hover:bg-red-600 transition-all"
            >
              <StopCircle className="w-4 h-4" />
              <span>Interrompre</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

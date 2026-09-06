import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bot, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  RefreshCw
} from 'lucide-react';
import type { Enterprise, ForumConfig, GroqConfig, SmtpConfig } from '../types';
import { generateEmailWithGroq } from '../services/groqService';
import { sendEmailViaSmtp, openMailClient, copyToClipboard } from '../services/emailService';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterprise: Enterprise | null;
  forumConfig: ForumConfig;
  groqConfig: GroqConfig;
  smtpConfig: SmtpConfig;
  onUpdateEnterprise: (updated: Enterprise) => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  enterprise,
  forumConfig,
  groqConfig,
  smtpConfig,
  onUpdateEnterprise,
}) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (enterprise) {
      setSubject(enterprise.generatedSubject || '');
      setBody(enterprise.generatedBody || '');
      setSendStatus(null);
    }
  }, [enterprise, isOpen]);

  if (!isOpen || !enterprise) return null;

  const handleGenerateOrRegenerate = async (refinementPrompt?: string) => {
    setIsGenerating(true);
    setSendStatus(null);

    try {
      const configForGen = refinementPrompt 
        ? { ...forumConfig, customPromptInstructions: `${forumConfig.customPromptInstructions}. CONSIGNE PARTICULIÈRE DE RÉVISION : ${refinementPrompt}` }
        : forumConfig;

      const result = await generateEmailWithGroq(enterprise, configForGen, groqConfig);
      setSubject(result.subject);
      setBody(result.body);

      const updatedEnt: Enterprise = {
        ...enterprise,
        generatedSubject: result.subject,
        generatedBody: result.body,
        status: 'generated'
      };

      onUpdateEnterprise(updatedEnt);
    } catch (err: any) {
      alert(`Erreur de génération IA: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdits = () => {
    const updatedEnt: Enterprise = {
      ...enterprise,
      generatedSubject: subject,
      generatedBody: body,
      status: 'generated'
    };
    onUpdateEnterprise(updatedEnt);
  };

  const handleSendViaSmtp = async () => {
    setIsSending(true);
    setSendStatus(null);

    const updatedEnt: Enterprise = {
      ...enterprise,
      generatedSubject: subject,
      generatedBody: body
    };

    const res = await sendEmailViaSmtp(updatedEnt, smtpConfig);
    setSendStatus(res);

    if (res.success) {
      const sentEnt: Enterprise = {
        ...updatedEnt,
        status: 'sent',
        sentAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      onUpdateEnterprise(sentEnt);
    }
    setIsSending(false);
  };

  const handleCopy = async () => {
    const fullText = `Objet: ${subject}\n\n${body}`;
    const ok = await copyToClipboard(fullText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">Mail d'Invitation IA</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-medium">
                  {enterprise.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Domaine: <strong className="text-slate-200">{enterprise.domain}</strong> | Destinataire: <strong className="text-slate-200">{enterprise.contactName}</strong> ({enterprise.email})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="my-4 space-y-4 overflow-y-auto flex-1 pr-1">
          
          {/* Quick AI Refine Chips */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ajustement rapide avec l'IA Groq :</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                disabled={isGenerating}
                onClick={() => handleGenerateOrRegenerate("Rendre le message plus synthétique et plus court (max 3 paragraphes).")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 flex items-center space-x-1"
              >
                <span>✂️ Plus court</span>
              </button>

              <button
                disabled={isGenerating}
                onClick={() => handleGenerateOrRegenerate("Insister fortement sur les Projets de Fin d'Études (PFE) et la pré-embauche des ingénieurs.")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 flex items-center space-x-1"
              >
                <span>🎓 Accentuer les PFE</span>
              </button>

              <button
                disabled={isGenerating}
                onClick={() => handleGenerateOrRegenerate("Adopter un ton très solennel et institutionnel.")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 flex items-center space-x-1"
              >
                <span>🏛️ Ton Solennel</span>
              </button>

              <button
                disabled={isGenerating}
                onClick={() => handleGenerateOrRegenerate()}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-300 border border-amber-500/30 flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Régénérer entièrement</span>
              </button>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Objet du Message</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onBlur={handleSaveEdits}
              placeholder="Objet généré par l'IA..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Body Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Corps de l'Email (Éditable)</label>
            <textarea
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onBlur={handleSaveEdits}
              placeholder="Le corps du mail généré par l'IA apparaîtra ici..."
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 font-sans leading-relaxed focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Send status feedback */}
          {sendStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
              sendStatus.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {sendStatus.success ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
              <span>{sendStatus.message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 flex-shrink-0">
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copie effectuée !' : 'Copier'}</span>
            </button>

            <button
              onClick={() => openMailClient({ ...enterprise, generatedSubject: subject, generatedBody: body })}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              title="Ouvrir dans Outlook/Mail de votre PC"
            >
              <ExternalLink className="w-4 h-4 text-brand-400" />
              <span>Ouvrir Mailto</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Fermer
            </button>

            <button
              onClick={handleSendViaSmtp}
              disabled={isSending || !subject || !body}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-brand-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Envoi en cours...' : 'Envoyer par SMTP'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

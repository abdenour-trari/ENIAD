import React from 'react';
import { 
  Building2, 
  Bot, 
  Mail, 
  Send, 
  FileSpreadsheet, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  GraduationCap
} from 'lucide-react';
import type { Enterprise, ForumConfig, GroqConfig, SmtpConfig } from '../types';

interface DashboardProps {
  enterprises: Enterprise[];
  forumConfig: ForumConfig;
  groqConfig: GroqConfig;
  smtpConfig: SmtpConfig;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenImportCsv: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  enterprises,
  forumConfig,
  groqConfig,
  smtpConfig,
  setActiveTab,
  onOpenAddModal,
  onOpenImportCsv,
}) => {
  const total = enterprises.length;
  const generated = enterprises.filter((e) => e.status === 'generated' || e.status === 'sent').length;
  const sent = enterprises.filter((e) => e.status === 'sent').length;
  const pending = total - generated;

  const isGroqReady = Boolean(groqConfig.apiKey && groqConfig.apiKey.trim().length > 0);
  const isSmtpReady = Boolean(smtpConfig.host && smtpConfig.user && smtpConfig.pass);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border border-brand-500/20 p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automatisation d'Invitations aux Entreprises par IA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Optimisez vos contacts pour le <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-400">{forumConfig.forumTitle}</span>
          </h1>
          <p className="mt-3 text-slate-300 text-base leading-relaxed">
            Offrez à chaque responsable d'entreprise un message unique, rédigé sur-mesure par l'IA Groq selon son secteur d'activité et vos offres de recrutement ({forumConfig.associationName}).
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab('batch')}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 text-white font-semibold shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all transform hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              <span>Lancer la Génération & l'Envoi Groupé</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onOpenImportCsv}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 text-slate-200 font-semibold border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Importer un fichier CSV / Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Entreprises</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{total}</h3>
            </div>
            <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400 border border-brand-500/20">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 flex items-center justify-between">
            <span>Enregistrées dans le système</span>
            <button onClick={onOpenAddModal} className="text-brand-400 hover:underline text-[11px] font-semibold">+ Ajouter</button>
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Emails IA Générés</p>
              <h3 className="text-3xl font-extrabold text-amber-400 mt-2">{generated}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Bot className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            {pending > 0 ? `${pending} entreprise(s) en attente` : 'Tous les messages sont générés !'}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Emails Envoyés</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">{sent}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Mail className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            {total > 0 ? `${Math.round((sent / total) * 100)}% de couverture d'envoi` : 'Aucun mail envoyé'}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Statut Système</p>
              <h3 className="text-lg font-bold text-white mt-2 flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isGroqReady ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{isGroqReady ? 'IA Prête' : 'IA Inactive'}</span>
              </h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex flex-col space-y-1 text-xs">
            <span className={isGroqReady ? 'text-emerald-400' : 'text-amber-400'}>
              • Groq API: {isGroqReady ? 'Configuré' : 'Non configuré'}
            </span>
            <span className={isSmtpReady ? 'text-emerald-400' : 'text-slate-400'}>
              • Serveur SMTP: {isSmtpReady ? 'Actif' : 'Non configuré (Mailto actif)'}
            </span>
          </div>
        </div>
      </div>

      {/* Guide des étapes */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <span>Étapes d'envoi automatisé</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div 
            onClick={() => setActiveTab('groq-config')}
            className={`p-5 rounded-xl border cursor-pointer transition-all ${
              isGroqReady ? 'bg-slate-900/60 border-emerald-500/30' : 'bg-slate-900 border-amber-500/40 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">Étape 1</span>
              {isGroqReady && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <h3 className="font-semibold text-white text-sm">Saisir la clé Groq</h3>
            <p className="text-xs text-slate-400 mt-1">Connectez l'API IA de Groq (Gratuite sur console.groq.com).</p>
          </div>

          <div 
            onClick={() => setActiveTab('forum-config')}
            className="p-5 rounded-xl border bg-slate-900/60 border-slate-800 hover:border-brand-500/40 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">Étape 2</span>
            </div>
            <h3 className="font-semibold text-white text-sm">Renseigner le Forum</h3>
            <p className="text-xs text-slate-400 mt-1">Définissez la date, le lieu et les profils d'ingénieurs à mettre en avant.</p>
          </div>

          <div 
            onClick={() => setActiveTab('enterprises')}
            className="p-5 rounded-xl border bg-slate-900/60 border-slate-800 hover:border-brand-500/40 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">Étape 3</span>
            </div>
            <h3 className="font-semibold text-white text-sm">Ajouter des Entreprises</h3>
            <p className="text-xs text-slate-400 mt-1">Saisissez les mails, responsables et domaines d'activité (ou CSV).</p>
          </div>

          <div 
            onClick={() => setActiveTab('batch')}
            className="p-5 rounded-xl border bg-gradient-to-br from-brand-950 to-slate-900 border-brand-500/30 hover:border-brand-400 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Étape 4</span>
              <Send className="w-4 h-4 text-brand-400" />
            </div>
            <h3 className="font-semibold text-white text-sm">Générer & Envoyer !</h3>
            <p className="text-xs text-slate-400 mt-1">L'IA génère chaque message et le système l'envoie automatiquement.</p>
          </div>
        </div>
      </div>

      {/* Résumé de l'événement */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Fiche de l'Événement Actif</span>
          </h2>
          <button
            onClick={() => setActiveTab('forum-config')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 underline"
          >
            Modifier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <GraduationCap className="w-5 h-5 text-brand-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Association</p>
              <p className="font-medium text-white">{forumConfig.associationName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Date prévue</p>
              <p className="font-medium text-white">{forumConfig.eventDate}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Lieu de l'événement</p>
              <p className="font-medium text-white">{forumConfig.eventLocation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

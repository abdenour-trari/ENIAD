import React, { useState } from 'react';
import { Mail, ShieldCheck, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import type { SmtpConfig } from '../types';

interface SmtpSettingsProps {
  smtpConfig: SmtpConfig;
  onSaveConfig: (config: SmtpConfig) => void;
}

export const SmtpSettings: React.FC<SmtpSettingsProps> = ({
  smtpConfig,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<SmtpConfig>(smtpConfig);
  const [testStatus, setTestStatus] = useState<{ type: 'idle' | 'testing' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setTestStatus({ type: 'success', message: 'Paramètres SMTP enregistrés !' });
  };

  const handleTestSmtp = async () => {
    setTestStatus({ type: 'testing' });

    try {
      const response = await fetch('http://localhost:3001/api/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ smtp: formData }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTestStatus({ type: 'success', message: data.message });
        onSaveConfig(formData);
      } else {
        setTestStatus({ type: 'error', message: data.message || 'Échec du test SMTP' });
      }
    } catch (err: any) {
      setTestStatus({
        type: 'error',
        message: 'Impossible de contacter le serveur backend (http://localhost:3001). Assurez-vous d\'exécuter "node server/index.mjs".'
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
            <Mail className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Serveur d'Envoi SMTP (Nodemailer)</h2>
            <p className="text-xs text-slate-400">
              Configurez vos accès email (Gmail, Outlook, OVH, SMTP d'école) pour envoyer automatiquement les invitations en arrière-plan.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Serveur SMTP Hôte</label>
            <input
              type="text"
              required
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              placeholder="smtp.gmail.com ou smtp.office365.com"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Port</label>
              <input
                type="number"
                required
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 465 })}
                placeholder="465 ou 587"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">SSL/TLS</label>
              <select
                value={formData.secure ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, secure: e.target.value === 'true' })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="true">Oui (465 SSL)</option>
                <option value="false">Non (587 TLS)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Utilisateur / Adresse E-mail</label>
            <input
              type="text"
              required
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value, fromEmail: formData.fromEmail || e.target.value })}
              placeholder="votre.association@ecole.com"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de passe SMTP / Mot de passe d'application</label>
            <input
              type="password"
              required
              value={formData.pass}
              onChange={(e) => setFormData({ ...formData, pass: e.target.value })}
              placeholder="••••••••••••••••"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">Pour Gmail: générez un "Mot de passe d'application" dans la sécurité de votre compte Google.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nom d'Expéditeur Affiché</label>
            <input
              type="text"
              value={formData.fromName}
              onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
              placeholder="AEI - Forum Entreprises"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email d'Expéditeur</label>
            <input
              type="email"
              value={formData.fromEmail}
              onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
              placeholder="contact@aei-ecole.com"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Feedback status */}
        {testStatus.type !== 'idle' && (
          <div className={`p-4 rounded-xl text-xs flex items-center space-x-3 border ${
            testStatus.type === 'testing'
              ? 'bg-brand-500/10 border-brand-500/30 text-brand-300'
              : testStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            {testStatus.type === 'testing' && <Mail className="w-5 h-5 animate-spin" />}
            {testStatus.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {testStatus.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            <span>{testStatus.message || 'Vérification...'}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleTestSmtp}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tester le serveur SMTP</span>
          </button>

          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Sauvegarder les Paramètres SMTP</span>
          </button>
        </div>
      </form>
    </div>
  );
};

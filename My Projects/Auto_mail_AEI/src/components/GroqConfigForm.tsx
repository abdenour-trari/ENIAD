import React, { useState } from 'react';
import { Bot, Key, CheckCircle2, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import type { GroqConfig } from '../types';

interface GroqConfigFormProps {
  groqConfig: GroqConfig;
  onSaveConfig: (config: GroqConfig) => void;
}

export const GroqConfigForm: React.FC<GroqConfigFormProps> = ({
  groqConfig,
  onSaveConfig,
}) => {
  const [apiKey, setApiKey] = useState(groqConfig.apiKey);
  const [model, setModel] = useState(groqConfig.model || 'llama-3.3-70b-versatile');
  const [temperature, setTemperature] = useState(groqConfig.temperature || 0.7);
  const [testStatus, setTestStatus] = useState<{ type: 'idle' | 'testing' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({ apiKey: apiKey.trim(), model, temperature });
  };

  const testGroqConnection = async () => {
    if (!apiKey || apiKey.trim() === '') {
      setTestStatus({ type: 'error', message: 'Veuillez d\'abord saisir une clé API Groq.' });
      return;
    }

    setTestStatus({ type: 'testing' });

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Dis uniquement "OK" si la connexion fonctionne.' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        setTestStatus({ type: 'success', message: 'Connexion à l\'API Groq réussie ! Le modèle répond correctement.' });
        onSaveConfig({ apiKey: apiKey.trim(), model, temperature });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestStatus({ type: 'error', message: errorData.error?.message || `Erreur API (${response.status})` });
      }
    } catch (err: any) {
      setTestStatus({ type: 'error', message: err.message || 'Impossible de contacter l\'API Groq.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-brand-500 to-amber-400 rounded-xl text-slate-950 font-bold">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Configuration de l'IA Groq Cloud</h2>
            <p className="text-xs text-slate-400">
              Groq offre l'inférence LLM la plus rapide au monde (Llama 3.3 70B, Mixtral, etc.). Clé gratuite disponible sur console.groq.com.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        
        {/* Clé API */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Clé API Groq (gsk_...) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="password"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 underline flex items-center space-x-1"
            >
              <span>Obtenir une clé API Groq gratuite</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-500">Stockée localement dans votre navigateur</span>
          </div>
        </div>

        {/* Modèle IA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Modèle IA Groq
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommandé - Ultra Performant)</option>
              <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (Très rapide & précis)</option>
              <option value="llama3-8b-8192">llama3-8b-8192 (Ultra rapide)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Créativité (Temperature: {temperature})
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full mt-3"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>0.1 (Strict & Formel)</span>
              <span>0.7 (Équilibré)</span>
              <span>1.0 (Très créatif)</span>
            </div>
          </div>
        </div>

        {/* Test Status feedback */}
        {testStatus.type !== 'idle' && (
          <div className={`p-4 rounded-xl text-xs flex items-center space-x-3 border ${
            testStatus.type === 'testing'
              ? 'bg-brand-500/10 border-brand-500/30 text-brand-300'
              : testStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            {testStatus.type === 'testing' && <Bot className="w-5 h-5 animate-spin" />}
            {testStatus.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {testStatus.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            <span>{testStatus.message || 'Vérification en cours...'}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={testGroqConnection}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Tester l'API Groq</span>
          </button>

          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all"
          >
            <span>Sauvegarder la Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

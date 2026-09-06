import React from 'react';
import { 
  Building2, 
  Bot, 
  Mail, 
  Calendar, 
  Send, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import type { GroqConfig } from '../types';
import type { User } from '../services/authService';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  groqConfig: GroqConfig;
  enterpriseCount: number;
  generatedCount: number;
  currentUser: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  groqConfig,
  enterpriseCount,
  generatedCount,
  currentUser,
  onLogout,
}) => {
  const isGroqReady = Boolean(groqConfig.apiKey && groqConfig.apiKey.trim().length > 0);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: Building2 },
    { id: 'enterprises', label: `Entreprises (${enterpriseCount})`, icon: Building2 },
    { id: 'forum-config', label: 'Configuration Forum', icon: Calendar },
    { id: 'groq-config', label: 'Clé API Groq IA', icon: Bot, badge: isGroqReady ? 'OK' : 'Requis' },
    { id: 'smtp-config', label: 'Paramètres SMTP', icon: Mail },
    { id: 'batch', label: 'Envoi Groupé', icon: Send, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-400 p-0.5 shadow-lg shadow-brand-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white">AEI AutoMail</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  IA Groq ({generatedCount} prêtes)
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Plateforme d'invitation Forum Entreprises & PFE
              </p>
            </div>
          </div>

          {/* Right Section: Groq status + Connected User Badge */}
          <div className="flex items-center space-x-4">
            
            {/* Groq API Status Pill */}
            <div className="hidden lg:flex items-center">
              <button
                onClick={() => setActiveTab('groq-config')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isGroqReady 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                {isGroqReady ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Groq IA Connecté</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Clé Groq Requise</span>
                  </>
                )}
              </button>
            </div>

            {/* Connected User Badge & Logout */}
            {currentUser && (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
                <div className="hidden sm:flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${currentUser.avatarColor} p-0.5 shadow-md`}>
                    <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-brand-300" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{currentUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 text-xs font-semibold border border-slate-700 hover:border-red-500/30 transition-all"
                  title="Déconnexion (La session expirera)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-md shadow-brand-500/20'
                      : 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                    : item.highlight
                    ? 'bg-gradient-to-r from-brand-700/80 to-amber-600/80 text-white hover:opacity-90'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : ''}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isGroqReady ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

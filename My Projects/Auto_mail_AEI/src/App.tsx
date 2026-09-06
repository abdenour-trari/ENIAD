import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { EnterpriseList } from './components/EnterpriseList';
import { EnterpriseModal } from './components/EnterpriseModal';
import { CsvImporterModal } from './components/CsvImporterModal';
import { ForumConfigForm } from './components/ForumConfigForm';
import { GroqConfigForm } from './components/GroqConfigForm';
import { SmtpSettings } from './components/SmtpSettings';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { BatchGeneratorModal } from './components/BatchGeneratorModal';
import { LoginScreen } from './components/LoginScreen';

import type { Enterprise, ForumConfig, GroqConfig, SmtpConfig } from './types';
import { 
  loadEnterprises, 
  saveEnterprises, 
  loadForumConfig, 
  saveForumConfig, 
  loadGroqConfig, 
  saveGroqConfig, 
  loadSmtpConfig, 
  saveSmtpConfig 
} from './utils/storage';
import { getCurrentUser, logoutUser, type User } from './services/authService';
import { generateEmailWithGroq } from './services/groqService';
import { sendEmailViaSmtp } from './services/emailService';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // State
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [forumConfig, setForumConfig] = useState<ForumConfig>(loadForumConfig());
  const [groqConfig, setGroqConfig] = useState<GroqConfig>(loadGroqConfig());
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(loadSmtpConfig());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState<Enterprise | null>(null);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [previewEnterprise, setPreviewEnterprise] = useState<Enterprise | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Restore session if active in current browser tab
    const savedUser = getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    setEnterprises(loadEnterprises());
  }, []);

  // Update forum & SMTP configuration whenever the active logged-in user changes
  useEffect(() => {
    if (currentUser) {
      setForumConfig((prev) => {
        const updated = {
          ...prev,
          senderName: currentUser.name,
          senderTitle: currentUser.title,
        };
        saveForumConfig(updated);
        return updated;
      });

      setSmtpConfig((prev) => {
        const updated = {
          ...prev,
          fromName: currentUser.title,
          fromEmail: prev.fromEmail || currentUser.email,
        };
        saveSmtpConfig(updated);
        return updated;
      });
    }
  }, [currentUser]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    showToast("Vous avez été déconnecté. La session est terminée.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // State update handlers
  const handleUpdateEnterprises = (newList: Enterprise[]) => {
    setEnterprises(newList);
    saveEnterprises(newList);
  };

  const handleSingleEnterpriseUpdate = (updatedEnt: Enterprise) => {
    const newList = enterprises.map((e) => (e.id === updatedEnt.id ? updatedEnt : e));
    handleUpdateEnterprises(newList);
  };

  const handleAddOrEditEnterprise = (ent: Enterprise) => {
    const exists = enterprises.some(e => e.id === ent.id);
    let newList: Enterprise[];
    if (exists) {
      newList = enterprises.map(e => e.id === ent.id ? ent : e);
      showToast(`Entreprise "${ent.name}" mise à jour.`);
    } else {
      newList = [ent, ...enterprises];
      showToast(`Entreprise "${ent.name}" ajoutée.`);
    }
    handleUpdateEnterprises(newList);
    setEditingEnterprise(null);
  };

  const handleDeleteEnterprise = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
      const newList = enterprises.filter(e => e.id !== id);
      handleUpdateEnterprises(newList);
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
      showToast("Entreprise supprimée.");
    }
  };

  const handleImportCsv = (newEnts: Enterprise[]) => {
    const merged = [...newEnts, ...enterprises];
    handleUpdateEnterprises(merged);
    showToast(`${newEnts.length} entreprise(s) importée(s) avec succès !`);
  };

  const handleSaveForumConfig = (config: ForumConfig) => {
    setForumConfig(config);
    saveForumConfig(config);
    showToast("Paramètres du Forum sauvegardés.");
  };

  const handleSaveGroqConfig = (config: GroqConfig) => {
    setGroqConfig(config);
    saveGroqConfig(config);
    showToast("Clé API & Configuration Groq sauvegardées.");
  };

  const handleSaveSmtpConfig = (config: SmtpConfig) => {
    setSmtpConfig(config);
    saveSmtpConfig(config);
    showToast("Paramètres SMTP sauvegardés.");
  };

  // Direct single AI generation
  const handleGenerateSingle = async (ent: Enterprise) => {
    if (!groqConfig.apiKey || groqConfig.apiKey.trim() === '') {
      alert("Veuillez d'abord configurer votre clé API Groq dans l'onglet 'Clé API Groq IA'.");
      setActiveTab('groq-config');
      return;
    }

    handleSingleEnterpriseUpdate({ ...ent, status: 'generating' });

    try {
      const res = await generateEmailWithGroq(ent, forumConfig, groqConfig);
      const updated: Enterprise = {
        ...ent,
        generatedSubject: res.subject,
        generatedBody: res.body,
        status: 'generated'
      };
      handleSingleEnterpriseUpdate(updated);
      setPreviewEnterprise(updated);
      showToast(`Email IA généré pour ${ent.name} !`);
    } catch (err: any) {
      handleSingleEnterpriseUpdate({ ...ent, status: 'error', errorMessage: err.message });
      alert(`Erreur de génération pour ${ent.name}: ${err.message}`);
    }
  };

  // Direct single send
  const handleSendSingle = async (ent: Enterprise) => {
    if (!ent.generatedSubject || !ent.generatedBody) {
      await handleGenerateSingle(ent);
      return;
    }

    const res = await sendEmailViaSmtp(ent, smtpConfig);
    if (res.success) {
      handleSingleEnterpriseUpdate({
        ...ent,
        status: 'sent',
        sentAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      });
      showToast(`Email envoyé avec succès à ${ent.email}`);
    } else {
      alert(`Échec de l'envoi SMTP: ${res.message}`);
    }
  };

  // If user is not logged in, display the Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Bienvenue ${user.name} !`);
        }}
      />
    );
  }

  const generatedCount = enterprises.filter(e => e.status === 'generated' || e.status === 'sent').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-brand-500/40 text-white text-xs font-semibold shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        groqConfig={groqConfig}
        enterpriseCount={enterprises.length}
        generatedCount={generatedCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            enterprises={enterprises}
            forumConfig={forumConfig}
            groqConfig={groqConfig}
            smtpConfig={smtpConfig}
            setActiveTab={setActiveTab}
            onOpenAddModal={() => { setEditingEnterprise(null); setIsAddModalOpen(true); }}
            onOpenImportCsv={() => setIsImportCsvOpen(true)}
          />
        )}

        {activeTab === 'enterprises' && (
          <EnterpriseList
            enterprises={enterprises}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onOpenAddModal={() => { setEditingEnterprise(null); setIsAddModalOpen(true); }}
            onEditEnterprise={(ent) => { setEditingEnterprise(ent); setIsAddModalOpen(true); }}
            onDeleteEnterprise={handleDeleteEnterprise}
            onOpenImportCsv={() => setIsImportCsvOpen(true)}
            onGenerateSingle={handleGenerateSingle}
            onPreviewEmail={(ent) => setPreviewEnterprise(ent)}
            onSendEmailSingle={handleSendSingle}
            onBatchGenerate={() => setIsBatchModalOpen(true)}
          />
        )}

        {activeTab === 'forum-config' && (
          <ForumConfigForm
            forumConfig={forumConfig}
            onSaveConfig={handleSaveForumConfig}
          />
        )}

        {activeTab === 'groq-config' && (
          <GroqConfigForm
            groqConfig={groqConfig}
            onSaveConfig={handleSaveGroqConfig}
          />
        )}

        {activeTab === 'smtp-config' && (
          <SmtpSettings
            smtpConfig={smtpConfig}
            onSaveConfig={handleSaveSmtpConfig}
          />
        )}

        {activeTab === 'batch' && (
          <div className="max-w-3xl mx-auto space-y-6 text-center py-8">
            <div className="glass-panel p-8 rounded-2xl border border-slate-800">
              <h2 className="text-2xl font-extrabold text-white mb-2">Génération & Envoi par Lot avec Groq IA</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
                Lancez la génération en masse pour {selectedIds.length > 0 ? selectedIds.length : enterprises.length} entreprise(s). L'IA adaptera l'accroche pour chaque secteur d'activité.
              </p>

              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-500 via-amber-500 to-emerald-500 text-white font-bold text-base shadow-xl shadow-brand-500/20 hover:opacity-95 transition-all transform hover:scale-105"
              >
                Ouvrir la Console de Traitement Groupé
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>AEI AutoMail IA - Plateforme développée pour l'Association des Étudiants Ingénieurs (AEI) - Powered by Groq LLM</p>
      </footer>

      {/* Modals */}
      <EnterpriseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddOrEditEnterprise}
        initialData={editingEnterprise}
      />

      <CsvImporterModal
        isOpen={isImportCsvOpen}
        onClose={() => setIsImportCsvOpen(false)}
        onImport={handleImportCsv}
      />

      <EmailPreviewModal
        isOpen={Boolean(previewEnterprise)}
        onClose={() => setPreviewEnterprise(null)}
        enterprise={previewEnterprise}
        forumConfig={forumConfig}
        groqConfig={groqConfig}
        smtpConfig={smtpConfig}
        onUpdateEnterprise={handleSingleEnterpriseUpdate}
      />

      <BatchGeneratorModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        enterprises={enterprises}
        selectedIds={selectedIds}
        forumConfig={forumConfig}
        groqConfig={groqConfig}
        smtpConfig={smtpConfig}
        onUpdateEnterprise={handleSingleEnterpriseUpdate}
      />
    </div>
  );
}

export default App;

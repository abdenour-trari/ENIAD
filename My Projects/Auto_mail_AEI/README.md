# 🚀 AEI AutoMail IA - Plateforme d'Invitation Forum Entreprises

Une application web moderne, complète et intuitive développée pour l'**Association des Étudiants Ingénieurs (AEI)**. Elle permet de générer des emails d'invitation hyper-personnalisés pour chaque responsable d'entreprise grâce à l'**IA Groq (LLM)** et d'automatiser leur envoi.

---

## 🌟 Fonctionnalités Principales

- 🤖 **Génération IA personnalisée (Groq Cloud API)** :
  - Adaptation dynamique de l'accroche et de l'argumentaire selon le domaine d'activité de l'entreprise (ex: IA/Data, Génie Civil, Automobile, Énergie, Finance, etc.).
  - Valorisation des spécialités d'ingénierie et des opportunités (PFE, Stages, Emplois, Stand de recrutement).
  - Choix des modèles IA (`llama-3.3-70b-versatile`, `mixtral-8x7b-32768`, `llama3-8b-8192`).
- 🏢 **Gestion des Entreprises Cibles** :
  - Ajout/édition individuelle d'entreprises.
  - Importation en masse de fichiers **CSV / Excel** avec détection automatique des colonnes.
  - Filtrage par secteur, recherche instantanée et export CSV des données et emails générés.
- ✉️ **Système d'Envoi d'Emails Multi-Canal** :
  - **Serveur SMTP Intégré (Nodemailer)** : Envoi automatique en arrière-plan avec testeur de connexion (Gmail, Outlook, OVH, SMTP sur-mesure).
  - **Mode Mailto & Copie 1-clic** : Ouverture directe du client mail du système pré-rempli.
  - **Console d'envoi groupé par lot (Batch Engine)** avec barre de progression et logs d'exécution en direct.
- 🎨 **Interface Moderne & Responsive** :
  - Thème sombre épuré, animations fluides, composants interactifs et badges de statut en temps réel.

---

## 🛠️ Stack Technique

- **Frontend** : React 18, Vite, TypeScript, Tailwind CSS, Lucide React Icons.
- **Backend (API Express)** : Node.js, Express, Nodemailer, CORS.
- **Service IA** : Groq API (Inférence ultra-rapide Llama 3.3 70B).
- **Import/Export** : PapaParse (CSV).

---

## 🚀 Installation & Démarrage Rapide

### 1. Cloner le dépôt
```bash
git clone https://github.com/VOTRE_NOM_DUTILISATEUR/Auto_mail_AEI.git
cd Auto_mail_AEI
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Démarrer l'application (Frontend + Backend simultanés)
```bash
npm run dev
```

L'application sera accessible sur :
- **Interface Web** : `http://localhost:5173`
- **Serveur API (SMTP)** : `http://localhost:3001`

---

## 🔑 Clé API Groq
1. Obtenez une clé API gratuite sur [console.groq.com](https://console.groq.com/keys).
2. Saisissez votre clé dans l'onglet **"Clé API Groq IA"** sur l'interface web.

---

## 📄 Licence
Ce projet est sous licence MIT - Libre d'utilisation pour toutes les associations d'étudiants ingénieurs.

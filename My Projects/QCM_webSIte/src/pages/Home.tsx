import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCode, 
  FileUp, 
  Sparkles, 
  Terminal, 
  BookOpen, 
  Layers, 
  Brain, 
  Sliders, 
  FileText, 
  Check, 
  Loader2, 
  Trash2, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';

interface HomeProps {
  onPasteCode: (defaultCode: string) => void;
  onUploadFile: (fileContent: string) => void;
}

export const SAMPLE_PYTHON_CODE = `# Exemple de questions QCM/QCU et Questions Ouvertes pour QCM Generator Pro
questions = [
    {
        "id": 1,
        "type": "QCU",
        "category": "Culture Générale",
        "question": "Quel est le plus grand océan de la planète Terre ?",
        "options": [
            "L'océan Atlantique",
            "L'océan Pacifique",
            "L'océan Indien",
            "L'océan Arctique"
        ],
        "correct": [1]
    },
    {
        "id": 2,
        "type": "QCM",
        "category": "Programmation",
        "question": "Parmi les technologies suivantes, lesquelles sont des langages de programmation ?",
        "options": [
            "Python",
            "HTML/CSS",
            "Rust",
            "Adobe Photoshop",
            "TypeScript"
        ],
        "correct": [0, 2, 4]
    },
    {
        "id": 3,
        "type": "OPEN",
        "category": "Machine Learning",
        "question": "Définissez brièvement l'apprentissage par renforcement (Reinforcement Learning).",
        "expected_answer": "L'apprentissage par renforcement est une branche du machine learning où un agent apprend à prendre des décisions dans un environnement afin de maximiser une notion de récompense cumulée à travers des essais et des erreurs."
    },
    {
        "id": 4,
        "type": "DEFINITION",
        "category": "Machine Learning",
        "question": "Qu'est-ce qu'un MDP (Processus de Décision de Markov) ?",
        "expected_answer": "Un processus de décision de Markov est un cadre mathématique pour modéliser la prise de décision dans des situations où les résultats sont partiellement aléatoires et partiellement sous le contrôle d'un agent. Il est défini par un quadruplet (S, A, P, R) où S représente les états, A les actions, P les probabilités de transition et R les récompenses."
    },
    {
        "id": 5,
        "type": "CASE_STUDY",
        "category": "Intelligence Artificielle",
        "scenario": "Une voiture autonome doit choisir sa trajectoire à une intersection. Pour cela, elle doit prendre en compte les feux de signalisation, les piétons qui traversent, et la présence de verglas au sol.",
        "question": "Expliquez brièvement comment un algorithme de RL (Q-Learning par exemple) modéliserait ce problème (états, actions et fonction de récompense).",
        "expected_answer": "Pour modéliser cela en RL, l'état comprendrait la position de la voiture, l'état du feu, la présence de piétons et les conditions météo au sol. Les actions possibles seraient : accélérer, freiner, tourner à gauche/droite. La fonction de récompense donnerait un malus énorme en cas d'accident ou de non-respect du code de la route, et un bonus positif lorsque la voiture arrive à destination de manière fluide et sécurisée."
    },
    {
        "id": 6,
        "type": "ANALYSIS",
        "category": "Algorithmes",
        "question": "Comparez succinctement l'algorithme Q-Learning et l'algorithme SARSA.",
        "expected_answer": "Le Q-Learning est un algorithme hors-politique (off-policy) qui met à jour sa fonction de valeur en supposant qu'il suivra la meilleure action future possible (politique gloutonne), indépendamment de l'action réelle choisie. SARSA est un algorithme sur-politique (on-policy) qui effectue ses mises à jour en utilisant l'action réelle choisie par la politique courante (par exemple e-greedy), ce qui le rend généralement plus prudent en cours d'apprentissage."
    }
]
`;

export const Home: React.FC<HomeProps> = ({ onPasteCode, onUploadFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'CODE' | 'AI'>('CODE');
  const [isDragActive, setIsDragActive] = useState(false);

  // AI Generation States
  const [aiFiles, setAiFiles] = useState<File[]>([]);
  const [aiTextContent, setAiTextContent] = useState('');
  const [showTextArea, setShowTextArea] = useState(false);
  const [generationMode, setGenerationMode] = useState<'STANDARD' | 'TP'>('STANDARD');
  const [difficulty, setDifficulty] = useState<'facile' | 'moyen' | 'difficile'>('moyen');
  const [numQuestions, setNumQuestions] = useState(10);
  
  // Percentages for standard mode
  const [pctQcm, setPctQcm] = useState(30);
  const [pctQcu, setPctQcu] = useState(30);
  const [pctOpen, setPctOpen] = useState(40);
  
  // Prompt instructions for TP mode
  const [tpPrompt, setTpPrompt] = useState(
    "En se basant sur ce TP : je veux un examen de 10 Questions pas QCM ou QCU ! et qui ne contient pas du code , que la compréhension mais traite tous le TP , comment l'algorithme fonctionne et autres choses! donner moi des situations globale hors TP avec des données , en se basant sur ce TP,"
  );

  // Update TP prompt text when numQuestions changes
  useEffect(() => {
    setTpPrompt((prev) => {
      // Regex replace "N Questions" or "N questions"
      const match = prev.match(/(\d+)\s+Questions/i);
      if (match) {
        return prev.replace(/(\d+)\s+Questions/i, `${numQuestions} Questions`);
      }
      return prev;
    });
  }, [numQuestions]);

  // Loading indicator states
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [genError, setGenError] = useState<string | null>(null);

  // Stepper logic
  useEffect(() => {
    if (!isGenerating) return;
    setGenStep(0);
    const interval = setInterval(() => {
      setGenStep((prev) => {
        if (prev < 2) return prev + 1;
        return prev;
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // File Handlers for TAB 1 (Code)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeTab === 'CODE') {
      const file = e.target.files?.[0];
      if (!file) return;
      readAndUploadFile(file);
    } else {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      
      setAiFiles((prev) => {
        const combined = [...prev];
        let addedCount = 0;
        let skippedCount = 0;
        
        for (const file of files) {
          const ext = file.name.split('.').pop()?.toLowerCase();
          if (ext === 'pdf' || ext === 'txt' || ext === 'py' || file.type === 'text/plain') {
            const exists = combined.some((f) => f.name === file.name && f.size === file.size);
            if (!exists) {
              if (combined.length < 7) {
                combined.push(file);
                addedCount++;
              } else {
                skippedCount++;
              }
            }
          } else {
            alert(`Format non supporté pour "${file.name}". Seuls les fichiers PDF, TXT ou Python (.py) sont acceptés.`);
          }
        }
        
        if (skippedCount > 0 || (files.length > addedCount && combined.length >= 7)) {
          alert("Vous ne pouvez pas importer plus de 7 fichiers au maximum.");
        }
        
        return combined;
      });
      // Clear input so the user can select the same file again if they want
      e.target.value = '';
    }
  };

  const readAndUploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onUploadFile(content);
    };
    reader.readAsText(file);
  };

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (activeTab === 'CODE') {
        const file = e.dataTransfer.files[0];
        if (file.name.endsWith('.py') || file.type === 'text/plain' || file.name.endsWith('.txt')) {
          readAndUploadFile(file);
        } else {
          alert("Veuillez déposer un fichier Python (.py) ou texte (.txt) valide.");
        }
      } else {
        const files = Array.from(e.dataTransfer.files);
        setAiFiles((prev) => {
          const combined = [...prev];
          let addedCount = 0;
          let skippedCount = 0;
          
          for (const file of files) {
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext === 'pdf' || ext === 'txt' || ext === 'py' || file.type === 'text/plain') {
              const exists = combined.some((f) => f.name === file.name && f.size === file.size);
              if (!exists) {
                if (combined.length < 7) {
                  combined.push(file);
                  addedCount++;
                } else {
                  skippedCount++;
                }
              }
            } else {
              alert(`Format non supporté pour "${file.name}". Seuls les fichiers PDF, TXT ou Python (.py) sont acceptés.`);
            }
          }
          
          if (skippedCount > 0 || (files.length > addedCount && combined.length >= 7)) {
            alert("Vous ne pouvez pas importer plus de 7 fichiers au maximum.");
          }
          
          return combined;
        });
      }
    }
  };

  // JSON to Python Converter
  const convertJSONToPython = (questions: any[]) => {
    const formatValue = (val: any): string => {
      if (val === null) return 'None';
      if (val === true) return 'True';
      if (val === false) return 'False';
      if (typeof val === 'string') {
        if (val.includes('\n')) {
          // Double escape triple quotes inside text
          const escaped = val.replace(/"""/g, '\\"\\"\\"');
          return `"""${escaped}"""`;
        }
        return JSON.stringify(val);
      }
      if (Array.isArray(val)) {
        return `[${val.map(formatValue).join(', ')}]`;
      }
      if (typeof val === 'object') {
        const entries = Object.entries(val)
          .map(([k, v]) => `        "${k}": ${formatValue(v)}`)
          .join(',\n');
        return `{\n${entries}\n    }`;
      }
      return String(val);
    };

    const qStrings = questions.map((q) => {
      const qFields = Object.entries(q)
        .map(([k, v]) => `        "${k}": ${formatValue(v)}`)
        .join(',\n');
      return `    {\n${qFields}\n    }`;
    });

    return `# Examen généré par l'IA le ${new Date().toLocaleDateString('fr-FR')}\nquestions = [\n${qStrings.join(',\n')}\n]\n`;
  };

  // Action: Call AI Generation API
  const handleAIGenerate = async () => {
    if (aiFiles.length === 0 && !aiTextContent.trim()) {
      alert("Veuillez téléverser un ou plusieurs documents ou coller du texte.");
      return;
    }

    if (generationMode === 'STANDARD' && (pctQcm + pctQcu + pctOpen !== 100)) {
      alert("La somme des pourcentages de répartition doit être égale à 100%.");
      return;
    }

    setIsGenerating(true);
    setGenError(null);

    const formData = new FormData();
    if (aiFiles.length > 0) {
      aiFiles.forEach((file) => {
        formData.append('files', file);
      });
    }
    if (aiTextContent.trim()) {
      formData.append('text_content', aiTextContent);
    }
    formData.append('difficulty', difficulty);
    formData.append('num_questions', String(numQuestions));
    formData.append('is_tp_mode', String(generationMode === 'TP'));
    
    if (generationMode === 'TP') {
      formData.append('tp_prompt', tpPrompt);
    } else {
      formData.append('pct_qcm', String(pctQcm));
      formData.append('pct_qcu', String(pctQcu));
      formData.append('pct_open', String(pctOpen));
    }

    try {
      const response = await fetch('http://localhost:8000/generate-exam', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
      }

      const data = await response.json();
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Le format renvoyé par l'IA est incorrect (manque la liste de questions).");
      }

      // Finish loading steps
      setGenStep(3);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const pythonCode = convertJSONToPython(data.questions);
      onUploadFile(pythonCode);
    } catch (err: any) {
      console.error(err);
      setGenError(err.message || "Une erreur inattendue est survenue.");
      setIsGenerating(false);
    }
  };

  // Constants
  const sumPct = pctQcm + pctQcu + pctOpen;
  const isPctValid = sumPct === 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  } as const;

  const loaderSteps = [
    { title: "Lecture du document", desc: "Téléversement et extraction du texte du fichier..." },
    { title: "Analyse des concepts clés", desc: "Extraction des algorithmes, structures de données et points cruciaux..." },
    { title: "Génération des questions", desc: "Conception des énoncés et réponses types par l'IA Llama 3.3..." },
    { title: "Mise en forme finale", desc: "Conversion des données et préparation de la session de test..." }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto px-4 py-12 sm:py-16 flex flex-col items-center justify-center flex-1 w-full"
    >
      {/* Loading overlay when generating */}
      {isGenerating && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-slate-100 mb-2">Génération de l'examen</h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              L'IA analyse votre document pour construire un examen personnalisé de qualité universitaire.
            </p>

            <div className="w-full space-y-4 text-left">
              {loaderSteps.map((step, idx) => {
                const isCompleted = genStep > idx;
                const isActive = genStep === idx;
                return (
                  <div key={idx} className={`flex items-start gap-3 transition-opacity duration-300 ${isCompleted || isActive ? 'opacity-100' : 'opacity-35'}`}>
                    <div className={`mt-0.5 p-1 rounded-full border flex-shrink-0 ${
                      isCompleted 
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-400' 
                        : isActive 
                        ? 'bg-blue-950 border-blue-500 text-blue-400 animate-pulse' 
                        : 'border-slate-800 text-slate-600'
                    }`}>
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : <div className="h-3.5 w-3.5 rounded-full bg-current" />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${isActive ? 'text-blue-400 font-bold' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Badge Banner */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold mb-6 shadow-md shadow-blue-500/5"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Créateur d'Examens Automatique par IA</span>
      </motion.div>

      {/* Main Title & Slogan */}
      <motion.h1
        variants={itemVariants}
        className="text-4xl sm:text-6xl font-extrabold text-center leading-tight tracking-tight mb-6 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-400 dark:from-slate-50 dark:via-slate-100 dark:to-slate-400 light:from-slate-900 light:via-slate-800 light:to-slate-600 bg-clip-text text-transparent"
      >
        Transformez vos supports en examens interactifs
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="text-base sm:text-lg text-slate-400 dark:text-slate-400 light:text-slate-600 text-center max-w-2xl mb-10 leading-relaxed"
      >
        Sélectionnez votre mode de chargement ci-dessous : importez un fichier de questions existant ou laissez notre IA générer un examen complet sur mesure basé sur votre cours ou TP.
      </motion.p>

      {/* Tabs Switcher */}
      <motion.div 
        variants={itemVariants}
        className="flex bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-200/80 p-1.5 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-350 mb-8 w-full max-w-md"
      >
        <button
          onClick={() => setActiveTab('CODE')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'CODE'
              ? 'bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 shadow-md border border-slate-800/50 dark:border-slate-800/50 light:border-slate-200'
              : 'text-slate-400 hover:text-slate-200 dark:text-slate-500 dark:hover:text-slate-300 light:text-slate-600 light:hover:text-slate-800'
          }`}
        >
          <FileCode className="h-4.5 w-4.5" />
          <span>Script Python existant</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('AI');
            setGenError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === 'AI'
              ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/20 shadow-md shadow-blue-500/5'
              : 'text-slate-400 hover:text-slate-200 dark:text-slate-500 dark:hover:text-slate-300 light:text-slate-600 light:hover:text-slate-800'
          }`}
        >
          <Sparkles className="h-4.5 w-4.5 text-blue-400" />
          <span>Générer par IA (Cours / TP)</span>
        </button>
      </motion.div>

      {/* Tab 1: Existings script (.py) */}
      {activeTab === 'CODE' && (
        <motion.div
          key="code-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center"
        >
          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mb-12">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".py,.txt"
              className="hidden"
            />
            <Button
              variant="primary"
              size="lg"
              className="flex-1 shadow-lg shadow-blue-500/20"
              leftIcon={<FileUp className="h-5 w-5" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Importer un fichier
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              leftIcon={<FileCode className="h-5 w-5 text-indigo-400" />}
              onClick={() => onPasteCode(SAMPLE_PYTHON_CODE)}
            >
              Coller du code
            </Button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl p-10 border-2 border-dashed rounded-3xl cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
              isDragActive
                ? 'bg-blue-600/10 border-blue-500 text-slate-100 shadow-xl scale-[1.01]'
                : 'bg-slate-900/35 dark:bg-slate-900/35 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-350 hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-slate-400'
            }`}
          >
            <div className="p-4 bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl mb-4 transition-transform hover:scale-105">
              <FileCode className="h-8 w-8 text-blue-400" />
            </div>
            <p className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-700 text-center text-lg mb-1">
              Déposez votre fichier Python ici
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 light:text-slate-500 text-center">
              Supporte les formats <span className="font-mono">.py</span> et <span className="font-mono">.txt</span> jusqu'à 5 Mo
            </p>
          </div>
        </motion.div>
      )}

      {/* Tab 2: AI generator from Course / TP */}
      {activeTab === 'AI' && (
        <motion.div
          key="ai-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-slate-900/35 dark:bg-slate-900/35 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-350 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl"
        >
          {genError && (
            <Alert 
              type="error" 
              title="Échec de génération" 
              message={genError} 
              onClose={() => setGenError(null)} 
            />
          )}

          {/* 1. Upload Support File */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">
              1. Documents sources (Support de cours ou TP, max 7)
            </span>
            
            {/* Selected files list */}
            {aiFiles.length > 0 && (
              <div className="flex flex-col gap-2 bg-slate-900/10 dark:bg-slate-950/15 light:bg-slate-50 border border-slate-800/85 dark:border-slate-800/85 light:border-slate-250 p-3 rounded-2xl">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wide px-1">
                  <span>Fichiers importés ({aiFiles.length}/7)</span>
                  <button
                    type="button"
                    onClick={() => setAiFiles([])}
                    className="text-rose-500 hover:text-rose-400 transition-colors normal-case font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Tout retirer
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1 mt-1.5">
                  {aiFiles.map((file, idx) => (
                    <motion.div
                      key={`${file.name}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between bg-slate-900/80 dark:bg-slate-950/80 light:bg-white border border-slate-850 dark:border-slate-850 light:border-slate-200 p-2.5 rounded-xl transition-all hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-slate-350"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex-shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 truncate">
                            {file.name}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {(file.size / 1024).toFixed(1)} Ko • {file.name.split('.').pop()?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAiFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-950/20 hover:text-rose-400 transition-colors flex-shrink-0 cursor-pointer"
                        title="Retirer ce fichier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Dropzone / Upload button area */}
            {aiFiles.length < 7 ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => aiFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 cursor-pointer text-center transition-all ${
                  isDragActive
                    ? 'bg-blue-600/10 border-blue-500'
                    : 'border-slate-800 dark:border-slate-800 light:border-slate-300 hover:border-slate-750 dark:hover:border-slate-750 light:hover:border-slate-400 bg-slate-900/40 dark:bg-slate-950/40 light:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={aiFileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.py"
                  multiple
                  className="hidden"
                />
                <FileUp className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium">
                  {aiFiles.length > 0 
                    ? "Ajouter un autre fichier (glissez-déposez ou cliquez)"
                    : "Glissez-déposez ou cliquez pour importer vos fichiers"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Formats acceptés : PDF, TXT ou Python (.py) • Maximum 7 fichiers
                </p>
              </div>
            ) : (
              <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-4 text-center">
                <p className="text-xs font-semibold text-emerald-400">
                  ✓ Limite maximale de 7 fichiers atteinte. Retirez des fichiers pour pouvoir en ajouter de nouveaux.
                </p>
              </div>
            )}

            {/* Alternately paste text content */}
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setShowTextArea(!showTextArea)}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 focus:outline-none"
              >
                {showTextArea ? "Masquer le champ texte" : "ou coller directement du texte brut"}
              </button>

              {showTextArea && (
                <textarea
                  value={aiTextContent}
                  onChange={(e) => setAiTextContent(e.target.value)}
                  placeholder="Collez le texte du cours ou de l'énoncé du TP ici..."
                  className="w-full h-32 px-3 py-2.5 mt-2 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-250 text-slate-100 dark:text-slate-100 light:text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans leading-relaxed resize-y"
                />
              )}
            </div>
          </div>

          {/* 2. Generation Mode */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">
              2. Type de support
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option: Standard Support */}
              <button
                onClick={() => setGenerationMode('STANDARD')}
                className={`p-4 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                  generationMode === 'STANDARD'
                    ? 'border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/5'
                    : 'border-slate-800 dark:border-slate-800 light:border-slate-250 bg-slate-900/10 dark:bg-slate-950/10 light:bg-slate-50 hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-slate-350'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 text-sm flex items-center gap-1.5">
                    <BookOpen className="h-4.5 w-4.5 text-blue-400" />
                    Support de cours classique
                  </span>
                  <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center ${generationMode === 'STANDARD' ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-700'}`}>
                    {generationMode === 'STANDARD' && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 leading-normal">
                  Idéal pour générer un examen équilibré contenant des QCM, QCU et des questions d'explications/définitions.
                </span>
              </button>

              {/* Option: TP Mode */}
              <button
                onClick={() => setGenerationMode('TP')}
                className={`p-4 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                  generationMode === 'TP'
                    ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/5'
                    : 'border-slate-800 dark:border-slate-800 light:border-slate-250 bg-slate-900/10 dark:bg-slate-950/10 light:bg-slate-50 hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-slate-350'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 text-sm flex items-center gap-1.5">
                    <Terminal className="h-4.5 w-4.5 text-indigo-400" />
                    Énoncé de TP (Travaux Pratiques)
                  </span>
                  <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center ${generationMode === 'TP' ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700'}`}>
                    {generationMode === 'TP' && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 leading-normal">
                  Génère des questions ouvertes conceptuelles/algorithmiques (sans QCM, QCU ni code) et des cas pratiques chiffrés.
                </span>
              </button>
            </div>
          </div>

          {/* 3. Common Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 pt-5">
            {/* Difficulty */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Difficulté de l'examen
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-250 text-slate-100 dark:text-slate-100 light:text-slate-950 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="facile">Facile</option>
                <option value="moyen">Moyen (Conseillé)</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>

            {/* Questions count */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Nombre de questions
              </label>
              <input
                type="number"
                min={2}
                max={30}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.max(2, Math.min(30, parseInt(e.target.value) || 2)))}
                className="px-3 py-2 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-250 text-slate-100 dark:text-slate-100 light:text-slate-950 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 4a. Standard Mode options */}
          {generationMode === 'STANDARD' && (
            <div className="flex flex-col gap-3 bg-slate-950/20 dark:bg-slate-950/20 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-250 p-5 rounded-2xl">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <Sliders className="h-4 w-4" /> Répartition des types (%)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPctValid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  Total : {sumPct}% {isPctValid ? '✓' : '✗ (doit valoir 100%)'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">QCM</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={pctQcm}
                    onChange={(e) => setPctQcm(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 dark:bg-slate-950 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-250 text-slate-100 dark:text-slate-100 light:text-slate-950 text-xs font-semibold text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">QCU</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={pctQcu}
                    onChange={(e) => setPctQcu(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 dark:bg-slate-950 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-250 text-slate-100 dark:text-slate-100 light:text-slate-950 text-xs font-semibold text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Ouvertes</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={pctOpen}
                    onChange={(e) => setPctOpen(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 dark:bg-slate-950 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-250 text-slate-100 dark:text-slate-100 light:text-slate-950 text-xs font-semibold text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Graphical distribution bar */}
              <div className="h-2 w-full rounded-full bg-slate-800 dark:bg-slate-950 light:bg-slate-200 overflow-hidden flex mt-2 shadow-inner">
                <div style={{ width: `${(pctQcm / (sumPct || 1)) * 100}%` }} className="h-full bg-blue-500 transition-all duration-300" title={`QCM: ${pctQcm}%`} />
                <div style={{ width: `${(pctQcu / (sumPct || 1)) * 100}%` }} className="h-full bg-indigo-500 transition-all duration-300" title={`QCU: ${pctQcu}%`} />
                <div style={{ width: `${(pctOpen / (sumPct || 1)) * 100}%` }} className="h-full bg-emerald-500 transition-all duration-300" title={`Ouvertes: ${pctOpen}%`} />
              </div>
            </div>
          )}

          {/* 4b. TP Mode options */}
          {generationMode === 'TP' && (
            <div className="flex flex-col gap-2 bg-slate-950/20 dark:bg-slate-950/20 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-250 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-indigo-400" /> Instructions d'examen pour le TP
              </span>
              <textarea
                value={tpPrompt}
                onChange={(e) => setTpPrompt(e.target.value)}
                placeholder="Consignes IA spécifiques pour le TP..."
                className="w-full h-24 px-3 py-2 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-250 text-slate-100 dark:text-slate-100 light:text-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans leading-relaxed resize-y"
              />
              <span className="text-[10px] text-slate-500 leading-normal flex items-start gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Ce mode impose que l'examen ne contiendra <b>aucun QCM/QCU</b> et <b>aucun bloc de code</b>. L'IA concevra des questions de pure compréhension basées sur le fonctionnement de l'algorithme ainsi que des cas pratiques avec données externes.</span>
              </span>
            </div>
          )}

          {/* 5. Submit Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
            leftIcon={<Sparkles className="h-5 w-5" />}
            disabled={(aiFiles.length === 0 && !aiTextContent.trim()) || (generationMode === 'STANDARD' && !isPctValid)}
            onClick={handleAIGenerate}
          >
            Générer l'examen avec l'IA
          </Button>
        </motion.div>
      )}

      {/* Quick Feature Grid */}
      {!isGenerating && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mt-16 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80 pt-10"
        >
          <div className="flex gap-3 items-start">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
              <Brain className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 text-sm">IA Llama 3.3</h4>
              <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-500 mt-1 leading-relaxed">
                Profitez du modèle haute performance Llama-3.3-70b de Groq pour concevoir des questions intelligentes de niveau universitaire.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <Sliders className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 text-sm">Contrôle de répartition</h4>
              <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-500 mt-1 leading-relaxed">
                Personnalisez la proportion de QCM, QCU et questions ouvertes pour ajuster le format de l'examen à vos besoins.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Terminal className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 text-sm">Mode TP Intégral</h4>
              <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-500 mt-1 leading-relaxed">
                Évaluez la compréhension algorithmique avec des cas d'études réels sans introduire de code, conformément aux critères de validation.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

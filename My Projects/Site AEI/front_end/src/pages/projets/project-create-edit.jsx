import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Upload,
  Link2,
  Tag,
  BookOpen,
  Image,
  Info,
  Check,
  ChevronRight,
  Layers,
  X,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../../lib/api";
import { supabase } from "../../lib/supabaseClient";
import { useProjectDraft } from "../../hooks/useProjectDraft";
import MarkdownEditor from "../../components/ui/markdown-editor";

const POPULAR_TAGS = [
  "React", "Node.js", "TailwindCSS", "Supabase", "Python",
  "TensorFlow", "FastAPI", "PostgreSQL", "Framer Motion", "Figma",
  "Docker", "IoT", "Flutter", "iOS", "Android", "Unity", "Django"
];

const STEPS = [
  { id: 1, name: "Informations", icon: Info },
  { id: 2, name: "Technologies", icon: Tag },
  { id: 3, name: "Médias", icon: Image },
  { id: 4, name: "Liens", icon: Link2 },
  { id: 5, name: "Documentation & IA", icon: BookOpen }
];

export default function ProjectCreateEditPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Draft Context integration
  const {
    draft,
    step,
    setStep,
    updateDraftField,
    saveStatus,
    lastSaved,
    isDirty,
    saveImmediately,
    restoreDraft,
    discardDraft,
    resetForm
  } = useProjectDraft();

  const [sessionUser, setSessionUser] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Restore draft dialog
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");

  // Media uploading loader states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Load user session and check if draft exists or load edit details
  useEffect(() => {
    const initPage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/connexion");
        return;
      }
      setSessionUser(session.user);

      if (isEditMode) {
        try {
          const proj = await apiFetch(`/api/projects?id=${id}`);
          
          if (proj.user_id !== session.user.id) {
            alert("Vous n'êtes pas autorisé à modifier ce projet.");
            navigate("/projets");
            return;
          }

          // Populate form fields directly into context draft
          Object.keys(proj).forEach((key) => {
            let fieldName = key;
            if (key === "short_description") fieldName = "shortDescription";
            if (key === "full_description") fieldName = "fullDescription";
            if (key === "readme_markdown") fieldName = "readmeMarkdown";
            if (key === "cover_url") fieldName = "coverUrl";
            if (key === "logo_url") fieldName = "logoUrl";
            if (key === "github_link") fieldName = "githubLink";
            if (key === "website_link") fieldName = "websiteLink";
            if (key === "figma_link") fieldName = "figmaLink";
            if (key === "docs_link") fieldName = "docsLink";
            if (key === "youtube_link") fieldName = "youtubeLink";

            updateDraftField(fieldName, proj[key]);
          });
          setStep(1);
        } catch (err) {
          console.error(err);
          alert("Erreur lors de la récupération du projet.");
          navigate("/projets");
        } finally {
          setLoading(false);
        }
      } else {
        // Create Mode: Look for local/remote draft
        try {
          const restored = await restoreDraft(session.user.id);
          if (restored) {
            setShowRestorePrompt(true);
          }
        } catch (err) {
          console.warn("Could not retrieve draft on init:", err);
        }
      }
    };
    initPage();
  }, [id, isEditMode]);

  // Autogenerate slug on title change in create mode
  const handleTitleChange = (val) => {
    updateDraftField("title", val);
    if (!isEditMode) {
      const formatted = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      updateDraftField("slug", formatted);
    }
  };

  // Image upload
  const handleImageUpload = async (e, bucket, type) => {
    const file = e.target.files?.[0];
    if (!file || !sessionUser) return;

    if (type === "logo") setUploadingLogo(true);
    if (type === "cover") setUploadingCover(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${sessionUser.id}/${fileName}`;

      const { data, error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      
      if (type === "logo") updateDraftField("logoUrl", publicUrl);
      if (type === "cover") updateDraftField("coverUrl", publicUrl);
    } catch (err) {
      console.error(err);
      alert("Erreur de téléversement : " + err.message);
    } finally {
      setUploadingLogo(false);
      setUploadingCover(false);
    }
  };

  const toggleTag = (tag) => {
    const currentTags = draft.tags || [];
    if (currentTags.includes(tag)) {
      updateDraftField("tags", currentTags.filter((t) => t !== tag));
    } else {
      updateDraftField("tags", [...currentTags, tag]);
    }
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const clean = customTagInput.trim();
    const currentTags = draft.tags || [];
    if (clean && !currentTags.includes(clean)) {
      updateDraftField("tags", [...currentTags, clean]);
      setCustomTagInput("");
    }
  };

  const handleAiReadme = async () => {
    if (!draft.title) {
      alert("Veuillez saisir au moins le titre du projet.");
      return;
    }
    setIsGeneratingAi(true);
    try {
      const res = await apiFetch("/api/projects?action=ai_generate", {
        method: "POST",
        body: JSON.stringify({
          title: draft.title,
          slogan: draft.slogan,
          category: draft.category,
          shortDescription: draft.shortDescription,
          fullDescription: draft.fullDescription,
          techStack: draft.tags
        })
      });
      updateDraftField("readmeMarkdown", res.readme);
    } catch (err) {
      alert("Erreur IA: " + err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draft.title || !draft.slug || !draft.category) {
      alert("Veuillez compléter le titre, le slug et la catégorie.");
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
        await apiFetch("/api/projects", {
          method: "PUT",
          body: JSON.stringify({ ...draft, id })
        });
      } else {
        await apiFetch("/api/projects", {
          method: "POST",
          body: JSON.stringify(draft)
        });
      }
      
      // Clean draft after successful publication
      await discardDraft(sessionUser?.id);
      
      navigate(`/projets/${draft.slug}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Restoring draft choice handles
  const handleKeepDraft = () => {
    setShowRestorePrompt(false);
  };

  const handleResetDraft = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir tout effacer et recommencer à zéro ?")) {
      await discardDraft(sessionUser?.id);
      setShowRestorePrompt(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-t-blue-600 border-slate-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Format save status
  const getSaveStatusMessage = () => {
    if (saveStatus === "saving") return "Sauvegarde en cours...";
    if (saveStatus === "saved") {
      return lastSaved
        ? `Sauvegardé à ${lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
        : "Sauvegardé";
    }
    if (saveStatus === "error") return "Erreur de sauvegarde automatique";
    return "";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/mes-projets"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={14} />
            <span>Mon espace projets</span>
          </Link>

          {/* Autosave Sync Status Label */}
          {getSaveStatusMessage() && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 self-start sm:self-auto shadow-xs border border-slate-200/50">
              {saveStatus === "saving" ? (
                <RefreshCw size={11} className="animate-spin text-blue-600" />
              ) : (
                <CheckCircle2 size={11} className="text-green-600" />
              )}
              <span>{getSaveStatusMessage()}</span>
            </div>
          )}
        </div>

        {/* Dynamic Title banner */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            {isEditMode ? "Éditer mon Projet" : "Publier un nouveau Projet"}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {isEditMode
              ? "Modifiez les informations et publiez des nouvelles documentations pour votre équipe."
              : "Créez une page de vitrine professionnelle pour votre projet. Vos modifications sont sauvegardées à chaque frappe."}
          </p>
        </div>

        {/* Step Indicator Panel */}
        <div className="grid grid-cols-5 border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-xs">
          {STEPS.map((s) => {
            const IconComponent = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;

            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`py-3.5 px-1.5 flex flex-col items-center gap-1.5 transition-colors border-r last:border-0 border-slate-100 text-center ${
                  isActive
                    ? "bg-slate-50 text-blue-600 font-bold"
                    : isCompleted
                    ? "text-blue-500 hover:bg-slate-50/50"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50/30"
                }`}
              >
                <IconComponent size={16} className={isActive ? "text-blue-600" : isCompleted ? "text-blue-500" : "text-slate-400"} />
                <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step Content Container */}
        <div className="border border-slate-200 bg-white p-6 rounded-3xl shadow-xs min-h-[350px]">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Titre du Projet *</label>
                      <input
                        type="text"
                        placeholder="Ex: AEI Assistant IA"
                        value={draft.title || ""}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        required
                        className="w-full bg-slate-50/65 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Slug de la page (URL unique) *</label>
                      <input
                        type="text"
                        placeholder="Ex: aei-assistant-ia"
                        value={draft.slug || ""}
                        onChange={(e) => updateDraftField("slug", e.target.value)}
                        required
                        className="w-full bg-slate-50/65 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Catégorie *</label>
                      <select
                        value={draft.category || "Web"}
                        onChange={(e) => updateDraftField("category", e.target.value)}
                        className="w-full bg-slate-50/65 border border-slate-200 rounded-xl p-3 text-xs text-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-semibold"
                      >
                        <option value="Web">Web (SaaS, Sites)</option>
                        <option value="IA">Intelligence Artificielle / Data</option>
                        <option value="Mobile">Mobile (iOS, Android)</option>
                        <option value="IoT">IoT / Électronique</option>
                        <option value="Jeux Video">Jeux Vidéo</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Slogan / Pitch court</label>
                      <input
                        type="text"
                        placeholder="Ex: L'assistant intelligent pour la réussite des examens universitaires."
                        value={draft.slogan || ""}
                        onChange={(e) => updateDraftField("slogan", e.target.value)}
                        className="w-full bg-slate-50/65 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Description courte</label>
                    <textarea
                      placeholder="Décrivez en 2 ou 3 phrases l'objectif principal du projet."
                      value={draft.shortDescription || ""}
                      onChange={(e) => updateDraftField("shortDescription", e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50/65 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Description complète</label>
                    <textarea
                      placeholder="Donnez plus de détails sur le contexte du projet, le problème résolu et les objectifs."
                      value={draft.fullDescription || ""}
                      onChange={(e) => updateDraftField("fullDescription", e.target.value)}
                      rows={4}
                      className="w-full bg-slate-50/65 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Technology selection */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Technologies populaires</label>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_TAGS.map((t) => {
                        const selected = draft.tags?.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleTag(t)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                              selected
                                ? "bg-blue-50 border-blue-200 text-blue-600"
                                : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-350"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Ajouter des tags personnalisés</label>
                    <form onSubmit={handleAddCustomTag} className="flex gap-2 max-w-sm">
                      <input
                        type="text"
                        placeholder="Ex: PyTorch, Tailwind..."
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        className="flex-1 bg-slate-50/65 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-blue-500 transition font-semibold"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-150 border border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                      >
                        Ajouter
                      </button>
                    </form>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Tags sélectionnés</label>
                    <div className="flex flex-wrap gap-2">
                      {!draft.tags || draft.tags.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Aucun tag sélectionné pour le moment.</span>
                      ) : (
                        draft.tags.map((t) => (
                          <span
                            key={t}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg shadow-xs"
                          >
                            <span>{t}</span>
                            <button
                              type="button"
                              onClick={() => toggleTag(t)}
                              className="text-slate-400 hover:text-red-500 ml-1 font-black text-sm"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Media Uploads */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* Logo upload */}
                    <div className="border border-slate-200 rounded-3xl bg-slate-50/20 p-5 space-y-4 shadow-xs">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Logo du Projet (Image carrée)</label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {draft.logoUrl ? (
                            <img src={draft.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                          ) : (
                            <Layers size={24} className="text-slate-350" />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition shadow-xs">
                            <Upload size={13} />
                            <span>{uploadingLogo ? "Téléversement..." : "Parcourir..."}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, "project-covers", "logo")}
                              className="hidden"
                              disabled={uploadingLogo}
                            />
                          </label>
                          <input
                            type="text"
                            placeholder="Ou saisissez un lien URL..."
                            value={draft.logoUrl || ""}
                            onChange={(e) => updateDraftField("logoUrl", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cover upload */}
                    <div className="border border-slate-200 rounded-3xl bg-slate-50/20 p-5 space-y-4 shadow-xs">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Image de couverture (Format Large)</label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-28 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {draft.coverUrl ? (
                            <img src={draft.coverUrl} alt="Couverture" className="h-full w-full object-cover" />
                          ) : (
                            <Image size={24} className="text-slate-350" />
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition shadow-xs">
                            <Upload size={13} />
                            <span>{uploadingCover ? "Téléversement..." : "Parcourir..."}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, "project-covers", "cover")}
                              className="hidden"
                              disabled={uploadingCover}
                            />
                          </label>
                          <input
                            type="text"
                            placeholder="Ou saisissez un lien URL..."
                            value={draft.coverUrl || ""}
                            onChange={(e) => updateDraftField("coverUrl", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 4: External links */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                        <Tag size={10} />
                        <span>Code Source (GitHub, GitLab)</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/votre-nom/projet"
                        value={draft.githubLink || ""}
                        onChange={(e) => updateDraftField("githubLink", e.target.value)}
                        className="w-full bg-slate-50/65 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                        <Layers size={10} />
                        <span>Site Web / Démo en ligne</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://votre-projet.vercel.app"
                        value={draft.websiteLink || ""}
                        onChange={(e) => updateDraftField("websiteLink", e.target.value)}
                        className="w-full bg-slate-50/65 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Maquette Figma</label>
                      <input
                        type="url"
                        placeholder="https://figma.com/file/..."
                        value={draft.figmaLink || ""}
                        onChange={(e) => updateDraftField("figmaLink", e.target.value)}
                        className="w-full bg-slate-50/65 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Lien Vidéo (YouTube)</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={draft.youtubeLink || ""}
                        onChange={(e) => updateDraftField("youtubeLink", e.target.value)}
                        className="w-full bg-slate-50/65 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Lien Documentation</label>
                      <input
                        type="url"
                        placeholder="https://docs.votre-projet.com"
                        value={draft.docsLink || ""}
                        onChange={(e) => updateDraftField("docsLink", e.target.value)}
                        className="w-full bg-slate-50/65 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: README & Status */}
              {step === 5 && (
                <div className="space-y-6">
                  {/* Status selection */}
                  <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-4 shadow-xs">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800">Visibilité du Projet</h4>
                      <p className="text-[10px] text-slate-500 font-semibold">Configurez qui peut découvrir ce projet.</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateDraftField("status", "public")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                          draft.status === "public"
                            ? "bg-green-50 border-green-200 text-green-600"
                            : "bg-transparent border-slate-200 text-slate-555 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDraftField("status", "draft")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                          draft.status === "draft"
                            ? "bg-amber-50 border-amber-200 text-amber-600"
                            : "bg-transparent border-slate-200 text-slate-555 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        Brouillon
                      </button>
                    </div>
                  </div>

                  {/* README Editor */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Documentation README.md</label>
                    </div>
                    
                    <MarkdownEditor
                      value={draft.readmeMarkdown || ""}
                      onChange={(val) => updateDraftField("readmeMarkdown", val)}
                      onAiGenerate={handleAiReadme}
                      isGeneratingAi={isGeneratingAi}
                    />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wizard Footer Navigation Controls */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center gap-1 px-4 py-2 border border-slate-250 hover:bg-slate-50 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <ArrowLeft size={14} />
            <span>Précédent</span>
          </button>

          {/* Sync indicator status for bottom */}
          <div className="hidden sm:block text-[10px] font-bold text-slate-450">
            Étape {step} sur 5
          </div>

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(Math.min(5, step + 1))}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl text-white transition shadow-xs"
            >
              <span>Suivant</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-bold rounded-xl text-white shadow-md shadow-blue-500/10 disabled:opacity-50 transition"
            >
              {saving ? (
                <span>Enregistrement...</span>
              ) : (
                <>
                  <Check size={14} />
                  <span>{isEditMode ? "Enregistrer" : "Publier la vitrine"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Restore Dialog Modal */}
      <AnimatePresence>
        {showRestorePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl flex flex-col p-6 space-y-5"
            >
              <div className="flex items-center gap-3 text-amber-600">
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-2xl">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Brouillon de projet détecté</h3>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Autosave hybride</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Vous avez un brouillon non publié pour le projet <strong className="text-slate-800">"{draft.title || "Sans titre"}"</strong> à l'étape {step} sur 5. Souhaitez-vous restaurer votre travail ou repartir à zéro ?
              </p>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  onClick={handleResetDraft}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Recommencer à zéro
                </button>
                <button
                  onClick={handleKeepDraft}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Continuer la saisie
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

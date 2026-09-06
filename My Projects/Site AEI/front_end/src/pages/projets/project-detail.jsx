import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ThumbsUp,
  Bookmark,
  Github,
  Globe,
  FileText,
  Plus,
  Layers,
  ArrowLeft,
  MessageSquare,
  Users,
  GitBranch,
  CornerDownRight,
  Clock,
  CheckCircle,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../../lib/api";
import { parseMarkdown } from "../../components/ui/markdown-editor";
import { supabase } from "../../lib/supabaseClient";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("readme"); // readme, releases, activity

  const [sessionUser, setSessionUser] = useState(null);

  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [collabLoading, setCollabLoading] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseVersion, setReleaseVersion] = useState("");
  const [releaseChangelog, setReleaseChangelog] = useState("");
  const [releasing, setReleasing] = useState(false);

  const fetchProjectData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionUser(session?.user || null);

      const data = await apiFetch(`/api/projects?slug=${slug}`);
      setProject(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur de chargement du projet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 border-4 border-t-blue-600 border-slate-200 rounded-full animate-spin"></div>
          <span className="text-sm text-slate-500 font-semibold">Chargement de la vitrine...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md border border-slate-200 p-8 rounded-3xl bg-white shadow-xs">
          <Layers size={48} className="mx-auto text-rose-500" />
          <h2 className="text-xl font-black text-slate-900">Impossible de charger le projet</h2>
          <p className="text-sm text-slate-500">{error || "Le projet demandé n'existe pas."}</p>
          <button
            onClick={() => navigate("/projets")}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition text-sm font-semibold"
          >
            <ArrowLeft size={16} />
            <span>Retour à l'exploration</span>
          </button>
        </div>
      </div>
    );
  }

  const isOwner = sessionUser && project.user_id === sessionUser.id;
  const isAcceptedCollaborator =
    sessionUser &&
    project.collaborators?.some(c => c.user_id === sessionUser.id && c.status === "accepted");
  const isPendingCollaborator =
    sessionUser &&
    project.collaborators?.some(c => c.user_id === sessionUser.id && c.status === "pending");

  const handleLike = async () => {
    if (!sessionUser) {
      alert("Veuillez vous connecter pour aimer ce projet.");
      return;
    }
    setLikeLoading(true);
    try {
      const res = await apiFetch("/api/projects?action=like", {
        method: "POST",
        body: JSON.stringify({ projectId: project.id })
      });
      setProject(prev => ({
        ...prev,
        user_liked: res.liked,
        likes_count: prev.likes_count + (res.liked ? 1 : -1)
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!sessionUser) {
      alert("Veuillez vous connecter pour ajouter en favoris.");
      return;
    }
    setBookmarkLoading(true);
    try {
      const res = await apiFetch("/api/projects?action=bookmark", {
        method: "POST",
        body: JSON.stringify({ projectId: project.id })
      });
      setProject(prev => ({
        ...prev,
        user_bookmarked: res.bookmarked,
        bookmarks_count: prev.bookmarks_count + (res.bookmarked ? 1 : -1)
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!sessionUser) {
      alert("Veuillez vous connecter pour postuler.");
      return;
    }
    setCollabLoading(true);
    try {
      const newCollab = await apiFetch("/api/projects?action=collaborate", {
        method: "POST",
        body: JSON.stringify({ projectId: project.id, role: "contributor" })
      });
      setProject(prev => ({
        ...prev,
        collaborators: [...(prev.collaborators || []), { ...newCollab, profile: { full_name: "Vous" } }]
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setCollabLoading(false);
    }
  };

  const handleAddComment = async (e, parentId = null) => {
    e.preventDefault();
    if (!sessionUser) {
      alert("Veuillez vous connecter pour commenter.");
      return;
    }
    const text = parentId ? replyText : commentText;
    if (!text.trim()) return;

    setSubmittingComment(true);
    try {
      const added = await apiFetch("/api/projects?action=comment", {
        method: "POST",
        body: JSON.stringify({
          projectId: project.id,
          content: text,
          parentId
        })
      });

      setProject(prev => ({
        ...prev,
        comments: [...(prev.comments || []), added]
      }));

      if (parentId) {
        setReplyText("");
        setReplyToId(null);
      } else {
        setCommentText("");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCreateRelease = async (e) => {
    e.preventDefault();
    if (!releaseVersion.trim()) return;
    setReleasing(true);
    try {
      const newVersion = await apiFetch("/api/projects?action=release", {
        method: "POST",
        body: JSON.stringify({
          projectId: project.id,
          versionName: releaseVersion,
          changelog: releaseChangelog
        })
      });

      setProject(prev => ({
        ...prev,
        versions: [newVersion, ...(prev.versions || [])]
      }));

      setReleaseVersion("");
      setReleaseChangelog("");
      setShowReleaseModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setReleasing(false);
    }
  };

  const handleRespondCollab = async (collabUserId, status) => {
    try {
      await apiFetch("/api/projects?action=respond_collaborator", {
        method: "POST",
        body: JSON.stringify({
          projectId: project.id,
          collaboratorUserId: collabUserId,
          status
        })
      });
      fetchProjectData();
    } catch (err) {
      alert(err.message);
    }
  };

  const rootComments = (project.comments || []).filter(c => !c.parent_id);
  const getReplies = (id) => (project.comments || []).filter(c => c.parent_id === id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/projets"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={14} />
            <span>Retour aux projets</span>
          </Link>

          {isOwner && (
            <Link
              to={`/projets/edit/${project.id}`}
              className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-lg text-slate-700 transition"
            >
              Éditer le projet
            </Link>
          )}
        </div>

        {/* Cover Canvas Area */}
        <div className="relative h-64 md:h-80 w-full rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 flex items-end">
          {project.cover_url ? (
            <img
              src={project.cover_url}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover opacity-85"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
          )}

          {/* Scrim overlay for title readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

          {/* Identity Block */}
          <div className="relative z-10 w-full p-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-md shrink-0">
                {project.logo_url ? (
                  <img src={project.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Layers size={32} className="text-slate-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white">{project.title}</h1>
                <p className="text-xs md:text-sm text-slate-200 mt-1 line-clamp-1">{project.slogan}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-white/20 text-white rounded">
                    {project.category}
                  </span>
                  {project.tags?.map(t => (
                    <span key={t} className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] bg-white/10 text-slate-100 rounded">
                      <Tag size={8} />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions (Like, Favorite) */}
            <div className="flex gap-2.5">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-semibold transition ${
                  project.user_liked
                    ? "bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20"
                    : "bg-white/20 border-white/20 text-white hover:bg-white/30"
                }`}
              >
                <ThumbsUp size={13} className={project.user_liked ? "fill-current" : ""} />
                <span>{project.likes_count || 0}</span>
              </button>
              <button
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-semibold transition ${
                  project.user_bookmarked
                    ? "bg-amber-600/10 border-amber-500/30 text-amber-400 hover:bg-amber-600/20"
                    : "bg-white/20 border-white/20 text-white hover:bg-white/30"
                }`}
              >
                <Bookmark size={13} className={project.user_bookmarked ? "fill-current" : ""} />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Columns Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT/CENTER: Dynamic Workspace Tabs & Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Light Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab("readme")}
                className={`flex items-center gap-1.5 pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === "readme"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText size={14} />
                <span>README.md</span>
              </button>
              <button
                onClick={() => setActiveTab("releases")}
                className={`flex items-center gap-1.5 pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === "releases"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <GitBranch size={14} />
                <span>Releases ({project.versions?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`flex items-center gap-1.5 pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === "activity"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Clock size={14} />
                <span>Timeline d'activité</span>
              </button>
            </div>

            {/* Tab content wrapper */}
            <div>
              {/* README View */}
              {activeTab === "readme" && (
                <div className="border border-slate-200 rounded-3xl bg-white p-6 shadow-xs overflow-hidden select-text">
                  {project.readme_markdown ? (
                    <article
                      className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-sans"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(project.readme_markdown) }}
                    />
                  ) : (
                    <div className="text-center py-10 text-slate-400 space-y-2">
                      <FileText className="mx-auto text-slate-300" size={32} />
                      <p className="text-sm italic">Aucun fichier README.md disponible.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Releases/Version list */}
              {activeTab === "releases" && (
                <div className="space-y-4">
                  {(isOwner || isAcceptedCollaborator) && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowReleaseModal(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                      >
                        <Plus size={14} />
                        <span>Nouvelle Release</span>
                      </button>
                    </div>
                  )}

                  {project.versions?.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl bg-white shadow-xs text-slate-400">
                      <GitBranch className="mx-auto mb-2 text-slate-300" size={32} />
                      <p className="text-sm italic">Aucune version de production publiée pour le moment.</p>
                    </div>
                  ) : (
                    <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6 py-2">
                      {project.versions.map((ver) => (
                        <div key={ver.id} className="relative group">
                          {/* Dot marker */}
                          <div className="absolute -left-[30px] top-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-blue-600 group-hover:scale-110 transition-transform shadow-xs" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {ver.version_name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {new Date(ver.created_at).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            <p className="text-xs text-slate-650 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200/60 whitespace-pre-wrap">
                              {ver.changelog || "Aucun détail de modification fourni."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity Timeline logs */}
              {activeTab === "activity" && (
                <div className="space-y-4">
                  {project.activity?.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <Clock className="mx-auto mb-1 text-slate-350" size={32} />
                      <p className="text-sm italic">Aucun journal d'activité disponible.</p>
                    </div>
                  ) : (
                    <div className="relative border-l border-slate-200 ml-4 pl-5 space-y-6">
                      {project.activity.map((act) => (
                        <div key={act.id} className="relative">
                          <div className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-300" />
                          <div className="text-xs">
                            <span className="font-bold text-slate-700">
                              {act.profile?.full_name || "Système"}
                            </span>
                            <span className="text-slate-500 mx-1">
                              ({act.activity_type}) :
                            </span>
                            <span className="text-slate-600">{act.description}</span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(act.created_at).toLocaleString("fr-FR")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comment Section thread view */}
            <div className="border border-slate-200 rounded-3xl bg-white p-6 space-y-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare size={16} />
                <span>Discussion ({project.comments?.length || 0})</span>
              </h3>

              {/* Comment trigger form */}
              {sessionUser ? (
                <form onSubmit={(e) => handleAddComment(e)} className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0 text-blue-600 border border-slate-200">
                    {sessionUser.user_metadata?.full_name?.charAt(0).toUpperCase() || "M"}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <textarea
                      placeholder="Ajouter une question ou un feedback constructif..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingComment}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                      >
                        {submittingComment ? "Envoi..." : "Commenter"}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  Veuillez vous connecter pour participer à la discussion.
                </div>
              )}

              {/* Thread list */}
              <div className="space-y-4 divide-y divide-slate-100">
                {rootComments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    Aucun commentaire pour le moment. Lancez la discussion !
                  </p>
                ) : (
                  rootComments.map((comment) => {
                    const replies = getReplies(comment.id);

                    return (
                      <div key={comment.id} className="pt-4 space-y-3">
                        {/* Parent Comment */}
                        <div className="flex gap-3 items-start">
                          <div className="h-7 w-7 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-[10px] text-blue-600 shrink-0 border border-slate-200">
                            {comment.profile?.avatar_url ? (
                              <img src={comment.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (comment.profile?.full_name || "E").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">
                                {comment.profile?.full_name || "Étudiant"}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400">
                                {new Date(comment.created_at).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 select-text">{comment.content}</p>
                            
                            {/* Reply button */}
                            {sessionUser && (
                              <button
                                onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                                className="text-[10px] font-bold text-slate-400 hover:text-slate-750 transition-colors"
                              >
                                Répondre
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Nest Reply input form */}
                        {replyToId === comment.id && (
                          <form
                            onSubmit={(e) => handleAddComment(e, comment.id)}
                            className="flex gap-2 items-start ml-8 pl-2 border-l border-slate-200"
                          >
                            <textarea
                              placeholder="Écrire votre réponse..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={1}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                            />
                            <button
                              type="submit"
                              disabled={submittingComment}
                              className="px-2.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                            >
                              Répondre
                            </button>
                          </form>
                        )}

                        {/* Nest replies mapping */}
                        {replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3 items-start ml-8 pl-3 border-l-2 border-slate-100">
                            <CornerDownRight size={14} className="text-slate-350 mt-1 shrink-0" />
                            <div className="h-6 w-6 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-[9px] text-orange-600 shrink-0 border border-slate-200">
                              {reply.profile?.avatar_url ? (
                                <img src={reply.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                (reply.profile?.full_name || "E").charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-slate-800">
                                  {reply.profile?.full_name || "Étudiant"}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400">
                                  {new Date(reply.created_at).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 select-text">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar Statistics & Project Crew info */}
          <div className="space-y-6">
            
            {/* Project Details Panel */}
            <div className="border border-slate-200 rounded-3xl bg-white p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                À propos de la release
              </h3>
              
              <div className="space-y-3 divide-y divide-slate-100">
                <div className="flex items-center justify-between text-xs py-1.5">
                  <span className="text-slate-400 font-semibold">Statut :</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    project.status === "public" ? "bg-green-50 text-green-600 border border-green-100" : "bg-yellow-50 text-yellow-600 border border-yellow-100"
                  }`}>
                    {project.status === "public" ? "Production" : "Brouillon"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 pt-3">
                  <span className="text-slate-400 font-semibold">Date de création :</span>
                  <span className="text-slate-700 font-bold">
                    {new Date(project.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 pt-3">
                  <span className="text-slate-400 font-semibold">Nombre de visites :</span>
                  <span className="text-slate-700 font-bold">{project.views_count || 0}</span>
                </div>
              </div>

              {/* Action buttons (Github, URL Demo) */}
              <div className="flex flex-col gap-2 pt-2">
                {project.github_link && (
                  <a
                    href={project.github_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold rounded-xl text-slate-700 transition"
                  >
                    <Github size={14} />
                    <span>Code Source</span>
                  </a>
                )}
                {project.website_link && (
                  <a
                    href={project.website_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl text-white transition shadow-xs"
                  >
                    <Globe size={14} />
                    <span>Démo en ligne</span>
                  </a>
                )}
              </div>
            </div>

            {/* Project Crew & Invitation Panel */}
            <div className="border border-slate-200 rounded-3xl bg-white p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} />
                <span>Membres de l'équipe</span>
              </h3>

              <div className="space-y-3">
                {/* Creator owner */}
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-blue-600 shrink-0 border border-slate-200">
                    {(project.author_profile?.full_name || "O").charAt(0).toUpperCase()}
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-bold text-slate-800">
                      {project.author_profile?.full_name}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold">Créateur du projet</span>
                  </div>
                </div>

                {/* Other collaborators */}
                {project.collaborators?.filter(c => c.status === "accepted").map(col => (
                  <div key={col.id} className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-blue-500 shrink-0 border border-slate-200">
                      {(col.profile?.full_name || "C").charAt(0).toUpperCase()}
                    </div>
                    <div className="leading-tight">
                      <div className="text-xs font-bold text-slate-700">
                        {col.profile?.full_name}
                      </div>
                      <span className="text-[9px] text-slate-400 capitalize">{col.role}</span>
                    </div>
                  </div>
                ))}

                {/* Join team invitation trigger */}
                {sessionUser && !isOwner && !isAcceptedCollaborator && !isPendingCollaborator && (
                  <button
                    onClick={handleJoinTeam}
                    disabled={collabLoading}
                    className="w-full flex items-center justify-center gap-1.5 mt-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-150 text-blue-600 text-xs font-bold rounded-lg transition"
                  >
                    <Plus size={13} />
                    <span>Demander à collaborer</span>
                  </button>
                )}

                {isPendingCollaborator && (
                  <div className="text-center p-2 mt-3 bg-slate-55 border border-slate-200 text-[10px] text-slate-500 rounded-lg italic">
                    Demande de participation en attente...
                  </div>
                )}
              </div>

              {/* Manage collaboration applications (Owner only) */}
              {isOwner && project.collaborators?.some(c => c.status === "pending") && (
                <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Candidatures en attente
                  </h4>
                  <div className="space-y-2">
                    {project.collaborators.filter(c => c.status === "pending").map((c) => (
                      <div key={c.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="text-[10px] leading-tight">
                          <span className="font-bold text-slate-800">{c.profile?.full_name || "Étudiant"}</span>
                          <span className="text-slate-500 block">Rôle : {c.role}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleRespondCollab(c.user_id, "accepted")}
                            className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white rounded text-[9px] font-bold"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => handleRespondCollab(c.user_id, "declined")}
                            className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold"
                          >
                            Refuser
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal: New Release creation form */}
        <AnimatePresence>
          {showReleaseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl flex flex-col"
              >
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800">Créer une Release</h3>
                  <button
                    onClick={() => setShowReleaseModal(false)}
                    className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                  >
                    Fermer
                  </button>
                </div>
                
                <form onSubmit={handleCreateRelease} className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Nom de version</label>
                    <input
                      type="text"
                      placeholder="Ex: v1.0.0, v2.1-beta"
                      value={releaseVersion}
                      onChange={(e) => setReleaseVersion(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Changelog (Détail des modifications)</label>
                    <textarea
                      placeholder="Décrivez les fonctionnalités ajoutées, les correctifs de bugs..."
                      value={releaseChangelog}
                      onChange={(e) => setReleaseChangelog(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowReleaseModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-700"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={releasing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      {releasing ? "Publication..." : "Publier"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

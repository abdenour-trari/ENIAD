import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Eye, ThumbsUp, Trash2, Edit, AlertCircle, FolderGit2, CheckCircle2, Circle, Compass, Sparkles } from "lucide-react";
import { apiFetch } from "../lib/api";
import { supabase } from "../lib/supabaseClient";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);
  const navigate = useNavigate();

  const loadMyProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/connexion");
        return;
      }
      setSessionUser(session.user);

      const data = await apiFetch("/api/projects?my_projects=true");
      setProjects(data || []);
    } catch (err) {
      console.error("Failed to load personal projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyProjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce projet définitivement ? Cette action est irréversible.")) {
      return;
    }

    try {
      await apiFetch(`/api/projects?id=${id}`, {
        method: "DELETE"
      });
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message || "Erreur de suppression");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Light Header Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative border border-slate-200 rounded-3xl bg-white p-6 md:p-8 shadow-xs overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FolderGit2 className="text-blue-600" />
                <span>Mon Espace Projets</span>
              </h1>
              <p className="text-xs text-slate-500 font-semibold">
                Gérez vos portfolios, modifiez vos documentations README et suivez l'activité de vos équipes.
              </p>
              
              {projects.length > 0 && (
                <div className="flex items-center gap-4 pt-2 text-xs text-slate-400 font-bold">
                  <span>Total : {projects.length} projet(s)</span>
                  <span>•</span>
                  <span>Publics : {projects.filter(p => p.status === "public").length}</span>
                  <span>•</span>
                  <span>Brouillons : {projects.filter(p => p.status !== "public").length}</span>
                </div>
              )}
            </div>
            
            <Link
              to="/projets/create"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Plus size={16} />
              <span>Nouveau Projet</span>
            </Link>
          </div>
        </motion.div>

        {/* Project Lists or Empty State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-4 border-t-blue-650 border-slate-200 rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          /* Premium Animated Empty State Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-16 px-6 border border-slate-200 rounded-3xl bg-white shadow-xs max-w-xl mx-auto space-y-6"
          >
            {/* Animated SVG illustration */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center bg-blue-50/50 rounded-full">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="text-blue-600"
              >
                <FolderGit2 size={56} />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute -top-1 -right-1 text-amber-500 bg-amber-50 p-1.5 rounded-full border border-amber-100 shadow-xs"
              >
                <Sparkles size={16} />
              </motion.div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800">Votre portfolio est encore vide</h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed">
                Publiez vos projets et valorisez votre travail auprès de la communauté et des recruteurs de l'AEI.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                to="/projets/create"
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Plus size={14} />
                <span>Créer un projet</span>
              </Link>
              <Link
                to="/projets"
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-50 border border-slate-250 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                <Compass size={14} />
                <span>Explorer les projets</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="group border border-slate-200 bg-white rounded-3xl p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-lg transition-all duration-300 shadow-xs hover:-translate-y-0.5"
              >
                <div className="space-y-4">
                  {/* Top line Info */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {project.category}
                      </span>
                      <Link
                        to={`/projets/${project.slug}`}
                        className="text-base font-black text-slate-800 hover:text-blue-600 transition"
                      >
                        {project.title}
                      </Link>
                    </div>

                    {/* Visibility status */}
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded flex items-center gap-1 border ${
                      project.status === "public"
                        ? "bg-green-50 border-green-150 text-green-600"
                        : "bg-amber-50 border-amber-150 text-amber-600"
                    }`}>
                      {project.status === "public" ? (
                        <>
                          <CheckCircle2 size={10} />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <Circle size={10} className="fill-amber-500/20" />
                          <span>Brouillon</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Slogan */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {project.slogan || project.short_description || "Aucune description renseignée."}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags?.slice(0, 4).map(t => (
                      <span key={t} className="px-2 py-0.5 bg-slate-50 border border-slate-200/60 rounded-md text-[9px] font-bold text-slate-500">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dashboard Card footer action controls */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
                  {/* Social Counters */}
                  <div className="flex items-center gap-3.5 text-slate-400">
                    <div className="flex items-center gap-1 text-[11px] font-semibold" title="J'aimes">
                      <ThumbsUp size={11} className={project.user_liked ? "text-blue-600 fill-current" : ""} />
                      <span>{project.likes_count || 0}</span>
                    </div>
                  </div>

                  {/* Quick Edit/Delete controls */}
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/projets/edit/${project.id}`}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit size={14} />
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <Link
                      to={`/projets/${project.slug}`}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition ml-1"
                    >
                      <span>Voir</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

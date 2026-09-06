import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, ThumbsUp, MessageSquare, Tag, Terminal, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch } from "../../lib/api";

const CATEGORIES = ["Tous", "IA", "Web", "Mobile", "IoT", "Jeux Video", "Autre"];
const SORTS = [
  { value: "newest", label: "Plus récents" },
  { value: "popular", label: "Plus populaires" }
];

export default function DiscoverProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTag, setSelectedTag] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = `/api/projects?sort=${sortBy}`;
      if (category !== "Tous") {
        url += `&category=${encodeURIComponent(category)}`;
      }
      if (search) {
        url += `&q=${encodeURIComponent(search)}`;
      }
      if (selectedTag) {
        url += `&tag=${encodeURIComponent(selectedTag)}`;
      }
      const data = await apiFetch(url);
      setProjects(data || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [category, sortBy, selectedTag]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      {/* Light Premium Header */}
      <div className="relative mb-12 text-center max-w-3xl mx-auto">
        <div className="absolute inset-0 -top-12 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-orange-500/5 blur-3xl opacity-50 rounded-full pointer-events-none"></div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full uppercase tracking-wider">
            Vitrine des Talents
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-slate-900">
            Découvrez les Projets Étudiants
          </h1>
          <p className="mt-3 text-base text-slate-500 leading-relaxed">
            Un GitHub universitaire pour explorer, collaborer et propulser vos applications. Inspirez-vous des meilleures réalisations de l'AEI.
          </p>
        </motion.div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/projets/create"
            className="group flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
            <span>Publier un Projet</span>
          </Link>
        </div>
      </div>

      {/* Control Panel: Search & Filter Tabs */}
      <div className="max-w-6xl mx-auto mb-10 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Rechercher un projet, slogan, stack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setTimeout(() => fetchProjects(), 0); }}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-800"
              >
                Effacer
              </button>
            )}
          </form>

          {/* Sort Selector & Selected Tag Reset */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {selectedTag && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-600 font-semibold">
                <Tag size={12} />
                <span>Tag: {selectedTag}</span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="font-bold hover:text-slate-800 ml-1 text-slate-500"
                >
                  ×
                </button>
              </div>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:border-slate-350 transition font-semibold"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setSelectedTag(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all duration-200 whitespace-nowrap ${
                category === cat
                  ? "bg-white border-slate-300 text-blue-600 shadow-xs"
                  : "bg-transparent border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 border border-slate-100 rounded-3xl bg-white animate-pulse overflow-hidden flex flex-col">
                <div className="h-44 bg-slate-100" />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-6 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 bg-slate-100 rounded-full" />
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-200 rounded-3xl bg-white/50 shadow-xs">
            <Layers className="mx-auto text-slate-350 mb-4" size={44} />
            <h3 className="text-lg font-bold text-slate-700">Aucun projet trouvé</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              Nous n'avons trouvé aucun projet correspondant à vos filtres. Soyez le premier à en publier un !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group border border-slate-200/80 bg-white rounded-3xl hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col shadow-xs hover:-translate-y-1"
              >
                {/* Project Cover / Header image */}
                <Link to={`/projets/${project.slug}`} className="block relative h-44 overflow-hidden bg-slate-100">
                  {project.cover_url ? (
                    <img
                      src={project.cover_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-550"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <Terminal size={40} className="text-slate-300" />
                    </div>
                  )}

                  {/* Category Badge */}
                  <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-white/90 text-slate-700 rounded border border-slate-100 shadow-xs">
                    {project.category}
                  </span>
                </Link>

                {/* Details Container */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {project.tags && project.tags.slice(0, 3).map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTag(t)}
                          className="flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/60 rounded-md transition-colors"
                        >
                          <Tag size={8} />
                          <span>{t}</span>
                        </button>
                      ))}
                      {project.tags && project.tags.length > 3 && (
                        <span className="text-[9px] font-bold text-slate-400 self-center">
                          +{project.tags.length - 3} de plus
                        </span>
                      )}
                    </div>

                    {/* Title & Slogan */}
                    <div>
                      <Link
                        to={`/projets/${project.slug}`}
                        className="text-lg font-bold text-slate-850 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {project.title}
                      </Link>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {project.slogan || project.short_description || "Pas de slogan ou description courte."}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Profile + Stats */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-5">
                    {/* Author profile */}
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                        {project.author_profile?.avatar_url ? (
                          <img
                            src={project.author_profile.avatar_url}
                            alt={project.author_profile.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-[10px] font-black text-blue-600">
                            {(project.author_profile?.full_name || "E").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        {project.author_profile?.full_name || "Étudiant"}
                      </span>
                    </div>

                    {/* Social Counters */}
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="flex items-center gap-1 text-[11px] font-semibold" title="J'aimes">
                        <ThumbsUp size={12} className={project.user_liked ? "text-blue-600 fill-current" : ""} />
                        <span>{project.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold" title="Commentaires">
                        <MessageSquare size={12} />
                        <span>{project.comments_count || 0}</span>
                      </div>
                    </div>
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

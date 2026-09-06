// src/pages/favorite.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Download,
  Heart,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  Building2,
  ShoppingBag,
  Info,
  Calendar,
  MapPin,
  Tag,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useFavorites } from "../hooks/useFavorites";
import { ColocationCard } from "./colocation";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductPreview } from "@/components/marketplace/ProductPreview";
import { DEFAULT_CLUBS } from "./clubs";
import { useToast } from "../components/ui/toast";

// Helper function to calculate relative day string
const calculateDays = (dateStr) => {
  if (!dateStr) return "Il y a 2 j.";
  const diffTime = Math.abs(Date.now() - new Date(dateStr).getTime());
  const days = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  return `Il y a ${days} j.`;
};

export default function FavoritePage() {
  const { toast } = useToast();
  const {
    courseFavorites,
    toggleCourseFavorite,
    isCourseFavorite,

    housingFavorites,
    toggleHousingFavorite,
    isHousingFavorite,

    marketplaceFavorites,
    toggleMarketplaceFavorite,
    isMarketplaceFavorite,

    loading
  } = useFavorites();

  const [activeTab, setActiveTab] = useState("all"); // all, courses, housing, marketplace, clubs
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Local storage favorites for clubs
  const [favoriteClubIds, setFavoriteClubIds] = useState(() => {
    const saved = localStorage.getItem("favorite_clubs");
    return saved ? JSON.parse(saved) : [];
  });

  // Keep club favorites synchronized if local storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("favorite_clubs");
      if (saved) {
        setFavoriteClubIds(JSON.parse(saved));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleRemoveClubFavorite = (clubId, clubName) => {
    const updated = favoriteClubIds.filter((id) => id !== clubId);
    setFavoriteClubIds(updated);
    localStorage.setItem("favorite_clubs", JSON.stringify(updated));
    toast("Retiré", `"${clubName}" a été retiré de vos favoris.`, "info");
    // Dispatch storage event to keep other pages in sync
    window.dispatchEvent(new Event("storage"));
  };

  // Filter States
  const [courseCat, setCourseCat] = useState("Tous");
  const [courseNiveau, setCourseNiveau] = useState("Tous");
  const [colocCity, setColocCity] = useState("Tous");
  const [productCat, setProductCat] = useState("Tous");
  const [productCity, setProductCity] = useState("Tous");

  // Grid page state
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Categories & Niveaux
  const courseCategories = ["Tous", "Math", "Statistiques", "IA", "Informatique", "Physique", "Langues"];
  const courseNiveaux = ["Tous", "CP1", "CP2", "CI"];
  const productCategories = ["Tous", "Informatique", "Téléphone", "Accessoires", "Mobilier", "Livres", "Vêtements", "Autres"];
  const cities = ["Tous", "Berkane", "Oujda", "Saidia", "Nador"];

  // 1. Mapped and Sanitized favorites list
  const mappedCourses = useMemo(() => {
    return courseFavorites.map((fav) => {
      const c = fav.course || {};
      return {
        id: fav.id,
        courseId: fav.course_id || fav.courseId,
        titre: c.title || fav.courseTitle || "Cours",
        niveau: c.niveau || "N/A",
        categorie: c.category || fav.categorie || "N/A",
        pdf: c.pdf_url || fav.pdf || "#",
      };
    });
  }, [courseFavorites]);

  const mappedHousing = useMemo(() => {
    return housingFavorites.map((fav) => {
      const post = fav.post || {};
      return {
        ...post,
        id: post.id,
        title: post.title,
        nom: post.title,
        description: post.description,
        desc: post.description,
        price: post.price,
        prix: post.price,
        location: post.location,
        ville: post.location,
        cover_url: post.cover_url,
        cover: post.cover_url,
      };
    });
  }, [housingFavorites]);

  const mappedMarketplace = useMemo(() => {
    return marketplaceFavorites.map((fav) => {
      const post = fav.post || {};
      return {
        ...post,
        id: post.id,
        title: post.title,
        titre: post.title,
        description: post.description,
        desc: post.description,
        price: post.price,
        prix: post.price,
        category: post.category,
        categorie: post.category,
        condition: post.condition,
        ville: post.city || "Berkane",
        image_url: post.image_url,
        img: post.image_url,
        date: post.created_at ? calculateDays(post.created_at) : "Il y a 2 j."
      };
    });
  }, [marketplaceFavorites]);

  const mappedClubs = useMemo(() => {
    return DEFAULT_CLUBS.filter((club) => favoriteClubIds.includes(club.id));
  }, [favoriteClubIds]);

  // 2. Filtered list per active tab
  const filteredCourses = useMemo(() => {
    return mappedCourses.filter((c) => {
      const matchSearch = (c.titre || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = courseCat === "Tous" || c.categorie === courseCat;
      const matchNiv = courseNiveau === "Tous" || c.niveau === courseNiveau;
      return matchSearch && matchCat && matchNiv;
    });
  }, [mappedCourses, search, courseCat, courseNiveau]);

  const filteredHousing = useMemo(() => {
    return mappedHousing.filter((h) => {
      const matchSearch = (h.title || "").toLowerCase().includes(search.toLowerCase());
      const matchCity = colocCity === "Tous" || h.ville === colocCity;
      return matchSearch && matchCity;
    });
  }, [mappedHousing, search, colocCity]);

  const filteredMarketplace = useMemo(() => {
    return mappedMarketplace.filter((p) => {
      const matchSearch = (p.title || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = productCat === "Tous" || p.categorie === productCat;
      const matchCity = productCity === "Tous" || p.ville === productCity;
      return matchSearch && matchCat && matchCity;
    });
  }, [mappedMarketplace, search, productCat, productCity]);

  const filteredClubs = useMemo(() => {
    return mappedClubs.filter((c) => {
      return c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
    });
  }, [mappedClubs, search]);

  // Pagination bounds based on active tab
  const activeList = useMemo(() => {
    if (activeTab === "courses") return filteredCourses;
    if (activeTab === "housing") return filteredHousing;
    if (activeTab === "marketplace") return filteredMarketplace;
    if (activeTab === "clubs") return filteredClubs;
    return [];
  }, [activeTab, filteredCourses, filteredHousing, filteredMarketplace, filteredClubs]);

  const totalPages = Math.ceil(activeList.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    return activeList.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [activeList, page]);

  const resetAllFilters = () => {
    setSearch("");
    setCourseCat("Tous");
    setCourseNiveau("Tous");
    setColocCity("Tous");
    setProductCat("Tous");
    setProductCity("Tous");
    setPage(1);
  };

  return (
    <div className="space-y-8 lg:p-6 md:p-4 p-2 relative">
      {/* Header Banner */}
      <header className="bg-linear-to-r from-sky-600 to-orange-500 text-white p-8 rounded-3xl shadow-lg mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Mes Favoris</h1>
        <p className="text-white/90 mt-2 text-sm sm:text-base font-semibold">
          Retrouvez tous vos supports de cours, colocations, produits et clubs favoris synchronisés en temps réel.
        </p>
      </header>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2.5 border-b border-slate-200/60 pb-4">
        <button
          onClick={() => { setActiveTab("all"); resetAllFilters(); }}
          className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === "all"
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
              : "bg-white text-slate-650 hover:bg-slate-50 border border-slate-100"
          }`}
        >
          <span>🌟 Tous</span>
          <span className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-bold">
            {mappedCourses.length + mappedHousing.length + mappedMarketplace.length + mappedClubs.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("courses"); resetAllFilters(); }}
          className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === "courses"
              ? "bg-sky-650 text-white shadow-md shadow-sky-600/15"
              : "bg-white text-slate-655 hover:bg-slate-50 border border-slate-100"
          }`}
        >
          <span>📚 Cours</span>
          <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-bold">
            {mappedCourses.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("housing"); resetAllFilters(); }}
          className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === "housing"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/15"
              : "bg-white text-slate-655 hover:bg-slate-50 border border-slate-100"
          }`}
        >
          <span>🏠 Colocations</span>
          <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-bold">
            {mappedHousing.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("marketplace"); resetAllFilters(); }}
          className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === "marketplace"
              ? "bg-pink-650 text-white shadow-md shadow-pink-500/15"
              : "bg-white text-slate-655 hover:bg-slate-50 border border-slate-100"
          }`}
        >
          <span>🛍️ Produits</span>
          <span className="text-[10px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full font-bold">
            {mappedMarketplace.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("clubs"); resetAllFilters(); }}
          className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === "clubs"
              ? "bg-teal-600 text-white shadow-md shadow-teal-600/15"
              : "bg-white text-slate-655 hover:bg-slate-50 border border-slate-100"
          }`}
        >
          <span>👥 Clubs</span>
          <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">
            {mappedClubs.length}
          </span>
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      {activeTab !== "all" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-xs border border-slate-100"
        >
          <div className="relative w-full lg:max-w-md">
            <input
              type="text"
              placeholder={`Rechercher dans mes favoris...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-xs md:text-sm focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 focus:outline-none"
            />
            <Search size={16} className="absolute top-3.5 left-3.5 text-slate-400" />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Courses Filters */}
            {activeTab === "courses" && (
              <>
                <select
                  value={courseCat}
                  onChange={(e) => { setCourseCat(e.target.value); setPage(1); }}
                  className="rounded-xl p-2.5 bg-white text-gray-700 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/10"
                >
                  <option value="Tous">Toutes Catégories</option>
                  {courseCategories.filter(c => c !== "Tous").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={courseNiveau}
                  onChange={(e) => { setCourseNiveau(e.target.value); setPage(1); }}
                  className="rounded-xl p-2.5 bg-white text-gray-700 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/10"
                >
                  <option value="Tous">Tous Niveaux</option>
                  {courseNiveaux.filter(n => n !== "Tous").map(niv => (
                    <option key={niv} value={niv}>{niv}</option>
                  ))}
                </select>
              </>
            )}

            {/* Housing Filters */}
            {activeTab === "housing" && (
              <select
                value={colocCity}
                onChange={(e) => { setColocCity(e.target.value); setPage(1); }}
                className="rounded-xl p-2.5 bg-white text-gray-700 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/10 w-full sm:w-auto"
              >
                <option value="Tous">Toutes les Villes</option>
                {cities.filter(c => c !== "Tous").map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            )}

            {/* Marketplace Filters */}
            {activeTab === "marketplace" && (
              <>
                <select
                  value={productCat}
                  onChange={(e) => { setProductCat(e.target.value); setPage(1); }}
                  className="rounded-xl p-2.5 bg-white text-gray-700 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/10"
                >
                  <option value="Tous">Toutes Catégories</option>
                  {productCategories.filter(c => c !== "Tous").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={productCity}
                  onChange={(e) => { setProductCity(e.target.value); setPage(1); }}
                  className="rounded-xl p-2.5 bg-white text-gray-700 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/10"
                >
                  <option value="Tous">Toutes les Villes</option>
                  {cities.filter(c => c !== "Tous").map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </>
            )}

            <button
              onClick={resetAllFilters}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition text-xs font-bold text-slate-500 cursor-pointer ml-auto sm:ml-0"
            >
              Réinitialiser
            </button>
          </div>
        </motion.div>
      )}

      {/* MAIN LAYOUT RENDERING */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-sky-600" size={48} />
        </div>
      ) : (
        <div>
          {/* TAB: TOUS (Combined Overview Dashboard) */}
          {activeTab === "all" && (
            <div className="space-y-12">
              {/* Courses Section */}
              {mappedCourses.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      📚 Supports de Cours ({mappedCourses.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab("courses")}
                      className="text-xs text-sky-600 hover:underline font-bold"
                    >
                      Voir tout
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mappedCourses.slice(0, 3).map((cours) => (
                      <div
                        key={cours.id}
                        className="relative bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between h-full group"
                      >
                        <div>
                          <button
                            onClick={() => toggleCourseFavorite(cours.courseId, cours.titre)}
                            className="absolute top-4 right-4 cursor-pointer z-10 p-1.5 bg-slate-50 hover:bg-red-50 rounded-full transition"
                          >
                            <Heart size={16} className="text-red-500 fill-red-500" />
                          </button>
                          <h4 className="text-lg font-bold text-slate-800 mb-2 mt-2 leading-tight group-hover:text-sky-600 transition">
                            {cours.titre}
                          </h4>
                          <div className="flex gap-2 mb-4">
                            <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {cours.niveau}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {cours.categorie}
                            </span>
                          </div>
                        </div>
                        <a
                          href={cours.pdf}
                          download
                          className="flex items-center justify-center gap-2 bg-linear-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-xl shadow-xs font-semibold text-xs mt-2 hover:opacity-95 transition cursor-pointer"
                        >
                          <Download size={14} /> Télécharger
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Housing Section */}
              {mappedHousing.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      🏠 Offres de Colocation ({mappedHousing.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab("housing")}
                      className="text-xs text-orange-600 hover:underline font-bold"
                    >
                      Voir tout
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mappedHousing.slice(0, 3).map((coloc, idx) => (
                      <ColocationCard
                        key={coloc.id || idx}
                        annonce={coloc}
                        index={idx}
                        priority={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Marketplace Section */}
              {mappedMarketplace.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      🛍️ Produits Marketplace ({mappedMarketplace.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab("marketplace")}
                      className="text-xs text-pink-600 hover:underline font-bold"
                    >
                      Voir tout
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mappedMarketplace.slice(0, 3).map((prod, idx) => (
                      <ProductCard
                        key={prod.id || idx}
                        product={prod}
                        index={idx}
                        priority={false}
                        isFavorite={true}
                        onToggleFavorite={() => toggleMarketplaceFavorite(prod.id, prod.titre)}
                        onSeeDetails={(p) => setSelectedProduct(p)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Clubs Section */}
              {mappedClubs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      👥 Clubs Étudiants ({mappedClubs.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab("clubs")}
                      className="text-xs text-teal-600 hover:underline font-bold"
                    >
                      Voir tout
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mappedClubs.slice(0, 3).map((club) => (
                      <div
                        key={club.id}
                        className="relative bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between h-[250px] group"
                      >
                        <div>
                          <button
                            onClick={() => handleRemoveClubFavorite(club.id, club.name)}
                            className="absolute top-4 right-4 cursor-pointer z-10 p-1.5 bg-slate-50 hover:bg-red-50 rounded-full transition"
                          >
                            <Heart size={15} className="text-red-500 fill-red-500" />
                          </button>
                          <div className="flex items-center gap-3 mt-2 mb-3">
                            <span className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shadow-xs shrink-0">
                              {club.logo}
                            </span>
                            <div className="overflow-hidden">
                              <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{club.category}</span>
                              <h4 className="font-extrabold text-sm text-slate-800 truncate mt-0.5">{club.name}</h4>
                            </div>
                          </div>
                          <p className="text-slate-400 text-[10px] font-semibold italic mb-1">"{club.slogan}"</p>
                          <p className="text-slate-500 text-xs line-clamp-2">{club.description}</p>
                        </div>
                        <Link
                          to="/clubs"
                          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 text-white py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Visiter la page Clubs
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Empty State for 'all' */}
              {mappedCourses.length === 0 && mappedHousing.length === 0 && mappedMarketplace.length === 0 && mappedClubs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center text-3xl shadow-inner animate-pulse">
                    💝
                  </div>
                  <h3 className="text-lg font-black text-slate-800">Aucun favori enregistré</h3>
                  <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                    Vous n'avez pas encore ajouté de favoris. Parcourez notre portail pour trouver des ressources !
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Link to="/cours" className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition">
                      Cours
                    </Link>
                    <Link to="/colocation" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition">
                      Colocations
                    </Link>
                    <Link to="/marketplace" className="bg-pink-600 hover:bg-pink-750 text-white font-bold text-xs px-5 py-3 rounded-xl transition">
                      Marketplace
                    </Link>
                    <Link to="/clubs" className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition">
                      Clubs
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: COURS */}
          {activeTab === "courses" && (
            <div className="space-y-8">
              {paginatedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-3xl border border-slate-100 shadow-xs">
                  <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center text-xl">
                    📚
                  </div>
                  <h3 className="text-md font-black text-slate-800">Aucun cours trouvé</h3>
                  <p className="text-xs text-slate-450 max-w-xs">
                    {search || courseCat !== "Tous" || courseNiveau !== "Tous"
                      ? "Ajustez vos filtres pour trouver ce que vous cherchez."
                      : "Vous n'avez aucun cours en favori. Cliquez sur l'icône cœur sur la page des cours."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedList.map((cours, idx) => (
                    <motion.div
                      key={cours.id || idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="relative bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between h-full group"
                    >
                      <div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleCourseFavorite(cours.courseId, cours.titre)}
                          className="absolute top-4 right-4 cursor-pointer z-10 p-1.5 bg-slate-50 hover:bg-red-50 rounded-full transition"
                        >
                          <Heart size={16} className="text-red-500 fill-red-500" />
                        </motion.button>

                        <h2 className="text-xl font-bold text-slate-800 mb-2 mt-4 leading-tight group-hover:text-sky-600 transition-colors">
                          {cours.titre}
                        </h2>

                        <div className="flex gap-2 mb-4">
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {cours.niveau}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {cours.categorie}
                          </span>
                        </div>
                      </div>

                      <motion.a
                        href={cours.pdf}
                        download
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 bg-linear-to-r from-sky-500 to-blue-600 text-white px-4 py-2.5 rounded-xl shadow-xs font-semibold text-xs mt-4 hover:opacity-95 transition cursor-pointer"
                      >
                        <Download size={16} /> Télécharger
                      </motion.a>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: COLOCATIONS */}
          {activeTab === "housing" && (
            <div className="space-y-8">
              {paginatedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-3xl border border-slate-100 shadow-xs">
                  <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-xl">
                    🏠
                  </div>
                  <h3 className="text-md font-black text-slate-800">Aucune colocation trouvée</h3>
                  <p className="text-xs text-slate-450 max-w-xs">
                    {search || colocCity !== "Tous"
                      ? "Ajustez vos filtres pour trouver ce que vous cherchez."
                      : "Vous n'avez aucune colocation en favori. Parcourez les annonces de colocation."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedList.map((coloc, idx) => (
                    <ColocationCard
                      key={coloc.id || idx}
                      annonce={coloc}
                      index={idx}
                      priority={idx < 3}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PRODUITS */}
          {activeTab === "marketplace" && (
            <div className="space-y-8">
              {paginatedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-3xl border border-slate-100 shadow-xs">
                  <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center text-xl">
                    🛍️
                  </div>
                  <h3 className="text-md font-black text-slate-850">Aucun produit trouvé</h3>
                  <p className="text-xs text-slate-450 max-w-xs">
                    {search || productCat !== "Tous" || productCity !== "Tous"
                      ? "Ajustez vos filtres pour trouver ce que vous cherchez."
                      : "Vous n'avez aucun produit marketplace en favori. Explorez la boutique."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedList.map((product, idx) => (
                    <ProductCard
                      key={product.id || idx}
                      product={product}
                      index={idx}
                      priority={idx < 3}
                      isFavorite={true}
                      onToggleFavorite={() => toggleMarketplaceFavorite(product.id, product.titre)}
                      onSeeDetails={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: CLUBS */}
          {activeTab === "clubs" && (
            <div className="space-y-8">
              {paginatedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-3xl border border-slate-100 shadow-xs">
                  <div className="w-16 h-16 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center text-xl">
                    👥
                  </div>
                  <h3 className="text-md font-black text-slate-800">Aucun club trouvé</h3>
                  <p className="text-xs text-slate-450 max-w-xs">
                    {search 
                      ? "Ajustez vos filtres pour trouver ce que vous cherchez."
                      : "Vous n'avez aucun club en favori. Explorez la page des clubs."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedList.map((club, idx) => (
                    <motion.div
                      key={club.id || idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="relative bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between h-[250px] group"
                    >
                      <div>
                        <button
                          onClick={() => handleRemoveClubFavorite(club.id, club.name)}
                          className="absolute top-4 right-4 cursor-pointer z-10 p-1.5 bg-slate-50 hover:bg-red-50 rounded-full transition"
                        >
                          <Heart size={15} className="text-red-500 fill-red-500" />
                        </button>
                        <div className="flex items-center gap-3 mt-2 mb-3">
                          <span className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shadow-xs shrink-0">
                            {club.logo}
                          </span>
                          <div className="overflow-hidden">
                            <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{club.category}</span>
                            <h4 className="font-extrabold text-sm text-slate-800 truncate mt-0.5">{club.name}</h4>
                          </div>
                        </div>
                        <p className="text-slate-400 text-[10px] font-semibold italic mb-1">"{club.slogan}"</p>
                        <p className="text-slate-500 text-xs line-clamp-2">{club.description}</p>
                      </div>
                      <Link
                        to="/clubs"
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 text-white py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Visiter la page Clubs
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PAGINATION */}
          {activeTab !== "all" && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 items-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Marketplace Product Preview Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductPreview
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            isFavorite={true}
            onToggleFavorite={() => {
              toggleMarketplaceFavorite(selectedProduct.id, selectedProduct.titre);
              setSelectedProduct(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

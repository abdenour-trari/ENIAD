// src/pages/clubs.jsx
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  Sparkles,
  Search,
  Award,
  BookOpen,
  Info,
  Clock,
  Heart,
  Share2,
  CheckCircle,
  X,
  Target,
  Megaphone,
  UserCheck,
  PlusCircle,
  TrendingUp,
  MapPin
} from "lucide-react";
import { useToast } from "../components/ui/toast";

export const DEFAULT_CLUBS = [
  {
    id: "club-ia-data-science",
    name: "Club IA & Data Science",
    logo: "🤖",
    category: "IA",
    slogan: "Façonner l'avenir de l'intelligence artificielle",
    description: "Le club de référence pour explorer le Machine Learning, le Deep Learning, et participer à des hackathons.",
    coverImage: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg",
    membersCount: 120,
    createdAt: "2024-09-15",
    status: "ouvert", // ouvert, fermé, nouveau
    badges: ["Club le plus actif", "Innovation"],
    mission: "Vulgariser et approfondir les connaissances en intelligence artificielle pour tous les étudiants.",
    objectives: [
      "Organiser des workshops hebdomadaires sur Python et TensorFlow.",
      "Préparer les équipes aux compétitions et hackathons nationaux.",
      "Développer des projets open-source utiles pour la communauté étudiante."
    ],
    bureau: [
      { name: "Yassir Alami", role: "Président (CI-2)" },
      { name: "Sara Bouhadi", role: "Vice-Présidente (CI-1)" },
      { name: "Amine Filali", role: "Secrétaire Général (CP2)" }
    ],
    events: [
      { date: "Octobre 2025", title: "Bootcamp Python & IA", desc: "Initiation aux bases de l'apprentissage automatique." },
      { date: "Novembre 2025", title: "Hackathon Inter-Écoles", desc: "48h de code non-stop pour résoudre des défis sociétaux via l'IA." }
    ],
    gallery: [
      "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
      "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg"
    ],
    announcements: [
      { title: "Recrutement de la cellule projet", date: "Il y a 3 jours", content: "Rejoignez notre équipe technique pour concevoir le chatbot du portail !" }
    ],
    activityLevel: 95
  },
  {
    id: "club-robotique-embarquee",
    name: "Club Robotique & Systèmes",
    logo: "⚙️",
    category: "Robotique",
    slogan: "Concevoir le matériel de demain",
    description: "Conception de robots autonomes, soudure électronique, impression 3D et programmation Arduino/Raspberry Pi.",
    coverImage: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg",
    membersCount: 85,
    createdAt: "2024-10-10",
    status: "ouvert",
    badges: ["Innovation"],
    mission: "Donner vie aux projets matériels et automatismes imaginés par les étudiants.",
    objectives: [
      "Participer à la Coupe Nationale de Robotique.",
      "Animer des ateliers pratiques d'impression 3D et modélisation CAD.",
      "Créer des drones autonomes pour la cartographie du campus."
    ],
    bureau: [
      { name: "Mehdi Tazi", role: "Président (CI-2)" },
      { name: "Fatima Zahra", role: "Trésorière (CI-1)" }
    ],
    events: [
      { date: "Novembre 2025", title: "Atelier Arduino & IoT", desc: "Introduction aux capteurs et à la communication d'objets connectés." }
    ],
    gallery: [
      "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
    ],
    announcements: [
      { title: "Arrivée de la nouvelle imprimante 3D", date: "Il y a 1 semaine", content: "L'imprimante 3D résine est au local club ! Venez tester vos designs." }
    ],
    activityLevel: 88
  },
  {
    id: "club-entreprendre-aei",
    name: "Club Entreprendre AEI",
    logo: "💡",
    category: "Entrepreneuriat",
    slogan: "De l'idée à la startup",
    description: "Développement d'idées de projets de startups, ateliers de pitch, management, et réseautage avec des incubateurs.",
    coverImage: "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg",
    membersCount: 65,
    createdAt: "2025-01-15",
    status: "nouveau",
    badges: ["Innovation"],
    mission: "Inculquer l'esprit d'initiative et accompagner les étudiants porteurs de projets innovants.",
    objectives: [
      "Organiser un Startup Weekend annuel sur le campus.",
      "Proposer des séances de mentorat avec des professionnels.",
      "Préparer les étudiants aux concours d'incubation nationaux."
    ],
    bureau: [
      { name: "Rania Mansouri", role: "Présidente (CI-2)" },
      { name: "Salma El Fassi", role: "Vice-Présidente (CI-1)" }
    ],
    events: [
      { date: "Décembre 2025", title: "Conférence FinTech & Startups", desc: "Echanges de haut niveau sur les opportunités de financement." }
    ],
    gallery: [
      "https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg"
    ],
    announcements: [
      { title: "Startup Weekend en approche", date: "Il y a 5 jours", content: "Pitcher votre idée en 60 secondes et formez votre équipe ce week-end !" }
    ],
    activityLevel: 82
  },
  {
    id: "club-aei-media",
    name: "AEI Média",
    logo: "📸",
    category: "Média",
    slogan: "La voix et l'image du campus",
    description: "Couverture photographique et vidéo des événements du portail, création graphique et podcasts hebdomadaires.",
    coverImage: "https://images.pexels.com/photos/906056/pexels-photo-906056.jpeg",
    membersCount: 50,
    createdAt: "2024-09-10",
    status: "ouvert",
    badges: ["Top événement"],
    mission: "Documenter la vie étudiante et former les étudiants aux métiers de l'audiovisuel et du graphisme.",
    objectives: [
      "Assurer la couverture média de tous les événements de l'école.",
      "Créer un journal mensuel numérique et des podcasts sur Spotify.",
      "Animer des ateliers de montage vidéo et design avec Adobe CC."
    ],
    bureau: [
      { name: "Anas Bennani", role: "Président (CI-1)" },
      { name: "Khadija Radi", role: "Responsable Design (CP2)" }
    ],
    events: [
      { date: "Octobre 2025", title: "Formation Montage Premiere", desc: "Apprendre les bases du montage vidéo dynamique." }
    ],
    gallery: [
      "https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg"
    ],
    announcements: [
      { title: "Lancement du premier Podcast AEI", date: "Il y a 2 jours", content: "Premier épisode disponible ! Interview exclusive du Directeur." }
    ],
    activityLevel: 80
  },
  {
    id: "club-sportif-aei",
    name: "Club Sportif AEI",
    logo: "⚽",
    category: "Sport",
    slogan: "L'esprit d'équipe et la performance",
    description: "Tournois de football, basketball, athlétisme et randonnées de groupe organisés pour dynamiser le campus.",
    coverImage: "https://images.pexels.com/photos/46798/football-players-kick-off-match-soccer-46798.jpeg",
    membersCount: 90,
    createdAt: "2024-09-20",
    status: "fermé",
    badges: ["Top événement"],
    mission: "Promouvoir la santé physique, le bien-être et la fraternité par des disciplines sportives variées.",
    objectives: [
      "Organiser le tournoi de football inter-classes annuel.",
      "Coordonner les entraînements de fitness et d'athlétisme.",
      "Planifier des excursions et randonnées écologiques en région."
    ],
    bureau: [
      { name: "Zakaria Lahlou", role: "Président (CI-2)" },
      { name: "Youssef Radi", role: "Responsable Tournoi (CI-1)" }
    ],
    events: [
      { date: "Décembre 2025", title: "Tournoi Futsal AEI", desc: "Affrontements entre les classes préparatoires et le cycle ingénieur." }
    ],
    gallery: [
      "https://images.pexels.com/photos/159611/soccer-football-sport-ball-159611.jpeg"
    ],
    announcements: [
      { title: "Clôture des inscriptions tournoi", date: "Il y a 4 jours", content: "Le tableau final est publié ! Début des matchs ce lundi." }
    ],
    activityLevel: 75
  },
  {
    id: "aei-social-green",
    name: "AEI Social & Green",
    logo: "🌱",
    category: "Social",
    slogan: "Agir ensemble pour notre environnement",
    description: "Actions écologiques, nettoyage de plages, sensibilisation au climat et initiatives solidaires auprès des plus démunis.",
    coverImage: "https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg",
    membersCount: 70,
    createdAt: "2024-11-01",
    status: "ouvert",
    badges: [],
    mission: "Mobiliser la communauté étudiante pour un campus vert et des actions solidaires durables.",
    objectives: [
      "Organiser des campagnes de plantation d'arbres sur le campus.",
      "Mettre en place des bacs de recyclage sélectifs au sein de l'école.",
      "Conduire des caravanes médicales et solidaires dans la région de Berkane."
    ],
    bureau: [
      { name: "Lina Amor", role: "Présidente (CI-2)" },
      { name: "Meryem Jamil", role: "Vice-Présidente (CI-1)" }
    ],
    events: [
      { date: "Octobre 2025", title: "Eco-Clean Day Berkane", desc: "Campagne solidaire de nettoyage de l'espace vert public." }
    ],
    gallery: [
      "https://images.pexels.com/photos/956606/pexels-photo-956606.jpeg"
    ],
    announcements: [
      { title: "Collecte de vêtements d'hiver", date: "Il y a 6 jours", content: "Apportez vos dons au local social avant la fin de semaine !" }
    ],
    activityLevel: 78
  }
];

export default function ClubsPage() {
  const { toast } = useToast();
  const [clubs, setClubs] = useState(() => {
    const saved = localStorage.getItem("aei_clubs");
    return saved ? JSON.parse(saved) : DEFAULT_CLUBS;
  });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tous");
  
  // Modals & previews
  const [selectedClub, setSelectedClub] = useState(null);
  const [detailTab, setDetailTab] = useState("apercu"); // apercu, activites, publications, membres, recrutement
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // States locally stored
  const [followedClubs, setFollowedClubs] = useState(() => {
    const saved = localStorage.getItem("followed_clubs");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [favoriteClubs, setFavoriteClubs] = useState(() => {
    const saved = localStorage.getItem("favorite_clubs");
    return saved ? JSON.parse(saved) : [];
  });

  const [registrations, setRegistrations] = useState(() => {
    const saved = localStorage.getItem("club_registrations");
    return saved ? JSON.parse(saved) : [];
  });

  // Recruitment form states
  const [recruitmentForm, setRecruitmentForm] = useState({
    motivation: "",
    specialty: "IA & Data Science",
    year: "CP1"
  });

  // Club creation form states
  const [creationForm, setCreationForm] = useState({
    name: "",
    slogan: "",
    description: "",
    category: "Tech",
    mission: ""
  });

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem("aei_clubs", JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem("followed_clubs", JSON.stringify(followedClubs));
  }, [followedClubs]);

  useEffect(() => {
    localStorage.setItem("favorite_clubs", JSON.stringify(favoriteClubs));
  }, [favoriteClubs]);

  useEffect(() => {
    localStorage.setItem("club_registrations", JSON.stringify(registrations));
  }, [registrations]);

  const categories = ["Tous", "Tech", "IA", "Robotique", "Entrepreneuriat", "Sport", "Média", "Social", "Culture"];

  // Filtering list
  const filteredClubs = useMemo(() => {
    return clubs.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "Tous" || c.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [clubs, search, categoryFilter]);

  // Sidebar dynamic widgets
  const popularClubs = useMemo(() => {
    return [...clubs].sort((a, b) => b.activityLevel - a.activityLevel).slice(0, 3);
  }, [clubs]);

  const recommendedClubs = useMemo(() => {
    // Return recommendations based on some criteria
    return clubs.slice(2, 5);
  }, [clubs]);

  // Toggles and Actions
  const handleFollow = (clubId, clubName) => {
    if (followedClubs.includes(clubId)) {
      setFollowedClubs(prev => prev.filter(id => id !== clubId));
      toast("Désabonné", `Vous ne suivez plus le club "${clubName}".`, "info");
    } else {
      setFollowedClubs(prev => [...prev, clubId]);
      toast("Abonné", `Vous suivez maintenant le club "${clubName}" !`, "success");
    }
  };

  const handleFavorite = (clubId, clubName) => {
    if (favoriteClubs.includes(clubId)) {
      setFavoriteClubs(prev => prev.filter(id => id !== clubId));
      toast("Retiré", `"${clubName}" a été retiré de vos favoris.`, "info");
    } else {
      setFavoriteClubs(prev => [...prev, clubId]);
      toast("Ajouté", `"${clubName}" a été ajouté à vos favoris.`, "success");
    }
  };

  const handleShare = (clubId) => {
    const link = `${window.location.origin}/clubs?id=${clubId}`;
    navigator.clipboard.writeText(link);
    toast("Partagé", "Lien du club copié dans le presse-papiers !", "success");
  };

  const handleRecruitmentSubmit = (e, clubId, clubName) => {
    e.preventDefault();
    if (!recruitmentForm.motivation.trim()) {
      toast("Erreur", "Veuillez exprimer votre motivation.", "error");
      return;
    }
    const newReg = {
      clubId,
      clubName,
      motivation: recruitmentForm.motivation,
      specialty: recruitmentForm.specialty,
      year: recruitmentForm.year,
      date: new Date().toISOString(),
      status: "pending"
    };
    setRegistrations(prev => [...prev, newReg]);
    setRecruitmentForm({ motivation: "", specialty: "IA & Data Science", year: "CP1" });
    toast("Candidature envoyée !", `Votre demande d'adhésion au "${clubName}" a bien été transmise.`, "success");
  };

  const handleCreateClub = (e) => {
    e.preventDefault();
    if (!creationForm.name.trim() || !creationForm.description.trim()) {
      toast("Erreur", "Le nom et la description sont requis.", "error");
      return;
    }
    // Simulate sending request to AEI administration
    toast("Demande envoyée !", `Votre demande pour créer le club "${creationForm.name}" a été soumise pour validation par l'AEI.`, "success");
    setIsCreateOpen(false);
    setCreationForm({ name: "", slogan: "", description: "", category: "Tech", mission: "" });
  };

  // Open modal inside specific tab
  const openClubDetails = (club, tab = "apercu") => {
    setSelectedClub(club);
    setDetailTab(tab);
  };

  const totalMembers = useMemo(() => clubs.reduce((acc, c) => acc + c.membersCount, 0), [clubs]);

  return (
    <div className="space-y-10 lg:p-6 md:p-4 p-2 relative">
      {/* 1. HERO HEADER BANNER */}
      <section className="relative overflow-hidden rounded-4xl bg-linear-to-br from-slate-950 via-slate-900 to-sky-950 text-white px-6 py-12 sm:px-12 sm:py-16 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sky-400 text-[10px] font-black uppercase tracking-wider">
              <Sparkles size={10} /> Vie Associative AEI
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Découvrez les clubs qui construisent la <span className="bg-linear-to-r from-sky-400 via-teal-300 to-orange-400 bg-clip-text text-transparent">vie étudiante</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl font-medium leading-relaxed">
              Rejoignez une communauté, participez aux événements et développez vos compétences au-delà des cours.
            </p>
          </div>

          {/* Banner Stats widgets */}
          <div className="lg:col-span-4 grid grid-cols-3 gap-3">
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-4 rounded-2xl text-center">
              <span className="text-2xl font-black text-white">{clubs.length}</span>
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Clubs</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-4 rounded-2xl text-center">
              <span className="text-2xl font-black text-white">{totalMembers}</span>
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Membres</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-4 rounded-2xl text-center">
              <span className="text-2xl font-black text-white">24</span>
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Événements</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ADVANCED FILTERS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Rechercher un club..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-slate-800 text-xs md:text-sm focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition"
          />
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                categoryFilter === cat
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                  : "bg-slate-50 text-slate-650 hover:bg-slate-100 border-slate-200/60"
              }`}
            >
              {cat === "Tous" ? "Tous les domaines" : cat}
            </button>
          ))}
          {categories.length > 5 && (
            <select
              value={categories.includes(categoryFilter) && categories.indexOf(categoryFilter) >= 5 ? categoryFilter : ""}
              onChange={(e) => {
                if (e.target.value) setCategoryFilter(e.target.value);
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-650 border border-slate-200/60 outline-none"
            >
              <option value="">Autres</option>
              {categories.slice(5).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 3. MAIN SECTION GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Clubs list Grid */}
        <div className="lg:col-span-8 space-y-6">
          {filteredClubs.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Info size={28} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Aucun club trouvé</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Aucun club étudiant ne correspond à votre recherche ou catégorie sélectionnée.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredClubs.map((club, index) => {
                const isFollowed = followedClubs.includes(club.id);
                const isFav = favoriteClubs.includes(club.id);
                const statusColors = {
                  ouvert: "bg-emerald-500 text-white shadow-xs",
                  fermé: "bg-slate-400 text-white",
                  nouveau: "bg-amber-500 text-white shadow-xs"
                };

                return (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.015,
                      boxShadow: "0 20px 40px rgba(14, 165, 233, 0.08)",
                      borderColor: "rgba(14, 165, 233, 0.3)"
                    }}
                    transition={{
                      delay: Math.min(index * 0.05, 0.3),
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    className="bg-white rounded-3xl border border-slate-100 transition-all duration-300 overflow-hidden flex flex-col h-[480px] group relative"
                  >
                    {/* Cover image area */}
                    <div className="h-40 w-full overflow-hidden shrink-0 relative bg-slate-100">
                      <img
                        src={club.coverImage}
                        alt={club.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                      {/* Status Badges */}
                      <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full tracking-wider ${
                          statusColors[club.status || "ouvert"]
                        }`}>
                          {club.status === "ouvert" ? "Recrutement Ouvert" : club.status === "nouveau" ? "Nouveau" : "Recrutement Fermé"}
                        </span>
                      </div>

                      {/* Top Action Buttons (Follow / Fav) */}
                      <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <button
                          onClick={() => handleFavorite(club.id, club.name)}
                          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-md active:scale-90 transition hover:bg-white text-rose-500"
                        >
                          <Heart size={14} fill={isFav ? "currentColor" : "none"} />
                        </button>
                      </div>

                      {/* Club title & Logo floating */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
                        <div className="w-14 h-14 bg-white/90 backdrop-blur-xs border border-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-md shrink-0">
                          {club.logo}
                        </div>
                        <div className="text-white overflow-hidden pb-1">
                          <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-md uppercase tracking-widest">{club.category}</span>
                          <h2 className="font-extrabold text-base truncate mt-1 drop-shadow-sm">{club.name}</h2>
                        </div>
                      </div>
                    </div>

                    {/* Description & Body */}
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div className="space-y-3">
                        <p className="text-slate-400 text-[11px] font-bold italic line-clamp-1">"{club.slogan}"</p>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                          {club.description}
                        </p>
                      </div>

                      {/* Dynamic hover-visible statistics block */}
                      <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-50">
                        <div>
                          <span className="block text-[9px] text-slate-450 uppercase font-black">Membres</span>
                          <span className="text-xs font-bold text-slate-800">{club.membersCount} adhérents</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-slate-450 uppercase font-black">Créé le</span>
                          <span className="text-xs font-bold text-slate-800">{new Date(club.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "short" })}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => openClubDetails(club, "recrutement")}
                          disabled={club.status === "fermé"}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-black shadow-md transition-all active:scale-[0.98] cursor-pointer text-center ${
                            club.status === "fermé"
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                              : "bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:opacity-95 shadow-sky-500/10"
                          }`}
                        >
                          Rejoindre le club
                        </button>
                        
                        <button
                          onClick={() => openClubDetails(club, "apercu")}
                          className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Découvrir
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Extras widgets panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Widget 1: Popular Clubs */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <TrendingUp size={16} className="text-sky-500" />
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Clubs Populaires</h3>
            </div>
            
            <div className="space-y-3">
              {popularClubs.map((club, idx) => (
                <div
                  key={club.id}
                  onClick={() => openClubDetails(club, "apercu")}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {club.logo}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{club.name}</h4>
                      <span className="text-[10px] text-sky-600 font-bold uppercase">{club.category}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">{club.membersCount} ad.</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Recommended Clubs */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <Sparkles size={16} className="text-amber-500" />
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Recommandés pour vous</h3>
            </div>

            <div className="space-y-3">
              {recommendedClubs.map((club) => (
                <div
                  key={club.id}
                  onClick={() => openClubDetails(club, "apercu")}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition duration-300 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {club.logo}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{club.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{club.slogan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Next Event Highlight */}
          <div className="bg-linear-to-br from-slate-900 via-slate-800 to-sky-950 text-white p-6 rounded-3xl border border-slate-850 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
            <span className="text-[9px] font-black bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-md uppercase tracking-widest">Événement Associatif</span>
            
            <h4 className="font-black text-base text-white mt-3 mb-1">Hackathon IA Inter-Écoles</h4>
            <p className="text-slate-300 text-xs mb-4">Organisé par le Club IA & Data Science.</p>
            
            <div className="flex items-center gap-2 text-xs text-slate-300 mb-6">
              <Calendar size={14} className="text-sky-400" />
              <span>Novembre 2025 (48h Non-Stop)</span>
            </div>

            <button
              onClick={() => {
                const target = clubs.find(c => c.id === "club-ia-data-science");
                if (target) openClubDetails(target, "activites");
              }}
              className="w-full bg-white text-slate-900 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-100 transition shadow"
            >
              En savoir plus
            </button>
          </div>

          {/* Widget 4: Create a Club request */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs text-center space-y-4">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
              <PlusCircle size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-800">Proposer un nouveau club</h4>
              <p className="text-slate-400 text-xs">Vous avez un projet de club innovant ? Déposez une demande de création.</p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Créer un club
            </button>
          </div>
        </div>
      </div>

      {/* 4. CLUB DETAILS MODAL (POPUP AT 5 TABS) */}
      <AnimatePresence>
        {selectedClub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClub(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-[650px] z-10 border border-slate-150"
            >
              {/* Header Hero Area */}
              <div className="h-44 w-full relative bg-slate-100 shrink-0">
                <img
                  src={selectedClub.coverImage}
                  alt={selectedClub.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

                {/* Close modal Button */}
                <button
                  onClick={() => setSelectedClub(null)}
                  className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/35 backdrop-blur-xs text-white rounded-full flex items-center justify-center transition border border-white/10 active:scale-95"
                >
                  <X size={18} />
                </button>

                {/* Floating Logo, Name, Slogan */}
                <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4 text-white">
                  <div className="w-16 h-16 bg-white/95 rounded-2xl flex items-center justify-center text-4xl shadow-lg border border-white/20 shrink-0">
                    {selectedClub.logo}
                  </div>
                  <div className="pb-1 overflow-hidden flex-1">
                    <span className="text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-md uppercase tracking-widest">{selectedClub.category}</span>
                    <h2 className="text-xl md:text-2xl font-black truncate mt-1 leading-none">{selectedClub.name}</h2>
                    <p className="text-xs text-slate-300 font-medium italic mt-1 leading-none">"{selectedClub.slogan}"</p>
                  </div>
                </div>
              </div>

              {/* Action and Navigation Tabs bar */}
              <div className="bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between shrink-0 px-6 py-2 gap-2">
                <div className="flex gap-1.5 overflow-x-auto">
                  {["apercu", "activites", "publications", "membres", "recrutement"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`px-3 py-2 rounded-xl text-xs font-black capitalize transition-all cursor-pointer ${
                        detailTab === tab
                          ? "bg-sky-50 text-sky-700"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab === "apercu" ? "Aperçu" : tab === "activites" ? "Activités" : tab === "publications" ? "Publications" : tab === "membres" ? "Membres" : "Recrutement"}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                  {/* Favorite */}
                  <button
                    onClick={() => handleFavorite(selectedClub.id, selectedClub.name)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${
                      favoriteClubs.includes(selectedClub.id)
                        ? "bg-rose-50 text-rose-500 border-rose-100"
                        : "bg-white text-slate-450 hover:text-slate-700 border-slate-200"
                    }`}
                    title="Ajouter aux favoris"
                  >
                    <Heart size={15} fill={favoriteClubs.includes(selectedClub.id) ? "currentColor" : "none"} />
                  </button>

                  {/* Follow */}
                  <button
                    onClick={() => handleFollow(selectedClub.id, selectedClub.name)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition border flex items-center gap-1.5 ${
                      followedClubs.includes(selectedClub.id)
                        ? "bg-sky-50 text-sky-700 border-sky-100"
                        : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {followedClubs.includes(selectedClub.id) ? (
                      <>
                        <UserCheck size={13} />
                        <span>Abonné</span>
                      </>
                    ) : (
                      <span>Suivre</span>
                    )}
                  </button>

                  {/* Share */}
                  <button
                    onClick={() => handleShare(selectedClub.id)}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center justify-center transition"
                    title="Partager le club"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>

              {/* Tab Contents Frame */}
              <div className="flex-1 p-6 overflow-y-auto bg-white">
                
                {/* TAB 1: APERCU */}
                {detailTab === "apercu" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div className="space-y-1.5">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Target size={13} /> Notre Mission</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">{selectedClub.mission}</p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Award size={13} /> Objectifs principaux</h3>
                          <ul className="space-y-2">
                            {selectedClub.objectives?.map((obj, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-slate-605 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Side activity bar & basic metadata */}
                      <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 h-fit">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Niveau d'activité</span>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-sky-500 h-2 rounded-full"
                                style={{ width: `${selectedClub.activityLevel}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-slate-700">{selectedClub.activityLevel}%</span>
                          </div>
                        </div>

                        <hr className="border-slate-200/60" />

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">Membres :</span>
                            <span className="font-bold text-slate-800">{selectedClub.membersCount} adhérents</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">Date de création :</span>
                            <span className="font-bold text-slate-800">{new Date(selectedClub.createdAt).toLocaleDateString("fr-FR")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">Statut :</span>
                            <span className="font-black text-emerald-600 capitalize">{selectedClub.status}</span>
                          </div>
                        </div>

                        {selectedClub.badges && selectedClub.badges.length > 0 && (
                          <>
                            <hr className="border-slate-200/60" />
                            <div className="flex flex-wrap gap-1.5">
                              {selectedClub.badges.map((badge, idx) => (
                                <span key={idx} className="px-2.5 py-0.5 bg-sky-100 text-sky-750 text-[9px] font-black rounded-md tracking-wider uppercase">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ACTIVITES */}
                {detailTab === "activites" && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Calendar size={13} /> Événements et Réalisations</h3>
                      <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-6">
                        {selectedClub.events?.map((ev, idx) => (
                          <div key={idx} className="relative">
                            <span className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 bg-white border-2 border-sky-500 rounded-full flex items-center justify-center shrink-0" />
                            <span className="text-[10px] text-sky-650 font-black uppercase tracking-wider block">{ev.date}</span>
                            <h4 className="font-bold text-slate-800 text-sm mt-0.5">{ev.title}</h4>
                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{ev.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedClub.gallery && selectedClub.gallery.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-slate-50">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Galerie Photo</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {selectedClub.gallery.map((img, idx) => (
                            <div key={idx} className="h-24 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                              <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: PUBLICATIONS */}
                {detailTab === "publications" && (
                  <div className="space-y-6">
                    {selectedClub.announcements && selectedClub.announcements.length > 0 ? (
                      <div className="space-y-4">
                        {selectedClub.announcements.map((ann, idx) => (
                          <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                                <Megaphone size={14} className="text-sky-500" />
                                {ann.title}
                              </h4>
                              <span className="text-[10px] font-bold text-slate-400">{ann.date}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                              {ann.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 space-y-2">
                        <span className="text-3xl block">📢</span>
                        <h4 className="font-bold text-xs text-slate-700">Aucune annonce récente</h4>
                        <p className="text-slate-400 text-xs">Ce club n'a publié aucune actualité ces derniers jours.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: MEMBRES */}
                {detailTab === "membres" && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Users size={13} /> Membres du Bureau</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedClub.bureau?.map((mem, idx) => (
                          <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                            <div className="w-9 h-9 bg-sky-500/10 text-sky-600 font-black rounded-lg flex items-center justify-center text-xs">
                              {mem.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-800">{mem.name}</h4>
                              <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">{mem.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: RECRUTEMENT */}
                {detailTab === "recrutement" && (
                  <div className="space-y-4">
                    {selectedClub.status === "fermé" ? (
                      <div className="bg-slate-50 p-8 rounded-2xl text-center space-y-2 border border-slate-100">
                        <span className="text-2xl block">🔒</span>
                        <h4 className="font-bold text-slate-700">Les candidatures sont closes</h4>
                        <p className="text-slate-400 text-xs">Le club n'accepte plus d'inscriptions pour le semestre en cours.</p>
                      </div>
                    ) : (
                      <form onSubmit={(e) => handleRecruitmentSubmit(e, selectedClub.id, selectedClub.name)} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100/60">
                        <h3 className="text-sm font-black text-slate-800 mb-2">Formulaire d'inscription</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Année d'étude</label>
                            <select
                              value={recruitmentForm.year}
                              onChange={(e) => setRecruitmentForm(prev => ({ ...prev, year: e.target.value }))}
                              className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs font-semibold"
                            >
                              <option value="CP1">Classe Préparatoire 1 (CP1)</option>
                              <option value="CP2">Classe Préparatoire 2 (CP2)</option>
                              <option value="CI-1">Cycle Ingénieur 1 (CI-1)</option>
                              <option value="CI-2">Cycle Ingénieur 2 (CI-2)</option>
                              <option value="CI-3">Cycle Ingénieur 3 (CI-3)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Spécialité / Filière</label>
                            <select
                              value={recruitmentForm.specialty}
                              onChange={(e) => setRecruitmentForm(prev => ({ ...prev, specialty: e.target.value }))}
                              className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs font-semibold"
                            >
                              <option value="IA & Data Science">IA & Data Science</option>
                              <option value="Robotique & IoT">Robotique & IoT</option>
                              <option value="Cybersécurité">Cybersécurité</option>
                              <option value="Développement Logiciel">Développement Logiciel</option>
                              <option value="Autre">Autre</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Motivations</label>
                          <textarea
                            placeholder="Pourquoi voulez-vous rejoindre ce club ? Que pouvez-vous apporter à l'équipe ?"
                            value={recruitmentForm.motivation}
                            onChange={(e) => setRecruitmentForm(prev => ({ ...prev, motivation: e.target.value }))}
                            rows={4}
                            className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 resize-none transition"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                        >
                          Soumettre ma candidature
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. CREATE A CLUB MODAL REQUEST */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-10 border border-slate-100"
            >
              <button
                onClick={() => setIsCreateOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-black text-slate-850 mb-1 flex items-center gap-2">
                <PlusCircle className="text-sky-500" /> Proposer un nouveau club
              </h2>
              <p className="text-slate-400 text-xs mb-6">
                Remplissez ce formulaire pour soumettre votre projet de club au comité d'administration de l'AEI.
              </p>

              <form onSubmit={handleCreateClub} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Nom du club</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Club d'Echecs AEI, CyberClub..."
                    value={creationForm.name}
                    onChange={(e) => setCreationForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Slogan</label>
                    <input
                      type="text"
                      placeholder="Ex: Réfléchir pour gagner"
                      value={creationForm.slogan}
                      onChange={(e) => setCreationForm(prev => ({ ...prev, slogan: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Catégorie</label>
                    <select
                      value={creationForm.category}
                      onChange={(e) => setCreationForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-xs font-bold"
                    >
                      {categories.filter(c => c !== "Tous").map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Description courte</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Présentation rapide du club pour les étudiants."
                    value={creationForm.description}
                    onChange={(e) => setCreationForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 resize-none transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Mission & Activités prévues</label>
                  <textarea
                    rows={3}
                    placeholder="Décrivez les objectifs généraux du club et les événements que vous aimeriez organiser."
                    value={creationForm.mission}
                    onChange={(e) => setCreationForm(prev => ({ ...prev, mission: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 resize-none transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer"
                >
                  Envoyer la proposition
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

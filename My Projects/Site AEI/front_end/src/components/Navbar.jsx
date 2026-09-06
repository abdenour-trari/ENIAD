// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Heart,
  FolderGit2,
  Calendar,
  Briefcase,
  MessageSquare,
  Megaphone,
  Sparkles,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  User,
  Users,
  ShoppingBag,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./ui/avatar";
import { Dropdown, DropdownItem } from "./ui/dropdown";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "./Footer";

export default function MainNavigation({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nouveau Cours", message: "Le cours d'Algèbre 2 est en ligne.", read: false },
    { id: 2, title: "Stage IA", message: "Nouvelle offre chez Dell Casablanca.", read: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const { user, profile, signOut, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/connexion");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const menuItems = [
    { name: "Mes favoris", icon: Heart, to: "/favori", roles: ["student", "moderator", "admin"] },
    { name: "Mes projets déposés", icon: FolderGit2, to: "/mes-projets", roles: ["student", "moderator", "admin"] },
    { name: "Mes annonces colocation", icon: Building2, to: "/mes-annonces", roles: ["student", "moderator", "admin"] },
    { name: "Évènements / Agenda", icon: Calendar, to: "/evenements", roles: ["student", "moderator", "admin"] },
    { name: "Stages & Opportunités", icon: Briefcase, to: "/stages-opportunites", roles: ["student", "moderator", "admin"] },
    { name: "Forum / Communauté", icon: MessageSquare, to: "/forum-communaute", roles: ["student", "moderator", "admin"] },
    { name: "Publicités", icon: Megaphone, to: "/publicites", roles: ["student", "moderator", "admin"] },
    { name: "Chatbot IA", icon: Sparkles, to: "/chatbot", roles: ["student", "moderator", "admin"] },
  ];

  const topLinks = [
    { name: "Accueil", icon: Home, to: "/" },
    { name: "Cours", icon: BookOpen, to: "/cours" },
    { name: "Colocation", icon: Building2, to: "/colocation" },
    { name: "Marketplace", icon: ShoppingBag, to: "/marketplace" },
    { name: "Projets", icon: FolderGit2, to: "/projets" },
    { name: "Clubs", icon: Users, to: "/clubs" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200/60 p-5 shadow-sm transform transition-all duration-300 ease-in-out z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:inset-auto
          flex flex-col h-full overflow-y-auto
          ${sidebarCollapsed ? "md:w-20" : "md:w-72"}
        `}
      >
        {/* Header (Logo + collapse trigger) */}
        <div className="flex items-center justify-between mb-8">
          {!sidebarCollapsed ? (
            <Link to="/" className="flex items-center gap-2">
              <span className="h-9 w-9 bg-sky-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-sky-500/20">
                A
              </span>
              <span className="font-black text-xl text-slate-900 tracking-tight">
                Portail <span className="text-sky-600">AEI</span>
              </span>
            </Link>
          ) : (
            <Link to="/" className="mx-auto h-9 w-9 bg-sky-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-sky-500/20">
              A
            </Link>
          )}

          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition mb-6 ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <Avatar
              src={profile?.avatar_url || user.user_metadata?.avatar_url}
              alt={profile?.full_name || user.email}
              fallback={profile?.full_name?.substring(0, 2) || user.email?.substring(0, 2)}
              className="w-10 h-10 border border-slate-200"
            />
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-slate-800 truncate">
                  {profile?.full_name || "Étudiant AEI"}
                </h4>
                <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">
                  {role || "Étudiant"}
                </p>
              </div>
            )}
          </Link>
        )}

        {/* Navigation - Top Links (Mobile only) */}
        <ul className="space-y-1.5 md:hidden mb-6">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
            Navigation
          </div>
          {topLinks.map((link, idx) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <li key={idx}>
                <Link
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-sky-50 text-sky-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Menu principal */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
              Mon Espace
            </div>
          )}
          <ul className="space-y-1.5">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <li key={idx}>
                  <Link
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-sky-50 text-sky-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    } ${sidebarCollapsed ? "justify-center" : ""}`}
                  >
                    <Icon size={18} className={isActive ? "text-sky-600" : "text-slate-500"} />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom Collapse Switch */}
        <div className="mt-auto pt-6 border-t border-slate-100 hidden md:block">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center justify-center w-full py-2.5 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* STICKY TOP NAVBAR */}
        <header className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-slate-200/50 h-16 flex items-center justify-between px-6 z-40 shadow-xs">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-600 cursor-pointer">
              <Menu size={24} />
            </button>

            {/* Desktop Navigation Link Pills */}
            <nav className="hidden md:flex items-center gap-1.5 font-semibold">
              {topLinks.map((link, idx) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={idx}
                    to={link.to}
                    className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Search, Notifications & Account */}
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden sm:block w-56 lg:w-72">
              <Search size={16} className="absolute top-3 left-3 text-slate-400" />
              <input
                type="text"
                placeholder="Recherche globale..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 text-slate-800 text-xs rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all border border-transparent focus:bg-white focus:border-slate-200"
              />
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition cursor-pointer"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    {/* Backdrop for click out */}
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/60 rounded-2xl shadow-2xl p-4 z-50"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                        <h4 className="font-bold text-sm text-slate-800">Notifications</h4>
                        <button
                          onClick={markAllRead}
                          className="text-xs text-sky-600 hover:underline font-semibold"
                        >
                          Marquer lu
                        </button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-2.5 rounded-xl text-xs transition border ${
                              notif.read
                                ? "bg-white border-transparent"
                                : "bg-sky-50/50 border-sky-100/50"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                              <span>{notif.title}</span>
                              {!notif.read && <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />}
                            </div>
                            <p className="text-slate-500">{notif.message}</p>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <p className="text-center text-slate-400 text-xs py-4">
                            Aucune notification
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown */}
            {user ? (
              <Dropdown
                trigger={
                  <div className="flex items-center gap-1.5 hover:opacity-85 transition">
                    <Avatar
                      src={profile?.avatar_url || user.user_metadata?.avatar_url}
                      alt={profile?.full_name || user.email}
                      fallback={profile?.full_name?.substring(0, 2) || user.email?.substring(0, 2)}
                      className="w-8.5 h-8.5 border border-slate-200"
                    />
                  </div>
                }
              >
                <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                  <p className="text-xs text-slate-400 font-medium">Connecté en tant que</p>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {profile?.full_name || "Étudiant AEI"}
                  </p>
                </div>
                <DropdownItem onClick={() => navigate("/profile")}>
                  <User size={16} className="mr-2 text-slate-400" /> Mon profil
                </DropdownItem>
                <DropdownItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                  <LogOut size={16} className="mr-2" /> Déconnexion
                </DropdownItem>
              </Dropdown>
            ) : (
              <Link
                to="/connexion"
                className="bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-850 transition"
              >
                Connexion
              </Link>
            )}
          </div>
        </header>

        {/* CORE PAGE VIEWS WRAPPER */}
        <div id="main-scroll-container" className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 mb-10">{children}</div>
          <Footer />
        </div>
      </main>
    </div>
  );
}

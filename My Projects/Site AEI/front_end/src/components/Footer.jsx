import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Code, ChevronUp } from "lucide-react";
import logo from "../assets/AEI.png";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll-container");
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (scrollContainer.scrollTop > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.getElementById("main-scroll-container");
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const navLinks = [
    { label: "Accueil", to: "/" },
    { label: "Cours", to: "/cours" },
    { label: "Colocation", to: "/colocation" },
    { label: "Marketplace", to: "/marketplace" },
    { label: "Projets", to: "/projets" },
    { label: "Forum", to: "/forum-communaute" },
    { label: "Stages", to: "/stages-opportunites" },
    { label: "Profil", to: "/profile" },
  ];

  return (
    <footer className="w-full bg-white/60 backdrop-blur-md border-t border-slate-200/60 py-12 px-6 md:px-12 relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16 text-center md:text-left">
          
          {/* COLONNE 1: Logo & Description */}
          <div className="flex flex-col gap-4 items-center md:items-start">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="AEI Logo"
                className="w-10 h-10 object-contain hover:scale-105 transition-transform duration-300 rounded-lg"
              />
              <div className="text-left">
                <h2 className="text-base font-bold text-slate-800 tracking-tight">
                  Portail Étudiant AEI
                </h2>
                <div className="mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/60 select-none">
                    Version 1.0
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Plateforme collaborative dédiée aux étudiants de l'École Nationale de l'Intelligence Artificielle et du Digital de Berkane.
            </p>
          </div>

          {/* COLONNE 2: Navigation Rapide */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 select-none">
              Navigation rapide
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 max-w-xs mx-auto md:mx-0">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="relative pb-0.5 text-sm text-slate-500 hover:text-sky-600 transition-colors duration-300 group inline-block font-medium"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-sky-600 group-hover:w-full transition-all duration-300 ease-out" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLONNE 3: Informations */}
          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 select-none">
              Informations
            </h3>
            <div className="flex flex-col gap-3 max-w-sm mx-auto md:mx-0">
              <p className="text-sm text-slate-500 leading-relaxed">
                École Nationale de l'Intelligence Artificielle et du Digital – Berkane{" "}
                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100 rounded ml-1 select-none">
                  ENIADB
                </span>
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-500 mt-1">
                <Code size={14} className="text-sky-600 animate-pulse" />
                <span>
                  Développé avec passion par{" "}
                  <span className="font-semibold text-slate-700">TRARI Abdenour</span>
                </span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Separator & Bottom Bar */}
        <div className="border-t border-slate-200/60 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium text-center md:text-left">
            <p className="select-none">
              © 2026 Portail Étudiant AEI — Tous droits réservés
            </p>
            <p>
              Conçu et développé par{" "}
              <span className="text-slate-500 hover:text-sky-600 transition-colors duration-300 font-semibold">
                TRARI Abdenour
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white text-sky-600 shadow-md border border-slate-200/80 transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer ${
          showScrollTop
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-75 pointer-events-none"
        }`}
        aria-label="Retour en haut"
      >
        <ChevronUp size={20} className="transition-transform duration-300" />
      </button>
    </footer>
  );
}

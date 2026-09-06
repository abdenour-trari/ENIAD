// src/pages/home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Building2,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  MessageSquare,
} from "lucide-react";
import event1 from "../assets/events/event1.png";
import event2 from "../assets/events/event2.png";
import event3 from "../assets/events/event3.png";

// Helper components for stats card
function StatCard({ icon: Icon, count, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs hover:shadow-lg transition-all text-center flex flex-col items-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
        <Icon size={22} />
      </div>
      <span className="text-3xl font-black text-slate-900 tracking-tight">{count}</span>
      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{label}</span>
    </motion.div>
  );
}

// Helper for feature card
function FeatureCard({ icon: Icon, title, description, to, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white border border-slate-100/80 p-8 rounded-3xl shadow-xs hover:shadow-xl transition-all flex flex-col justify-between h-full group"
    >
      <div>
        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center mb-6 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
          <Icon size={22} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{description}</p>
      </div>
      <Link
        to={to}
        className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition"
      >
        En savoir plus <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const events = [
    {
      title: "Journée d’intégration",
      date: "Octobre 2025",
      description: "Accueil des nouveaux étudiants et activités culturelles.",
      image: event1,
    },
    {
      title: "Hackathon IA",
      date: "Novembre 2025",
      description: "Compétition nationale autour de l’intelligence artificielle.",
      image: event2,
    },
    {
      title: "Conférence Entrepreneuriat",
      date: "Décembre 2025",
      description: "Rencontre avec des fondateurs de startups du pays.",
      image: event3,
    },
  ];

  const sponsors = [
    { name: "Dell Technologies", logo: "DELL" },
    { name: "AWS Academy", logo: "AWS" },
    { name: "CDG Maroc", logo: "CDG" },
    { name: "Orange Maroc", logo: "Orange" },
  ];

  const testimonials = [
    {
      name: "Salma Bennani",
      role: "Étudiante en CI-2",
      quote: "Le chatbot IA m'a énormément aidée à synthétiser mes fiches d'Algèbre 2. C'est le portail que nous attendions tous.",
    },
    {
      name: "Yassine Mansouri",
      role: "Diplômé AEI (Promo 2024)",
      quote: "Grâce à la section Stages & Opportunités, j'ai décroché mon stage PFE chez Orange. Un outil formidable pour lancer sa carrière.",
    },
  ];

  return (
    <div className="space-y-24 py-4">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-4xl bg-linear-to-br from-slate-950 via-slate-900 to-sky-950 text-white px-6 py-20 sm:px-12 sm:py-28 text-center flex flex-col items-center justify-center border border-slate-800 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={12} /> Version 2.0 Live
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Construisons ensemble la <span className="bg-linear-to-r from-sky-400 via-teal-300 to-orange-400 bg-clip-text text-transparent">communauté étudiante</span> de demain
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
            Partagez vos cours, trouvez votre colocation idéale, vendez vos fournitures et posez vos questions à notre IA au même endroit.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 hover:scale-[1.02] transition cursor-pointer"
            >
              Commencer
            </Link>
            <Link
              to="/cours"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white font-bold px-8 py-3.5 rounded-2xl border border-white/10 hover:scale-[1.02] transition cursor-pointer"
            >
              Découvrir les cours
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <StatCard icon={Users} count="1,200+" label="Étudiants Actifs" delay={0.1} />
          <StatCard icon={BookOpen} count="350+" label="Supports de Cours" delay={0.2} />
          <StatCard icon={Building2} count="45+" label="Offres Coloc" delay={0.3} />
          <StatCard icon={Award} count="80+" label="Projets Déposés" delay={0.4} />
        </div>
      </section>

      {/* 3. FUNCTIONALITIES SECTION */}
      <section className="space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tout ce dont vous avez besoin</h2>
          <p className="text-slate-500 text-sm">
            Une suite d'outils interconnectés pour faciliter votre vie universitaire au quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={BookOpen}
            title="Partage de Cours"
            description="Accédez aux cours, annales d'examens et fiches résumées par niveau de CP1 à CI."
            to="/cours"
            delay={0.1}
          />
          <FeatureCard
            icon={Building2}
            title="Annonces Colocations"
            description="Découvrez des opportunités de logements étudiants partagés proches du campus."
            to="/colocation"
            delay={0.2}
          />
          <FeatureCard
            icon={ShoppingBag}
            title="Marketplace Étudiante"
            description="Achetez et vendez vos manuels scolaires, ordinateurs et fournitures d'occasion."
            to="/marketplace"
            delay={0.3}
          />
        </div>
      </section>

      {/* 4. IA ASSISTANT SHOWCASE */}
      <section className="bg-slate-900 text-white rounded-4xl p-8 sm:p-12 overflow-hidden relative border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-sky-500/20">
              <Sparkles size={12} /> Assistant IA Intégré
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Propulsé par Llama 3.3 de Meta
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Posez des questions techniques sur vos cours, demandez des synthèses automatiques de chapitres ou trouvez instantanément les réponses à vos interrogations académiques.
            </p>
            <div className="pt-2">
              <Link
                to="/chatbot"
                className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-6 py-3 rounded-2xl hover:bg-slate-100 hover:scale-[1.02] transition cursor-pointer"
              >
                Discuter avec l'IA <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="bg-slate-950/80 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-850">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
              <span className="text-[10px] font-bold text-slate-500 ml-2 uppercase">Llama 3.3 Chat</span>
            </div>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-slate-900 rounded-2xl text-slate-300 border border-slate-800 w-fit max-w-[85%]">
                Comment puis-je calculer la transformée de Laplace pour sin(wt) ?
              </div>
              <div className="p-3 bg-sky-900/40 rounded-2xl text-white border border-sky-850 w-fit max-w-[85%] ml-auto">
                La transformée de Laplace de <span className="font-mono font-bold text-sky-400">sin(wt)</span> est donnée par la formule : <br/>
                <span className="font-bold text-teal-300">F(s) = w / (s² + w²)</span> pour s &gt; 0.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EVENTS CAROUSEL/Timeline */}
      <section className="space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Agenda de l'AEI</h2>
          <p className="text-slate-500 text-sm">Ne manquez pas les moments forts de notre vie associative.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-lg transition group"
            >
              <div className="h-48 overflow-hidden bg-slate-100">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-3">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wide">{event.date}</span>
                <h3 className="font-bold text-slate-900 text-lg">{event.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{event.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="bg-slate-50 py-10 rounded-4xl px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-xs border border-slate-100 space-y-4">
              <div className="flex items-center gap-1.5 text-yellow-400">
                {"★".repeat(5)}
              </div>
              <p className="text-slate-600 text-sm italic leading-relaxed">
                "{test.quote}"
              </p>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{test.name}</h4>
                <p className="text-slate-400 text-xs font-medium">{test.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SPONSORS & SPONSORS */}
      <section className="text-center space-y-8">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Partenaires officiels du portail</p>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-60">
          {sponsors.map((spon, idx) => (
            <span
              key={idx}
              className="text-slate-700 font-black tracking-widest text-lg sm:text-2xl hover:opacity-100 transition-opacity"
            >
              {spon.logo}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

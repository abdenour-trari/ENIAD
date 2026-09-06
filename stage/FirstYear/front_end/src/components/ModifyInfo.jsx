import { useState, useEffect } from "react";
import Navbar from "./NavBar";
import { motion } from "framer-motion";

// Animations pro
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function ModifyInfo() {
  const [darkMode, setDarkMode] = useState(true);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/company");
        const data = await res.json();
        if (data.success && data.data) {
          setForm(data.data);
        }
      } catch (err) {
        console.error("Erreur récupération entreprise", err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("http://localhost:5000/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);

        // ✅ Le message s'affiche 4 secondes
        setTimeout(() => {
          setSuccess(false);
        }, 4000);
      } else {
        alert("❌ Erreur : " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = `
    w-full px-4 py-2 rounded-xl border outline-none transition-all duration-300
    focus:border-blue-500 focus:ring-2 focus:ring-blue-500
    ${
      darkMode
        ? "bg-[#0d1117] text-white border-gray-600"
        : "bg-white text-gray-900 border-gray-300"
    }
  `;

  return (
    <>
      {/* Navbar avec switch */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        openChat={() => {}}
        openAdvancedSearch={() => {}}
      />

      {/* Fond adaptatif */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`min-h-screen transition-colors duration-500 ${
          darkMode ? "bg-[#0d1117] text-gray-100" : "bg-gray-100 text-gray-900"
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Titre animé */}
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className={`text-center font-bold mb-6 text-2xl sm:text-3xl ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Modifier les informations de{" "}
            {form.name ? form.name : "l’entreprise"}
          </motion.h1>

          {/* Formulaire animé */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={`rounded-2xl shadow-lg p-6 space-y-6 transition-colors duration-500 ${
              darkMode ? "bg-[#161b22]" : "bg-white"
            }`}
          >
            {/* Nom de l’entreprise */}
            <motion.div variants={fadeInUp}>
              <label
                className={`block mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Nom de l’entreprise
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: NovaLuim SARL"
                className={inputClasses}
              />
            </motion.div>

            {/* Adresse */}
            <motion.div variants={fadeInUp}>
              <label
                className={`block mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Adresse
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Ex: 123 Rue Hassan II, Casablanca"
                className={inputClasses}
              />
            </motion.div>

            {/* Téléphone */}
            <motion.div variants={fadeInUp}>
              <label
                className={`block mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+212 6 12 34 56 78"
                className={inputClasses}
              />
            </motion.div>

            {/* Email */}
            <motion.div variants={fadeInUp}>
              <label
                className={`block mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contact@entreprise.com"
                className={inputClasses}
              />
            </motion.div>

            {/* Site Web */}
            <motion.div variants={fadeInUp}>
              <label
                className={`block mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Site Web
              </label>
              <input
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://www.entreprise.com"
                className={inputClasses}
              />
            </motion.div>

            {/* Bouton / Loader / Succès */}
            <motion.div variants={fadeInUp} className="flex justify-end">
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full"
                />
              ) : success ? (
                <span className="text-green-500 font-semibold">
                  ✅ Données enregistrées !
                </span>
              ) : (
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 15px rgba(37,99,235,0.6)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors"
                >
                  Enregistrer
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

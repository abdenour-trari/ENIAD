// src/App.jsx
import { use, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import MessageInput from "./components/MessageInput";
import AdvancedSearchForm from "./components/AdvancedSearchForm";
import AOAnalysis from "./components/AOAnalysis";
import { useNavigate } from "react-router-dom";
import ModifyInfo from "./components/ModifyInfo";

import { Link } from "react-router-dom";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  // Appels d'offres
  const [tenders, setTenders] = useState({});
  const [showTenders, setShowTenders] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  // AO détaillés
  const [detailedTenders, setDetailedTenders] = useState([]);
  const [showDetailed, setShowDetailed] = useState(false);
  const [loadingDetailed, setLoadingDetailed] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(detailedTenders.length / itemsPerPage);
  const currentItems = detailedTenders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Chatbot
  const [messages, setMessages] = useState([]);
  const [botLoading, setBotLoading] = useState(false);

  // Fenêtres flottantes
  const [chatOpen, setChatOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

  // Recherche simple
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "", // "success" ou "error"
    visible: false,
  });

  const navigate = useNavigate();

  const handleClick = (item) => {
    navigate("/ao-analysis", {
      state: { objet: item.objet, lien: item.lien, reference: item.reference },
    });
  };
  // Charger AO catégories
  const fetchTenders = () => {
    setLoading(true);
    fetch("http://localhost:5000/pmmp-categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTenders(data.data);
          setActiveCategory(Object.keys(data.data)[0]);
          setShowTenders(true);
          setShowDetailed(false);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  // Charger AO détaillés
  const fetchDetailedTenders = () => {
    setLoadingDetailed(true);
    fetch("http://localhost:5000/detailed-tenders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDetailedTenders(data.data);
          setShowDetailed(true);
          setShowSearch(false);
          setShowTenders(false);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingDetailed(false));
  };

  // Envoyer message chatbot
  // messages = useState([])
  // botLoading = useState(false)

  async function sendMessage(text) {
    if (!text.trim()) return;

    // 1. Ajouter le message user
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setBotLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (data.success) {
        if (Array.isArray(data.results) && data.results.length > 0) {
          // Si backend renvoie une liste d’AO
          const formatted = data.results
            .map(
              (r) =>
                `📌 Référence: ${r.reference}\n📄 Objet: ${r.objet}\n📅 Date: ${r.date}`
            )
            .join("\n\n");
          setMessages((prev) => [...prev, { sender: "bot", text: formatted }]);
        } else {
          // Réponse texte classique
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: data.reply || "Réponse vide." },
          ]);
        }
      } else {
        // Erreur backend
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "⚠️ Erreur : " + (data.error || "inconnue") },
        ]);
      }
    } catch (err) {
      // Erreur réseau
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Erreur réseau : " + err.message },
      ]);
    } finally {
      setBotLoading(false);
    }
  }

  async function refreshTenders() {
    setRefreshing(true); // afficher le loader
    try {
      const response = await fetch("http://localhost:5000/update-tenders");
      const result = await response.json();

      if (result.success) {
        setNotification({
          message: "✅ AO mis à jour !",
          type: "success",
          visible: true,
        });
        fetchDetailedTenders();
      } else {
        setNotification({
          message: "❌ Erreur : " + result.error,
          type: "error",
          visible: true,
        });
      }

      // Cacher la notification après 3 secondes
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, visible: false }));
      }, 3000);
      setCurrentPage(1);
    } catch (err) {
      setNotification({
        message: "⚠️ Erreur réseau : " + err,
        type: "error",
        visible: true,
      });

      setTimeout(() => {
        setNotification((prev) => ({ ...prev, visible: false }));
      }, 3000);
    } finally {
      setRefreshing(false); // cacher le loader
    }
  }

  // Nouvelle fonction pour recherche avancée
  const handleAdvancedSearch = (criteria) => {
    let results = detailedTenders.filter((item) => {
      const refMatch = criteria.reference
        ? item.reference
            .toLowerCase()
            .includes(criteria.reference.toLowerCase())
        : true;

      const objetMatch = criteria.objet
        ? item.objet.toLowerCase().includes(criteria.objet.toLowerCase())
        : true;

      const acheteurMatch = criteria.acheteur
        ? item.acheteur.toLowerCase().includes(criteria.acheteur.toLowerCase())
        : true;

      const lieuMatch = criteria.lieu
        ? item.lieu.toLowerCase().includes(criteria.lieu.toLowerCase())
        : true;

      const procedureMatch = criteria.procedure
        ? item.procedure
            .toLowerCase()
            .includes(criteria.procedure.toLowerCase())
        : true;

      const categorieMatch = criteria.categorie
        ? (item.categorie || "").toLowerCase() ===
          criteria.categorie.toLowerCase()
        : true;

      const dateFromMatch = criteria.dateFrom
        ? new Date(item.date) >= new Date(criteria.dateFrom)
        : true;

      const dateToMatch = criteria.dateTo
        ? new Date(item.date) <= new Date(criteria.dateTo)
        : true;

      return (
        refMatch &&
        objetMatch &&
        acheteurMatch &&
        lieuMatch &&
        procedureMatch &&
        categorieMatch &&
        dateFromMatch &&
        dateToMatch
      );
    });
    setCurrentPage(1);
    setSearchResults(results);
    setShowSearch(true);
    setAdvancedSearchOpen(false);
  };

  // Recherche AO par mot-clé
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    let results = [];
    if (showTenders) {
      Object.keys(tenders).forEach((cat) => {
        tenders[cat].forEach((item) => {
          if (item.sector.toLowerCase().includes(query.toLowerCase())) {
            results.push(`${cat} → ${item.sector}: ${item.count}`);
          }
        });
      });
    } else if (showDetailed) {
      results = detailedTenders.filter(
        (item) =>
          item.reference.toLowerCase().includes(query.toLowerCase()) ||
          item.objet.toLowerCase().includes(query.toLowerCase()) ||
          item.acheteur.toLowerCase().includes(query.toLowerCase())
      );
    }

    setSearchResults(results);
    setCurrentPage(1);
    setShowSearch(true);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div
            className={`min-h-screen flex flex-col ${
              darkMode
                ? "bg-[#0d1117] text-gray-200"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            {/* NavBar */}
            <Navbar
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              setSearchQuery={handleSearch}
              openChat={() => {
                setChatOpen(true);
                setAdvancedSearchOpen(false);
              }}
              openAdvancedSearch={() => {
                setAdvancedSearchOpen(true);
                setChatOpen(false);
              }}
            />

            {/* Main content */}
            <div className="flex flex-col md:flex-row flex-1 p-4 md:p-6 gap-4 md:gap-6">
              {/* Appels d'offres */}
              <div className="w-full">
                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    onClick={fetchTenders}
                    className="btn-ao bg-blue-600 text-white px-3 py-2 rounded bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 
              hover:from-blue-700 hover:via-blue-600 hover:to-sky-600 transition-colors duration-300 w-full sm:w-auto"
                  >
                    Afficher les derniers AO
                  </button>

                  <button
                    onClick={fetchDetailedTenders}
                    className="btn-ao bg-blue-600 text-white px-3 py-2 rounded bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500
              hover:from-blue-700 hover:via-blue-600 hover:to-sky-600 transition-colors duration-300 w-full sm:w-auto"
                  >
                    Afficher AO détaillés
                  </button>

                  <button
                    onClick={refreshTenders}
                    className="btn-ao bg-blue-600 text-white px-3 py-2 rounded bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500
              hover:from-blue-700 hover:via-blue-600 hover:to-sky-600 transition-colors duration-300 w-full sm:w-auto"
                  >
                    Actualiser les AO
                  </button>

                  <Link to="/Info-Entreprise">
                    <button
                      className="btn-ao bg-blue-600 text-white px-3 py-2 rounded bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500
                  hover:from-blue-700 hover:via-blue-600 hover:to-sky-600 transition-colors duration-300 w-full sm:w-full"
                    >
                      Modifier les Informations de l'entreprise
                    </button>
                  </Link>
                </div>

                {/* AO catégories */}
                {showTenders && (
                  <div
                    className={`rounded-lg shadow p-4 overflow-x-auto ${
                      darkMode
                        ? "bg-[#161b22] border border-[#30363d]"
                        : "bg-white border border-gray-300"
                    }`}
                  >
                    {loading ? (
                      <div className="text-center text-gray-500">
                        ⏳ Chargement...
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2 border-b border-gray-500 pb-2 mb-4 overflow-x-auto">
                          {Object.keys(tenders).map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setActiveCategory(cat)}
                              className={`px-4 py-2 rounded-t-md text-sm font-medium cursor-pointer ${
                                activeCategory === cat
                                  ? "bg-blue-600 text-white"
                                  : darkMode
                                  ? "bg-[#21262d] text-gray-300 hover:bg-[#30363d]"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {activeCategory && (
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr
                                  className={
                                    darkMode
                                      ? "bg-[#21262d] text-gray-200"
                                      : "bg-gray-200 text-gray-800"
                                  }
                                >
                                  <th className="px-4 py-2 text-left border border-gray-600">
                                    Secteur
                                  </th>
                                  <th className="px-4 py-2 w-l text-left border border-gray-600">
                                    Nombre
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {tenders[activeCategory].map((item, i) => (
                                  <tr
                                    key={i}
                                    className={
                                      darkMode
                                        ? "hover:bg-[#2d333b]"
                                        : "hover:bg-gray-100"
                                    }
                                  >
                                    <td className="px-4 py-2 border border-gray-600">
                                      {item.sector}
                                    </td>
                                    <td className="px-4 py-2 w-[15%] border border-gray-600 font-semibold">
                                      {item.count}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* AO détaillés */}
                {showDetailed && (
                  <div
                    className={`rounded-lg shadow p-4 ${
                      darkMode
                        ? "bg-[#161b22] border border-[#30363d]"
                        : "bg-white border border-gray-300"
                    }`}
                  >
                    {(() => {
                      const dataToDisplay = showSearch
                        ? searchResults
                        : detailedTenders;
                      const totalPages = Math.ceil(
                        dataToDisplay.length / itemsPerPage
                      );
                      const paginatedData = dataToDisplay.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      );

                      return (
                        <>
                          {dataToDisplay.length === 0 ? (
                            <div className="text-center text-gray-500">
                              {showSearch
                                ? "Aucun résultat trouvé"
                                : "Aucun appel d'offres"}
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {paginatedData.map((item, i) => (
                                  <div
                                    onClick={() => handleClick(item)}
                                    key={i}
                                    href={item.lien}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`cursor-pointer block rounded-xl p-4 shadow-md transition transform hover:scale-[1.02] ${
                                      darkMode
                                        ? "bg-[#21262d] border border-[#30363d] hover:bg-[#2d333b]"
                                        : "bg-white border border-gray-300 hover:bg-gray-100"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-bold text-blue-500">
                                        {item.reference}
                                      </span>
                                      <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
                                        {item.categorie || "N/A"}
                                      </span>
                                    </div>

                                    <h3 className="text-base font-semibold mb-2 line-clamp-2">
                                      {item.objet}
                                    </h3>

                                    <p
                                      className={`mb-1 ${
                                        darkMode
                                          ? "text-sm text-gray-400"
                                          : "text-sm text-gray-500"
                                      }`}
                                    >
                                      🏢 {item.acheteur}
                                    </p>

                                    <p
                                      className={`mb-1 ${
                                        darkMode
                                          ? "text-sm text-gray-400"
                                          : "text-sm text-gray-500"
                                      }`}
                                    >
                                      📍 {item.lieu}
                                    </p>

                                    <p
                                      className={`mb-1 ${
                                        darkMode
                                          ? "text-sm text-gray-400"
                                          : "text-sm text-gray-500"
                                      }`}
                                    >
                                      ⚖ {item.procedure}
                                    </p>

                                    {item.date && (
                                      <p
                                        className={`mb-1 ${
                                          darkMode
                                            ? "text-sm text-gray-400"
                                            : "text-sm text-gray-500"
                                        }`}
                                      >
                                        🗓 {item.date}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-center items-center mt-4 space-x-2 flex-wrap gap-2">
                                <button
                                  disabled={currentPage === 1}
                                  onClick={() => setCurrentPage((p) => p - 1)}
                                  className="px-3 py-1 rounded bg-transparent cursor-pointer hover:bg-gray-400 disabled:opacity-50"
                                >
                                  ◀
                                </button>
                                <span className="px-2">
                                  Page {currentPage} / {totalPages}
                                </span>
                                <button
                                  disabled={currentPage === totalPages}
                                  onClick={() => setCurrentPage((p) => p + 1)}
                                  className="px-3 py-1 rounded bg-transparent cursor-pointer hover:bg-gray-400 disabled:opacity-50"
                                >
                                  ▶
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {notification.visible && (
              <div
                className={`fixed top-[80px] left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white z-50 transition-all duration-300 ${
                  notification.type === "success"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {notification.message}
              </div>
            )}

            {/* Loader central */}
            {refreshing && (
              <div className="Loader fixed inset-0 flex items-center justify-center bg-opacity-70 z-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                <span className="text-white text-lg font-medium">
                  Actualisation en cours...
                </span>
              </div>
            )}

            {/* Chat flottant */}
            {chatOpen && (
              <div className="bg fixed inset-0 flex items-center justify-center z-50 p-2">
                <div
                  className={`w-full sm:w-3/4 md:w-1/3 max-w-[1500px] bg-white dark:bg-[#161b22] border ${
                    darkMode ? "border-[#30363d]" : "border-gray-300"
                  } rounded-2xl shadow-2xl flex flex-col`}
                  style={{ maxHeight: "90vh" }}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center px-4 py-3 border-b dark:border-[#30363d] border-gray-300">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      💬 Chatbot
                    </h2>
                    <button
                      onClick={() => setChatOpen(false)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      ✖
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          msg.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap break-words ${
                            msg.sender === "user"
                              ? "bg-blue-500 text-white rounded-br-none"
                              : "bg-gray-200 dark:bg-[#21262d] dark:text-gray-200 rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {botLoading && (
                      <div className="flex justify-start">
                        <div className="px-3 py-2 rounded-lg text-sm bg-gray-200 dark:bg-[#21262d] animate-pulse">
                          ...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="border-t dark:border-[#30363d] border-gray-300 p-2">
                    <MessageInput
                      onSend={sendMessage}
                      disabled={botLoading}
                      darkMode={darkMode}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Recherche avancée flottante */}
            {advancedSearchOpen && (
              <div className="bg fixed inset-0 flex items-center justify-center z-50 p-2">
                <div
                  className={`w-full sm:w-3/4 md:w-1/3  bg-white dark:bg-[#161b22] border ${
                    darkMode ? "border-[#30363d]" : "border-gray-300"
                  } rounded-lg shadow-lg p-4`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-white">
                      🔍 Recherche Avancée
                    </h2>
                    <button
                      onClick={() => setAdvancedSearchOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✖
                    </button>
                  </div>
                  <AdvancedSearchForm
                    darkMode={darkMode}
                    onSearch={handleAdvancedSearch}
                  />
                </div>
              </div>
            )}
          </div>
        }
      />
      <Route path="/ao-analysis" element={<AOAnalysis />} />
      <Route path="/Info-Entreprise" element={<ModifyInfo />} />
    </Routes>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Home, ShoppingBag, Eye, Trash2, CheckCircle2, RefreshCw } from "lucide-react";

import { apiFetch } from "../lib/api";
import { useHousingDraft } from "../hooks/useHousingDraft";
import { useAuth } from "../context/AuthContext";
import { CreateProductModal } from "../components/marketplace/CreateProductModal";

export default function MyAnnoncePage() {
  const { setIsOpen: setIsHousingOpen } = useHousingDraft();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("housing"); // 'housing' or 'marketplace'
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProductOpen, setIsProductOpen] = useState(false);
  
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);

  // Fetch list when tab or user changes
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setAnnonces([]);
    setPage(1);

    const apiPath = activeTab === "housing" ? "/api/housing" : "/api/marketplace";

    apiFetch(`${apiPath}?user_id=${user.id}&start=0&end=999`)
      .then((data) => {
        setAnnonces(data?.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error fetching user ${activeTab} posts:`, err);
        setLoading(false);
      });
  }, [user, activeTab]);

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      return;
    }
    const apiPath = activeTab === "housing" ? "/api/housing" : "/api/marketplace";
    try {
      await apiFetch(`${apiPath}?id=${id}`, {
        method: "DELETE"
      });
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Erreur lors de la suppression de l'annonce.");
    }
  };

  const handleToggleSold = async (id, currentStatus) => {
    const nextStatus = currentStatus === "sold" ? "published" : "sold";
    try {
      await apiFetch(`/api/marketplace?id=${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus })
      });
      setAnnonces((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
      );
    } catch (err) {
      console.error("Error toggling sold status:", err);
      alert("Erreur lors du changement d'état.");
    }
  };

  const totalPages = Math.ceil(annonces.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const displayedAnnonces = annonces.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      {/* Header Banner */}
      <header className="bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-4">
        <h1 className="text-3xl font-bold">Mon Tableau de Bord</h1>
        <p className="text-white/90 mt-1">
          Gérez vos colocations et vos produits en vente au même endroit.
        </p>
      </header>

      {/* Tabs Selector & Publish Button Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-2">
        {/* Sleek Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit gap-1 shrink-0">
          <button
            onClick={() => setActiveTab("housing")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "housing"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Home size={14} />
            <span>Colocations</span>
          </button>
          
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "marketplace"
                ? "bg-white text-pink-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShoppingBag size={14} />
            <span>Marketplace</span>
          </button>
        </div>

        {/* Dynamic Publish Button */}
        {activeTab === "housing" ? (
          <button 
            onClick={() => setIsHousingOpen(true)}
            className="bg-linear-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md hover:opacity-95 transition-transform hover:scale-102 cursor-pointer w-fit"
          >
            + Publier un logement
          </button>
        ) : (
          <button 
            onClick={() => setIsProductOpen(true)}
            className="bg-linear-to-r from-pink-500 to-rose-650 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md hover:opacity-95 transition-transform hover:scale-102 cursor-pointer w-fit"
          >
            + Vendre un produit
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-400" size={48} />
          </div>
        ) : displayedAnnonces.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm font-semibold">
            {activeTab === "housing"
              ? "Vous n'avez encore publié aucun logement en colocation."
              : "Vous n'avez encore publié aucun produit sur la marketplace."}
          </div>
        ) : (
          displayedAnnonces.map((item, index) => {
            const coverImage = item.image || item.image_url || (item.images && item.images[0]) || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800";
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={item.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md border border-slate-100 transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 w-full overflow-hidden relative bg-slate-50">
                    <img
                      src={coverImage}
                      alt={item.title || item.titre}
                      className="w-full h-full object-cover"
                    />
                    
                    {activeTab === "marketplace" && (
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        item.status === "sold" ? "bg-slate-800 text-white" : "bg-emerald-500 text-white"
                      }`}>
                        {item.status === "sold" ? "Vendu" : "En vente"}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full ${
                        activeTab === "housing" ? "bg-sky-50 text-sky-700" : "bg-pink-50 text-pink-700"
                      }`}>
                        {activeTab === "housing" ? (item.location || "Logement") : (item.category || "Produit")}
                      </span>
                    </div>

                    <h2 className="text-lg font-extrabold text-slate-800 line-clamp-1">
                      {item.title || item.titre || item.nom}
                    </h2>
                    
                    <p className={`font-black text-lg ${activeTab === "housing" ? "text-sky-600" : "text-emerald-600"}`}>
                      {item.price || item.prix} DH{activeTab === "housing" && <span className="text-xs font-normal text-slate-400">/mois</span>}
                    </p>

                    <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">
                      {item.description || item.desc}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-50">
                    {activeTab === "marketplace" && (
                      <button
                        onClick={() => handleToggleSold(item.id, item.status)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-extrabold transition active:scale-97 cursor-pointer ${
                          item.status === "sold"
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {item.status === "sold" ? (
                          <>
                            <RefreshCw size={12} />
                            <span>Remettre en vente</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={12} />
                            <span>Marquer Vendu</span>
                          </>
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 active:scale-97 text-red-600 rounded-xl text-[10px] font-extrabold transition ml-auto cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8 items-center shrink-0">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="cursor-pointer"
          >
            <ChevronLeft />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? "default" : "outline"}
              onClick={() => setPage(i + 1)}
              className="cursor-pointer"
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="cursor-pointer"
          >
            <ChevronRight />
          </Button>
        </div>
      )}

      {/* Sell Product Modal overlay */}
      <CreateProductModal isOpen={isProductOpen} onClose={() => setIsProductOpen(false)} />
    </div>
  );
}

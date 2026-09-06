import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, Heart, Share2, Wifi, Car, Maximize2, Users, MapPin, Calendar, Flame, Sparkles, Eye, Info } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { LazyImage } from "@/components/ui/LazyImage";
import { ImageSkeleton } from "@/components/ui/ImageSkeleton";
import { useVirtualGrid } from "@/hooks/useVirtualGrid";
import { useHousingDraft } from "@/hooks/useHousingDraft";
import { useInfinitePagination } from "@/hooks/useInfinitePagination";
import { useIntersectionLoader } from "@/hooks/useIntersectionLoader";
import { fetchPaginatedHousing } from "@/services/pagination";
import { supabase } from "@/lib/supabaseClient";
import { useFavorites } from "@/hooks/useFavorites";

// Empty State component for filtered queries yielding no results
function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-xs">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <Info size={28} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">Aucune annonce trouvée</h3>
      <p className="text-slate-500 text-sm max-w-sm mb-6">
        Nous n'avons trouvé aucune colocation correspondant à vos critères de recherche.
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="px-5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-xl text-xs font-bold transition duration-300"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}

// Inner card component to isolate rendering scope
export function ColocationCard({ annonce, index, priority }) {
  const { toggleHousingFavorite, isHousingFavorite } = useFavorites();
  const isFav = isHousingFavorite(annonce.id);

  const calculateScore = (item) => {
    let score = 30; // base score for title & location
    if (item.desc || item.description) score += 15;
    if (item.cover || item.cover_url) score += 25;
    if (item.surface) score += 10;
    if (item.roommates_count || item.roommatesCount) score += 10;
    if (item.wifi) score += 5;
    if (item.parking) score += 5;
    if (item.clim) score += 5;
    return Math.min(score, 100);
  };

  const isNew = (item) => {
    if (!item.created_at) return false;
    const created = new Date(item.created_at);
    const diffTime = Math.abs(new Date() - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleHousingFavorite(annonce.id, annonce.nom || annonce.title || "Colocation");
  };

  const coverImage = annonce.cover || annonce.cover_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800";


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ 
        delay: Math.min(index * 0.03, 0.3),
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="bg-white rounded-3xl border border-slate-100 hover:shadow-2xl hover:border-slate-200/80 transition-all duration-300 overflow-hidden flex flex-col h-[520px] group relative"
    >
      {/* Aspect Ratio 16/10 Container for cover image */}
      <div className="aspect-16/10 w-full overflow-hidden shrink-0 relative bg-slate-100">
        <LazyImage
          src={coverImage}
          alt={annonce.nom || annonce.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          width={800}
          quality={75}
          priority={priority}
          placeholder={annonce.cover_blur}
        />
        
        {/* Discretionary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Badges container */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {isNew(annonce) && (
            <span className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-sm">
              <Sparkles size={10} /> Nouveau
            </span>
          )}
          <span className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-sm">
            Disponible
          </span>
        </div>

        {/* Announcement Score Badge */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2.5 py-1 bg-white/85 backdrop-blur-xs text-slate-800 text-[10px] font-black rounded-full shadow-sm border border-white/40">
          <Flame size={10} className="text-orange-500" />
          <span>Score: {calculateScore(annonce)}%</span>
        </div>
      </div>

      {/* Card Info and details container */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          {/* Header metadata */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-450 font-bold uppercase tracking-wider">
              <MapPin size={12} className="text-slate-400 shrink-0" />
              <span>{annonce.ville || annonce.location}</span>
              {annonce.distance_to_campus !== undefined && (
                <>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                  <span>{annonce.distance_to_campus} km du campus</span>
                </>
              )}
            </div>
            <h2 className="font-extrabold text-slate-800 text-lg leading-snug line-clamp-1 group-hover:text-sky-600 transition-colors">
              {annonce.nom || annonce.title}
            </h2>
          </div>

          {/* Core specifications/icons body */}
          <div className="flex flex-wrap gap-2 mb-4">
            {annonce.surface && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg border border-slate-100">
                <Maximize2 size={12} /> {annonce.surface} m²
              </span>
            )}
            <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg border border-slate-100">
              <Users size={12} /> {annonce.roommates_count || annonce.roommatesCount || 0} colocs
            </span>
            {annonce.wifi && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-lg border border-sky-100">
                <Wifi size={12} /> Wifi
              </span>
            )}
            {annonce.parking && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100">
                <Car size={12} /> Parking
              </span>
            )}
          </div>

          {/* Description Snippet */}
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
            {annonce.desc || annonce.description || "Aucune description fournie pour ce logement."}
          </p>
        </div>

        {/* Footer specifications, pricing and actions */}
        <div className="space-y-4">
          <div className="flex items-end justify-between border-t border-slate-50 pt-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Loyer</span>
              <div className="text-2xl font-black text-sky-600 tracking-tight transition-transform duration-300 hover:scale-102">
                {annonce.prix || annonce.price} DH<span className="text-xs font-medium text-slate-500">/mois</span>
              </div>
            </div>
            
            <div className="text-right text-[10px] text-slate-400 font-semibold flex flex-col items-end gap-1">
              <span className="flex items-center gap-1">
                <Calendar size={10} /> Il y a {annonce.posted || 2} j.
              </span>
              {annonce.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye size={10} /> {annonce.views} vues
                </span>
              )}
            </div>
          </div>

          {/* Buttons Actions */}
          <div className="flex gap-2 items-center">
            <button className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-sky-500/20 active:scale-[0.98] transition-all duration-300">
              Voir détails
            </button>

            {/* Share action */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(window.location.origin + `/colocation?id=${annonce.id}`);
                alert("Lien de l'annonce copié dans le presse-papiers !");
              }}
              title="Partager l'annonce"
              className="p-2.5 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 text-slate-500 rounded-xl transition border border-slate-100"
            >
              <Share2 size={14} />
            </button>

            {/* Favorite animated Heart toggle */}
            <button 
              onClick={handleFavoriteClick}
              title="Ajouter aux favoris"
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition border border-slate-100 relative"
            >
              <motion.div
                animate={{ scale: isFav ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className={isFav ? "text-rose-500" : "text-slate-400 hover:text-rose-500"}
              >
                <Heart size={14} fill={isFav ? "currentColor" : "none"} />
              </motion.div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ColocationPage() {
  const { setIsOpen } = useHousingDraft();
  const queryClient = useQueryClient();

  // STATES FILTRES
  const [ville, setVille] = useState("");
  const [prix, setPrix] = useState("");
  const [date, setDate] = useState("");

  const filters = useMemo(() => ({
    ville,
    prix,
    date
  }), [ville, prix, date]);

  // Infinite Scroll Hook - loads 12 at first, then 12 more using API pagination
  const {
    items: annonces,
    hasMore,
    loading: isLoading,
    loadMore
  } = useInfinitePagination({
    queryKey: ["housing_posts"],
    fetchFn: fetchPaginatedHousing,
    size: 12,
    filters
  });

  // Intersection observer hook with 500ms debounce
  const loaderRef = useIntersectionLoader({
    loadMore,
    hasMore,
    loading: isLoading
  });

  // Realtime subscription for instant updates on the query
  useEffect(() => {
    const channel = supabase
      .channel("realtime-housing")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "housing_posts"
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["housing_posts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const villes = ["Berkane", "Oujda", "Saidia", "Nador"];

  const handleClearFilters = () => {
    setVille("");
    setPrix("");
    setDate("");
  };

  // Virtual Grid Hook - virtualizes if list exceeds 30 items
  const {
    containerRef,
    totalHeight,
    visibleRows,
    isVirtual
  } = useVirtualGrid({
    items: annonces,
    itemHeight: 520,
    overscan: 2
  });

  const isInitialLoading = isLoading && annonces.length === 0;

  return (
    <div className="space-y-8 lg:p-6 md:p-4 p-2">
      <header className="bg-linear-to-r from-sky-600 to-orange-500 text-white p-6 rounded-xl shadow-lg mb-10">
        <h1 className="text-3xl font-bold">Annonces de Colocation</h1>
        <p className="text-white/90 mt-1">
          Explorez les annonces postées par les étudiants.
        </p>
      </header>

      {/* FILTRES */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-10 flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-gray-700 font-semibold mb-1">
            Emplacement
          </label>
          <select
            value={ville}
            onChange={(e) => {
              setVille(e.target.value);
            }}
            className="border rounded-xl px-4 py-2"
          >
            <option value="">Toutes les villes</option>
            {villes.map((v, index) => (
              <option key={index} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-gray-700 font-semibold mb-1">Prix</label>
          <select
            value={prix}
            onChange={(e) => {
              setPrix(e.target.value);
            }}
            className="border rounded-xl px-4 py-2"
          >
            <option value="">Par défaut</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>

        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-gray-700 font-semibold mb-1">
            Date de publication
          </label>
          <select
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
            }}
            className="border rounded-xl px-4 py-2"
          >
            <option value="">Par défaut</option>
            <option value="recent">Plus récent</option>
            <option value="old">Plus ancien</option>
          </select>
        </div>
      </div>

      {/* GRID ANNONCES */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100 flex flex-col h-[520px]">
              <div className="h-48 w-full shrink-0">
                <ImageSkeleton />
              </div>
              <div className="p-6 flex flex-col justify-between flex-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded-md animate-pulse w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded-md animate-pulse w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded-md animate-pulse w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded-md animate-pulse w-full"></div>
                    <div className="h-3 bg-slate-200 rounded-md animate-pulse w-5/6"></div>
                  </div>
                </div>
                <div>
                  <div className="h-6 bg-slate-200 rounded-md animate-pulse w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded-md animate-pulse w-1/4 mb-4"></div>
                  <div className="h-10 bg-slate-200 rounded-xl animate-pulse w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : annonces.length === 0 ? (
        <EmptyState onClear={handleClearFilters} />
      ) : isVirtual ? (
        // Virtualized grid for high counts
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden"
          style={{ height: `${totalHeight}px` }}
        >
          {visibleRows.map(({ rowIndex, offsetTop, items: rowItems }) => (
            <div
              key={rowIndex}
              className="absolute left-0 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
              style={{ top: `${offsetTop}px`, height: "520px" }}
            >
              {rowItems.map((annonce, colIndex) => {
                const globalIndex = rowIndex * 3 + colIndex;
                const isPriority = globalIndex < 3; // Preload top 3 images visible on screen
                return (
                  <ColocationCard
                    key={annonce.id}
                    annonce={annonce}
                    index={globalIndex}
                    priority={isPriority}
                  />
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        // Non-virtualized grid for smaller layouts
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {annonces.map((annonce, index) => {
            const isPriority = index < 3; // Preload top 3 images
            return (
              <ColocationCard
                key={annonce.id}
                annonce={annonce}
                index={index}
                priority={isPriority}
              />
            );
          })}
        </div>
      )}

      {/* Infinite scroll sensor and loader indicator */}
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-10">
          <Loader2 className="animate-spin text-sky-600" size={32} />
        </div>
      )}

      {/* End of list message */}
      {!hasMore && annonces.length > 0 && (
        <div className="text-center py-12 border-t border-slate-100 mt-10">
          <p className="text-slate-400 font-semibold text-sm">
            🎉 Vous êtes arrivé à la fin. Explorer autre chose.
          </p>
        </div>
      )}

      {/* Bouton publier */}
      <div className="flex justify-end mt-12">
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-linear-to-r from-green-500 to-emerald-600 text-white px-7 py-3 rounded-2xl font-semibold hover:opacity-90 transition shadow-lg"
        >
          Publier une annonce
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Search, ShoppingBag, Loader2, Sparkles, SlidersHorizontal, Info } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useVirtualGrid } from "@/hooks/useVirtualGrid";
import { ImageSkeleton } from "@/components/ui/ImageSkeleton";

import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { useMarketplace } from "@/hooks/useMarketplace";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { CreateProductModal } from "@/components/marketplace/CreateProductModal";
import { ProductPreview } from "@/components/marketplace/ProductPreview";

function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-xs w-full col-span-full">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <Info size={28} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">Aucun produit trouvé</h3>
      <p className="text-slate-500 text-sm max-w-sm mb-6">
        Nous n'avons trouvé aucun article correspondant à vos critères de recherche.
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="px-5 py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-650 rounded-xl text-xs font-bold transition duration-300 cursor-pointer"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}

function MarketPlaceContent() {
  const {
    products,
    favorites,
    loading,
    hasMore,
    totalCount,
    search,
    filterCat,
    filterVille,
    sort,
    setSearch,
    setFilterCat,
    setFilterVille,
    setSort,
    loadMore,
    toggleFavorite,
    logView,
    clearFilters
  } = useMarketplace();

  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ["Informatique", "Téléphone", "Accessoires", "Mobilier", "Livres", "Vêtements", "Autres"];
  const villes = ["Berkane", "Oujda", "Saidia", "Nador"];
  const triOptions = ["Récent", "Ancien", "Prix: Croissant", "Prix: Décroissant"];

  const handleSeeDetails = (product) => {
    setSelectedProduct(product);
    logView(product.id);
  };

  // Virtual Grid Hook - active if items count exceeds 30
  const {
    containerRef,
    totalHeight,
    visibleRows,
    isVirtual
  } = useVirtualGrid({
    items: products,
    itemHeight: 520,
    overscan: 2
  });

  const isInitialLoading = loading && products.length === 0;

  return (
    <div className="space-y-8 lg:p-6 md:p-4 p-2 relative">
      {/* Sticky Top-Right Banner Actions Bar */}
      <div className="sticky top-4 z-40 flex justify-end shrink-0 pointer-events-none">
        <button
          onClick={() => setIsPublishOpen(true)}
          className="pointer-events-auto bg-linear-to-r from-pink-500 to-rose-650 text-white px-6 py-3.5 rounded-2xl font-black hover:opacity-95 active:scale-97 transition-all shadow-xl shadow-pink-500/10 flex items-center gap-2 text-xs md:text-sm cursor-pointer"
        >
          <ShoppingBag size={16} />
          <span>Publier un produit</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="rounded-[32px] p-8 md:p-12 bg-linear-to-r from-purple-600 via-pink-500 to-orange-400 text-white shadow-xl relative overflow-hidden mb-12">
        <div className="relative z-10 max-w-xl">
          <span className="flex items-center gap-1 bg-white/15 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit mb-4">
            <Sparkles size={10} /> Portail AEI
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Marketplace Étudiante
          </h1>
          <p className="text-sm sm:text-base mt-3 opacity-90 leading-relaxed font-semibold">
            Achetez, vendez ou échangez vos objets en toute confiance entre étudiants.
          </p>
          <div className="mt-6 text-xs font-bold bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl w-fit">
            🛒 {totalCount === 0 ? "Aucun produit" : totalCount === 1 ? "1 produit disponible" : `${totalCount} produits disponibles`}
          </div>
        </div>
        
        {/* Soft background shape */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[350px] h-[350px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xl mb-10 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-1">
          <SlidersHorizontal size={14} className="text-slate-400" />
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            Filtres de recherche
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Que recherchez-vous..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 text-slate-800 text-xs md:text-sm outline-none transition"
            />
          </div>

          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="border border-slate-200 p-3 rounded-2xl text-xs md:text-sm text-slate-700 outline-none focus:border-pink-500 transition"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filterVille}
            onChange={(e) => setFilterVille(e.target.value)}
            className="border border-slate-200 p-3 rounded-2xl text-xs md:text-sm text-slate-700 outline-none focus:border-pink-500 transition"
          >
            <option value="">Toutes les villes</option>
            {villes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-slate-200 p-3 rounded-2xl text-xs md:text-sm text-slate-700 outline-none focus:border-pink-500 transition"
          >
            <option value="">Trier par</option>
            {triOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Display Section */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col h-[500px]">
              <div className="h-48 sm:h-56 w-full shrink-0">
                <ImageSkeleton />
              </div>
              <div className="p-6 flex flex-col justify-between flex-1">
                <div className="space-y-3">
                  <div className="h-5 bg-slate-100 rounded-md animate-pulse w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded-md animate-pulse w-1/3"></div>
                  <div className="h-6 bg-slate-100 rounded-full animate-pulse w-1/4"></div>
                </div>
                <div>
                  <div className="h-7 bg-slate-100 rounded-md animate-pulse w-1/3 mb-2"></div>
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState onClear={clearFilters} />
      ) : isVirtual ? (
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden"
          style={{ height: `${totalHeight}px` }}
        >
          {visibleRows.map(({ rowIndex, offsetTop, items: rowItems }) => (
            <div
              key={rowIndex}
              className="absolute left-0 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              style={{ top: `${offsetTop}px`, height: "500px" }}
            >
              {rowItems.map((p, colIndex) => {
                const globalIndex = rowIndex * 4 + colIndex;
                const isPriority = globalIndex < 4;
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    index={globalIndex}
                    priority={isPriority}
                    isFavorite={favorites.has(p.id)}
                    onToggleFavorite={toggleFavorite}
                    onSeeDetails={handleSeeDetails}
                  />
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((p, index) => {
            const isPriority = index < 4;
            return (
              <ProductCard
                key={p.id}
                product={p}
                index={index}
                priority={isPriority}
                isFavorite={favorites.has(p.id)}
                onToggleFavorite={toggleFavorite}
                onSeeDetails={handleSeeDetails}
              />
            );
          })}
        </div>
      )}

      {/* Infinite Scroll Sensor */}
      {hasMore && (
        <div ref={loadMore} className="flex justify-center py-12 shrink-0">
          <Loader2 className="animate-spin text-pink-500" size={32} />
        </div>
      )}

      {/* End of list message */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-12 border-t border-slate-100 mt-10 shrink-0">
          <p className="text-slate-400 font-semibold text-sm">
            🎉 Vous êtes arrivé à la fin. Explorez autre chose.
          </p>
        </div>
      )}

      {/* Modals & Overlays */}
      <CreateProductModal isOpen={isPublishOpen} onClose={() => setIsPublishOpen(false)} />

      <AnimatePresence>
        {selectedProduct && (
          <ProductPreview
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            isFavorite={favorites.has(selectedProduct.id)}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MarketPlacePage() {
  return (
    <MarketplaceProvider>
      <MarketPlaceContent />
    </MarketplaceProvider>
  );
}

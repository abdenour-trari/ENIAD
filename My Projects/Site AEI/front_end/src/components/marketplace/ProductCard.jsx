import { useState } from "react";
import { MapPin, Tag, Calendar, Heart, Share2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { LazyImage } from "../ui/LazyImage";

export function ProductCard({ product, index, priority = false, isFavorite = false, onToggleFavorite, onSeeDetails }) {
  const coverImage = product.img || product.image_url || "https://images.pexels.com/photos/18105/pexels-photo.jpg";

  const conditionColors = {
    neuf: "bg-emerald-500 text-white shadow-sm",
    "très bon": "bg-green-550 text-white shadow-sm",
    bon: "bg-blue-500 text-white shadow-sm",
    acceptable: "bg-amber-500 text-white shadow-sm"
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + `/marketplace?id=${product.id}`);
    alert("Lien du produit copié dans le presse-papiers !");
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{
        delay: Math.min(index * 0.03, 0.3),
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      onClick={() => onSeeDetails(product)}
      className="bg-white rounded-3xl border border-slate-100 hover:shadow-2xl hover:border-slate-200/80 transition-all duration-300 overflow-hidden flex flex-col h-[500px] group relative cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="aspect-16/10 w-full overflow-hidden shrink-0 relative bg-slate-100">
        <LazyImage
          src={coverImage}
          alt={product.titre || product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          width={400}
          quality={75}
          priority={priority}
          placeholder={product.image_blur}
        />
        
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Category tag */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <span className="flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold rounded-full shadow-xs border border-white/40">
            <Tag size={10} className="text-pink-500" />
            {product.categorie || product.category}
          </span>
        </div>

        {/* Condition Tag */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`flex items-center px-3 py-1 text-[10px] font-bold rounded-full ${
            conditionColors[product.condition || "bon"]
          }`}>
            {product.condition || "Bon état"}
          </span>
        </div>
      </div>

      {/* Details Box */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          {/* Header Metadata */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-450 font-bold uppercase tracking-wider">
              <MapPin size={12} className="text-slate-400 shrink-0" />
              <span>{product.ville || "Berkane"}</span>
            </div>
            <h2 className="font-extrabold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-pink-600 transition-colors">
              {product.titre || product.title}
            </h2>
          </div>

          {/* Description Snippet */}
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
            {product.desc || product.description || "Aucune description fournie pour ce produit."}
          </p>
        </div>

        {/* Footer Area */}
        <div className="space-y-4">
          <div className="flex items-end justify-between border-t border-slate-50 pt-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prix</span>
              <div className="text-2xl font-black text-emerald-600 tracking-tight transition-transform duration-300 hover:scale-102">
                {product.transactionType === "gratuit" ? "Gratuit" : `${product.prix || product.price} DH`}
              </div>
            </div>
            
            <div className="text-right text-[10px] text-slate-450 font-semibold flex flex-col items-end gap-1">
              <span className="flex items-center gap-1">
                <Calendar size={10} /> {product.date || "Il y a 2 j."}
              </span>
            </div>
          </div>

          {/* Buttons & Actions */}
          <div className="flex gap-2 items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSeeDetails(product);
              }}
              className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-sky-500/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <ShoppingBag size={13} />
              <span>Voir le produit</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShareClick}
              title="Partager l'annonce"
              className="p-2.5 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 text-slate-500 rounded-xl transition border border-slate-100"
            >
              <Share2 size={14} />
            </button>

            {/* Favorite toggle */}
            <button
              onClick={handleFavoriteClick}
              title="Ajouter aux favoris"
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition border border-slate-100 relative"
            >
              <motion.div
                animate={{ scale: isFavorite ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className={isFavorite ? "text-rose-500" : "text-slate-400 hover:text-rose-500"}
              >
                <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
              </motion.div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export default ProductCard;

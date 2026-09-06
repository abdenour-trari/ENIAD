import { useState } from "react";
import { X, MapPin, Tag, Calendar, Heart, Share2, ShoppingBag, Eye, CheckCircle2, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LazyImage } from "../ui/LazyImage";

export function ProductPreview({ product, onClose, isFavorite = false, onToggleFavorite }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.img || product.image_url || "https://images.pexels.com/photos/18105/pexels-photo.jpg"];

  const conditionColors = {
    neuf: "bg-emerald-100 text-emerald-800 border-emerald-200",
    "très bon": "bg-green-100 text-green-800 border-green-200",
    bon: "bg-blue-100 text-blue-800 border-blue-200",
    acceptable: "bg-amber-100 text-amber-800 border-amber-200"
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/marketplace?id=${product.id}`);
    alert("Lien du produit copié dans le presse-papiers !");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-[650px] z-10 border border-slate-100"
      >
        {/* Gallery Section */}
        <div className="w-full md:w-1/2 bg-slate-50 relative flex flex-col h-[300px] md:h-full justify-between shrink-0">
          {/* Main Large Image */}
          <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
            <LazyImage
              src={images[activeImageIndex]}
              alt={product.titre || product.title}
              className="w-full h-full object-cover"
            />

            {/* Gallery Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 w-10 h-10 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center text-slate-800 hover:bg-white active:scale-95 shadow-md transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 w-10 h-10 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center text-slate-800 hover:bg-white active:scale-95 shadow-md transition"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Dots/Thumbnails list */}
          {images.length > 1 && (
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto justify-center">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    activeImageIndex === index ? "border-pink-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto h-full">
          <div>
            {/* Header badges and actions */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-700 text-xs font-bold rounded-full border border-pink-100/50">
                  <Tag size={12} />
                  {product.categorie || product.category}
                </span>
                
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  conditionColors[product.condition || "bon"]
                }`}>
                  État: {product.condition || "Bon"}
                </span>

                {product.transactionType && product.transactionType !== "vente" && (
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold rounded-full uppercase">
                    {product.transactionType}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
                  title="Partager le produit"
                >
                  <Share2 size={16} />
                </button>

                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(product.id)}
                    className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition"
                    title="Ajouter aux favoris"
                  >
                    <Heart
                      size={16}
                      className={isFavorite ? "text-rose-500 fill-current" : "text-slate-400"}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Title & Price */}
            <div className="space-y-2 mb-6">
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                {product.titre || product.title}
              </h1>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-600">
                  {product.prix || product.price} DH
                </span>
                {product.isNegotiable && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Négociable
                  </span>
                )}
              </div>
            </div>

            <hr className="border-slate-100 mb-5" />

            {/* Specifications list */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-450 shrink-0">
                  <MapPin size={14} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ville</div>
                  <div className="text-xs font-bold text-slate-800">{product.ville || "Berkane"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-450 shrink-0">
                  <ShoppingBag size={14} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Livraison</div>
                  <div className="text-xs font-bold text-slate-800">
                    {product.deliveryOptions?.includes("livraison") ? "Disponible (Envoi)" : "Remise en main propre"}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {product.desc || product.description || "Aucune description fournie pour ce produit."}
              </p>
            </div>
          </div>

          <div>
            <hr className="border-slate-100 mb-5" />

            {/* Seller profile & Contact */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={product.author?.avatar_url || product.avatar || "https://i.pravatar.cc/150?img=33"}
                  alt={product.author?.full_name || "Vendeur"}
                  className="w-11 h-11 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <div className="text-xs font-extrabold text-slate-800">
                    {product.author?.full_name || "Étudiant AEI"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar size={10} /> {product.date || "Publié récemment"}
                  </div>
                </div>
              </div>

              {product.contactDetails && (
                <a
                  href={`tel:${product.contactDetails}`}
                  className="bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/10 transition flex items-center justify-center gap-2"
                >
                  <Phone size={14} />
                  <span>Contacter: {product.contactDetails}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Absolute Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 bg-white/90 hover:bg-white shadow-md hover:shadow-lg rounded-full flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 transition-all z-20 border border-slate-100"
        >
          <X size={18} />
        </button>
      </motion.div>
    </div>
  );
}

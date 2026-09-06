import { Check, ArrowRight, Eye, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export function PublishSuccess({ onSeeProduct, onPublishAnother, onClose }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center max-w-md mx-auto">
      {/* Animated Success Checkmark Ring */}
      <div className="relative mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20"
        >
          <Check size={36} className="stroke-[3]" />
        </motion.div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="absolute inset-0 border-2 border-emerald-500 rounded-full pointer-events-none"
        />
      </div>

      <h2 className="text-2xl font-black text-slate-800 mb-2">Produit publié 🎉</h2>
      <p className="text-slate-500 text-sm leading-relaxed mb-8">
        Votre produit est maintenant en ligne et visible par tous les étudiants du Portail AEI.
      </p>

      {/* Action Buttons Stack */}
      <div className="w-full space-y-3">
        <button
          onClick={onSeeProduct}
          className="w-full bg-linear-to-r from-pink-500 to-rose-600 hover:opacity-95 active:scale-98 text-white py-3.5 rounded-2xl text-xs font-extrabold shadow-lg shadow-pink-500/10 transition-all flex items-center justify-center gap-2"
        >
          <Eye size={14} />
          <span>Voir mon annonce</span>
        </button>

        <button
          onClick={onPublishAnother}
          className="w-full bg-slate-50 hover:bg-slate-100 active:scale-98 text-slate-700 py-3.5 rounded-2xl text-xs font-bold transition border border-slate-100 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={14} />
          <span>Publier un autre objet</span>
        </button>

        <button
          onClick={onClose}
          className="w-full text-slate-400 hover:text-slate-655 text-xs font-bold transition py-2"
        >
          Retour à la Marketplace
        </button>
      </div>
    </div>
  );
}

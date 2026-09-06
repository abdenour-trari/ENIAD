import { useEffect } from "react";
import { X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductWizard } from "./ProductWizard";
import { useProductDraft } from "../../hooks/useProductDraft";

export function CreateProductModal({ isOpen, onClose }) {
  const draftHook = useProductDraft(isOpen);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Modal Content Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] md:h-[650px] z-10 border border-slate-100"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shadow-xs">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">
                    Publier un produit
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Remplissez les détails ci-dessous pour publier votre annonce.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body (Houses Wizard) */}
            <div className="flex-1 p-6 overflow-hidden min-h-0 bg-slate-50/20">
              <ProductWizard onClose={onClose} draftHook={draftHook} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default CreateProductModal;

// src/components/ui/toast.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext({
  toast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((title, description, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast container overlay */}
      <div className="fixed bottom-6 right-6 z-55 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let Icon = CheckCircle2;
            let iconColor = "text-emerald-500";
            let borderColor = "border-emerald-100/50";
            let bgColor = "bg-white/95";

            if (t.type === "error") {
              Icon = AlertCircle;
              iconColor = "text-red-500";
              borderColor = "border-red-100/50";
            } else if (t.type === "info") {
              Icon = Info;
              iconColor = "text-sky-500";
              borderColor = "border-sky-100/50";
            }

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`flex gap-3 p-4 rounded-2xl border ${borderColor} ${bgColor} shadow-2xl backdrop-blur-md pointer-events-auto`}
              >
                <div className="shrink-0">
                  <Icon className={iconColor} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold text-slate-900 leading-tight">
                    {t.title}
                  </h5>
                  {t.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 transition p-0.5 rounded-lg hover:bg-slate-100 h-fit cursor-pointer"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

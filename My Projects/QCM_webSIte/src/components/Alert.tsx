import React from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  errorsList?: string[];
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  errorsList,
  onClose,
  className = '',
}) => {
  const styles = {
    success: {
      bg: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400',
      icon: <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />,
    },
    error: {
      bg: 'bg-rose-950/30 border-rose-500/30 text-rose-400',
      icon: <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-950/30 border-amber-500/30 text-amber-400',
      icon: <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-blue-950/30 border-blue-500/30 text-blue-400',
      icon: <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`border rounded-xl p-4 flex gap-3 ${styles[type].bg} ${className}`}
    >
      {styles[type].icon}
      <div className="flex-1 text-sm">
        {title && <h5 className="font-semibold mb-1 text-slate-100">{title}</h5>}
        {message && <p className="opacity-90">{message}</p>}
        {errorsList && errorsList.length > 0 && (
          <ul className="list-disc list-inside mt-2 space-y-1 opacity-90 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {errorsList.map((err, idx) => (
              <li key={idx} className="leading-relaxed">{err}</li>
            ))}
          </ul>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="hover:bg-slate-800/50 p-1 rounded-lg transition-colors h-fit self-start"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
};

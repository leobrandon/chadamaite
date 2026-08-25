import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Heart, Sparkles, Copy, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'success', icon = null, duration = 3500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type, icon, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Fixed Toast Container */}
      <div 
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const getIcon = () => {
    if (toast.icon) return toast.icon;
    switch (toast.type) {
      case 'heart':
        return <Heart className="w-4 h-4 fill-blush-500 text-blush-500" />;
      case 'copy':
        return <Copy className="w-4 h-4 text-emerald-500" />;
      case 'sparkle':
        return <Sparkles className="w-4 h-4 text-gold-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-sky-500" />;
      case 'success':
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, scale: 0.9, filter: 'blur(4px)' }}
      transition={{ type: 'spring', damping: 18, stiffness: 180 }}
      className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-blush-200/90 dark:border-slate-800 shadow-lg shadow-blush-500/10 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-medium backdrop-blur-md"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0">{getIcon()}</div>
        <p className="truncate">{toast.message}</p>
      </div>
      <button
        onClick={onRemove}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition shrink-0 cursor-pointer"
        aria-label="Fechar notificação"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return context;
}

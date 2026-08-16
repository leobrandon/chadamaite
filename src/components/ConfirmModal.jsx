import React, { useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirmação',
  message = 'Tem certeza de que deseja prosseguir com esta ação?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel,
}) {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Handle ESC key press
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Auto focus confirm or cancel button
    const timer = setTimeout(() => {
      if (confirmBtnRef.current) {
        confirmBtnRef.current.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 relative transform transition-all animate-scale-up">
        
        {/* Close Icon Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-rose-100 text-rose-600'
                : 'bg-blush-100 text-blush-600'
            }`}
          >
            {isDestructive ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 pt-1">
            <h3
              id="confirm-modal-title"
              className="font-serif text-lg sm:text-xl font-bold text-slate-800"
            >
              {title}
            </h3>
            <p
              id="confirm-modal-description"
              className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed"
            >
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm transition active:scale-[0.98]"
          >
            {cancelText}
          </button>
          
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-[0.98] ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-blush-500 hover:bg-blush-600 shadow-blush-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}

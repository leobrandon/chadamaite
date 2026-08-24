import React from 'react';
import { Shield, Lock, X } from 'lucide-react';

export default function AdminHeader({ isAuthenticated, onLock, onClose }) {
  return (
    <div className="bg-slate-900 px-4 py-3.5 sm:p-6 text-white shrink-0 relative">
      {/* Mobile top pill indicator for bottom-sheet aesthetic */}
      <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blush-500/20 text-blush-400 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-base sm:text-xl font-bold truncate">
              Painel dos Papais
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              Leonardo & Isabella • Gestão Geral
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isAuthenticated && (
            <button
              type="button"
              onClick={onLock}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition min-h-[36px]"
              title="Bloquear Painel com Senha"
            >
              <Lock className="w-3.5 h-3.5 text-blush-400 shrink-0" />
              <span className="hidden sm:inline">Bloquear</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 sm:p-2 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white transition flex items-center justify-center min-w-[36px] min-h-[36px]"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

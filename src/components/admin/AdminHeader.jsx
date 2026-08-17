import React from 'react';
import { Shield, Lock, X } from 'lucide-react';

export default function AdminHeader({ isAuthenticated, onLock, onClose }) {
  return (
    <div className="bg-slate-900 p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blush-500/20 text-blush-400 flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-bold">
            Painel dos Papais (Leonardo & Isabella)
          </h3>
          <p className="text-xs text-slate-400">
            Gerencie a lista de presentes, convidados confirmados e detalhes do evento
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated && (
          <button
            type="button"
            onClick={onLock}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            title="Bloquear Painel com Senha"
          >
            <Lock className="w-3.5 h-3.5 text-blush-400" />
            <span className="hidden sm:inline">Bloquear</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

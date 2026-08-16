import React from 'react';
import { Heart, Sparkles, Shield } from 'lucide-react';

export default function Footer({ config, onOpenAdmin }) {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        
        {/* Logo / Monogram */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blush-500/20 text-blush-400 text-2xl mb-1">
          🌸
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-wide">
          Chá de Bebê da {config.babyName}
        </h3>

        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          "Um pedacinho de nós dois que vem para transformar as nossas vidas com o mais puro amor."
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>Com amor,</span>
          <strong className="text-white font-semibold">{config.parents}</strong>
          <Heart className="w-3.5 h-3.5 text-blush-400 fill-blush-400" />
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Chá da Maitê. Todos os direitos reservados.</p>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition py-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            <Shield className="w-3 h-3" />
            <span>Área Administrativa dos Pais</span>
          </button>
        </div>

      </div>
    </footer>
  );
}

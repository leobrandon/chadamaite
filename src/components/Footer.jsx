import React from 'react';
import { Heart, Shield, Share2 } from 'lucide-react';
import { useToast } from './ui/ToastProvider';

export default function Footer({ config, onOpenAdmin }) {
  const { addToast } = useToast();

  const handleShareClick = () => {
    addToast({ message: 'Abrindo compartilhamento do WhatsApp! 💌', type: 'info' });
  };
  const getShareUrl = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Olá! Veja o convite e lista de presentes do Chá de Bebê da Maitê: ${currentUrl}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  };

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

        {/* WhatsApp Share in Footer */}
        <div className="pt-2">
          <a
            href={getShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleShareClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartilhar Convite no WhatsApp</span>
          </a>
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

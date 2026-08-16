import React, { useState } from 'react';
import { X, Copy, Check, Heart, QrCode, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PixModal({ isOpen, onClose, config }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(config.pixKey);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 }
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-blush-200 overflow-hidden relative animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gold-400 to-gold-500 p-6 text-slate-900 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-slate-800 transition focus:outline-none"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/40 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner mb-3">
            ✨
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-tight">
            Mimo em Pix para a Maitê
          </h3>
          <p className="text-slate-800 text-xs sm:text-sm mt-1">
            Qualquer valor será recebido com muito amor e carinho!
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Key Info */}
          <div className="bg-gold-50 border border-gold-200 rounded-2xl p-4 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
              Chave Pix ({config.pixName})
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-slate-800 select-all block break-all">
              {config.pixKey}
            </span>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full py-3.5 px-6 rounded-2xl bg-gold-400 hover:bg-gold-500 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-800" />
                <span className="text-emerald-950 font-bold">Chave Pix Copiada com Sucesso!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copiar Chave Pix</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 leading-relaxed">
            Ao fazer o Pix, você pode colocar o seu nome no comprovante ou enviar uma mensagem de carinho! 💖
          </p>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition"
            >
              Fechar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

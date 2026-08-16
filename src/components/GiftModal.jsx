import React, { useState } from 'react';
import { Heart, Check, X, Gift, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GiftModal({ gift, isOpen, onClose, onConfirm, onAddPledge }) {
  const [guestName, setGuestName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [nameError, setNameError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !gift) return null;

  const handleConfirm = () => {
    if (!guestName.trim()) {
      setNameError(true);
      return;
    }

    setIsSubmitting(true);
    setNameError(false);
    
    // Confetti celebration effect
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f7799e', '#eed86a', '#7fa382', '#ffd6e1']
    });

    setTimeout(() => {
      if (onAddPledge) {
        onAddPledge(gift.id, guestName.trim(), quantity);
      } else {
        onConfirm(gift.id, guestName.trim());
      }
      setIsSubmitting(false);
      setGuestName('');
      setQuantity(1);
      setNameError(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-blush-200 overflow-hidden relative animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Top decorative header */}
        <div className="bg-gradient-to-r from-blush-400 via-blush-500 to-blush-400 p-6 text-white text-center relative">
          <button
            onClick={() => {
              setNameError(false);
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition focus:outline-none"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner mb-3">
            {gift.icon || '🎁'}
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-tight">
            Presentear a Maitê 💖
          </h3>
          <p className="text-blush-100 text-xs sm:text-sm mt-1">
            Muito obrigado pelo seu carinho com a nossa família!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Gift Summary Box */}
          <div className="bg-blush-50/70 border border-blush-200/80 rounded-2xl p-4">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-blush-200 text-blush-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              {gift.category}
            </span>
            <h4 className="font-bold text-slate-800 text-base sm:text-lg leading-snug">
              {gift.title}
            </h4>
            {gift.description && (
              <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                {gift.description}
              </p>
            )}
          </div>

          {/* Important Notice */}
          <div className="flex items-start gap-3 p-3.5 bg-blush-50 rounded-2xl border border-blush-200/80 text-blush-900 text-xs sm:text-sm">
            <Heart className="w-5 h-5 text-blush-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Você pode contribuir com quantas unidades quiser!</strong> Outros convidados também poderão escolher este mesmo item.
            </p>
          </div>

          {/* Mandatory Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Seu nome ou de quem está presenteando <span className="text-rose-500 font-bold">* (Obrigatório)</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                if (nameError) setNameError(false);
              }}
              placeholder="Ex: Titia Ana / Leonardo e Família"
              className={`w-full px-4 py-3 rounded-2xl border outline-none text-sm transition ${
                nameError
                  ? 'border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-200'
              }`}
            />
            {nameError ? (
              <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                <span>⚠️</span>
                <span>Por favor, informe seu nome para que os papais saibam quem presenteou!</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Informe seu nome para que os papais possam agradecer com carinho.
              </p>
            )}
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Quantas unidades você vai dar?
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 rounded-2xl border outline-none text-sm transition border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-200"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-blush-500/25 transition flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>{isSubmitting ? 'Confirmando...' : 'Confirmar meu presente! 💖'}</span>
            </button>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition"
            >
              Voltar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

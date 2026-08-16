import React, { useState, useEffect } from 'react';
import { Heart, Check, X, Gift, Sparkles, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GiftModal({ gift, gifts = [], pledges = [], isOpen, onClose, onConfirm, onAddPledge }) {
  const [guestName, setGuestName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [confirmedQuantity, setConfirmedQuantity] = useState(1);
  const [confirmedGuestName, setConfirmedGuestName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [selectedMimoId, setSelectedMimoId] = useState('');
  const [mimoQuantity, setMimoQuantity] = useState(1);
  const [mimoError, setMimoError] = useState(false);
  const [confirmedMimo, setConfirmedMimo] = useState(null);
  const [confirmedMimoQty, setConfirmedMimoQty] = useState(1);

  // Compute remaining quota limit quietly without displaying quota bars or totals
  const giftPledges = (pledges || []).filter(p => p.giftId === gift?.id);
  const totalPledged = giftPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
  const targetQty = Number(gift?.targetQuantity) || 5;
  const remainingAvailable = Math.max(1, targetQty - totalPledged);

  const isFralda = gift?.category === 'Fraldas';
  
  const availableMimos = (gifts || []).filter(g => {
    if (g.category === 'Fraldas' || g.id === gift?.id) return false;
    const pList = (pledges || []).filter(p => p.giftId === g.id);
    const pledgedTotal = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
    const target = Number(g.targetQuantity) || 5;
    return pledgedTotal < target;
  });

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setGuestName('');
      setNameError(false);
      setIsSuccess(false);
      setMimoError(false);
      if (isFralda && availableMimos.length > 0) {
        setSelectedMimoId(availableMimos[0].id);
      } else {
        setSelectedMimoId('');
      }
      setMimoQuantity(1);
    }
  }, [isOpen, gift?.id, gifts, pledges, isFralda]);

  if (!isOpen || !gift) return null;

  const handleConfirm = () => {
    if (!guestName.trim()) {
      setNameError(true);
      return;
    }

    if (isFralda && availableMimos.length > 0 && !selectedMimoId) {
      setMimoError(true);
      return;
    }

    setIsSubmitting(true);
    setNameError(false);
    setMimoError(false);

    const safeQty = Math.min(remainingAvailable, Math.max(1, quantity));
    setConfirmedQuantity(safeQty);
    setConfirmedGuestName(guestName.trim());
    
    let safeMimoQty = 1;
    let chosenMimo = null;

    if (isFralda && selectedMimoId) {
      chosenMimo = gifts.find(g => g.id === selectedMimoId);
      if (chosenMimo) {
        const pList = (pledges || []).filter(p => p.giftId === chosenMimo.id);
        const pledgedTotal = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
        const target = Number(chosenMimo.targetQuantity) || 5;
        const mimoRemaining = Math.max(1, target - pledgedTotal);
        safeMimoQty = Math.min(mimoRemaining, Math.max(1, mimoQuantity));
        setConfirmedMimo(chosenMimo);
        setConfirmedMimoQty(safeMimoQty);
      }
    } else {
      setConfirmedMimo(null);
    }
    
    // Confetti celebration effect
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#f7799e', '#eed86a', '#7fa382', '#ffd6e1']
    });

    setTimeout(() => {
      if (onAddPledge) {
        onAddPledge(gift.id, guestName.trim(), safeQty);
        if (chosenMimo) {
          onAddPledge(chosenMimo.id, guestName.trim(), safeMimoQty);
        }
      } else if (onConfirm) {
        onConfirm(gift.id, guestName.trim());
      }
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 350);
  };

  const handleClose = () => {
    setNameError(false);
    setIsSuccess(false);
    onClose();
  };

  let whatsappMessage = `Oi Leo e Isa! 💕 Acabei de escolher o combo: ${gift.title} (${confirmedQuantity} un.) para a Maitê no site! Mal posso esperar pelo Chá! 💖`;
  if (confirmedMimo) {
    whatsappMessage = `Oi Leo e Isa! 💕 Acabei de escolher o combo: ${gift.title} (${confirmedQuantity} un.) + ${confirmedMimo.title} (${confirmedMimoQty} un.) para a Maitê no site! Mal posso esperar pelo Chá! 💖`;
  }
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-blush-200 overflow-hidden relative animate-slide-up max-h-[90dvh] overflow-y-auto overscroll-contain flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Top decorative header */}
        <div className="bg-gradient-to-r from-blush-400 via-blush-500 to-blush-400 p-6 text-white text-center relative shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition focus:outline-none"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner mb-3">
            {isSuccess ? '🎉' : (gift.icon || '🎁')}
          </div>
          
          <h3 className="font-serif text-2xl font-bold tracking-tight">
            {isSuccess ? 'Combo Escolhido com Muito Amor! 💕' : 'Montar Combo de Presente 💖'}
          </h3>
          <p className="text-blush-100 text-xs sm:text-sm mt-1">
            {isSuccess
              ? 'Os papais vão amar o seu carinho e presença!'
              : 'Muito obrigado pelo seu carinho com a nossa família!'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5 flex-1">
          
          {isSuccess ? (
            /* SUCCESS VIEW */
            <div className="space-y-6 text-center py-2 animate-fade-in">
              <div className="bg-blush-50/80 border border-blush-200/90 rounded-2xl p-5 space-y-2">
                <span className="text-xs uppercase tracking-wider font-bold text-blush-700 block">
                  Confirmação de Combo
                </span>
                <h4 className="font-bold text-slate-800 text-lg sm:text-xl">
                  {gift.title}
                </h4>
                <p className="text-sm text-slate-600 font-medium">
                  Quantidade: <strong className="text-blush-600">{confirmedQuantity} {confirmedQuantity === 1 ? 'unidade' : 'unidades'}</strong>
                </p>
                {confirmedMimo && (
                  <div className="pt-2 mt-2 border-t border-blush-200/60">
                    <h5 className="font-bold text-slate-700 text-base">{confirmedMimo.title}</h5>
                    <p className="text-sm text-slate-600 font-medium">
                      Quantidade: <strong className="text-blush-600">{confirmedMimoQty} {confirmedMimoQty === 1 ? 'unidade' : 'unidades'}</strong>
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-500 pt-1">
                  Presenteado por: <strong>{confirmedGuestName}</strong>
                </p>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                Que emoção ter pessoas tão especiais como você ao nosso lado para receber a Maitê! 💕
              </p>

              {/* Prominent WhatsApp Notify Button without phone number */}
              <div className="space-y-3 pt-2">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2.5 group"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Avisar os papais no WhatsApp 💌</span>
                </a>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition"
                >
                  Concluir e Voltar
                </button>
              </div>
            </div>
          ) : (
            /* FORM VIEW */
            <>
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

              {/* Mandatory Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Seu nome ou de quem está presenteando <span className="text-rose-500 font-bold">* (Obrigatório)</span>
                </label>
                <input
                  type="text"
                  maxLength={80}
                  required
                  autoFocus
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    if (nameError) setNameError(false);
                  }}
                  placeholder="Ex: Titia Ana / Leonardo e Família"
                  className={`w-full px-4 py-3 rounded-2xl border outline-none text-base sm:text-sm transition ${
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

              {/* Quantity Input with Stepper */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Quantas unidades você deseja dar?
                </label>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-2xl bg-white p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-base"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={remainingAvailable}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.min(remainingAvailable, Math.max(1, val)));
                      }}
                      className="w-14 text-center font-bold text-slate-800 text-base outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.min(remainingAvailable, q + 1))}
                      disabled={quantity >= remainingAvailable}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-base"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick selection chips */}
                  {remainingAvailable > 1 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Array.from({ length: Math.min(remainingAvailable, 5) }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setQuantity(n)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                            quantity === n
                              ? 'bg-blush-500 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {n} {n === 1 ? 'un.' : 'un.'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mimo Selection */}
              {isFralda && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blush-500" />
                    <span>Escolha um Mimo para acompanhar a fralda: <span className="text-rose-500">*</span></span>
                  </label>
                  
                  {availableMimos.length > 0 ? (
                    <div className="space-y-3">
                      <select
                        value={selectedMimoId}
                        onChange={(e) => {
                          setSelectedMimoId(e.target.value);
                          setMimoError(false);
                          setMimoQuantity(1);
                        }}
                        className={`w-full px-4 py-3 rounded-2xl border outline-none text-base sm:text-sm transition ${
                          mimoError
                            ? 'border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-200'
                            : 'border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-200 bg-white'
                        }`}
                      >
                        <option value="" disabled>Selecione um mimo...</option>
                        {availableMimos.map(m => (
                          <option key={m.id} value={m.id}>{m.icon || '🎁'} {m.title} ({m.category})</option>
                        ))}
                      </select>
                      
                      {selectedMimoId && (
                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-sm font-medium text-slate-600">Quantidade do Mimo:</span>
                          <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1 shadow-sm">
                            <button
                              type="button"
                              onClick={() => setMimoQuantity(q => Math.max(1, q - 1))}
                              disabled={mimoQuantity <= 1}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={(() => {
                                const sMimo = gifts.find(g => g.id === selectedMimoId);
                                const pList = (pledges || []).filter(p => p.giftId === selectedMimoId);
                                const pTotal = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
                                return Math.max(1, (Number(sMimo?.targetQuantity) || 5) - pTotal);
                              })()}
                              value={mimoQuantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                const sMimo = gifts.find(g => g.id === selectedMimoId);
                                const pList = (pledges || []).filter(p => p.giftId === selectedMimoId);
                                const pTotal = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
                                const maxAvail = Math.max(1, (Number(sMimo?.targetQuantity) || 5) - pTotal);
                                setMimoQuantity(Math.min(maxAvail, Math.max(1, val)));
                              }}
                              className="w-10 text-center font-bold text-slate-800 text-sm outline-none bg-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setMimoQuantity(q => {
                                const sMimo = gifts.find(g => g.id === selectedMimoId);
                                const pList = (pledges || []).filter(p => p.giftId === selectedMimoId);
                                const pTotal = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
                                const maxAvail = Math.max(1, (Number(sMimo?.targetQuantity) || 5) - pTotal);
                                return Math.min(maxAvail, q + 1);
                              })}
                              disabled={mimoQuantity >= (() => {
                                const sMimo = gifts.find(g => g.id === selectedMimoId);
                                const pList = (pledges || []).filter(p => p.giftId === selectedMimoId);
                                const pTotal = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
                                return Math.max(1, (Number(sMimo?.targetQuantity) || 5) - pTotal);
                              })()}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-700">Todos os mimos já foram escolhidos! Você pode presentear apenas com a fralda.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-blush-500/25 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>{isSubmitting ? 'Confirmando...' : 'Confirmar meu Combo de Presente! 💖'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition"
                >
                  Voltar
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}

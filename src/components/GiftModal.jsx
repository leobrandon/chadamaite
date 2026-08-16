import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Check, X, Gift, Sparkles, MessageCircle, Search, CheckCircle2 } from 'lucide-react';
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
  const [mimoSearch, setMimoSearch] = useState('');
  const [mimoCategoryFilter, setMimoCategoryFilter] = useState('Todos');
  const [mimoError, setMimoError] = useState(false);
  const [confirmedMimo, setConfirmedMimo] = useState(null);
  const [confirmedMimoQty, setConfirmedMimoQty] = useState(1);

  // Compute remaining quota for the selected main gift (diaper)
  const giftPledges = useMemo(() => (pledges || []).filter(p => p.giftId === gift?.id), [pledges, gift?.id]);
  const totalPledged = useMemo(() => giftPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0), [giftPledges]);
  const targetQty = Number(gift?.targetQuantity) || 5;
  const remainingAvailable = Math.max(1, targetQty - totalPledged);

  const isFralda = gift?.category === 'Fraldas';
  
  // Available Mimos (all non-diaper gifts with remaining quota)
  const availableMimos = useMemo(() => {
    const pWeight = { high: 1, medium: 2, low: 3 };
    return (gifts || []).filter(g => {
      if (g.category === 'Fraldas' || g.id === gift?.id) return false;
      const pList = (pledges || []).filter(p => p.giftId === g.id);
      const pledgedTotal = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
      const target = Number(g.targetQuantity) || 5;
      return pledgedTotal < target;
    }).sort((a, b) => {
      const pA = pWeight[a.priority || 'medium'] || 2;
      const pB = pWeight[b.priority || 'medium'] || 2;
      if (pA !== pB) return pA - pB;
      return (a.displayOrder || 999) - (b.displayOrder || 999);
    });
  }, [gifts, pledges, gift?.id]);

  // Unique categories for available mimos
  const mimoCategories = useMemo(() => {
    const cats = new Set(availableMimos.map(m => m.category));
    return ['Todos', ...Array.from(cats)];
  }, [availableMimos]);

  // Filtered mimos for the picker
  const filteredMimos = useMemo(() => {
    return availableMimos.filter(m => {
      const matchCat = mimoCategoryFilter === 'Todos' || m.category === mimoCategoryFilter;
      const matchSearch = !mimoSearch.trim() || 
        m.title.toLowerCase().includes(mimoSearch.toLowerCase()) ||
        m.category.toLowerCase().includes(mimoSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [availableMimos, mimoCategoryFilter, mimoSearch]);

  // Selected Mimo Object & remaining quota
  const currentSelectedMimo = useMemo(() => {
    return availableMimos.find(m => m.id === selectedMimoId) || null;
  }, [availableMimos, selectedMimoId]);

  const maxMimoAvailable = useMemo(() => {
    if (!currentSelectedMimo) return 1;
    const pList = (pledges || []).filter(p => p.giftId === currentSelectedMimo.id);
    const pTotal = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
    return Math.max(1, (Number(currentSelectedMimo.targetQuantity) || 5) - pTotal);
  }, [currentSelectedMimo, pledges]);

  // Reset state ONLY when opening a modal or changing the target gift
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setGuestName('');
      setNameError(false);
      setIsSuccess(false);
      setMimoError(false);
      setMimoSearch('');
      setMimoCategoryFilter('Todos');
      setConfirmedMimo(null);
      
      // Auto-select first available mimo
      if (availableMimos.length > 0) {
        setSelectedMimoId(availableMimos[0].id);
      } else {
        setSelectedMimoId('');
      }
      setMimoQuantity(1);
    }
  }, [isOpen, gift?.id]); // Note: DO NOT include pledges/gifts here to prevent resetting during submit

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
      chosenMimo = currentSelectedMimo || gifts.find(g => g.id === selectedMimoId);
      if (chosenMimo) {
        safeMimoQty = Math.min(maxMimoAvailable, Math.max(1, mimoQuantity));
        setConfirmedMimo(chosenMimo);
        setConfirmedMimoQty(safeMimoQty);
      }
    } else {
      setConfirmedMimo(null);
    }
    
    // Confetti celebration effect
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f7799e', '#eed86a', '#7fa382', '#ffd6e1']
      });
    } catch {
      // ignore
    }

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
    }, 250);
  };

  const handleClose = () => {
    setNameError(false);
    setIsSuccess(false);
    onClose();
  };

  let whatsappMessage = `Oi Leo e Isa! 💕 Acabei de escolher o presente: ${gift.title} (${confirmedQuantity} un.) para a Maitê no site! Mal posso esperar pelo Chá! 💖`;
  if (confirmedMimo) {
    whatsappMessage = `Oi Leo e Isa! 💕 Acabei de escolher o combo: ${gift.title} (${confirmedQuantity} un.) + ${confirmedMimo.title} (${confirmedMimoQty} un.) para a Maitê no site! Mal posso esperar pelo Chá! 💖`;
  }
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-blush-200 overflow-hidden relative animate-slide-up max-h-[92dvh] my-auto flex flex-col overscroll-contain"
        role="dialog"
        aria-modal="true"
      >
        {/* Top decorative header */}
        <div className="bg-gradient-to-r from-blush-400 via-blush-500 to-blush-400 p-5 sm:p-6 text-white text-center relative shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition focus:outline-none"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-13 h-13 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner mb-2.5">
            {isSuccess ? '🎉' : (gift.icon || '🎁')}
          </div>
          
          <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
            {isSuccess ? 'Combo Escolhido com Muito Amor! 💕' : 'Montar Combo de Presente 💖'}
          </h3>
          <p className="text-blush-100 text-xs sm:text-sm mt-0.5">
            {isSuccess
              ? 'Os papais vão amar o seu carinho e presença!'
              : 'Escolha a fralda e um mimo especial para a Maitê'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
          
          {isSuccess ? (
            /* SUCCESS VIEW */
            <div className="space-y-5 text-center py-2 animate-fade-in">
              <div className="bg-gradient-to-b from-blush-50/90 to-white border border-blush-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
                <div className="flex items-center gap-2 text-blush-700 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resumo do Combo Confirmado</span>
                </div>

                {/* Diaper summary item */}
                <div className="bg-white p-3.5 rounded-2xl border border-blush-100 shadow-sm flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blush-50 text-blush-600 flex items-center justify-center text-xl shrink-0">
                    {gift.icon || '👶'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blush-600 block">Item Principal</span>
                    <h5 className="font-bold text-slate-800 text-sm leading-snug">{gift.title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Quantidade: <strong className="text-blush-700 font-bold">{confirmedQuantity} {confirmedQuantity === 1 ? 'pacote' : 'pacotes'}</strong>
                    </p>
                  </div>
                </div>

                {/* Mimo summary item */}
                {confirmedMimo && (
                  <div className="bg-white p-3.5 rounded-2xl border border-blush-100 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blush-50 text-blush-600 flex items-center justify-center text-xl shrink-0">
                      {confirmedMimo.icon || '🎁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blush-600 block">Mimo Especial</span>
                      <h5 className="font-bold text-slate-800 text-sm leading-snug">{confirmedMimo.title}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Quantidade: <strong className="text-blush-700 font-bold">{confirmedMimoQty} {confirmedMimoQty === 1 ? 'unidade' : 'unidades'}</strong>
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500">
                    Presenteado com carinho por: <strong className="text-slate-800 text-sm">{confirmedGuestName}</strong>
                  </p>
                </div>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                Que emoção ter você ao nosso lado para receber a Maitê! Avise os papais no WhatsApp abaixo para que possamos comemorar juntos! 💕
              </p>

              {/* Prominent WhatsApp Notify Button */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2.5 group"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Avisar os papais no WhatsApp 💌</span>
                </a>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold text-xs sm:text-sm transition"
                >
                  Concluir e Voltar ao Site
                </button>
              </div>
            </div>
          ) : (
            /* FORM VIEW */
            <>
              {/* STEP 1: DIAPER SELECTION */}
              <div className="bg-blush-50/80 border border-blush-200/90 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm shrink-0">
                      {gift.icon || '👶'}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blush-700 block">
                        Passo 1 • Fralda Selecionada
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                        {gift.title}
                      </h4>
                    </div>
                  </div>
                </div>

                {gift.description && (
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {gift.description}
                  </p>
                )}

                {/* Diaper Quantity Stepper */}
                <div className="flex items-center justify-between pt-2 border-t border-blush-200/60">
                  <span className="text-xs font-bold text-slate-700">Quantos pacotes vai dar?</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-sm"
                      >
                        -
                      </button>
                      <span className="w-9 text-center font-bold text-slate-800 text-sm">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.min(remainingAvailable, q + 1))}
                        disabled={quantity >= remainingAvailable}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{quantity === 1 ? 'pacote' : 'pacotes'}</span>
                  </div>
                </div>
              </div>

              {/* STEP 2: MIMO SELECTION (VISUAL CARD PICKER) */}
              {isFralda && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blush-500" />
                      <span>Passo 2 • Escolha o Mimo para Acompanhar: <span className="text-rose-500">*</span></span>
                    </label>
                  </div>

                  {availableMimos.length > 0 ? (
                    <div className="space-y-2.5">
                      {/* Search & Category Filter */}
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Buscar mimo por nome..."
                            value={mimoSearch}
                            onChange={(e) => setMimoSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blush-400 focus:bg-white transition"
                          />
                        </div>

                        {/* Category filter pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                          {mimoCategories.map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setMimoCategoryFilter(cat)}
                              className={`px-2.5 py-1 rounded-lg font-semibold transition shrink-0 ${
                                mimoCategoryFilter === cat
                                  ? 'bg-slate-800 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Visual Mimos Grid (Scrollable) */}
                      <div className="max-h-48 sm:max-h-56 overflow-y-auto pr-1 space-y-2 overscroll-contain">
                        {filteredMimos.length > 0 ? (
                          filteredMimos.map(m => {
                            const isSelected = selectedMimoId === m.id;
                            return (
                              <div
                                key={m.id}
                                onClick={() => {
                                  setSelectedMimoId(m.id);
                                  setMimoError(false);
                                  setMimoQuantity(1);
                                }}
                                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                  isSelected
                                    ? 'bg-blush-50/90 border-blush-500 shadow-sm ring-2 ring-blush-200'
                                    : 'bg-white border-slate-200 hover:border-blush-300 hover:bg-slate-50/80'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-lg shadow-2xs shrink-0">
                                    {m.icon || '🎁'}
                                  </span>
                                  <div className="min-w-0 flex flex-col items-start gap-0.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h5 className="font-bold text-slate-800 text-xs sm:text-sm truncate max-w-[200px]">
                                        {m.title}
                                      </h5>
                                      {m.priority === 'high' && (
                                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full whitespace-nowrap">
                                          ★ Preferência
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate w-full">
                                      {m.category} {m.description ? `• ${m.description}` : ''}
                                    </p>
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                  {isSelected ? (
                                    <div className="w-6 h-6 rounded-full bg-blush-500 text-white flex items-center justify-center shadow-xs">
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full border border-slate-300 bg-white" />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                            Nenhum mimo encontrado para esta busca.
                          </div>
                        )}
                      </div>

                      {/* Mimo Quantity Stepper when a mimo is selected */}
                      {currentSelectedMimo && (
                        <div className="flex items-center justify-between bg-blush-50/60 p-3 rounded-xl border border-blush-200/80 mt-2">
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">Quantidade do Mimo:</span>
                            <span className="text-[10px] text-slate-500">{currentSelectedMimo.title}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 shadow-sm">
                              <button
                                type="button"
                                onClick={() => setMimoQuantity(q => Math.max(1, q - 1))}
                                disabled={mimoQuantity <= 1}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-xs"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold text-slate-800 text-xs">
                                {mimoQuantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setMimoQuantity(q => Math.min(maxMimoAvailable, q + 1))}
                                disabled={mimoQuantity >= maxMimoAvailable}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-xs"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">un.</span>
                          </div>
                        </div>
                      )}

                      {mimoError && (
                        <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                          <span>⚠️</span>
                          <span>Por favor, escolha um mimo acima para completar seu combo!</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                      <p className="text-xs text-amber-700">Todos os mimos já foram escolhidos por outros convidados! Você pode presentear com o pacote de fraldas.</p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: GUEST NAME */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Passo 3 • Seu nome ou de quem está presenteando <span className="text-rose-500 font-bold">* (Obrigatório)</span>
                </label>
                <input
                  type="text"
                  maxLength={80}
                  required
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

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
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

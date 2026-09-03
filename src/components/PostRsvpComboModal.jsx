import React, { useState, useEffect, useMemo } from 'react';
import { X, Gift, Sparkles, CheckCircle2, MessageCircle, Search, ArrowLeft, Heart, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PostRsvpComboModal({
  isOpen,
  onClose,
  attending = true,
  guestName = '',
  gifts = [],
  pledges = [],
  onAddPledge,
  config = {}
}) {
  // Navigation steps: 'invite' | 'select_fralda' | 'builder' | 'success'
  const [step, setStep] = useState('invite');
  
  // Selection states
  const [selectedFralda, setSelectedFralda] = useState(null);
  const [fraldaQuantity, setFraldaQuantity] = useState(1);
  
  const [selectedMimoId, setSelectedMimoId] = useState('');
  const [mimoQuantity, setMimoQuantity] = useState(1);
  const [mimoSearch, setMimoSearch] = useState('');
  const [mimoCategoryFilter, setMimoCategoryFilter] = useState('Todos');
  
  const [currentGuestName, setCurrentGuestName] = useState(guestName);
  const [nameError, setNameError] = useState(false);
  const [mimoError, setMimoError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Final confirmed data for success display
  const [confirmedCombo, setConfirmedCombo] = useState(null);

  // Available Diapers (category === 'Fraldas' with available quota)
  const availableFraldas = useMemo(() => {
    return (gifts || [])
      .filter(g => g.category === 'Fraldas')
      .filter(g => {
        const pList = (pledges || []).filter(p => p.giftId === g.id);
        const pledgedTotal = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
        const target = Number(g.targetQuantity) || 5;
        return pledgedTotal < target;
      })
      .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
  }, [gifts, pledges]);

  // Remaining quota for selected diaper
  const remainingFraldaQuota = useMemo(() => {
    if (!selectedFralda) return 1;
    const pList = (pledges || []).filter(p => p.giftId === selectedFralda.id);
    const totalPledged = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
    const target = Number(selectedFralda.targetQuantity) || 5;
    return Math.max(1, target - totalPledged);
  }, [pledges, selectedFralda]);

  // Available Mimos (all non-diapers with open quota)
  const availableMimos = useMemo(() => {
    const pWeight = { high: 1, medium: 2, low: 3 };
    return (gifts || [])
      .filter(g => {
        if (g.category === 'Fraldas') return false;
        if (selectedFralda && g.id === selectedFralda.id) return false;
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
  }, [gifts, pledges, selectedFralda]);

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
        (m.category && m.category.toLowerCase().includes(mimoSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [availableMimos, mimoCategoryFilter, mimoSearch]);

  const currentSelectedMimo = useMemo(() => {
    return availableMimos.find(m => m.id === selectedMimoId) || null;
  }, [availableMimos, selectedMimoId]);

  const maxMimoAvailable = useMemo(() => {
    if (!currentSelectedMimo) return 1;
    const pList = (pledges || []).filter(p => p.giftId === currentSelectedMimo.id);
    const pTotal = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
    return Math.max(1, (Number(currentSelectedMimo.targetQuantity) || 5) - pTotal);
  }, [currentSelectedMimo, pledges]);

  // Reset state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep('invite');
      setSelectedFralda(null);
      setFraldaQuantity(1);
      setSelectedMimoId('');
      setMimoQuantity(1);
      setMimoSearch('');
      setMimoCategoryFilter('Todos');
      setCurrentGuestName(guestName || '');
      setNameError(false);
      setMimoError(false);
      setIsSubmitting(false);
      setConfirmedCombo(null);
    }
  }, [isOpen, guestName]);

  if (!isOpen) return null;

  // Handle Diaper selection (advance to step 3 builder)
  const handleSelectFralda = (fralda) => {
    setSelectedFralda(fralda);
    setFraldaQuantity(1);
    setStep('builder');
  };

  // Handle Combo confirmation
  const handleConfirmCombo = async () => {
    if (!currentGuestName.trim()) {
      setNameError(true);
      return;
    }

    if (availableMimos.length > 0 && !selectedMimoId) {
      setMimoError(true);
      return;
    }

    if (!selectedFralda) {
      setStep('select_fralda');
      return;
    }

    setIsSubmitting(true);
    setNameError(false);
    setMimoError(false);

    const safeFraldaQty = Math.min(remainingFraldaQuota, Math.max(1, fraldaQuantity));
    let safeMimoQty = 1;
    let chosenMimo = null;

    if (selectedMimoId) {
      chosenMimo = currentSelectedMimo || gifts.find(g => g.id === selectedMimoId);
      if (chosenMimo) {
        safeMimoQty = Math.min(maxMimoAvailable, Math.max(1, mimoQuantity));
      }
    }

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f7799e', '#eed86a', '#7fa382', '#a7c3a9', '#fcaec4']
      });
    } catch {
      // ignore confetti errors
    }

    try {
      if (onAddPledge) {
        await onAddPledge(selectedFralda.id, currentGuestName.trim(), safeFraldaQty);
        if (chosenMimo) {
          await onAddPledge(chosenMimo.id, currentGuestName.trim(), safeMimoQty);
        }
      }

      setConfirmedCombo({
        fralda: selectedFralda,
        fraldaQty: safeFraldaQty,
        mimo: chosenMimo,
        mimoQty: safeMimoQty,
        guestName: currentGuestName.trim(),
      });
      setStep('success');
    } catch (err) {
      console.error('Erro ao registrar combo de presentes:', err);
      alert('Houve um erro ao registrar o presente. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build personalized WhatsApp message
  let whatsappShareUrl = '';
  if (confirmedCombo) {
    let whatsappMessage = '';
    if (attending) {
      if (confirmedCombo.mimo) {
        whatsappMessage = `Oi Leo e Isa! 💕 Acabei de escolher o combo: ${confirmedCombo.fralda.title} (${confirmedCombo.fraldaQty} un.) + ${confirmedCombo.mimo.title} (${confirmedCombo.mimoQty} un.) para a Maitê no site! Mal posso esperar pelo Chá! 💖`;
      } else {
        whatsappMessage = `Oi Leo e Isa! 💕 Acabei de escolher o presente: ${confirmedCombo.fralda.title} (${confirmedCombo.fraldaQty} un.) para a Maitê no site! Mal posso esperar pelo Chá! 💖`;
      }
    } else {
      if (confirmedCombo.mimo) {
        whatsappMessage = `Oi Leo e Isa! 💕 Mesmo não podendo estar presente fisicamente, escolhi com muito carinho o combo: ${confirmedCombo.fralda.title} (${confirmedCombo.fraldaQty} un.) + ${confirmedCombo.mimo.title} (${confirmedCombo.mimoQty} un.) para a Maitê no site! Um beijo bem grande! 💖`;
      } else {
        whatsappMessage = `Oi Leo e Isa! 💕 Mesmo não podendo estar presente fisicamente, escolhi com muito carinho o presente: ${confirmedCombo.fralda.title} (${confirmedCombo.fraldaQty} un.) para a Maitê no site! Um beijo bem grande! 💖`;
      }
    }
    whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-blush-200 overflow-hidden relative animate-slide-up max-h-[92dvh] my-auto flex flex-col overscroll-contain"
        role="dialog"
        aria-modal="true"
      >
        {/* TOP HEADER */}
        <div className="bg-gradient-to-r from-blush-400 via-blush-500 to-blush-400 p-5 sm:p-6 text-white text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition focus:outline-none"
            aria-label="Mais tarde eu confirmo (fechar)"
            title="Mais tarde eu confirmo"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Badge */}
          <div className="w-13 h-13 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner mb-2.5">
            {step === 'invite' && (attending ? '🎉' : '💌')}
            {step === 'select_fralda' && '👶'}
            {step === 'builder' && '🎁'}
            {step === 'success' && '💕'}
          </div>

          {/* Titles per Step */}
          {step === 'invite' && (
            <>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                {attending ? 'Presença Confirmada! 🎉' : 'Obrigado por nos avisar! 💖'}
              </h3>
              <p className="text-blush-100 text-xs sm:text-sm mt-0.5 max-w-xs mx-auto">
                {attending
                  ? 'Para alegrar ainda mais os papais, que tal escolher o presente?'
                  : 'Mesmo de longe, que tal escolher um presentinho de carinho?'}
              </p>
            </>
          )}

          {step === 'select_fralda' && (
            <>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                Escolha o Tamanho da Fralda 👶
              </h3>
              <p className="text-blush-100 text-xs sm:text-sm mt-0.5">
                Passo 1 de 2 • Selecione uma das opções disponíveis
              </p>
            </>
          )}

          {step === 'builder' && (
            <>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                Montar Combo de Presente 💖
              </h3>
              <p className="text-blush-100 text-xs sm:text-sm mt-0.5">
                Passo 2 de 2 • Complete a fralda com um mimo especial
              </p>
            </>
          )}

          {step === 'success' && (
            <>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                Combo Escolhido com Amor! 💕
              </h3>
              <p className="text-blush-100 text-xs sm:text-sm mt-0.5">
                Os papais {config.parents || 'Leo e Isa'} vão amar o seu carinho!
              </p>
            </>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
          
          {/* ================= STEP 1: INVITE SCREEN ================= */}
          {step === 'invite' && (
            <div className="text-center py-4 sm:py-6 space-y-6 animate-fade-in">
              <div className="max-w-md mx-auto space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blush-50 text-blush-700 text-xs font-bold border border-blush-200">
                  <Smile className="w-3.5 h-3.5 text-blush-500" />
                  <span>Sua confirmação já foi registrada com sucesso!</span>
                </div>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  {attending ? (
                    <>
                      Ficamos muito felizes que você estará conosco para celebrar a chegada da pequena <strong>{config.babyName || 'Maitê'}</strong>!
                      <br /><br />
                      Gostaria de aproveitar para escolher agora o seu <strong>Combo de Presente</strong> (Fralda + Mimo)?
                    </>
                  ) : (
                    <>
                      Sentiremos muito sua falta, mas seu carinho continua guardado no coração dos papais!
                      <br /><br />
                      Mesmo não podendo comparecer presencialmente, gostaria de presentear a pequena <strong>{config.babyName || 'Maitê'}</strong> com um mimo especial?
                    </>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => setStep('select_fralda')}
                  className="w-full py-4 px-6 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-blush-500/25 transition flex items-center justify-center gap-2 group"
                >
                  <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>🎁 Escolher o presente agora</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-600 hover:text-slate-800 font-semibold text-xs sm:text-sm transition"
                >
                  Mais tarde eu confirmo
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: SELECT DIAPER ================= */}
          {step === 'select_fralda' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('invite')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>

                <span className="text-xs text-slate-400 font-medium">Nenhum tamanho pré-selecionado</span>
              </div>

              <div className="space-y-2.5 pt-1">
                {availableFraldas.length > 0 ? (
                  availableFraldas.map(fralda => (
                    <div
                      key={fralda.id}
                      onClick={() => handleSelectFralda(fralda)}
                      className="bg-white border-2 border-slate-200 hover:border-blush-400 hover:bg-blush-50/60 p-4 rounded-2xl transition-all cursor-pointer flex items-center gap-3.5 group shadow-xs hover:shadow-md"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blush-50 text-blush-600 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                        {fralda.icon || '👶'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-800 text-sm sm:text-base group-hover:text-blush-700 transition">
                            {fralda.title}
                          </h5>
                        </div>
                        {fralda.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {fralda.description}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <span className="px-3 py-1.5 rounded-xl bg-blush-100/70 group-hover:bg-blush-500 group-hover:text-white text-blush-700 font-bold text-xs transition">
                          Escolher →
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-6 bg-slate-50 rounded-2xl text-slate-500 text-sm">
                    Todas as cotas de fraldas já foram preenchidas por outros convidados!
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-700 underline font-medium cursor-pointer transition"
                >
                  Mais tarde eu confirmo
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: COMBO BUILDER ================= */}
          {step === 'builder' && selectedFralda && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              
              {/* BACK BUTTON */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('select_fralda')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Trocar tamanho da fralda</span>
                </button>

                <span className="text-xs text-blush-600 font-semibold">Passo 2 de 2</span>
              </div>

              {/* CHOSEN DIAPER CARD */}
              <div className="bg-blush-50/80 border border-blush-200/90 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm shrink-0">
                      {selectedFralda.icon || '👶'}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blush-700 block">
                        Fralda Selecionada
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                        {selectedFralda.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('select_fralda')}
                    className="text-[11px] font-bold text-blush-600 hover:text-blush-800 underline shrink-0"
                  >
                    Trocar
                  </button>
                </div>

                {/* Diaper Quantity Stepper */}
                <div className="flex items-center justify-between pt-2 border-t border-blush-200/60">
                  <span className="text-xs font-bold text-slate-700">Quantos pacotes vai dar?</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setFraldaQuantity(q => Math.max(1, q - 1))}
                        disabled={fraldaQuantity <= 1}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-sm"
                      >
                        -
                      </button>
                      <span className="w-9 text-center font-bold text-slate-800 text-sm">
                        {fraldaQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFraldaQuantity(q => Math.min(remainingFraldaQuota, q + 1))}
                        disabled={fraldaQuantity >= remainingFraldaQuota}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{fraldaQuantity === 1 ? 'pacote' : 'pacotes'}</span>
                  </div>
                </div>
              </div>

              {/* MIMO SELECTION (VISUAL CARD PICKER) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blush-500" />
                    <span>Escolha um Mimo para Acompanhar: <span className="text-rose-500">*</span></span>
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

                    {/* Mimos Scrollable List */}
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
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <span className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-lg shadow-2xs shrink-0 mt-0.5">
                                  {m.icon || '🎁'}
                                </span>
                                <div className="min-w-0 flex flex-col items-start gap-1 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug break-words">
                                      {m.title}
                                    </h5>
                                    {m.priority === 'high' && (
                                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded-full whitespace-nowrap">
                                        ★ Preferência
                                      </span>
                                    )}
                                    {m.priority === 'medium' && (
                                      <span className="px-1.5 py-0.5 bg-blush-100 text-blush-700 text-[9px] font-bold rounded-full whitespace-nowrap">
                                        Desejável
                                      </span>
                                    )}
                                    {m.priority === 'low' && (
                                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-medium rounded-full whitespace-nowrap">
                                        Opcional
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 leading-relaxed break-words">
                                    {m.category} {m.description ? `• ${m.description}` : ''}
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'border-blush-500 bg-blush-500 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}>
                                  {isSelected && <span className="text-[10px] font-bold">✓</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400">
                          Nenhum mimo encontrado nessa categoria.
                        </div>
                      )}
                    </div>

                    {/* Mimo Quantity Stepper if selected */}
                    {selectedMimoId && currentSelectedMimo && (
                      <div className="flex items-center justify-between p-3 bg-blush-50/50 border border-blush-200/80 rounded-2xl animate-fade-in">
                        <div>
                          <span className="block font-bold text-slate-800 text-xs">Quantidade do Mimo</span>
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
                          <span className="text-xs text-slate-500 font-medium">{mimoQuantity === 1 ? 'unidade' : 'unidades'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Todos os mimos já foram escolhidos!</p>
                )}

                {mimoError && (
                  <p className="text-xs text-rose-500 font-medium animate-pulse">
                    ⚠️ Por favor, escolha um mimo acima para completar seu combo!
                  </p>
                )}
              </div>

              {/* GUEST NAME INPUT (PRE-FILLED FROM RSVP) */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Seu Nome (como aparecerá aos papais) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={currentGuestName}
                  onChange={(e) => {
                    setCurrentGuestName(e.target.value);
                    if (e.target.value.trim()) setNameError(false);
                  }}
                  placeholder="Seu nome completo"
                  className={`w-full px-4 py-3 rounded-2xl bg-white border ${
                    nameError ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'
                  } focus:border-blush-400 focus:ring-2 focus:ring-blush-100 outline-none text-sm shadow-sm transition`}
                />
                {nameError && (
                  <p className="text-xs text-rose-500 font-medium">
                    Por favor, informe seu nome.
                  </p>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmCombo}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-blush-500/25 transition flex items-center justify-center gap-2 group"
                >
                  <Heart className="w-5 h-5 fill-current" />
                  <span>{isSubmitting ? 'Confirmando...' : 'Confirmar meu Combo de Presente! 💖'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 text-center text-xs text-slate-500 hover:text-slate-800 font-medium transition"
                >
                  Mais tarde eu confirmo
                </button>
              </div>

            </div>
          )}

          {/* ================= STEP 4: SUCCESS VIEW ================= */}
          {step === 'success' && confirmedCombo && (
            <div className="space-y-5 text-center py-2 animate-fade-in">
              <div className="bg-gradient-to-b from-blush-50/90 to-white border border-blush-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
                <div className="flex items-center gap-2 text-blush-700 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resumo do Combo Confirmado</span>
                </div>

                {/* Diaper summary item */}
                <div className="bg-white p-3.5 rounded-2xl border border-blush-100 shadow-sm flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blush-50 text-blush-600 flex items-center justify-center text-xl shrink-0">
                    {confirmedCombo.fralda.icon || '👶'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blush-600 block">Item Principal</span>
                    <h5 className="font-bold text-slate-800 text-sm leading-snug">{confirmedCombo.fralda.title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Quantidade: <strong className="text-blush-700 font-bold">{confirmedCombo.fraldaQty} {confirmedCombo.fraldaQty === 1 ? 'pacote' : 'pacotes'}</strong>
                    </p>
                  </div>
                </div>

                {/* Mimo summary item */}
                {confirmedCombo.mimo && (
                  <div className="bg-white p-3.5 rounded-2xl border border-blush-100 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blush-50 text-blush-600 flex items-center justify-center text-xl shrink-0">
                      {confirmedCombo.mimo.icon || '🎁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blush-600 block">Mimo Especial</span>
                      <h5 className="font-bold text-slate-800 text-sm leading-snug">{confirmedCombo.mimo.title}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Quantidade: <strong className="text-blush-700 font-bold">{confirmedCombo.mimoQty} {confirmedCombo.mimoQty === 1 ? 'unidade' : 'unidades'}</strong>
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500">
                    Presenteado com carinho por: <strong className="text-slate-800 text-sm">{confirmedCombo.guestName}</strong>
                  </p>
                </div>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                {attending ? (
                  <>Que emoção ter você conosco para receber a Maitê! Avise os papais no WhatsApp abaixo para comemorarmos juntos! 💕</>
                ) : (
                  <>Mesmo de longe, seu carinho enche os nossos corações de alegria! Avise os papais no WhatsApp abaixo! 💖</>
                )}
              </p>

              {/* WhatsApp Notification Button */}
              <div className="space-y-2.5 pt-1">
                {whatsappShareUrl && (
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2.5 group"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Avisar os papais no WhatsApp 💌</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold text-xs sm:text-sm transition"
                >
                  Concluir e Voltar ao Site
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

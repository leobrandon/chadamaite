import React, { useState, useMemo } from 'react';
import { Gift, Search, Sparkles, CheckCircle2, Lock, Heart } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/initialGifts';

export default function GiftList({ gifts, pledges = [], onSelectGift, onOpenAdmin, isLoading = false }) {
  const [searchQuery, setSearchQuery] = useState('');

  const safeGifts = Array.isArray(gifts) ? gifts : [];

  // Filtered gifts (Only Fraldas for the Combo view)
  const filteredGifts = useMemo(() => {
    return safeGifts.filter(gift => {
      if (!gift || gift.category !== 'Fraldas') return false;
      
      // Search match
      const matchSearch = 
        (gift.title && gift.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (gift.description && gift.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSearch;
    });
  }, [safeGifts, searchQuery]);

  const mimos = useMemo(() => safeGifts.filter(g => g.category !== 'Fraldas'), [safeGifts]);

  return (
    <section id="presentes" className="py-16 md:py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blush-100/80 text-blush-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Gift className="w-3.5 h-3.5" />
            <span>Lista de Presentes & Combos da Maitê</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
            Escolha o seu Combo de Presente
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Como funciona: Escolha o tamanho do pacote de fraldas e, em seguida, selecione um mimo especial (lenços umedecidos, pomadinhas, roupinhas, etc.) para acompanhar com todo carinho! 💕
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              maxLength={80}
              placeholder="Buscar presentes por nome, fralda, marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-20 py-3 rounded-2xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-100 outline-none text-base sm:text-sm shadow-sm transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1 font-medium"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Mimos Preview Section */}
          {mimos.length > 0 && (
            <div className="bg-white/60 border border-slate-200/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🧸</span>
                <h3 className="font-semibold text-sm text-slate-700 uppercase tracking-wide">Mimos disponíveis para acompanhar:</h3>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent z-10" />
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none overscroll-x-contain pr-4">
                  {mimos.map(mimo => {
                    const mimoPledges = pledges.filter(p => p.giftId === mimo.id);
                    const mimoPledgedTotal = mimoPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
                    const mimoTarget = Number(mimo.targetQuantity) || 5;
                    const isMimoCompleted = mimoPledgedTotal >= mimoTarget;
                    
                    return (
                      <div key={mimo.id} className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${isMimoCompleted ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60' : 'bg-blush-50 text-blush-700 border-blush-100 hover:bg-blush-100/70'}`}>
                        <span className="text-base">{mimo.icon || '🎁'}</span>
                        <span className="truncate max-w-[150px]">{mimo.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Gift Cards Grid or Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between border-blush-100/80 animate-pulse bg-white/70 min-h-[240px]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-blush-100/70" />
                    <div className="w-20 h-5 rounded-full bg-slate-200/70" />
                  </div>
                  <div className="w-3/4 h-6 rounded-xl bg-slate-200/80 mb-2.5" />
                  <div className="w-full h-3.5 rounded-lg bg-slate-100 mb-1.5" />
                  <div className="w-2/3 h-3.5 rounded-lg bg-slate-100" />
                </div>
                <div className="pt-3 border-t border-slate-100/70 mt-4">
                  <div className="w-full h-11 rounded-2xl bg-blush-100/60" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredGifts.map((gift) => {
              const giftPledges = pledges.filter(p => p.giftId === gift.id);
              const totalPledged = giftPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
              const targetQty = Number(gift.targetQuantity) || 5;
              const isCompleted = totalPledged >= targetQty;

              return (
                <div
                  key={gift.id}
                  className={`glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden border-blush-100/90 ${
                    isCompleted
                      ? 'bg-white/70 opacity-95'
                      : 'hover:-translate-y-1 hover:shadow-lg transition-all duration-300'
                  }`}
                >
                  {/* Top card row */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-blush-50 text-blush-600 border border-blush-100 shrink-0">
                        {gift.icon || '🎁'}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blush-100 text-blush-700 border border-blush-200 shadow-sm flex items-center gap-1">
                          🎁 Combo: Fralda + Mimo
                        </span>

                        {gift.priority === 'high' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blush-100 text-blush-700">
                            ★ Preferência
                          </span>
                        )}

                        {isCompleted && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sage-50 text-sage-700 border border-sage-200/80 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-sage-600" /> Completo ✨
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-800 mb-1.5 leading-snug">
                      {gift.title}
                    </h3>

                    {gift.description && (
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                        {gift.description}
                      </p>
                    )}

                    <div className="mt-2 mb-2 bg-blush-50/50 rounded-lg p-2.5 border border-blush-100/50">
                      <p className="text-blush-600 text-xs font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        + Inclui 1 Mimo à sua escolha no próximo passo ✨
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Area */}
                  <div className="pt-3 border-t border-slate-100/70 mt-3">
                    {isCompleted ? (
                      <div className="space-y-1.5">
                        <p className="text-center text-[11px] text-sage-700 font-medium italic">
                          Combo já completo por outros convidados ✨
                        </p>
                        <button
                          disabled
                          aria-disabled="true"
                          className="w-full py-3 px-4 rounded-2xl font-semibold text-xs sm:text-sm bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed flex items-center justify-center gap-2 select-none shadow-none"
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Limite deste combo já foi preenchido 💖</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectGift(gift)}
                        className="w-full py-3 px-4 rounded-2xl active:scale-[0.98] font-bold text-xs sm:text-sm bg-blush-500 hover:bg-blush-600 text-white shadow-md shadow-blush-500/20 hover:shadow-blush-500/30 transition flex items-center justify-center gap-2 group cursor-pointer"
                      >
                        <Heart className="w-4 h-4 group-hover:scale-125 transition-transform fill-white" />
                        <span>Vou dar este Combo (Fralda + Mimo) 💖</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/70 rounded-3xl border border-blush-100 max-w-md mx-auto p-8">
            <div className="w-14 h-14 mx-auto rounded-full bg-blush-50 flex items-center justify-center text-blush-400 mb-3">
              <Gift className="w-7 h-7" />
            </div>
            <h4 className="font-serif text-lg font-bold text-slate-800 mb-1">
              Nenhum presente encontrado
            </h4>
            <p className="text-slate-500 text-xs sm:text-sm mb-4">
              Tente alterar os filtros ou a busca digitada acima.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-blush-500 text-white text-xs font-semibold hover:bg-blush-600 transition"
            >
              Ver todos os presentes
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

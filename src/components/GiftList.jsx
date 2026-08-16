import React, { useState, useMemo } from 'react';
import { Gift, Search, Sparkles, Filter, CheckCircle2, Lock, Heart, PlusCircle } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/initialGifts';

export default function GiftList({ gifts, onSelectGift, onOpenAdmin }) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'available' | 'reserved'

  const categories = INITIAL_CATEGORIES;
  const safeGifts = Array.isArray(gifts) ? gifts : [];

  // Stats calculation
  const totalCount = safeGifts.length;
  const reservedCount = safeGifts.filter(g => g && g.status === 'reserved').length;
  const availableCount = totalCount - reservedCount;
  const percentageReserved = totalCount > 0 ? Math.round((reservedCount / totalCount) * 100) : 0;

  // Filtered gifts
  const filteredGifts = useMemo(() => {
    return safeGifts.filter(gift => {
      if (!gift) return false;
      // Category match
      const matchCategory = selectedCategory === 'Todas' || gift.category === selectedCategory;
      
      // Search match
      const matchSearch = 
        (gift.title && gift.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (gift.description && gift.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (gift.category && gift.category.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status match
      const matchStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'available' && gift.status === 'available') ||
        (statusFilter === 'reserved' && gift.status === 'reserved');

      return matchCategory && matchSearch && matchStatus;
    });
  }, [safeGifts, selectedCategory, searchQuery, statusFilter]);

  return (
    <section id="presentes" className="py-16 md:py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blush-100/80 text-blush-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Gift className="w-3.5 h-3.5" />
            <span>Lista de Presentes da Maitê</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
            Escolha o que gostaria de dar
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Selecione o presente desejado. Ao clicar em <strong>"Vou dar este presente"</strong>, ele ficará reservado para você.
          </p>
        </div>

        {/* Progress Bar / Summary Card */}
        <div className="glass-card max-w-3xl mx-auto p-5 sm:p-6 rounded-3xl mb-10 shadow-sm border border-blush-200/70">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Status da Lista
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-serif text-2xl font-bold text-blush-600">
                  {reservedCount} de {totalCount}
                </span>
                <span className="text-xs text-slate-500">presentes já foram escolhidos</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                🟢 {availableCount} Disponíveis
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-blush-50 text-blush-700 border border-blush-200">
                💖 {reservedCount} Reservados
              </span>
            </div>
          </div>

          {/* Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-blush-400 to-blush-500 rounded-full transition-all duration-700"
              style={{ width: `${percentageReserved}%` }}
            />
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          
          {/* Search bar + Status Toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar presentes por nome, fralda, marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-100 outline-none text-sm shadow-sm transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Status Segmented Control */}
            <div className="flex items-center bg-white border border-slate-200 p-1 rounded-2xl shadow-sm self-stretch sm:self-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  statusFilter === 'all'
                    ? 'bg-blush-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('available')}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  statusFilter === 'available'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disponíveis ({availableCount})
              </button>
              <button
                onClick={() => setStatusFilter('reserved')}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  statusFilter === 'reserved'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reservados ({reservedCount})
              </button>
            </div>
          </div>

          {/* Categories Pill Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm scale-105'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-blush-300 hover:bg-blush-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* Gift Cards Grid */}
        {filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredGifts.map((gift) => {
              const isReserved = gift.status === 'reserved';

              return (
                <div
                  key={gift.id}
                  className={`glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                    isReserved
                      ? 'opacity-75 bg-slate-50/90 border-slate-200'
                      : 'glass-card-hover border-blush-100/90'
                  }`}
                >
                  {/* Top card row */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${
                        isReserved ? 'bg-slate-200 text-slate-400' : 'bg-blush-50 text-blush-600 border border-blush-100'
                      }`}>
                        {gift.icon || '🎁'}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {gift.category}
                        </span>

                        {gift.priority === 'high' && !isReserved && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blush-100 text-blush-700">
                            ★ Preferência
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
                  </div>

                  {/* Bottom Action Area */}
                  <div className="pt-4 border-t border-slate-100/80">
                    {isReserved ? (
                      <div className="flex items-center justify-between bg-slate-100 px-4 py-2.5 rounded-2xl text-slate-500 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Já foi reservado! 💖</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Obrigado!</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectGift(gift)}
                        className="w-full py-3 px-4 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-blush-500/20 hover:shadow-blush-500/30 transition flex items-center justify-center gap-2 group"
                      >
                        <Heart className="w-4 h-4 group-hover:scale-125 transition-transform fill-white" />
                        <span>Vou dar este presente</span>
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
                setSelectedCategory('Todas');
                setSearchQuery('');
                setStatusFilter('all');
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

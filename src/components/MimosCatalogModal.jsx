import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function MimosCatalogModal({ isOpen, onClose, mimos = [], pledges = [], onScrollToGifts, onSelectMimo }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(mimos.map((m) => m.category).filter(Boolean));
    return ['Todos', ...Array.from(set)];
  }, [mimos]);

  // Filtered mimos
  const filteredMimos = useMemo(() => {
    return mimos.filter((mimo) => {
      const matchCat = selectedCategory === 'Todos' || mimo.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (mimo.title && mimo.title.toLowerCase().includes(q)) ||
        (mimo.category && mimo.category.toLowerCase().includes(q)) ||
        (mimo.description && mimo.description.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [mimos, selectedCategory, search]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-blush-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-b from-blush-50/60 to-white dark:from-slate-800/50 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blush-100 dark:bg-blush-950/80 text-blush-600 dark:text-blush-400 flex items-center justify-center text-xl shrink-0 border border-blush-200 dark:border-blush-800">
              🧸
            </div>
            <div>
              <h2 id="catalog-title" className="font-serif text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                Catálogo de Mimos para o Combo
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Veja as opções disponíveis que você pode escolher junto com o pacote de fraldas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar catálogo"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar mimo por nome ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 dark:focus:ring-blush-950 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          {categories.length > 2 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blush-500 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mimos Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 overscroll-contain">
          {filteredMimos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMimos.map((mimo) => {
                const mimoPledges = pledges.filter((p) => p.giftId === mimo.id);
                const mimoPledgedTotal = mimoPledges.reduce(
                  (sum, p) => sum + (Number(p.quantity) || 1),
                  0
                );
                const mimoTarget = Number(mimo.targetQuantity) || 5;
                const isCompleted = mimoPledgedTotal >= mimoTarget;

                return (
                  <div
                    key={mimo.id}
                    onClick={() => {
                      if (!isCompleted && onSelectMimo) {
                        onSelectMimo(mimo);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                      isCompleted
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-750 opacity-60'
                        : 'bg-white dark:bg-slate-800/80 border-blush-100 dark:border-slate-700 hover:border-blush-400 dark:hover:border-blush-500 shadow-xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:bg-slate-50/80 dark:hover:bg-slate-750'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-blush-50 dark:bg-slate-700 text-blush-600 dark:text-blush-300 flex items-center justify-center text-xl shrink-0 border border-blush-100/80 dark:border-slate-600">
                      {mimo.icon || '🎁'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                          {mimo.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {mimo.priority === 'high' && (
                          <span className="text-[9px] text-amber-800 dark:text-amber-300 font-bold bg-amber-100/90 dark:bg-amber-950/80 px-1.5 py-0.5 rounded-md">
                            ★ Preferência
                          </span>
                        )}
                        {mimo.priority === 'medium' && (
                          <span className="text-[9px] text-blush-700 dark:text-blush-300 font-bold bg-blush-100/80 dark:bg-blush-950/80 px-1.5 py-0.5 rounded-md">
                            Desejável
                          </span>
                        )}
                        {mimo.priority === 'low' && (
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                            Opcional
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {mimo.category}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between text-[11px] gap-2">
                        {isCompleted ? (
                          <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sage-500" />
                            Já preenchido ✨
                          </span>
                        ) : (
                          <>
                            <span className="text-blush-600 dark:text-blush-400 font-medium flex items-center gap-1 text-[11px]">
                              <Sparkles className="w-3 h-3" />
                              Disponível
                            </span>
                            <span className="text-[11px] font-bold text-blush-700 dark:text-blush-300 bg-blush-50 dark:bg-blush-950/80 hover:bg-blush-100 px-2.5 py-1 rounded-lg border border-blush-200 dark:border-blush-800 transition">
                              Escolher com Fralda ›
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xs text-slate-400">Nenhum mimo encontrado para essa busca.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600 dark:text-slate-300 text-center sm:text-left">
            💡 <strong className="font-semibold">Como presentear:</strong> Escolha seu pacote de fraldas (M ou G) na tela para selecionar o mimo desejado!
          </p>
          <button
            onClick={() => {
              onClose();
              if (onScrollToGifts) onScrollToGifts();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-blush-500 hover:bg-blush-600 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Escolher pacote de fraldas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}

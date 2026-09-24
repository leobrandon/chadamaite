import React, { useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Lock, ArrowRight, Heart } from 'lucide-react';

export default function MimoComboSelectModal({
  isOpen,
  onClose,
  mimo,
  gifts = [],
  pledges = [],
  onSelectDiaper,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mimo) return null;

  // Filter diaper gifts
  const diaperGifts = (gifts || [])
    .filter((g) => g.category === 'Fraldas')
    .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mimo-combo-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-blush-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up my-auto flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blush-400 via-blush-500 to-blush-400 p-5 text-white relative text-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-2xl shadow-inner mb-2">
            🎁
          </div>

          <h3 id="mimo-combo-title" className="font-serif text-lg sm:text-xl font-bold tracking-tight">
            Montar Combo de Presente
          </h3>
          <p className="text-blush-100 text-xs mt-0.5">
            Você escolheu o mimo! Agora escolha o pacote de fralda para acompanhar.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Card do Mimo Selecionado */}
          <div className="bg-gradient-to-br from-blush-50/90 to-white dark:from-slate-800 dark:to-slate-800/70 border border-blush-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blush-700 dark:text-blush-300 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blush-500" />
              <span>Mimo Selecionado</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 text-blush-600 dark:text-blush-300 flex items-center justify-center text-2xl shrink-0 shadow-xs border border-blush-100 dark:border-slate-600">
                {mimo.icon || '🧸'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-snug">
                  {mimo.title}
                </h4>
                {mimo.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {mimo.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {mimo.priority === 'high' && (
                    <span className="text-[9px] text-amber-800 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/90 border border-amber-200/80 dark:border-amber-700/60 px-2 py-0.5 rounded-md">
                      ★ Preferência
                    </span>
                  )}
                  {mimo.priority === 'medium' && (
                    <span className="text-[9px] text-blush-700 dark:text-blush-300 font-bold bg-blush-100 dark:bg-blush-950/90 border border-blush-200/80 dark:border-blush-700/60 px-2 py-0.5 rounded-md">
                      Desejável
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {mimo.category}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seletor de Fralda */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>🍼 Escolha o Pacote de Fraldas:</span>
              </span>
              <span className="text-[11px] text-blush-600 dark:text-blush-400 font-semibold">
                Passo Final
              </span>
            </div>

            <div className="space-y-2.5">
              {diaperGifts.map((diaper) => {
                const diaperPledges = (pledges || []).filter((p) => p.giftId === diaper.id);
                const totalPledged = diaperPledges.reduce(
                  (sum, p) => sum + (Number(p.quantity) || 1),
                  0
                );
                const targetQty = Number(diaper.targetQuantity) || 5;
                const isCompleted = totalPledged >= targetQty;

                return (
                  <div
                    key={diaper.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-750 opacity-60'
                        : 'bg-white dark:bg-slate-800 border-blush-200 dark:border-slate-700 hover:border-blush-400 dark:hover:border-blush-500 hover:shadow-md hover:-translate-y-0.5 hover:bg-slate-50/80 dark:hover:bg-slate-750'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blush-50 dark:bg-slate-700 flex items-center justify-center text-xl shrink-0 border border-blush-100 dark:border-slate-600">
                          {diaper.icon || '👶'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                              {diaper.title}
                            </h5>
                          </div>
                          {diaper.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {diaper.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="shrink-0">
                        {isCompleted ? (
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Completo
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectDiaper(diaper, mimo)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blush-500 hover:bg-blush-600 active:scale-95 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Heart className="w-3.5 h-3.5 fill-white" />
                            <span>Levar com este</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
            Ao clicar, o combo será aberto para você digitar seu nome e confirmar com carinho. 💕
          </p>

        </div>

      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { X, Gift } from 'lucide-react';

export default function GiftSuggestModal({ isOpen, onClose, gifts = [], pledges = [], onSelectGift }) {
  const availableFraldas = useMemo(() => {
    return gifts
      .filter(g => g.category === 'Fraldas')
      .filter(g => {
        const pList = pledges.filter(p => p.giftId === g.id);
        const pledgedTotal = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
        const target = Number(g.targetQuantity) || 5;
        return pledgedTotal < target;
      })
      .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
  }, [gifts, pledges]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-blush-200 overflow-hidden relative animate-slide-up flex flex-col max-h-[90dvh]">
        <div className="bg-gradient-to-r from-blush-400 via-blush-500 to-blush-400 p-5 text-white text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition focus:outline-none"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner mb-2">
            🎁
          </div>
          <h3 className="font-serif text-xl font-bold tracking-tight">Quer também presentear a Maitê? 🎁</h3>
          <p className="text-blush-100 text-xs mt-1">Escolha uma Fralda e adicione um Mimo especial!</p>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {availableFraldas.length > 0 ? (
            availableFraldas.map(gift => {
              const pList = pledges.filter(p => p.giftId === gift.id);
              const totalPledged = pList.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
              const target = Number(gift.targetQuantity) || 5;
              
              return (
                <div
                  key={gift.id}
                  onClick={() => {
                    onSelectGift(gift);
                    onClose();
                  }}
                  className="bg-white border border-slate-200 hover:border-blush-300 hover:bg-blush-50/50 p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blush-50 text-blush-600 flex items-center justify-center text-xl shrink-0">
                    {gift.icon || '👶'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-800 text-sm truncate">{gift.title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {totalPledged} de {target} contribuições
                    </p>
                  </div>
                  <div className="shrink-0 text-blush-500">
                    <Gift className="w-5 h-5" />
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center p-4 text-slate-500 text-sm">
              Todos os presentes já foram escolhidos!
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition"
          >
            Talvez depois →
          </button>
        </div>
      </div>
    </div>
  );
}

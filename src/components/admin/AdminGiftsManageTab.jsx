import React, { useState } from 'react';
import { Plus, RefreshCw, Search, X, Edit2 } from 'lucide-react';
import { INITIAL_CATEGORIES, BABY_EMOJIS } from '../../data/initialGifts';

export default function AdminGiftsManageTab({
  gifts = [],
  pledges = [],
  onAddGift,
  onEditGift,
  onResetGifts,
  onRequestConfirm,
}) {
  // New Gift Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Fraldas');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('🎁');
  const [newPriority, setNewPriority] = useState('medium');
  const [newTargetQuantity, setNewTargetQuantity] = useState(5);
  const [newDisplayOrder, setNewDisplayOrder] = useState('');

  // Search filter
  const [giftManageSearch, setGiftManageSearch] = useState('');

  const handleCreateGift = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onAddGift({
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim(),
      icon: newIcon || '🎁',
      priority: newPriority,
      targetQuantity: Number(newTargetQuantity) || 5,
      displayOrder: Number(newDisplayOrder) || (gifts.length + 1),
    });

    setNewTitle('');
    setNewDesc('');
    setNewTargetQuantity(5);
    setNewDisplayOrder('');
  };

  const filteredGifts = gifts
    .filter((gift) => {
      if (!giftManageSearch.trim()) return true;
      const q = giftManageSearch.toLowerCase();
      return (
        (gift.title || '').toLowerCase().includes(q) ||
        (gift.category || '').toLowerCase().includes(q) ||
        (gift.description || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

  return (
    <div className="space-y-6">
      {/* Add New Gift Box */}
      <div className="bg-white dark:bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-blush-200 dark:border-slate-800 shadow-sm">
        <h5 className="font-bold text-slate-800 dark:text-white text-sm mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blush-500 dark:text-blush-400" />
          <span>Adicionar Novo Presente à Lista</span>
        </h5>

        <form onSubmit={handleCreateGift} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Ícone (Emoji)</label>
            <select
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="w-full px-2.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blush-400 dark:focus:border-blush-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
            >
              {BABY_EMOJIS.map((item) => (
                <option key={item.emoji} value={item.emoji}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Nome do Item *</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex: Banheira Ergonômica com Suporte"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Categoria</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blush-400 dark:focus:border-blush-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
            >
              {INITIAL_CATEGORIES.filter(c => c !== 'Todas').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Prioridade</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blush-400 dark:focus:border-blush-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
            >
              <option value="high">★ Alta (Preferência)</option>
              <option value="medium">Média (Desejável)</option>
              <option value="low">Baixa (Opcional)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Meta Desejada</label>
            <input
              type="number"
              min="1"
              max="999"
              required
              value={newTargetQuantity}
              onChange={(e) => setNewTargetQuantity(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1" title="Ordem de exibição da esquerda para a direita, de cima para baixo">Posição na Lista</label>
            <input
              type="number"
              min="1"
              max="999"
              value={newDisplayOrder}
              onChange={(e) => setNewDisplayOrder(e.target.value)}
              placeholder={String(gifts.length + 1)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div className="sm:col-span-10">
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Descrição / Tamanho / Sugestão de Marca</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Ex: Cor rosa ou neutra, preferência por marcas com trava de segurança"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blush-500 hover:bg-blush-600 text-white font-bold text-xs shadow-sm transition"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>

      {/* Gifts Card List — mobile-friendly, fully clickable */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-white text-sm">
            Todos os Presentes ({gifts.length})
          </span>
          <button
            onClick={() => {
              onRequestConfirm({
                title: 'Restaurar Lista Padrão',
                message: 'Tem certeza que deseja restaurar a lista padrão de presentes? Todas as adições e edições manuais serão redefinidas para o modelo inicial.',
                confirmText: 'Sim, Restaurar',
                cancelText: 'Cancelar',
                isDestructive: true,
                onConfirm: () => onResetGifts(),
              });
            }}
            className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restaurar Lista Padrão</span>
          </button>
        </div>

        {/* Search bar for gifts list */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={giftManageSearch}
              onChange={(e) => setGiftManageSearch(e.target.value)}
              placeholder="Buscar item por nome, categoria ou marca..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500 focus:ring-2 focus:ring-blush-100 dark:focus:ring-blush-950 transition"
            />
            {giftManageSearch && (
              <button
                type="button"
                onClick={() => setGiftManageSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredGifts.map((gift) => {
            const giftPledges = pledges.filter(p => p.giftId === gift.id);
            const totalUnits = giftPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
            const targetQty = Number(gift.targetQuantity) || 5;
            const isCompleted = totalUnits >= targetQty;

            return (
              <button
                key={gift.id}
                onClick={() => onEditGift(gift)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-blush-50/50 dark:active:bg-slate-800 transition text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-blush-50 dark:bg-blush-950/40 border border-blush-100 dark:border-blush-900/50 flex items-center justify-center text-xl shrink-0 relative">
                  <span className="absolute -top-2 -left-2 bg-slate-800 dark:bg-slate-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    #{gift.displayOrder || '-'}
                  </span>
                  {gift.icon || '🎁'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-white text-sm leading-snug truncate">
                    {gift.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                      {gift.category}
                    </span>
                    {gift.priority === 'high' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border dark:border-amber-800/60 font-bold text-[10px]">★ Preferência</span>
                    )}
                    {gift.priority === 'medium' && (
                      <span className="px-2 py-0.5 rounded-full bg-blush-100 dark:bg-blush-950/60 text-blush-700 dark:text-blush-300 border dark:border-blush-800/60 font-bold text-[10px]">Desejável</span>
                    )}
                    {gift.priority === 'low' && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10px]">Opcional</span>
                    )}
                    {giftPledges.length > 0 ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border dark:border-emerald-800/60' : 'bg-blush-100 dark:bg-blush-950/60 text-blush-700 dark:text-blush-300 border dark:border-blush-800/60'
                      }`}>
                        {isCompleted ? '🎉 ' : '💝 '}{totalUnits}/{targetQty} un. ({giftPledges.length} contrib.)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                        0/{targetQty} un.
                      </span>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <Edit2 className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blush-400 transition shrink-0" />
              </button>
            );
          })}
          {filteredGifts.length === 0 && (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              Nenhum presente encontrado para "{giftManageSearch}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

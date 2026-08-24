import React, { useState } from 'react';
import { Plus, RefreshCw, Search, X, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
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
    setIsAddFormOpen(false);
  };

  const safeGifts = Array.isArray(gifts) ? gifts : [];
  const safePledges = Array.isArray(pledges) ? pledges : [];

  const filteredGifts = safeGifts
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
    <div className="space-y-4">
      {/* Add New Gift Accordion / Collapsible Box */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-blush-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blush-50 dark:bg-blush-950/60 text-blush-600 dark:text-blush-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-slate-800 dark:text-white text-sm">
                Adicionar Novo Presente à Lista
              </h5>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Cadastre novos itens, fraldas e mimos com metas de quantidade
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-blush-600 dark:text-blush-400 flex items-center gap-1">
            <span>{isAddFormOpen ? 'Recolher' : 'Cadastrar'}</span>
            {isAddFormOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isAddFormOpen && (
          <form onSubmit={handleCreateGift} className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3.5 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Ícone</label>
                <select
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blush-400 dark:focus:border-blush-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                >
                  {BABY_EMOJIS.map((item) => (
                    <option key={item.emoji} value={item.emoji}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-9">
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Nome do Item *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Banheira Ergonômica com Suporte"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blush-400 dark:focus:border-blush-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                >
                  {INITIAL_CATEGORIES.filter(c => c !== 'Todas').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Prioridade</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blush-400 dark:focus:border-blush-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                >
                  <option value="high">★ Alta (Preferência)</option>
                  <option value="medium">Média (Desejável)</option>
                  <option value="low">Baixa (Opcional)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Meta (Qtd)</label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  required
                  value={newTargetQuantity}
                  onChange={(e) => setNewTargetQuantity(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Posição</label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={newDisplayOrder}
                  onChange={(e) => setNewDisplayOrder(e.target.value)}
                  placeholder={String(safeGifts.length + 1)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Descrição / Tamanho / Sugestão de Marca</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ex: Cor rosa ou neutra, tamanho M ou G"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blush-500 hover:bg-blush-600 text-white font-bold text-xs shadow-sm transition min-h-[40px]"
              >
                Salvar e Adicionar Presente
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Gifts Card List */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <span className="font-bold text-slate-800 dark:text-white text-sm">
            Todos os Presentes ({safeGifts.length})
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
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500 transition"
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
            const giftPledges = safePledges.filter(p => p.giftId === gift.id);
            const totalUnits = giftPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
            const targetQty = Number(gift.targetQuantity) || 5;
            const isCompleted = totalUnits >= targetQty;

            return (
              <button
                key={gift.id}
                onClick={() => onEditGift(gift)}
                className="w-full flex items-center gap-3 px-3.5 sm:px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-blush-50/50 dark:active:bg-slate-800 transition text-left group min-h-[64px]"
              >
                <div className="w-10 h-10 rounded-xl bg-blush-50 dark:bg-blush-950/40 border border-blush-100 dark:border-blush-900/50 flex items-center justify-center text-xl shrink-0 relative">
                  <span className="absolute -top-2 -left-2 bg-slate-800 dark:bg-slate-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    #{gift.displayOrder || '-'}
                  </span>
                  {gift.icon || '🎁'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm leading-snug truncate">
                    {gift.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
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
                        {isCompleted ? '🎉 ' : '💝 '}{totalUnits}/{targetQty} un. ({giftPledges.length} conv.)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                        0/{targetQty} un.
                      </span>
                    )}
                  </div>
                </div>

                {/* Chevron/Edit Icon */}
                <div className="shrink-0 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blush-600 dark:group-hover:text-blush-400 transition">
                  <Edit2 className="w-3.5 h-3.5" />
                </div>
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

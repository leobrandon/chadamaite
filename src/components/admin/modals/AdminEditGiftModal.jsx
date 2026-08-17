import React from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { INITIAL_CATEGORIES, BABY_EMOJIS } from '../../../data/initialGifts';

export default function AdminEditGiftModal({
  editingGift,
  setEditingGift,
  onSaveEditedGift,
  onDeleteGift,
  onRequestConfirm,
}) {
  if (!editingGift) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90dvh] overflow-y-auto overscroll-contain">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{editingGift.icon || '🎁'}</span>
            <h4 className="font-bold text-slate-800 text-base">Editar Presente</h4>
          </div>
          <button
            onClick={() => setEditingGift(null)}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSaveEditedGift} className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Ícone (Emoji)</label>
            <select
              value={editingGift.icon || '🎁'}
              onChange={(e) => setEditingGift({ ...editingGift, icon: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
            >
              {BABY_EMOJIS.map((item) => (
                <option key={item.emoji} value={item.emoji}>{item.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Nome do Item *</label>
            <input
              type="text"
              required
              value={editingGift.title}
              onChange={(e) => setEditingGift({ ...editingGift, title: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Categoria</label>
              <select
                value={editingGift.category}
                onChange={(e) => setEditingGift({ ...editingGift, category: e.target.value })}
                className="w-full px-2.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
              >
                {INITIAL_CATEGORIES.filter(c => c !== 'Todas').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Prioridade</label>
              <select
                value={editingGift.priority || 'medium'}
                onChange={(e) => setEditingGift({ ...editingGift, priority: e.target.value })}
                className="w-full px-2.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
              >
                <option value="high">★ Alta (Preferência)</option>
                <option value="medium">Média (Desejável)</option>
                <option value="low">Baixa (Opcional)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Meta (Qtd)</label>
              <input
                type="number"
                min="1"
                max="999"
                required
                value={editingGift.targetQuantity ?? 5}
                onChange={(e) => setEditingGift({ ...editingGift, targetQuantity: parseInt(e.target.value) || 1 })}
                className="w-full px-2.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5" title="Ordem da esquerda para direita, de cima para baixo">Posição #{editingGift.displayOrder || '-'}</label>
              <input
                type="number"
                min="1"
                max="999"
                required
                value={editingGift.displayOrder ?? 1}
                onChange={(e) => setEditingGift({ ...editingGift, displayOrder: parseInt(e.target.value) || 1 })}
                className="w-full px-2.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition font-bold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Descrição / Sugestão de Marca</label>
            <textarea
              rows="2"
              value={editingGift.description}
              onChange={(e) => setEditingGift({ ...editingGift, description: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blush-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={() => setEditingGift(null)}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition"
            >
              Cancelar
            </button>
          </div>

          {/* Danger Zone — Delete */}
          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onRequestConfirm({
                  title: 'Excluir Presente',
                  message: `Tem certeza que deseja excluir o presente "${editingGift.title}" permanentemente da lista?`,
                  confirmText: 'Sim, Excluir Presente',
                  cancelText: 'Cancelar',
                  isDestructive: true,
                  onConfirm: async () => {
                    await onDeleteGift(editingGift.id);
                    setEditingGift(null);
                  },
                });
              }}
              className="w-full py-2.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-[0.98] font-semibold text-sm transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Excluir este presente
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

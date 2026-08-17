import React from 'react';
import { Edit2, X, Check } from 'lucide-react';

export default function AdminEditMessageModal({
  editingMessage,
  setEditingMessage,
  isSavingMessage,
  setIsSavingMessage,
  onUpdateMessage,
}) {
  if (!editingMessage) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-blush-100 dark:border-slate-800 overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-blush-400 to-blush-500 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Edit2 className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-base">Editar Recado</h3>
              <p className="text-xs text-white/80">Altere o nome ou o texto do recado</p>
            </div>
          </div>
          <button
            onClick={() => setEditingMessage(null)}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const author = editingMessage.author.trim();
            const text = editingMessage.text.trim();
            if (!author || !text) return;
            setIsSavingMessage(true);
            try {
              if (onUpdateMessage) {
                await onUpdateMessage(editingMessage.id, { author, text });
              }
              setEditingMessage(null);
            } catch (err) {
              console.error('Erro ao salvar recado:', err);
            } finally {
              setIsSavingMessage(false);
            }
          }}
          className="p-5 space-y-4"
        >
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Nome do Autor *
            </label>
            <input
              type="text"
              maxLength={80}
              required
              value={editingMessage.author}
              onChange={(e) => setEditingMessage((prev) => ({ ...prev, author: e.target.value }))}
              placeholder="Nome de quem enviou o recado"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500 focus:ring-2 focus:ring-blush-100 dark:focus:ring-blush-950 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Texto do Recado *
            </label>
            <textarea
              rows={4}
              maxLength={1000}
              required
              value={editingMessage.text}
              onChange={(e) => setEditingMessage((prev) => ({ ...prev, text: e.target.value }))}
              placeholder="Mensagem do convidado..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none focus:border-blush-400 dark:focus:border-blush-500 focus:ring-2 focus:ring-blush-100 dark:focus:ring-blush-950 transition"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-right">{editingMessage.text.length}/1000 caracteres</p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isSavingMessage}
              className="flex-1 py-3 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blush-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              {isSavingMessage ? 'Salvando...' : 'Salvar Recado'}
            </button>
            <button
              type="button"
              onClick={() => setEditingMessage(null)}
              className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

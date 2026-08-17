import React from 'react';
import { X, Check } from 'lucide-react';
import { formatPhone, handlePhoneKeyDown } from '../../../utils/phoneMask';

export default function AdminEditRsvpModal({
  editingRsvp,
  setEditingRsvp,
  onSaveEditedRsvp,
}) {
  if (!editingRsvp) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90dvh] overflow-y-auto overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            <h4 className="font-bold text-slate-800 text-base">Editar Confirmação</h4>
          </div>
          <button
            onClick={() => setEditingRsvp(null)}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSaveEditedRsvp();
          }}
          className="p-5 space-y-4"
        >
          {/* Name (read-only) */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Convidado</label>
            <p className="font-semibold text-slate-800 text-sm">{editingRsvp.name}</p>
          </div>

          {/* Adults */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Adultos</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const v = Math.max(1, (editingRsvp.adultsCount || 1) - 1);
                  setEditingRsvp((prev) => {
                    const companions = [...(prev.companionNames || [])];
                    const total = v + (prev.childrenCount || 0);
                    const needed = Math.max(0, total - 1);
                    while (companions.length < needed) companions.push('');
                    return { ...prev, adultsCount: v, companionNames: companions.slice(0, needed) };
                  });
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-slate-800">{editingRsvp.adultsCount || 1}</span>
              <button
                type="button"
                onClick={() => {
                  const v = (editingRsvp.adultsCount || 1) + 1;
                  setEditingRsvp((prev) => {
                    const companions = [...(prev.companionNames || [])];
                    const total = v + (prev.childrenCount || 0);
                    const needed = Math.max(0, total - 1);
                    while (companions.length < needed) companions.push('');
                    return { ...prev, adultsCount: v, companionNames: companions.slice(0, needed) };
                  });
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Children */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Crianças</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const v = Math.max(0, (editingRsvp.childrenCount || 0) - 1);
                  setEditingRsvp((prev) => {
                    const companions = [...(prev.companionNames || [])];
                    const total = (prev.adultsCount || 1) + v;
                    const needed = Math.max(0, total - 1);
                    while (companions.length < needed) companions.push('');
                    return { ...prev, childrenCount: v, companionNames: companions.slice(0, needed) };
                  });
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-slate-800">{editingRsvp.childrenCount || 0}</span>
              <button
                type="button"
                onClick={() => {
                  const v = (editingRsvp.childrenCount || 0) + 1;
                  setEditingRsvp((prev) => {
                    const companions = [...(prev.companionNames || [])];
                    const total = (prev.adultsCount || 1) + v;
                    const needed = Math.max(0, total - 1);
                    while (companions.length < needed) companions.push('');
                    return { ...prev, childrenCount: v, companionNames: companions.slice(0, needed) };
                  });
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Companions */}
          {(editingRsvp.companionNames || []).length > 0 && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">
                Nome dos Acompanhantes e Crianças * (Obrigatório)
              </label>
              <div className="space-y-2">
                {(editingRsvp.companionNames || []).map((name, i) => (
                  <input
                    key={i}
                    type="text"
                    required={true}
                    value={name}
                    onChange={(e) => {
                      const next = [...(editingRsvp.companionNames || [])];
                      next[i] = e.target.value;
                      setEditingRsvp((prev) => ({ ...prev, companionNames: next }));
                    }}
                    placeholder={`Nome do acompanhante / criança ${i + 1} *`}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">WhatsApp / Telefone</label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={15}
              value={editingRsvp.phone || ''}
              onKeyDown={handlePhoneKeyDown}
              onChange={(e) => setEditingRsvp((prev) => ({ ...prev, phone: formatPhone(e.target.value) }))}
              placeholder="(11) 99999-9999"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Recado com Carinho</label>
            <textarea
              rows="3"
              value={editingRsvp.message || ''}
              onChange={(e) => setEditingRsvp((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Recado deixado pelo convidado..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blush-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Salvar Alterações
            </button>
            <button
              type="button"
              onClick={() => setEditingRsvp(null)}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

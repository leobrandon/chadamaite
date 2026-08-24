import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, XCircle, Edit2, Trash2, Search, Phone, MessageSquare, Users } from 'lucide-react';

export default function AdminRSVPTab({
  rsvps = [],
  attendingRSVPs = [],
  totalGuests = 0,
  onExportPDF,
  onExportCSV,
  onEditRsvp,
  onDeleteRSVP,
  onRequestConfirm,
}) {
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [filterAttending, setFilterAttending] = useState('all'); // 'all' | 'yes' | 'no'

  const safeRsvps = Array.isArray(rsvps) ? rsvps : [];

  const filteredRsvps = safeRsvps.filter((rsvp) => {
    if (filterAttending === 'yes' && !rsvp.attending) return false;
    if (filterAttending === 'no' && rsvp.attending) return false;

    if (!rsvpSearch.trim()) return true;
    const q = rsvpSearch.toLowerCase();
    const companions = (rsvp.companionNames || []).join(' ').toLowerCase();
    return (
      (rsvp.name || '').toLowerCase().includes(q) ||
      (rsvp.phone || '').includes(q) ||
      (rsvp.message || '').toLowerCase().includes(q) ||
      companions.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header with Title & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
              Lista de Confirmações (RSVP)
            </h4>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 dark:border dark:border-emerald-800 font-bold">
              {attendingRSVPs.length} confirmados ({totalGuests} pessoas)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gerencie as respostas recebidas, acompanhantes e contatos de WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExportPDF}
            disabled={safeRsvps.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition min-h-[38px]"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>PDF</span>
          </button>
          <button
            onClick={onExportCSV}
            disabled={safeRsvps.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition min-h-[38px]"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {safeRsvps.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={rsvpSearch}
              onChange={(e) => setRsvpSearch(e.target.value)}
              placeholder="Buscar por convidado, acompanhante, telefone..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blush-400 dark:focus:border-blush-500 outline-none text-xs shadow-sm transition"
            />
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
            <button
              onClick={() => setFilterAttending('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial ${
                filterAttending === 'all'
                  ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Todos ({safeRsvps.length})
            </button>
            <button
              onClick={() => setFilterAttending('yes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial ${
                filterAttending === 'yes'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              Sim ({attendingRSVPs.length})
            </button>
            <button
              onClick={() => setFilterAttending('no')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial ${
                filterAttending === 'no'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              Não ({safeRsvps.length - attendingRSVPs.length})
            </button>
          </div>
        </div>
      )}

      {/* Main List */}
      {filteredRsvps.length > 0 ? (
        <div className="space-y-3">
          {/* Mobile Card Layout */}
          <div className="sm:hidden space-y-2.5">
            {filteredRsvps.map((rsvp) => {
              const companions = rsvp.companionNames || [];
              const totalInGroup = (rsvp.adultsCount || 1) + (rsvp.childrenCount || 0);

              return (
                <div
                  key={rsvp.id}
                  className="bg-white dark:bg-slate-900/95 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-blush-100 dark:bg-blush-950/60 text-blush-700 dark:text-blush-300 font-bold flex items-center justify-center text-xs shrink-0">
                        {(rsvp.name || 'C').charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-white text-sm truncate">
                          {rsvp.name}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {rsvp.phone ? `📱 ${rsvp.phone}` : 'Sem WhatsApp informado'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {rsvp.attending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Vai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[11px] border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3.5 h-3.5" /> Não vai
                        </span>
                      )}
                    </div>
                  </div>

                  {rsvp.attending && (
                    <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blush-500" />
                          <span>Total: {totalInGroup} pessoa{totalInGroup > 1 ? 's' : ''}</span>
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">
                          ({rsvp.adultsCount || 1} adulto{rsvp.adultsCount > 1 ? 's' : ''}, {rsvp.childrenCount || 0} criança{rsvp.childrenCount !== 1 ? 's' : ''})
                        </span>
                      </div>

                      {companions.length > 0 && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Acompanhantes: </span>
                          {companions.join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {rsvp.message && (
                    <div className="p-2.5 rounded-xl bg-blush-50/50 dark:bg-blush-950/20 border border-blush-100/60 dark:border-blush-900/40 text-xs text-slate-700 dark:text-slate-300 italic flex items-start gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blush-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">"{rsvp.message}"</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onEditRsvp({ ...rsvp, companionNames: rsvp.companionNames || [] })}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blush-50 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition min-h-[38px]"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blush-500" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => {
                        onRequestConfirm({
                          title: 'Excluir Confirmação',
                          message: `Tem certeza que deseja excluir a confirmação de presença de ${rsvp.name}?`,
                          confirmText: 'Sim, Excluir',
                          cancelText: 'Cancelar',
                          isDestructive: true,
                          onConfirm: () => onDeleteRSVP(rsvp.id),
                        });
                      }}
                      className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition min-h-[38px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100/80 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Convidado</th>
                    <th className="p-3">Presença</th>
                    <th className="p-3">Adultos</th>
                    <th className="p-3">Crianças</th>
                    <th className="p-3">Acompanhantes</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">Recado</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                        {rsvp.name}
                      </td>
                      <td className="p-3">
                        {rsvp.attending ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Sim
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-200 dark:border-rose-800">
                            <XCircle className="w-3 h-3" /> Não
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{rsvp.adultsCount || 0}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{rsvp.childrenCount || 0}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[160px] truncate" title={(rsvp.companionNames || []).join(', ')}>
                        {(rsvp.companionNames && rsvp.companionNames.length > 0)
                          ? rsvp.companionNames.join(', ')
                          : '-'}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{rsvp.phone || '-'}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={rsvp.message}>
                        {rsvp.message || '-'}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onEditRsvp({ ...rsvp, companionNames: rsvp.companionNames || [] })}
                          className="p-1.5 rounded-lg hover:bg-blush-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blush-600 dark:hover:text-blush-400 transition"
                          title="Editar confirmação"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onRequestConfirm({
                              title: 'Excluir Confirmação',
                              message: `Tem certeza que deseja excluir a confirmação de presença de ${rsvp.name}?`,
                              confirmText: 'Sim, Excluir',
                              cancelText: 'Cancelar',
                              isDestructive: true,
                              onConfirm: () => onDeleteRSVP(rsvp.id),
                            });
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          title="Excluir resposta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/90 p-8 sm:p-12 rounded-2xl text-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
          {rsvpSearch ? `Nenhum convidado encontrado para "${rsvpSearch}".` : 'Nenhuma confirmação de presença registrada até o momento.'}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { FileText, Download, CheckCircle2, XCircle, Edit2, Trash2 } from 'lucide-react';

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
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white text-base sm:text-lg">
            Lista de Respostas dos Convidados
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {attendingRSVPs.length} confirmações positivas ({totalGuests} pessoas no total)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportPDF}
            disabled={rsvps.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={onExportCSV}
            disabled={rsvps.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Relatório (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {rsvps.length > 0 ? (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/80 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Convidado Principal</th>
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
                {rsvps.map((rsvp) => (
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
      ) : (
        <div className="bg-white dark:bg-slate-900/90 p-8 rounded-2xl text-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-sm">
          Nenhuma confirmação de presença registrada até o momento.
        </div>
      )}
    </div>
  );
}

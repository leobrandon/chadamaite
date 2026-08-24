import React, { useState } from 'react';
import { FileText, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminGiftsReportTab({
  gifts = [],
  pledges = [],
  onDeletePledge,
  onExportPDF,
  onExportCSV,
  onRequestConfirm,
}) {
  const [giftReportSearch, setGiftReportSearch] = useState('');
  const [expandedGiftId, setExpandedGiftId] = useState(null);

  const safeGifts = Array.isArray(gifts) ? gifts : [];
  const safePledges = Array.isArray(pledges) ? pledges : [];
  const giftsWithPledgesCount = new Set(safePledges.map((p) => p.giftId)).size;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
              Relatório: Contribuições por Presente
            </h4>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blush-100 dark:bg-blush-950/60 text-blush-700 dark:text-blush-300 dark:border dark:border-blush-800 font-bold">
              {giftsWithPledgesCount} com escolhas
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhe quem escolheu presentear cada item e as quantidades.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExportPDF}
            disabled={giftsWithPledgesCount === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition min-h-[38px]"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>PDF</span>
          </button>
          <button
            onClick={onExportCSV}
            disabled={giftsWithPledgesCount === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition min-h-[38px]"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Search filter */}
      {giftsWithPledgesCount > 0 && (
        <div className="w-full sm:max-w-md">
          <input
            type="text"
            value={giftReportSearch}
            onChange={(e) => setGiftReportSearch(e.target.value)}
            placeholder="Filtrar por presente ou categoria..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blush-400 dark:focus:border-blush-500 outline-none text-xs shadow-sm transition"
          />
        </div>
      )}

      {/* Pledges Accordion */}
      {giftsWithPledgesCount > 0 ? (
        <div className="space-y-3">
          {safeGifts
            .filter((g) => safePledges.some((p) => p.giftId === g.id))
            .filter((g) => {
              const q = giftReportSearch.toLowerCase();
              return (g.title || '').toLowerCase().includes(q) || (g.category || '').toLowerCase().includes(q);
            })
            .map((gift) => {
              const giftPledges = safePledges.filter((p) => p.giftId === gift.id);
              const totalUnits = giftPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
              const targetQty = Number(gift.targetQuantity) || 5;
              const isCompleted = totalUnits >= targetQty;
              const progressPercent = Math.min(100, Math.round((totalUnits / targetQty) * 100));
              const isExpanded = expandedGiftId === gift.id;

              return (
                <div key={gift.id} className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  {/* Gift Header */}
                  <div
                    className="flex items-center justify-between p-3.5 sm:p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-blush-50/30 transition select-none"
                    onClick={() => setExpandedGiftId(isExpanded ? null : gift.id)}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blush-50 dark:bg-blush-950/40 text-blush-600 dark:text-blush-400 flex items-center justify-center text-xl shrink-0 border border-blush-100 dark:border-blush-900/50">
                        {gift.icon || '🎁'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm truncate max-w-[190px] sm:max-w-none">
                            {gift.title}
                          </h5>
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] sm:text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                              Meta Atingida! 🎉
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {gift.category} • <span className="font-semibold text-blush-600 dark:text-blush-400">{giftPledges.length} conv.</span> • <span className="font-semibold text-slate-700 dark:text-slate-200">{totalUnits}/{targetQty} un. ({progressPercent}%)</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 p-1 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded Pledges List */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 sm:p-4">
                      {/* Mobile Card View for pledges */}
                      <div className="sm:hidden space-y-2">
                        {giftPledges.map((pledge) => (
                          <div
                            key={pledge.id}
                            className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-7 h-7 rounded-full bg-blush-100 dark:bg-blush-950/60 text-blush-700 dark:text-blush-300 flex items-center justify-center text-xs font-bold shrink-0">
                                {(pledge.giverName || 'C').charAt(0).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                  {pledge.giverName || 'Convidado'}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                  {pledge.quantity} un. • {pledge.createdAt ? new Date(pledge.createdAt).toLocaleDateString('pt-BR') : '-'}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRequestConfirm({
                                  title: 'Excluir Contribuição',
                                  message: `Tem certeza que deseja excluir a contribuição de ${pledge.giverName}?`,
                                  confirmText: 'Sim, Excluir',
                                  cancelText: 'Cancelar',
                                  isDestructive: true,
                                  onConfirm: () => onDeletePledge(pledge.id),
                                });
                              }}
                              className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Excluir contribuição"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                          <thead className="bg-slate-200/50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="p-2.5">Convidado</th>
                              <th className="p-2.5">Quantidade</th>
                              <th className="p-2.5">Data</th>
                              <th className="p-2.5 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {giftPledges.map((pledge) => (
                              <tr key={pledge.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition">
                                <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blush-100 dark:bg-blush-950/60 text-blush-700 dark:text-blush-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                      {(pledge.giverName || 'C').charAt(0).toUpperCase()}
                                    </span>
                                    <span>{pledge.giverName}</span>
                                  </div>
                                </td>
                                <td className="p-2.5 font-medium text-slate-700 dark:text-slate-300">{pledge.quantity} un.</td>
                                <td className="p-2.5 text-slate-500 dark:text-slate-400">
                                  {pledge.createdAt ? new Date(pledge.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'}
                                </td>
                                <td className="p-2.5 text-right">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRequestConfirm({
                                        title: 'Excluir Contribuição',
                                        message: `Tem certeza que deseja excluir a contribuição de ${pledge.giverName}?`,
                                        confirmText: 'Sim, Excluir',
                                        cancelText: 'Cancelar',
                                        isDestructive: true,
                                        onConfirm: () => onDeletePledge(pledge.id),
                                      });
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition"
                                    title="Excluir contribuição"
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
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/90 p-8 sm:p-12 rounded-2xl text-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs sm:text-sm space-y-2">
          <div className="w-12 h-12 rounded-full bg-blush-50 dark:bg-blush-950/40 text-blush-400 mx-auto flex items-center justify-center text-xl">
            🎁
          </div>
          <p className="font-bold text-slate-700 dark:text-slate-200 text-sm sm:text-base">Sem contribuições ainda.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Assim que os convidados escolherem presentes, eles aparecerão aqui!</p>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { FileText, Download, Trash2 } from 'lucide-react';

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

  const giftsWithPledgesCount = new Set(pledges.map(p => p.giftId)).size;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white text-base sm:text-lg flex items-center gap-2">
            <span>Relatório: Contribuições por Presente</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blush-100 dark:bg-blush-950/60 text-blush-700 dark:text-blush-300 dark:border dark:border-blush-800 font-bold">
              {giftsWithPledgesCount} presentes com contribuições
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe as contribuições não-exclusivas. Diversos convidados podem contribuir com o mesmo presente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportPDF}
            disabled={giftsWithPledgesCount === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={onExportCSV}
            disabled={giftsWithPledgesCount === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Relatório (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {/* Search filter */}
      {giftsWithPledgesCount > 0 && (
        <div className="max-w-md">
          <input
            type="text"
            value={giftReportSearch}
            onChange={(e) => setGiftReportSearch(e.target.value)}
            placeholder="Buscar por presente..."
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blush-400 dark:focus:border-blush-500 outline-none text-xs shadow-sm transition"
          />
        </div>
      )}

      {/* Pledges Accordion */}
      {giftsWithPledgesCount > 0 ? (
        <div className="space-y-3">
          {gifts
            .filter(g => pledges.some(p => p.giftId === g.id))
            .filter(g => {
              const q = giftReportSearch.toLowerCase();
              return (g.title || '').toLowerCase().includes(q) || (g.category || '').toLowerCase().includes(q);
            })
            .map((gift) => {
              const giftPledges = pledges.filter(p => p.giftId === gift.id);
              const totalUnits = giftPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
              const targetQty = Number(gift.targetQuantity) || 5;
              const isCompleted = totalUnits >= targetQty;
              const progressPercent = Math.min(100, Math.round((totalUnits / targetQty) * 100));
              const isExpanded = expandedGiftId === gift.id;

              return (
                <div key={gift.id} className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  {/* Gift Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    onClick={() => setExpandedGiftId(isExpanded ? null : gift.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blush-50 dark:bg-blush-950/40 text-blush-600 dark:text-blush-400 flex items-center justify-center text-xl shrink-0 border border-blush-100 dark:border-blush-900/50">
                        {gift.icon || '🎁'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-slate-800 dark:text-white text-sm">{gift.title}</h5>
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                              Meta Atingida! 🎉
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {gift.category} • <span className="font-semibold text-blush-600 dark:text-blush-400">{giftPledges.length} contribuidor(es)</span> • <span className="font-semibold text-slate-700 dark:text-slate-200">{totalUnits} de {targetQty} un. recebidas ({progressPercent}%)</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 p-2 text-xs">
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>

                  {/* Expanded Pledges Table */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-200/50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-2">Convidado</th>
                            <th className="p-2">Quantidade</th>
                            <th className="p-2">Data</th>
                            <th className="p-2 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {giftPledges.map(pledge => (
                            <tr key={pledge.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition">
                              <td className="p-2 font-bold text-slate-800 dark:text-slate-200">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-blush-100 dark:bg-blush-950/60 text-blush-700 dark:text-blush-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {(pledge.giverName || 'C').charAt(0).toUpperCase()}
                                  </span>
                                  <span>{pledge.giverName}</span>
                                </div>
                              </td>
                              <td className="p-2 font-medium text-slate-700 dark:text-slate-300">{pledge.quantity} un.</td>
                              <td className="p-2 text-slate-500 dark:text-slate-400">
                                {pledge.createdAt ? new Date(pledge.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'}
                              </td>
                              <td className="p-2 text-right">
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
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/90 p-12 rounded-2xl text-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-sm space-y-2">
          <div className="w-12 h-12 rounded-full bg-blush-50 dark:bg-blush-950/40 text-blush-400 mx-auto flex items-center justify-center text-xl">
            🎁
          </div>
          <p className="font-bold text-slate-700 dark:text-slate-200 text-base">Sem contribuições ainda.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Assim que os convidados começarem a escolher presentes, eles aparecerão aqui!</p>
        </div>
      )}
    </div>
  );
}

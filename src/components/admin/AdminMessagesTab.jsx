import React, { useState, useMemo } from 'react';
import { Edit2, Check, X, CheckCircle2, MessageCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ADMIN_MESSAGES_PER_PAGE = 8;

export default function AdminMessagesTab({
  pendingMessages = [],
  approvedMessages = [],
  onApproveMessage,
  onDeleteMessage,
  onEditMessage,
  onRequestConfirm,
}) {
  const [messageFilter, setMessageFilter] = useState('pending'); // 'pending' | 'approved'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const safePending = Array.isArray(pendingMessages) ? pendingMessages : [];
  const safeApproved = Array.isArray(approvedMessages) ? approvedMessages : [];

  const activeList = messageFilter === 'pending' ? safePending : safeApproved;

  // Filtragem por busca
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return activeList;
    const q = searchQuery.toLowerCase();
    return activeList.filter(
      (m) => (m.author || '').toLowerCase().includes(q) || (m.text || '').toLowerCase().includes(q)
    );
  }, [activeList, searchQuery]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredList.length / ADMIN_MESSAGES_PER_PAGE));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ADMIN_MESSAGES_PER_PAGE;
    return filteredList.slice(start, start + ADMIN_MESSAGES_PER_PAGE);
  }, [filteredList, currentPage]);

  const handleTabSwitch = (newFilter) => {
    setMessageFilter(newFilter);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h5 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
            Moderação do Mural de Recados
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aprove ou edite recados deixados pelos convidados antes da exibição pública.
          </p>
        </div>

        {/* Sub-tabs: Pendentes vs Aprovados */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm shrink-0">
          <button
            onClick={() => handleTabSwitch('pending')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition min-h-[36px] ${
              messageFilter === 'pending'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Pendentes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
              {safePending.length}
            </span>
          </button>

          <button
            onClick={() => handleTabSwitch('approved')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition min-h-[36px] ${
              messageFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Aprovados</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
              {safeApproved.length}
            </span>
          </button>
        </div>
      </div>

      {/* Search Input for Admin */}
      {activeList.length > 4 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por autor ou conteúdo da mensagem..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 transition"
          />
        </div>
      )}

      {/* Messages List */}
      {messageFilter === 'pending' ? (
        filteredList.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {paginatedList.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border-2 border-rose-200/80 dark:border-rose-900/60 flex flex-col justify-between shadow-sm space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-slate-800 dark:text-white text-sm truncate">
                        {msg.author}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          Pendente
                        </span>
                        <button
                          onClick={() => onEditMessage({ id: msg.id, author: msg.author, text: msg.text })}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blush-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-blush-600 transition min-h-[32px] min-w-[32px] flex items-center justify-center"
                          title="Editar recado"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      "{msg.text}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{msg.date}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApproveMessage(msg.id)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition min-h-[36px]"
                        title="Aprovar e publicar no mural"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprovar</span>
                      </button>
                      <button
                        onClick={() => {
                          onRequestConfirm({
                            title: 'Recusar Recado',
                            message: `Tem certeza que deseja recusar e excluir o recado de ${msg.author}?`,
                            confirmText: 'Sim, Recusar',
                            cancelText: 'Cancelar',
                            isDestructive: true,
                            onConfirm: () => onDeleteMessage(msg.id),
                          });
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-300 text-xs font-bold transition min-h-[36px]"
                        title="Recusar recado"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Recusar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-400">
                  Página {currentPage} de {totalPages} ({filteredList.length} total)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900/90 p-8 sm:p-12 rounded-2xl text-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-sm space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-200">
              {searchQuery ? `Nenhum recado encontrado para "${searchQuery}".` : 'Tudo em dia!'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {searchQuery ? 'Tente buscar por outro termo.' : 'Não há novos recados aguardando aprovação.'}
            </p>
          </div>
        )
      ) : (
        filteredList.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {paginatedList.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-slate-800 dark:text-white text-sm truncate">
                        {msg.author}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          No Mural ✓
                        </span>
                        <button
                          onClick={() => onEditMessage({ id: msg.id, author: msg.author, text: msg.text })}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blush-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-blush-600 transition min-h-[32px] min-w-[32px] flex items-center justify-center"
                          title="Editar recado"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      "{msg.text}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{msg.date}</span>
                    <button
                      onClick={() => {
                        onRequestConfirm({
                          title: 'Remover Recado do Mural',
                          message: `Tem certeza que deseja remover o recado de ${msg.author} do mural público?`,
                          confirmText: 'Sim, Remover',
                          cancelText: 'Cancelar',
                          isDestructive: true,
                          onConfirm: () => onDeleteMessage(msg.id),
                        });
                      }}
                      className="p-1.5 text-xs text-rose-500 hover:text-rose-700 dark:text-rose-400 font-bold transition flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remover</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-400">
                  Página {currentPage} de {totalPages} ({filteredList.length} total)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900/90 p-8 sm:p-12 rounded-2xl text-center border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-sm space-y-2">
            <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-200">
              {searchQuery ? `Nenhum recado encontrado para "${searchQuery}".` : 'Nenhum recado aprovado ainda.'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {searchQuery ? 'Tente buscar por outro nome ou texto.' : 'Recados aprovados aparecem no mural do site para todos os convidados.'}
            </p>
          </div>
        )
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Edit2, Check, X, CheckCircle2 } from 'lucide-react';

export default function AdminMessagesTab({
  pendingMessages = [],
  approvedMessages = [],
  onApproveMessage,
  onDeleteMessage,
  onEditMessage,
  onRequestConfirm,
}) {
  const [messageFilter, setMessageFilter] = useState('pending'); // 'pending' | 'approved'

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h5 className="font-bold text-slate-800 text-base">
            Moderação do Mural de Recados
          </h5>
          <p className="text-xs text-slate-500">
            Aprove ou recuse recados deixados pelos convidados antes de serem exibidos publicamente
          </p>
        </div>

        {/* Sub-tabs: Pendentes vs Aprovados */}
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setMessageFilter('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              messageFilter === 'pending'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Aguardando Aprovação</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
              {pendingMessages.length}
            </span>
          </button>

          <button
            onClick={() => setMessageFilter('approved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              messageFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Aprovados no Mural</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
              {approvedMessages.length}
            </span>
          </button>
        </div>
      </div>

      {/* Messages Content */}
      {messageFilter === 'pending' ? (
        pendingMessages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingMessages.map((msg) => (
              <div key={msg.id} className="bg-white p-5 rounded-2xl border-2 border-rose-200/80 flex flex-col justify-between shadow-sm relative">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-sm">{msg.author}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Pendente
                      </span>
                      <button
                        onClick={() => onEditMessage({ id: msg.id, author: msg.author, text: msg.text })}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blush-100 text-slate-500 hover:text-blush-600 transition"
                        title="Editar recado"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{msg.text}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">{msg.date}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApproveMessage(msg.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                      title="Aprovar e publicar no mural"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprovar Recado</span>
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
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition"
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
        ) : (
          <div className="bg-white p-10 rounded-2xl text-center border border-slate-200 text-slate-400 text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Tudo em dia!</p>
            <p className="text-xs text-slate-400 mt-1">Não há novos recados aguardando aprovação.</p>
          </div>
        )
      ) : (
        approvedMessages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {approvedMessages.map((msg) => (
              <div key={msg.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-sm">{msg.author}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        No Mural ✓
                      </span>
                      <button
                        onClick={() => onEditMessage({ id: msg.id, author: msg.author, text: msg.text })}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blush-100 text-slate-500 hover:text-blush-600 transition"
                        title="Editar recado"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{msg.text}"
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{msg.date}</span>
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
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                  >
                    Remover do Mural
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-400 text-sm">
            Nenhum recado aprovado no momento.
          </div>
        )
      )}
    </div>
  );
}

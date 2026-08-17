import React from 'react';
import { Gift, Users, Plus, MessageCircleHeart, Settings } from 'lucide-react';

export default function AdminStats({
  totalGuests,
  totalAdults,
  totalChildren,
  giftsWithPledgesCount,
  totalGiftsCount,
  availableGiftsCount,
  totalMessagesCount,
  activeTab,
  setActiveTab,
  rsvpsCount,
  pendingMessagesCount,
  approvedMessagesCount,
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-5 shrink-0">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Total Convidados</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{totalGuests}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">({totalAdults} ad. / {totalChildren} cr.)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Presentes com Contribuição</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-blush-600 dark:text-blush-400">{giftsWithPledgesCount}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">de {totalGiftsCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Presentes Sem Contrib.</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {availableGiftsCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Recados no Mural</span>
          <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
            {totalMessagesCount}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('gifts-report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'gifts-report'
              ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5 text-blush-500 dark:text-blush-400" />
          <span>🎁 Contribuições por Presente ({giftsWithPledgesCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('rsvps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'rsvps'
              ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Presenças Confirmadas ({rsvpsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('gifts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'gifts'
              ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar/Editar Itens ({totalGiftsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'messages'
              ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageCircleHeart className="w-3.5 h-3.5" />
          <span>Moderar Recados</span>
          {pendingMessagesCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
              {pendingMessagesCount} pendente{pendingMessagesCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">({approvedMessagesCount})</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'config'
              ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configurações</span>
        </button>
      </div>
    </div>
  );
}

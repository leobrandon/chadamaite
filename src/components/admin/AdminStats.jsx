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
  const tabs = [
    {
      id: 'gifts-report',
      label: 'Contribuições',
      badge: giftsWithPledgesCount,
      icon: Gift,
      iconColor: 'text-blush-500 dark:text-blush-400',
    },
    {
      id: 'rsvps',
      label: 'Presenças',
      badge: rsvpsCount,
      icon: Users,
    },
    {
      id: 'gifts',
      label: 'Presentes',
      badge: totalGiftsCount,
      icon: Plus,
    },
    {
      id: 'messages',
      label: 'Recados',
      badge: pendingMessagesCount > 0 ? `${pendingMessagesCount} pend.` : approvedMessagesCount,
      isAlert: pendingMessagesCount > 0,
      icon: MessageCircleHeart,
    },
    {
      id: 'config',
      label: 'Ajustes',
      icon: Settings,
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-5 shrink-0">
      {/* Top Stats Cards - 2x2 grid on mobile, 4 in a row on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider truncate">Convidados</span>
          <div className="flex items-baseline gap-1 mt-0.5 flex-wrap">
            <span className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white">{totalGuests}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">({totalAdults}a / {totalChildren}c)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider truncate">Com Escolha</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold text-blush-600 dark:text-blush-400">{giftsWithPledgesCount}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">de {totalGiftsCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider truncate">Sem Escolha</span>
          <div className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {availableGiftsCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider truncate">Recados Mural</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalMessagesCount}
            </span>
            {pendingMessagesCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                {pendingMessagesCount} pend.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar with horizontal scroll and touch padding */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none overscroll-x-contain">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 min-h-[38px] ${
                isActive
                  ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm ring-1 ring-slate-800'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.iconColor || ''}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    tab.isAlert
                      ? 'bg-rose-500 text-white'
                      : isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

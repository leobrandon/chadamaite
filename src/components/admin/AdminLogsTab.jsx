import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  Gift, 
  Users, 
  MessageCircleHeart, 
  Settings, 
  ShieldCheck, 
  Clock, 
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function AdminLogsTab({ logs = [], onClearLogs, onDeleteLog, onRequestConfirm }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todos os Logs', count: logs.length },
    { id: 'gifts', label: 'Presentes', icon: Gift, count: logs.filter((l) => l.category === 'gifts').length },
    { id: 'rsvps', label: 'Presenças', icon: Users, count: logs.filter((l) => l.category === 'rsvps').length },
    { id: 'messages', label: 'Recados', icon: MessageCircleHeart, count: logs.filter((l) => l.category === 'messages').length },
    { id: 'config', label: 'Configurações', icon: Settings, count: logs.filter((l) => l.category === 'config').length },
    { id: 'system', label: 'Sistema & Acesso', icon: ShieldCheck, count: logs.filter((l) => l.category === 'system').length },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesSearch =
      (log.action || '').toLowerCase().includes(query) ||
      (log.details || '').toLowerCase().includes(query) ||
      (log.formattedDate || '').toLowerCase().includes(query) ||
      (log.formattedTime || '').toLowerCase().includes(query) ||
      (log.author || '').toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const getCategoryConfig = (category) => {
    switch (category) {
      case 'gifts':
        return {
          icon: Gift,
          bg: 'bg-blush-100 dark:bg-blush-950/80 text-blush-600 dark:text-blush-400 border-blush-200 dark:border-blush-800/60',
          badgeBg: 'bg-blush-50 dark:bg-blush-950/60 text-blush-700 dark:text-blush-300 border-blush-200 dark:border-blush-800',
          label: 'Presente',
        };
      case 'rsvps':
        return {
          icon: Users,
          bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          label: 'Presença',
        };
      case 'messages':
        return {
          icon: MessageCircleHeart,
          bg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
          badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          label: 'Recado',
        };
      case 'config':
        return {
          icon: Settings,
          bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
          badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          label: 'Configuração',
        };
      case 'system':
      default:
        return {
          icon: ShieldCheck,
          bg: 'bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/60',
          badgeBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          label: 'Sistema',
        };
    }
  };

  const handleExportCSV = () => {
    const csvUri = storageService.exportAdminLogsToCSV();
    if (!csvUri) {
      alert('Não há logs para exportar.');
      return;
    }
    const link = document.createElement('a');
    link.setAttribute('href', csvUri);
    link.setAttribute('download', `historico_alteracoes_admin_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAll = () => {
    onRequestConfirm({
      title: 'Limpar Todo o Histórico de Logs?',
      message: 'Tem certeza que deseja apagar todos os registros de atividades administrativas? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, Limpar Tudo',
      cancelText: 'Cancelar',
      isDestructive: true,
      onConfirm: () => {
        onClearLogs();
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Histórico de Atividades & Auditoria
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                {logs.length} {logs.length === 1 ? 'registro' : 'registros'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acompanhe todas as alterações, edições, exclusões e acessos feitos no painel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition shadow-xs cursor-pointer"
            title="Exportar registros para planilha CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 disabled:opacity-50 transition shadow-xs cursor-pointer"
            title="Limpar todos os registros de logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar Histórico</span>
          </button>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="space-y-2.5">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por ação, convidado, presente, data ou horário..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blush-400 dark:focus:ring-blush-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logs Timeline List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Nenhum registro encontrado
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all'
                ? 'Tente ajustar os filtros ou termos da pesquisa.'
                : 'Todas as ações realizadas no painel administrativo serão listadas aqui automaticamente.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => {
            const config = getCategoryConfig(log.category);
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex items-start gap-3 group"
              >
                {/* Category Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${config.bg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Log Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                        {log.action}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badgeBg}`}
                      >
                        {config.label}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{log.formattedDate}</span>
                      <span>às</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {log.formattedTime}
                      </span>
                    </div>
                  </div>

                  {/* Description / Content */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                    {log.details}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      Feito por: <strong className="text-slate-500 dark:text-slate-400">{log.author || 'Administrador'}</strong>
                    </span>
                    {onDeleteLog && (
                      <button
                        type="button"
                        onClick={() => onDeleteLog(log.id)}
                        className="text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Remover este registro"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

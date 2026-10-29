import { KEYS } from './keys.js';
import { generateUniqueId } from './ids.js';

export function createAdminLogsApi(service) {
  return {
    getAdminLogs: () => {
      try {
        const saved = localStorage.getItem(KEYS.LOGS);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        // Filtrar logs de acesso/login e sessão encerrada para não poluir o histórico
        const ignoredActions = ['Acesso ao Painel', 'Sessão Encerrada', 'Logout'];
        return parsed.filter(l => !ignoredActions.includes(l.action));
      } catch {
        return [];
      }
    },

    addAdminLog: ({ action, details, category = 'system', author = 'Administrador' }) => {
      try {
        const trimmedAction = String(action || 'Ação do Sistema').trim();
        // Não registrar acessos ou encerramentos de sessão no painel para evitar poluição dos logs
        const ignoredActions = ['Acesso ao Painel', 'Sessão Encerrada', 'Logout'];
        if (ignoredActions.includes(trimmedAction)) {
          return null;
        }

        const currentLogs = service.getAdminLogs();
        const now = new Date();
        const newLog = {
          id: generateUniqueId('log'),
          timestamp: now.toISOString(),
          formattedTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          formattedDate: now.toLocaleDateString('pt-BR'),
          action: trimmedAction,
          details: String(details || '').trim(),
          category, // 'gifts' | 'rsvps' | 'messages' | 'config' | 'system'
          author: String(author || 'Administrador').trim(),
        };

        // Limitar a 500 registros para otimizar espaço e performance
        const updatedLogs = [newLog, ...currentLogs].slice(0, 500);
        localStorage.setItem(KEYS.LOGS, JSON.stringify(updatedLogs));
        window.dispatchEvent(new CustomEvent('admin_logs_updated', { detail: updatedLogs }));
        return newLog;
      } catch (err) {
        console.warn('Não foi possível gravar o log administrativo:', err);
        return null;
      }
    },

    deleteAdminLog: (logId) => {
      const currentLogs = service.getAdminLogs();
      const updated = currentLogs.filter(l => l.id !== logId);
      localStorage.setItem(KEYS.LOGS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('admin_logs_updated', { detail: updated }));
      return updated;
    },

    clearAdminLogs: () => {
      localStorage.setItem(KEYS.LOGS, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('admin_logs_updated', { detail: [] }));
      return [];
    },
  };
}

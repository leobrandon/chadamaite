/**
 * Utilitário para formatação amigável e precisa de datas das mensagens e ações
 */
export function formatRelativeOrExactDate(dateValue, createdAtValue) {
  // 1. Tenta obter timestamp válido do createdAt ou dateValue
  let dateObj = null;

  if (createdAtValue) {
    const d = new Date(createdAtValue);
    if (!isNaN(d.getTime())) {
      dateObj = d;
    }
  }

  if (!dateObj && dateValue) {
    const d = new Date(dateValue);
    if (!isNaN(d.getTime())) {
      dateObj = d;
    }
  }

  // 2. Se temos um objeto Date válido, calculamos tempo relativo amigável ou data exata
  if (dateObj) {
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Se for no futuro ou menos de 2 minutos
    if (diffMinutes < 2) {
      return 'Há poucos instantes';
    }

    // Menos de 1 hora (ex: "Há 15 min")
    if (diffMinutes < 60) {
      return `Há ${diffMinutes} min`;
    }

    // Menos de 24 horas e mesmo dia
    if (diffHours < 24 && dateObj.getDate() === now.getDate()) {
      return `Hoje às ${dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Ontem
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      dateObj.getDate() === yesterday.getDate() &&
      dateObj.getMonth() === yesterday.getMonth() &&
      dateObj.getFullYear() === yesterday.getFullYear()
    ) {
      return `Ontem às ${dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Menos de 7 dias
    if (diffDays >= 1 && diffDays < 7) {
      return `Há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    }

    // Data exata formatada em português brasileiro (ex: 24/08/2026)
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // 3. Fallback: se dateValue for uma string sem formatação ISO conhecida mas legível (ex: 'Hoje', 'Ontem', etc.)
  if (dateValue && typeof dateValue === 'string' && dateValue.trim() !== '' && !dateValue.toLowerCase().includes('agora mesmo')) {
    return dateValue;
  }

  // 4. Se não houver data válida nem fallback, retorna null (para não exibir texto vago)
  return null;
}

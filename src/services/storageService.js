import { INITIAL_GIFTS, INITIAL_EVENT_CONFIG, INITIAL_MESSAGES } from '../data/initialGifts';

const KEYS = {
  GIFTS: 'cha_maite_gifts_v1',
  RSVPS: 'cha_maite_rsvps_v1',
  CONFIG: 'cha_maite_config_v1',
  MESSAGES: 'cha_maite_messages_v1',
};

export const storageService = {
  // Configurações do Evento
  getConfig: () => {
    try {
      const saved = localStorage.getItem(KEYS.CONFIG);
      return saved ? { ...INITIAL_EVENT_CONFIG, ...JSON.parse(saved) } : INITIAL_EVENT_CONFIG;
    } catch {
      return INITIAL_EVENT_CONFIG;
    }
  },

  saveConfig: (newConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(newConfig));
    window.dispatchEvent(new CustomEvent('config_updated', { detail: newConfig }));
    return newConfig;
  },

  // Presentes
  getGifts: () => {
    try {
      const saved = localStorage.getItem(KEYS.GIFTS);
      return saved ? JSON.parse(saved) : INITIAL_GIFTS;
    } catch {
      return INITIAL_GIFTS;
    }
  },

  saveGifts: (gifts) => {
    localStorage.setItem(KEYS.GIFTS, JSON.stringify(gifts));
    window.dispatchEvent(new CustomEvent('gifts_updated', { detail: gifts }));
    return gifts;
  },

  reserveGift: (giftId, guestName = '') => {
    const gifts = storageService.getGifts();
    const updated = gifts.map(gift => {
      if (gift.id === giftId) {
        return {
          ...gift,
          status: 'reserved',
          reservedBy: guestName.trim() || 'Convidado com carinho',
          reservedAt: new Date().toISOString(),
        };
      }
      return gift;
    });
    storageService.saveGifts(updated);
    return updated;
  },

  cancelReservation: (giftId) => {
    const gifts = storageService.getGifts();
    const updated = gifts.map(gift => {
      if (gift.id === giftId) {
        return {
          ...gift,
          status: 'available',
          reservedBy: '',
          reservedAt: null,
        };
      }
      return gift;
    });
    storageService.saveGifts(updated);
    return updated;
  },

  addGift: (newGift) => {
    const gifts = storageService.getGifts();
    const gift = {
      ...newGift,
      id: `gift-${Date.now()}`,
      status: 'available',
      reservedBy: '',
      reservedAt: null,
    };
    const updated = [gift, ...gifts];
    storageService.saveGifts(updated);
    return updated;
  },

  updateGift: (giftId, fields) => {
    const gifts = storageService.getGifts();
    const updated = gifts.map(g => g.id === giftId ? { ...g, ...fields } : g);
    storageService.saveGifts(updated);
    return updated;
  },

  deleteGift: (giftId) => {
    const gifts = storageService.getGifts();
    const updated = gifts.filter(g => g.id !== giftId);
    storageService.saveGifts(updated);
    return updated;
  },

  resetGiftsToDefault: () => {
    storageService.saveGifts(INITIAL_GIFTS);
    return INITIAL_GIFTS;
  },

  // Confirmações de Presença (RSVP)
  getRSVPs: () => {
    try {
      const saved = localStorage.getItem(KEYS.RSVPS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  saveRSVP: (rsvpData) => {
    const rsvps = storageService.getRSVPs();
    const newEntry = {
      id: `rsvp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...rsvpData,
    };
    const updated = [newEntry, ...rsvps];
    localStorage.setItem(KEYS.RSVPS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));

    // Se o convidado deixou um recadinho, salva também no mural de mensagens
    if (rsvpData.message && rsvpData.message.trim()) {
      storageService.addMessage({
        author: rsvpData.name,
        text: rsvpData.message.trim(),
      });
    }

    return newEntry;
  },

  deleteRSVP: (rsvpId) => {
    const rsvps = storageService.getRSVPs();
    const updated = rsvps.filter(r => r.id !== rsvpId);
    localStorage.setItem(KEYS.RSVPS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));
    return updated;
  },

  // Mensagens / Mural de Carinho
  getMessages: () => {
    try {
      const saved = localStorage.getItem(KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  },

  addMessage: (msgData) => {
    const messages = storageService.getMessages();
    const newMsg = {
      id: `msg-${Date.now()}`,
      author: msgData.author || 'Amigo da Família',
      text: msgData.text,
      date: 'Agora mesmo',
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    const updated = [newMsg, ...messages];
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
    return newMsg;
  },

  likeMessage: (msgId) => {
    const messages = storageService.getMessages();
    const updated = messages.map(m => m.id === msgId ? { ...m, likes: (m.likes || 0) + 1 } : m);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
    return updated;
  },

  deleteMessage: (msgId) => {
    const messages = storageService.getMessages();
    const updated = messages.filter(m => m.id !== msgId);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
    return updated;
  },

  // Exportação para CSV / Relatório
  exportRSVPsToCSV: () => {
    const rsvps = storageService.getRSVPs();
    if (!rsvps.length) return null;

    const headers = ['Data Envio', 'Nome Principal', 'Vai ao Chá?', 'Adultos', 'Crianças', 'Acompanhantes', 'Telefone', 'Recado'];
    const rows = rsvps.map(r => [
      new Date(r.createdAt).toLocaleDateString('pt-BR'),
      `"${r.name.replace(/"/g, '""')}"`,
      r.attending ? 'SIM' : 'NÃO',
      r.adultsCount || 1,
      r.childrenCount || 0,
      `"${(r.companionNames || []).join(', ').replace(/"/g, '""')}"`,
      `"${r.phone || ''}"`,
      `"${(r.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    return encodeURI(csvContent);
  }
};

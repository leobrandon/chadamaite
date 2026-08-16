import { INITIAL_GIFTS, INITIAL_EVENT_CONFIG, INITIAL_MESSAGES } from '../data/initialGifts';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const KEYS = {
  GIFTS: 'cha_maite_gifts_v1',
  RSVPS: 'cha_maite_rsvps_v1',
  CONFIG: 'cha_maite_config_v1',
  MESSAGES: 'cha_maite_messages_v1',
};

// Helper: map DB column names to camelCase and vice-versa
function mapConfigFromDB(row) {
  if (!row) return INITIAL_EVENT_CONFIG;
  return {
    babyName: row.baby_name || INITIAL_EVENT_CONFIG.babyName,
    parents: row.parents || INITIAL_EVENT_CONFIG.parents,
    date: row.event_date || INITIAL_EVENT_CONFIG.date,
    time: row.event_time || INITIAL_EVENT_CONFIG.time,
    displayDate: row.display_date || INITIAL_EVENT_CONFIG.displayDate,
    displayTime: row.display_time || INITIAL_EVENT_CONFIG.displayTime,
    locationName: row.location_name || INITIAL_EVENT_CONFIG.locationName,
    address: row.address || INITIAL_EVENT_CONFIG.address,
    city: row.city || INITIAL_EVENT_CONFIG.city,
    mapUrl: row.map_url || INITIAL_EVENT_CONFIG.mapUrl,
    pixKey: row.pix_key || INITIAL_EVENT_CONFIG.pixKey,
    pixName: row.pix_name || INITIAL_EVENT_CONFIG.pixName,
    adminPin: row.admin_pin || INITIAL_EVENT_CONFIG.adminPin,
    welcomeMessage: row.welcome_message || INITIAL_EVENT_CONFIG.welcomeMessage,
  };
}

function mapConfigToDB(cfg) {
  return {
    id: 'default_config',
    baby_name: cfg.babyName,
    parents: cfg.parents,
    event_date: cfg.date,
    event_time: cfg.time,
    display_date: cfg.displayDate,
    display_time: cfg.displayTime,
    location_name: cfg.locationName,
    address: cfg.address,
    city: cfg.city,
    map_url: cfg.mapUrl,
    pix_key: cfg.pixKey,
    pix_name: cfg.pixName,
    admin_pin: cfg.adminPin,
    welcome_message: cfg.welcomeMessage,
  };
}

function mapGiftFromDB(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description || '',
    icon: row.icon || '🎁',
    status: row.status || 'available',
    reservedBy: row.reserved_by || '',
    reservedAt: row.reserved_at || null,
    priority: row.priority || 'medium',
  };
}

function mapGiftToDB(g) {
  return {
    id: g.id,
    title: g.title,
    category: g.category,
    description: g.description || '',
    icon: g.icon || '🎁',
    status: g.status || 'available',
    reserved_by: g.reservedBy || '',
    reserved_at: g.reservedAt || null,
    priority: g.priority || 'medium',
  };
}

function mapRSVPFromDB(row) {
  return {
    id: row.id,
    name: row.name,
    attending: row.attending,
    adultsCount: row.adults_count || 1,
    childrenCount: row.children_count || 0,
    companionNames: row.companion_names || [],
    phone: row.phone || '',
    message: row.message || '',
    createdAt: row.created_at,
  };
}

function mapRSVPToDB(r) {
  return {
    id: r.id,
    name: r.name,
    attending: r.attending,
    adults_count: r.adultsCount || 1,
    children_count: r.childrenCount || 0,
    companion_names: r.companionNames || [],
    phone: r.phone || '',
    message: r.message || '',
  };
}

export const storageService = {
  isCloudConnected: isSupabaseConfigured,

  // Inicialização e sincronização em tempo real
  initRealtimeSync: async (onDataUpdate) => {
    if (!isSupabaseConfigured || !supabase) {
      console.log('ℹ️ Operando no modo local (localStorage).');
      return;
    }

    try {
      console.log('⚡ Conectando ao banco em tempo real Supabase...');

      // Carregar dados iniciais da nuvem
      const [configData, giftsData, rsvpsData, messagesData] = await Promise.all([
        storageService.fetchConfigFromCloud(),
        storageService.fetchGiftsFromCloud(),
        storageService.fetchRSVPsFromCloud(),
        storageService.fetchMessagesFromCloud(),
      ]);

      if (onDataUpdate) {
        onDataUpdate({
          config: configData,
          gifts: giftsData,
          rsvps: rsvpsData,
          messages: messagesData,
        });
      }

      // Canal de escuta em tempo real (Realtime Postgres Changes)
      const channel = supabase
        .channel('cha_maite_realtime_channel')
        .on('postgres_changes', { event: '*', schema: 'public' }, async () => {
          console.log('🔄 Atualização recebida do banco em tempo real!');
          const [cfg, gft, rsv, msg] = await Promise.all([
            storageService.fetchConfigFromCloud(),
            storageService.fetchGiftsFromCloud(),
            storageService.fetchRSVPsFromCloud(),
            storageService.fetchMessagesFromCloud(),
          ]);
          if (onDataUpdate) {
            onDataUpdate({ config: cfg, gifts: gft, rsvps: rsv, messages: msg });
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('Erro na sincronização com Supabase:', err);
    }
  },

  // CONFIGURAÇÕES
  fetchConfigFromCloud: async () => {
    if (!isSupabaseConfigured || !supabase) return storageService.getConfig();
    try {
      const { data, error } = await supabase
        .from('event_config')
        .select('*')
        .eq('id', 'default_config')
        .single();

      if (error || !data) {
        // Se ainda não existir registro, cria o padrão
        await supabase.from('event_config').upsert([mapConfigToDB(INITIAL_EVENT_CONFIG)]);
        return INITIAL_EVENT_CONFIG;
      }
      const mapped = mapConfigFromDB(data);
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(mapped));
      return mapped;
    } catch {
      return storageService.getConfig();
    }
  },

  getConfig: () => {
    try {
      const saved = localStorage.getItem(KEYS.CONFIG);
      return saved ? { ...INITIAL_EVENT_CONFIG, ...JSON.parse(saved) } : INITIAL_EVENT_CONFIG;
    } catch {
      return INITIAL_EVENT_CONFIG;
    }
  },

  saveConfig: async (newConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(newConfig));
    window.dispatchEvent(new CustomEvent('config_updated', { detail: newConfig }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('event_config')
          .upsert([mapConfigToDB(newConfig)]);
      } catch (err) {
        console.error('Erro ao salvar config no Supabase:', err);
      }
    }
    return newConfig;
  },

  // PRESENTES
  fetchGiftsFromCloud: async () => {
    if (!isSupabaseConfigured || !supabase) return storageService.getGifts();
    try {
      const { data, error } = await supabase.from('gifts').select('*').order('created_at', { ascending: true });
      if (error) throw error;

      if (!data || data.length === 0) {
        // Inicializa o banco com a lista completa inicial
        const dbGifts = INITIAL_GIFTS.map(mapGiftToDB);
        await supabase.from('gifts').insert(dbGifts);
        return INITIAL_GIFTS;
      }
      const mapped = data.map(mapGiftFromDB);
      localStorage.setItem(KEYS.GIFTS, JSON.stringify(mapped));
      return mapped;
    } catch (err) {
      console.error('Erro ao carregar presentes do Supabase:', err);
      return storageService.getGifts();
    }
  },

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

  reserveGift: async (giftId, guestName) => {
    const gifts = storageService.getGifts();
    const nowIso = new Date().toISOString();
    const updated = gifts.map(gift => {
      if (gift.id === giftId) {
        return {
          ...gift,
          status: 'reserved',
          reservedBy: guestName.trim() || 'Convidado com carinho',
          reservedAt: nowIso,
        };
      }
      return gift;
    });
    storageService.saveGifts(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('gifts')
          .update({
            status: 'reserved',
            reserved_by: guestName.trim() || 'Convidado com carinho',
            reserved_at: nowIso,
          })
          .eq('id', giftId);
      } catch (err) {
        console.error('Erro ao reservar presente no Supabase:', err);
      }
    }
    return updated;
  },

  cancelReservation: async (giftId) => {
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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('gifts')
          .update({
            status: 'available',
            reserved_by: '',
            reserved_at: null,
          })
          .eq('id', giftId);
      } catch (err) {
        console.error('Erro ao liberar presente no Supabase:', err);
      }
    }
    return updated;
  },

  addGift: async (newGift) => {
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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('gifts').insert([mapGiftToDB(gift)]);
      } catch (err) {
        console.error('Erro ao adicionar presente no Supabase:', err);
      }
    }
    return updated;
  },

  updateGift: async (giftId, fields) => {
    const gifts = storageService.getGifts();
    const updated = gifts.map(g => g.id === giftId ? { ...g, ...fields } : g);
    storageService.saveGifts(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const gift = updated.find(g => g.id === giftId);
        if (gift) {
          await supabase.from('gifts').update(mapGiftToDB(gift)).eq('id', giftId);
        }
      } catch (err) {
        console.error('Erro ao atualizar presente no Supabase:', err);
      }
    }
    return updated;
  },

  deleteGift: async (giftId) => {
    const gifts = storageService.getGifts();
    const updated = gifts.filter(g => g.id !== giftId);
    storageService.saveGifts(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('gifts').delete().eq('id', giftId);
      } catch (err) {
        console.error('Erro ao deletar presente no Supabase:', err);
      }
    }
    return updated;
  },

  resetGiftsToDefault: async () => {
    storageService.saveGifts(INITIAL_GIFTS);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('gifts').delete().neq('id', 'dummy');
        await supabase.from('gifts').insert(INITIAL_GIFTS.map(mapGiftToDB));
      } catch (err) {
        console.error('Erro ao resetar presentes no Supabase:', err);
      }
    }
    return INITIAL_GIFTS;
  },

  // CONFIRMAÇÕES DE PRESENÇA (RSVP)
  fetchRSVPsFromCloud: async () => {
    if (!isSupabaseConfigured || !supabase) return storageService.getRSVPs();
    try {
      const { data, error } = await supabase.from('rsvps').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map(mapRSVPFromDB);
      localStorage.setItem(KEYS.RSVPS, JSON.stringify(mapped));
      return mapped;
    } catch (err) {
      console.error('Erro ao carregar RSVPs do Supabase:', err);
      return storageService.getRSVPs();
    }
  },

  getRSVPs: () => {
    try {
      const saved = localStorage.getItem(KEYS.RSVPS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  saveRSVP: async (rsvpData) => {
    const rsvps = storageService.getRSVPs();
    const newEntry = {
      id: `rsvp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...rsvpData,
    };
    const updated = [newEntry, ...rsvps];
    localStorage.setItem(KEYS.RSVPS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));

    // Se deixou recado, salva no mural
    if (rsvpData.message && rsvpData.message.trim()) {
      storageService.addMessage({
        author: rsvpData.name,
        text: rsvpData.message.trim(),
      });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('rsvps').insert([mapRSVPToDB(newEntry)]);
      } catch (err) {
        console.error('Erro ao salvar RSVP no Supabase:', err);
      }
    }

    return newEntry;
  },

  deleteRSVP: async (rsvpId) => {
    const rsvps = storageService.getRSVPs();
    const updated = rsvps.filter(r => r.id !== rsvpId);
    localStorage.setItem(KEYS.RSVPS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('rsvps').delete().eq('id', rsvpId);
      } catch (err) {
        console.error('Erro ao excluir RSVP no Supabase:', err);
      }
    }
    return updated;
  },

  // MENSAGENS / MURAL DE CARINHO
  fetchMessagesFromCloud: async () => {
    if (!isSupabaseConfigured || !supabase) return storageService.getMessages();
    try {
      const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) {
        const initMsgs = INITIAL_MESSAGES.map(m => ({
          ...m,
          status: 'approved',
        }));
        await supabase.from('messages').insert(initMsgs);
        return initMsgs;
      }
      const mapped = data.map(m => ({ ...m, status: m.status || 'approved' }));
      localStorage.setItem(KEYS.MESSAGES, JSON.stringify(mapped));
      return mapped;
    } catch (err) {
      console.error('Erro ao carregar mensagens do Supabase:', err);
      return storageService.getMessages();
    }
  },

  getMessages: () => {
    try {
      const saved = localStorage.getItem(KEYS.MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(m => ({ ...m, status: m.status || 'approved' }));
      }
      return INITIAL_MESSAGES.map(m => ({ ...m, status: 'approved' }));
    } catch {
      return INITIAL_MESSAGES.map(m => ({ ...m, status: 'approved' }));
    }
  },

  addMessage: async (msgData, autoApprove = false) => {
    const messages = storageService.getMessages();
    const newMsg = {
      id: `msg-${Date.now()}`,
      author: msgData.author || 'Amigo da Família',
      text: msgData.text,
      date: 'Agora mesmo',
      createdAt: new Date().toISOString(),
      likes: 0,
      status: autoApprove ? 'approved' : 'pending',
    };
    const updated = [newMsg, ...messages];
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').insert([newMsg]);
      } catch (err) {
        console.error('Erro ao adicionar mensagem no Supabase:', err);
      }
    }
    return newMsg;
  },

  approveMessage: async (msgId) => {
    const messages = storageService.getMessages();
    const updated = messages.map(m => m.id === msgId ? { ...m, status: 'approved' } : m);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').update({ status: 'approved' }).eq('id', msgId);
      } catch (err) {
        console.error('Erro ao aprovar mensagem no Supabase:', err);
      }
    }
    return updated;
  },

  likeMessage: async (msgId) => {
    const messages = storageService.getMessages();
    const target = messages.find(m => m.id === msgId);
    const newLikes = (target?.likes || 0) + 1;
    const updated = messages.map(m => m.id === msgId ? { ...m, likes: newLikes } : m);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').update({ likes: newLikes }).eq('id', msgId);
      } catch (err) {
        console.error('Erro ao curtir mensagem no Supabase:', err);
      }
    }
    return updated;
  },

  deleteMessage: async (msgId) => {
    const messages = storageService.getMessages();
    const updated = messages.filter(m => m.id !== msgId);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').delete().eq('id', msgId);
      } catch (err) {
        console.error('Erro ao deletar mensagem no Supabase:', err);
      }
    }
    return updated;
  },

  // EXPORTAÇÕES PARA CSV / EXCEL
  exportRSVPsToCSV: () => {
    const rsvps = storageService.getRSVPs();
    if (!rsvps.length) return null;

    const headers = ['Data Envio', 'Nome Principal', 'Vai ao Chá?', 'Adultos', 'Crianças', 'Acompanhantes', 'Telefone', 'Recado'];
    const rows = rsvps.map(r => [
      new Date(r.createdAt || Date.now()).toLocaleDateString('pt-BR'),
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
  },

  exportGiftsToCSV: () => {
    const gifts = storageService.getGifts();
    if (!gifts.length) return null;

    const headers = ['Presente', 'Categoria', 'Status', 'Quem vai dar (Presenteador)', 'Data da Reserva', 'Detalhes/Tamanho'];
    const rows = gifts.map(g => [
      `"${g.title.replace(/"/g, '""')}"`,
      `"${g.category.replace(/"/g, '""')}"`,
      g.status === 'reserved' ? 'RESERVADO' : 'DISPONÍVEL',
      `"${(g.reservedBy || '-').replace(/"/g, '""')}"`,
      g.reservedAt ? new Date(g.reservedAt).toLocaleDateString('pt-BR') : '-',
      `"${(g.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    return encodeURI(csvContent);
  }
};

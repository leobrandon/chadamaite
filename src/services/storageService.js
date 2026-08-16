import { INITIAL_GIFTS, INITIAL_EVENT_CONFIG, INITIAL_MESSAGES } from '../data/initialGifts';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const KEYS = {
  GIFTS: 'cha_maite_gifts_v1',
  RSVPS: 'cha_maite_rsvps_v1',
  CONFIG: 'cha_maite_config_v1',
  MESSAGES: 'cha_maite_messages_v1',
  PLEDGES: 'cha_maite_pledges_v1',
};

// Robust ID Generator using crypto.randomUUID with standard fallback
export function generateUniqueId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

function mapGiftFromDB(row, index = 0) {
  let targetQuantity = 5;
  let displayOrder = 999;
  let cleanDescription = row.description || '';

  // 1. Extrair tag de metadados [meta:X] da descrição se presente
  const metaMatch = cleanDescription.match(/\[meta:(\d+)\]/);
  if (metaMatch) {
    targetQuantity = parseInt(metaMatch[1], 10) || 5;
    cleanDescription = cleanDescription.replace(/\s*\[meta:\d+\]/, '').trim();
  }

  // 2. Extrair tag [order:X] da descrição
  const orderMatch = cleanDescription.match(/\[order:(\d+)\]/);
  if (orderMatch) {
    displayOrder = parseInt(orderMatch[1], 10) || 999;
    cleanDescription = cleanDescription.replace(/\s*\[order:\d+\]/, '').trim();
  }

  // 3. Se a coluna nativa do Supabase existir e tiver valor, ela tem precedência
  if (row.target_quantity !== undefined && row.target_quantity !== null) {
    targetQuantity = Number(row.target_quantity);
  }

  if (row.display_order !== undefined && row.display_order !== null) {
    displayOrder = Number(row.display_order);
  } else if (row.position !== undefined && row.position !== null) {
    displayOrder = Number(row.position);
  } else if (!orderMatch) {
    displayOrder = index + 1; // fallback
  }

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: cleanDescription,
    icon: row.icon || '🎁',
    status: row.status || 'available',
    reservedBy: row.reserved_by || '',
    reservedAt: row.reserved_at || null,
    priority: row.priority || 'medium',
    targetQuantity: targetQuantity,
    displayOrder: displayOrder,
  };
}

function mapGiftToDB(g) {
  const targetQty = Number(g.targetQuantity || 5);
  const displayOrder = Number(g.displayOrder || 999);
  let desc = (g.description || '').replace(/\s*\[meta:\d+\]/, '').replace(/\s*\[order:\d+\]/, '').trim();
  // Inclui tag de metadados para persistência garantida em qualquer ambiente
  const descWithMeta = desc ? `${desc} [meta:${targetQty}] [order:${displayOrder}]` : `[meta:${targetQty}] [order:${displayOrder}]`;

  return {
    id: g.id,
    title: g.title,
    category: g.category,
    description: descWithMeta,
    icon: g.icon || '🎁',
    status: g.status || 'available',
    reserved_by: g.reservedBy || '',
    reserved_at: g.reservedAt || null,
    priority: g.priority || 'medium',
    target_quantity: targetQty,
    display_order: displayOrder,
  };
}

// Helper to detect missing schema columns in Supabase
function isSchemaColumnError(error) {
  if (!error) return false;
  const msg = String(error.message || '').toLowerCase();
  const details = String(error.details || '').toLowerCase();
  const hint = String(error.hint || '').toLowerCase();
  return (
    error.code === 'PGRST204' ||
    msg.includes('target_quantity') ||
    msg.includes('display_order') ||
    msg.includes('position') ||
    details.includes('target_quantity') ||
    details.includes('display_order') ||
    details.includes('position') ||
    hint.includes('target_quantity') ||
    hint.includes('display_order') ||
    hint.includes('position')
  );
}

function stripSchemaExtendedColumns(payload) {
  const { target_quantity, display_order, position, targetQuantity, displayOrder, ...safePayload } = payload;
  return safePayload;
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

function mapPledgeFromDB(row) {
  return { id: row.id, giftId: row.gift_id, giverName: row.giver_name, quantity: row.quantity, createdAt: row.created_at };
}
function mapPledgeToDB(p) {
  return { id: p.id, gift_id: p.giftId, giver_name: p.giverName, quantity: p.quantity };
}

function mapMessageFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    author: row.author,
    text: row.text,
    date: row.date || 'Recente',
    likes: Number(row.likes) || 0,
    status: row.status || 'approved',
    createdAt: row.created_at,
  };
}

function mapMessageToDB(m) {
  return {
    id: m.id,
    author: m.author || 'Amigo com carinho',
    text: m.text || '',
    date: m.date || 'Agora mesmo',
    likes: Number(m.likes) || 0,
    status: m.status || 'pending',
    created_at: m.createdAt || new Date().toISOString(),
  };
}

export const storageService = {
  isCloudConnected: isSupabaseConfigured,

  // Inicialização e sincronização em tempo real otimizada
  initRealtimeSync: async (onDataUpdate) => {
    if (!isSupabaseConfigured || !supabase) {
      console.log('ℹ️ Operando no modo local (localStorage).');
      return;
    }

    try {
      console.log('⚡ Conectando ao banco em tempo real Supabase...');

      // Carregar dados iniciais da nuvem
      const [configData, giftsData, rsvpsData, messagesData, pledgesData] = await Promise.all([
        storageService.fetchConfigFromCloud(),
        storageService.fetchGiftsFromCloud(),
        storageService.fetchRSVPsFromCloud(),
        storageService.fetchMessagesFromCloud(),
        storageService.fetchPledgesFromCloud(),
      ]);

      if (onDataUpdate) {
        onDataUpdate({
          config: configData,
          gifts: giftsData,
          rsvps: rsvpsData,
          messages: messagesData,
          pledges: pledgesData,
        });
      }

      // Batching & Debounce state for realtime postgres changes
      const pendingTables = new Set();
      let debounceTimer = null;

      const processBatchedUpdates = async () => {
        const tablesToFetch = Array.from(pendingTables);
        pendingTables.clear();
        debounceTimer = null;

        if (tablesToFetch.length === 0) return;

        const updatePayload = {};

        await Promise.all(
          tablesToFetch.map(async (table) => {
            try {
              switch (table) {
                case 'gifts': {
                  updatePayload.gifts = await storageService.fetchGiftsFromCloud();
                  break;
                }
                case 'rsvps': {
                  updatePayload.rsvps = await storageService.fetchRSVPsFromCloud();
                  break;
                }
                case 'messages': {
                  updatePayload.messages = await storageService.fetchMessagesFromCloud();
                  break;
                }
                case 'gift_pledges': {
                  updatePayload.pledges = await storageService.fetchPledgesFromCloud();
                  break;
                }
                case 'event_config': {
                  updatePayload.config = await storageService.fetchConfigFromCloud();
                  break;
                }
                default: {
                  const [cfg, gft, rsv, msg, pld] = await Promise.all([
                    storageService.fetchConfigFromCloud(),
                    storageService.fetchGiftsFromCloud(),
                    storageService.fetchRSVPsFromCloud(),
                    storageService.fetchMessagesFromCloud(),
                    storageService.fetchPledgesFromCloud(),
                  ]);
                  updatePayload.config = cfg;
                  updatePayload.gifts = gft;
                  updatePayload.rsvps = rsv;
                  updatePayload.messages = msg;
                  updatePayload.pledges = pld;
                  break;
                }
              }
            } catch (fetchErr) {
              console.error(`Erro ao sincronizar tabela ${table}:`, fetchErr);
            }
          })
        );

        if (onDataUpdate && Object.keys(updatePayload).length > 0) {
          onDataUpdate(updatePayload);
        }
      };

      // Canal de escuta em tempo real (Realtime Postgres Changes)
      const channel = supabase
        .channel('cha_maite_realtime_channel')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          const tableName = payload?.table || '*';
          console.log(`🔄 Atualização em tempo real recebida para a tabela: ${tableName}`);
          pendingTables.add(tableName);

          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          debounceTimer = setTimeout(() => {
            processBatchedUpdates();
          }, 300);
        })
        .subscribe();

      return () => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
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
        const payload = mapConfigToDB(newConfig);
        const { error } = await supabase
          .from('event_config')
          .update(payload)
          .eq('id', 'default_config');

        if (error) {
          console.error('Erro ao atualizar config no Supabase:', error);
          await supabase.from('event_config').upsert([payload]);
        }
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
        const { error: insertErr } = await supabase.from('gifts').insert(dbGifts);
        if (insertErr && isSchemaColumnError(insertErr)) {
          const fallbackGifts = dbGifts.map(stripSchemaExtendedColumns);
          await supabase.from('gifts').insert(fallbackGifts);
        }
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
      targetQuantity: Number(newGift.targetQuantity || 5),
      displayOrder: Number(newGift.displayOrder || 999),
      id: generateUniqueId('gift'),
      status: 'available',
      reservedBy: '',
      reservedAt: null,
    };
    const updated = [gift, ...gifts];
    storageService.saveGifts(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = mapGiftToDB(gift);
        const { error } = await supabase.from('gifts').insert([payload]);
        if (error) {
          if (isSchemaColumnError(error)) {
            const fallbackPayload = stripSchemaExtendedColumns(payload);
            const retryRes = await supabase.from('gifts').insert([fallbackPayload]);
            if (retryRes.error) {
              console.error('Erro ao adicionar presente no Supabase (retry seguro):', retryRes.error);
            }
          } else {
            console.error('Erro ao adicionar presente no Supabase:', error);
          }
        }
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
          const payload = mapGiftToDB(gift);
          const { error } = await supabase.from('gifts').update(payload).eq('id', giftId);
          if (error) {
            if (isSchemaColumnError(error)) {
              const fallbackPayload = stripSchemaExtendedColumns(payload);
              const retryRes = await supabase.from('gifts').update(fallbackPayload).eq('id', giftId);
              if (retryRes.error) {
                console.error('Erro ao atualizar presente no Supabase (retry seguro):', retryRes.error);
              }
            } else {
              console.error('Erro ao atualizar presente no Supabase:', error);
            }
          }
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

    // Limpar pledges associados a este presente localmente
    const pledges = storageService.getPledges();
    const updatedPledges = pledges.filter(p => p.giftId !== giftId);
    localStorage.setItem(KEYS.PLEDGES, JSON.stringify(updatedPledges));
    window.dispatchEvent(new CustomEvent('pledges_updated', { detail: updatedPledges }));

    if (isSupabaseConfigured && supabase) {
      try {
        const [giftRes, pledgeRes] = await Promise.all([
          supabase.from('gifts').delete().eq('id', giftId),
          supabase.from('gift_pledges').delete().eq('gift_id', giftId),
        ]);
        if (giftRes.error) {
          console.error('Erro ao deletar presente no Supabase:', giftRes.error);
        }
        if (pledgeRes.error) {
          console.error('Erro ao limpar pledges associados no Supabase:', pledgeRes.error);
        }
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
        const dbGifts = INITIAL_GIFTS.map(mapGiftToDB);
        const { error } = await supabase.from('gifts').insert(dbGifts);
        if (error) {
          if (isSchemaColumnError(error)) {
            const fallbackGifts = dbGifts.map(stripSchemaExtendedColumns);
            const retryRes = await supabase.from('gifts').insert(fallbackGifts);
            if (retryRes.error) {
              console.error('Erro ao resetar presentes no Supabase (retry seguro):', retryRes.error);
            }
          } else {
            console.error('Erro ao resetar presentes no Supabase:', error);
          }
        }
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
      id: generateUniqueId('rsvp'),
      createdAt: new Date().toISOString(),
      ...rsvpData,
    };
    
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('rsvps').insert([mapRSVPToDB(newEntry)]);
      } catch (err) {
        console.error('Erro ao salvar RSVP no Supabase:', err);
      }
    }

    const updated = [newEntry, ...rsvps];
    localStorage.setItem(KEYS.RSVPS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));

    // Se deixou recado, salva no mural
    if (rsvpData.message && rsvpData.message.trim()) {
      await storageService.addMessage({
        author: rsvpData.name,
        text: rsvpData.message.trim(),
      });
    }

    return newEntry;
  },

  deleteRSVP: async (rsvpId) => {
    const rsvps = storageService.getRSVPs();
    const updated = rsvps.filter(r => r.id !== rsvpId);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('rsvps').delete().eq('id', rsvpId);
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao excluir RSVP no Supabase:', err);
        return rsvps;
      }
    }

    localStorage.setItem(KEYS.RSVPS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));
    return updated;
  },

  updateRSVP: async (rsvpId, fields) => {
    const rsvps = storageService.getRSVPs();
    const updated = rsvps.map(r => r.id === rsvpId ? { ...r, ...fields } : r);
    localStorage.setItem(KEYS.RSVPS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          adults_count: fields.adultsCount,
          children_count: fields.childrenCount,
          companion_names: fields.companionNames || [],
          phone: fields.phone || '',
          message: fields.message || '',
        };
        const { error } = await supabase.from('rsvps').update(payload).eq('id', rsvpId);
        if (error) console.error('Erro ao atualizar RSVP no Supabase:', error);
      } catch (err) {
        console.error('Erro ao atualizar RSVP no Supabase:', err);
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

      const mapped = (data || []).map(mapMessageFromDB).filter(Boolean);
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
      id: generateUniqueId('msg'),
      author: msgData.author || 'Amigo com carinho',
      text: msgData.text,
      date: 'Agora mesmo',
      createdAt: new Date().toISOString(),
      likes: 0,
      status: autoApprove ? 'approved' : 'pending',
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = mapMessageToDB(newMsg);
        const { error } = await supabase.from('messages').insert([payload]);
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao adicionar mensagem no Supabase:', err);
      }
    }

    const updated = [newMsg, ...messages];
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
    return newMsg;
  },

  approveMessage: async (msgId) => {
    const messages = storageService.getMessages();
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('messages').update({ status: 'approved' }).eq('id', msgId);
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao aprovar mensagem no Supabase:', err);
        return messages;
      }
    }

    const updated = messages.map(m => m.id === msgId ? { ...m, status: 'approved' } : m);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
    return updated;
  },

  likeMessage: async (msgId) => {
    const messages = storageService.getMessages();
    const target = messages.find(m => m.id === msgId);
    const newLikes = (target?.likes || 0) + 1;
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('messages').update({ likes: newLikes }).eq('id', msgId);
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao curtir mensagem no Supabase:', err);
      }
    }

    const updated = messages.map(m => m.id === msgId ? { ...m, likes: newLikes } : m);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
    return updated;
  },

  deleteMessage: async (msgId) => {
    const messages = storageService.getMessages();

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('messages').delete().eq('id', msgId);
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao deletar mensagem no Supabase:', err);
        return messages;
      }
    }

    const updated = messages.filter(m => m.id !== msgId);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
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
  },

  // PLEDGES (CONTRIBUIÇÕES DE PRESENTES)
  fetchPledgesFromCloud: async () => {
    if (!isSupabaseConfigured || !supabase) return storageService.getPledges();
    try {
      const { data, error } = await supabase.from('gift_pledges').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      const mapped = (data || []).map(mapPledgeFromDB);
      localStorage.setItem(KEYS.PLEDGES, JSON.stringify(mapped));
      return mapped;
    } catch (err) {
      console.error('Erro ao carregar pledges do Supabase:', err);
      return storageService.getPledges();
    }
  },

  getPledges: () => {
    try {
      const saved = localStorage.getItem(KEYS.PLEDGES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  addPledge: async (giftId, giverName, quantity) => {
    const pledges = storageService.getPledges();
    const newPledge = {
      id: generateUniqueId('pledge'),
      giftId,
      giverName,
      quantity,
      createdAt: new Date().toISOString(),
    };
    const updated = [...pledges, newPledge];
    localStorage.setItem(KEYS.PLEDGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pledges_updated', { detail: updated }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('gift_pledges').insert([mapPledgeToDB(newPledge)]);
      } catch (err) {
        console.error('Erro ao adicionar pledge no Supabase:', err);
      }
    }
    return newPledge;
  },

  deletePledge: async (pledgeId) => {
    const pledges = storageService.getPledges();
    const updated = pledges.filter(p => p.id !== pledgeId);
    localStorage.setItem(KEYS.PLEDGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pledges_updated', { detail: updated }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('gift_pledges').delete().eq('id', pledgeId);
      } catch (err) {
        console.error('Erro ao deletar pledge no Supabase:', err);
      }
    }
    return updated;
  }
};

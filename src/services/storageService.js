import { INITIAL_GIFTS, INITIAL_EVENT_CONFIG, INITIAL_MESSAGES } from '../data/initialGifts';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { formatPhone } from '../utils/phoneMask';
import { DEFAULT_ADMIN_PIN_HASH, sanitizeText, sanitizeName } from '../utils/security';

const KEYS = {
  GIFTS: 'cha_maite_gifts_v1',
  RSVPS: 'cha_maite_rsvps_v1',
  CONFIG: 'cha_maite_config_v1',
  MESSAGES: 'cha_maite_messages_v1',
  PLEDGES: 'cha_maite_pledges_v1',
  LOGS: 'cha_maite_admin_logs_v1',
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

// Filtro para impedir que registros criados durante testes poluam o painel de convidados e cotas
export function isTestGuest(nameOrAuthor) {
  if (!nameOrAuthor) return false;
  const n = String(nameOrAuthor).trim().toLowerCase();
  if (n === 'teste' || n.startsWith('teste ') || n.includes('teste convidado') || n.includes('teste app')) return true;
  if (n === 'carlos eduardo' || n === 'mariana silva') return true;
  return false;
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
    adminPinHash: row.admin_pin || INITIAL_EVENT_CONFIG.adminPinHash || 'e815b24d314219266fbae1d11292d9d23bb2befbd5d0dc3f7a2422edc354413c',
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
    admin_pin: cfg.adminPinHash || cfg.adminPin || 'e815b24d314219266fbae1d11292d9d23bb2befbd5d0dc3f7a2422edc354413c',
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
    phone: formatPhone(row.phone || ''),
    message: row.message || '',
    createdAt: row.created_at,
  };
}

function mapRSVPToDB(r) {
  const payload = {
    id: r.id,
    name: r.name,
    attending: r.attending,
    adults_count: r.adultsCount || 1,
    children_count: r.childrenCount || 0,
    companion_names: r.companionNames || [],
    phone: formatPhone(r.phone || ''),
    message: r.message || '',
  };
  if (r.createdAt) {
    payload.created_at = r.createdAt;
  }
  return payload;
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
    date: row.date || '',
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
    date: m.date || '',
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

      // Canal de escuta em tempo real com nome único para evitar conflito com canais já subscritos
      const channelName = `cha_maite_realtime_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const channel = supabase
        .channel(channelName)
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
        .subscribe((status, error) => {
          if (error) {
            console.warn('Aviso no canal Realtime Supabase:', error);
          }
        });

      return () => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    } catch (err) {
      console.error('Erro na sincronização com Supabase:', err);
      return () => {};
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
      const mapped = (data || []).map(mapRSVPFromDB).filter(r => !isTestGuest(r.name));
      localStorage.setItem(KEYS.RSVPS, JSON.stringify(mapped));
      window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: mapped }));
      return mapped;
    } catch (err) {
      console.error('Erro ao carregar RSVPs do Supabase:', err);
      return storageService.getRSVPs();
    }
  },

  getRSVPs: () => {
    try {
      const saved = localStorage.getItem(KEYS.RSVPS);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(r => !isTestGuest(r.name))
        .map((r) => ({
          ...r,
          phone: formatPhone(r.phone || ''),
        }));
    } catch {
      return [];
    }
  },

  saveRSVP: async (rsvpData) => {
    const rsvps = storageService.getRSVPs();
    const safeName = sanitizeName(rsvpData.name || '', 80);
    const safePhone = formatPhone(rsvpData.phone || '');
    const safeMessage = sanitizeText(rsvpData.message || '', 500);
    const safeCompanions = Array.isArray(rsvpData.companionNames)
      ? rsvpData.companionNames.map(c => sanitizeName(c, 80)).filter(Boolean)
      : [];
    const safeAdults = Math.max(1, Math.min(20, Number(rsvpData.adultsCount) || 1));
    const safeChildren = Math.max(0, Math.min(20, Number(rsvpData.childrenCount) || 0));

    const newEntry = {
      id: generateUniqueId('rsvp'),
      createdAt: new Date().toISOString(),
      name: safeName,
      attending: Boolean(rsvpData.attending),
      adultsCount: rsvpData.attending ? safeAdults : 0,
      childrenCount: rsvpData.attending ? safeChildren : 0,
      companionNames: rsvpData.attending ? safeCompanions : [],
      phone: safePhone,
      message: safeMessage,
    };

    const hasMessage = Boolean(safeMessage && safeMessage.trim());
    const newMsg = hasMessage ? {
      id: generateUniqueId('msg'),
      author: safeName || 'Amigo com carinho',
      text: safeMessage,
      date: 'Agora mesmo',
      createdAt: new Date().toISOString(),
      likes: 0,
      status: 'pending',
    } : null;

    if (isSupabaseConfigured && supabase) {
      const promises = [
        supabase.from('rsvps').insert([mapRSVPToDB(newEntry)]),
      ];
      if (newMsg) {
        promises.push(supabase.from('messages').insert([mapMessageToDB(newMsg)]));
      }
      try {
        const results = await Promise.all(promises);
        results.forEach((res, i) => {
          if (res?.error) {
            console.error(`Erro ao salvar item ${i === 0 ? 'RSVP' : 'Mensagem'} no Supabase:`, res.error);
          }
        });
      } catch (err) {
        console.error('Erro ao salvar RSVP/Recado no Supabase:', err);
      }
    }

    const updated = [newEntry, ...rsvps];
    localStorage.setItem(KEYS.RSVPS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));

    if (newMsg) {
      const currentMsgs = storageService.getMessages();
      const updatedMsgs = [newMsg, ...currentMsgs.filter(m => m.id !== newMsg.id)];
      localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updatedMsgs));
      window.dispatchEvent(new CustomEvent('messages_updated', { detail: updatedMsgs }));
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
    const existing = rsvps.find(r => r.id === rsvpId);
    const updatedEntry = existing ? { ...existing, ...fields } : null;
    const updated = rsvps.map(r => r.id === rsvpId ? { ...r, ...fields } : r);
    localStorage.setItem(KEYS.RSVPS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));

    if (isSupabaseConfigured && supabase && updatedEntry) {
      try {
        const payload = mapRSVPToDB(updatedEntry);
        // Supabase JS retorna status 200 com array vazio caso RLS bloqueie UPDATE.
        // Usamos .select() para verificar se alguma linha foi realmente atualizada.
        const { data: updatedRows, error: updateErr } = await supabase
          .from('rsvps')
          .update(payload)
          .eq('id', rsvpId)
          .select();

        if (updateErr || !updatedRows || updatedRows.length === 0) {
          // Fallback garantido: delete + insert (permitido por políticas anon no Supabase)
          await supabase.from('rsvps').delete().eq('id', rsvpId);
          const { error: insertErr } = await supabase.from('rsvps').insert([payload]);
          if (insertErr) {
            console.error('Erro ao reinserir RSVP no Supabase:', insertErr);
            throw insertErr;
          }
        }
      } catch (err) {
        console.error('Erro ao atualizar RSVP no Supabase:', err);
        throw err;
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
    const nowIso = new Date().toISOString();
    const safeAuthor = sanitizeName(msgData.author || 'Amigo com carinho', 80);
    const safeText = sanitizeText(msgData.text || '', 500);

    const newMsg = {
      id: generateUniqueId('msg'),
      author: safeAuthor || 'Amigo com carinho',
      text: safeText,
      date: nowIso,
      createdAt: nowIso,
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

  likeMessage: async (msgId, delta = 1) => {
    const messages = storageService.getMessages();
    const target = messages.find(m => m.id === msgId);
    const currentLikes = Number(target?.likes) || 0;
    const newLikes = Math.max(0, currentLikes + delta);
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('messages').update({ likes: newLikes }).eq('id', msgId);
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao atualizar curtida da mensagem no Supabase:', err);
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

  updateMessage: async (msgId, fields) => {
    const messages = storageService.getMessages();
    const target = messages.find(m => m.id === msgId);
    if (!target) return messages;

    const dbFields = {};
    if (fields.author !== undefined) dbFields.author = fields.author;
    if (fields.text !== undefined) dbFields.text = fields.text;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('messages').update(dbFields).eq('id', msgId);
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao atualizar mensagem no Supabase:', err);
        return messages;
      }
    }

    const updated = messages.map(m => m.id === msgId ? { ...m, ...dbFields } : m);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
    return updated;
  },

  // EXPORTAÇÕES PARA CSV / EXCEL COM PROTEÇÃO CONTRA FORMULA INJECTION
  exportRSVPsToCSV: () => {
    const rsvps = storageService.getRSVPs();
    if (!rsvps.length) return null;

    // Função de sanitização contra injeção de fórmulas CSV (OWASP)
    const safeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).trim();
      if (!str || str === '-') return '"-"';
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const formatDate = (dateVal) => {
      if (!dateVal) return '-';
      try {
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
      } catch {
        return '-';
      }
    };

    const headers = ['Data Envio', 'Nome Principal', 'Vai ao Chá?', 'Adultos', 'Crianças', 'Acompanhantes', 'Telefone', 'Recado'];
    const rows = rsvps.map(r => [
      safeCsv(formatDate(r.createdAt || Date.now())),
      safeCsv(r.name),
      r.attending ? 'SIM' : 'NÃO',
      Number(r.adultsCount) || 1,
      Number(r.childrenCount) || 0,
      safeCsv((r.companionNames || []).join(', ')),
      safeCsv(formatPhone(r.phone || '')),
      safeCsv(r.message || '')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    return encodeURI(csvContent);
  },

  exportGiftsToCSV: (customGifts = null, customPledges = null) => {
    const gifts = Array.isArray(customGifts) && customGifts.length > 0 
      ? customGifts 
      : storageService.getGifts();
    const pledges = Array.isArray(customPledges) 
      ? customPledges 
      : storageService.getPledges();

    if (!gifts.length && !pledges.length) return null;

    const safeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).trim();
      if (!str || str === '-') return '"-"';
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const formatDate = (dateVal) => {
      if (!dateVal) return '-';
      try {
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
      } catch {
        return '-';
      }
    };

    const headers = [
      'Presente',
      'Categoria',
      'Status / Meta',
      'Quem vai dar (Presenteador)',
      'Quantidade',
      'Data da Reserva',
      'Detalhes/Tamanho'
    ];

    const rows = [];
    const sortedGifts = [...gifts].sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

    sortedGifts.forEach((gift) => {
      const giftPledges = (pledges || []).filter((p) => p && (p.giftId === gift.id || p.gift_id === gift.id));
      const targetQty = Number(gift.targetQuantity) || 5;
      const totalUnits = giftPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
      const isCompleted = totalUnits >= targetQty;
      const progressPercent = Math.min(100, Math.round((totalUnits / targetQty) * 100));

      if (giftPledges.length > 0) {
        // Se houver contribuições registradas por convidados, listar cada uma
        giftPledges.forEach((p) => {
          rows.push([
            safeCsv(gift.title),
            safeCsv(gift.category),
            safeCsv(isCompleted ? 'META ATINGIDA' : `${totalUnits}/${targetQty} un. (${progressPercent}%)`),
            safeCsv(p.giverName || p.giver_name || 'Convidado'),
            safeCsv(`${Number(p.quantity) || 1} un.`),
            safeCsv(formatDate(p.createdAt || p.created_at)),
            safeCsv(gift.description || '')
          ]);
        });
      } else if (gift.reservedBy || gift.status === 'reserved') {
        // Suporte a reservas diretas legadas
        rows.push([
          safeCsv(gift.title),
          safeCsv(gift.category),
          safeCsv('RESERVADO'),
          safeCsv(gift.reservedBy || 'Convidado'),
          safeCsv('1 un.'),
          safeCsv(formatDate(gift.reservedAt)),
          safeCsv(gift.description || '')
        ]);
      } else {
        // Presente disponível sem contribuições ainda
        rows.push([
          safeCsv(gift.title),
          safeCsv(gift.category),
          safeCsv('DISPONÍVEL'),
          safeCsv('-'),
          safeCsv('-'),
          safeCsv('-'),
          safeCsv(gift.description || '')
        ]);
      }
    });

    // Incluir contribuições que possam referenciar presentes excluídos ou renomeados
    const knownGiftIds = new Set(sortedGifts.map((g) => g.id));
    const orphanedPledges = (pledges || []).filter((p) => p && !knownGiftIds.has(p.giftId || p.gift_id));
    orphanedPledges.forEach((p) => {
      rows.push([
        safeCsv(`Item #${p.giftId || p.gift_id}`),
        safeCsv('Outros'),
        safeCsv('CONTRIBUIÇÃO'),
        safeCsv(p.giverName || p.giver_name || 'Convidado'),
        safeCsv(`${Number(p.quantity) || 1} un.`),
        safeCsv(formatDate(p.createdAt || p.created_at)),
        safeCsv('-')
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    return encodeURI(csvContent);
  },

  // PLEDGES (CONTRIBUIÇÕES DE PRESENTES)
  fetchPledgesFromCloud: async () => {
    if (!isSupabaseConfigured || !supabase) return storageService.getPledges();
    try {
      const { data, error } = await supabase.from('gift_pledges').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      const mapped = (data || []).map(mapPledgeFromDB).filter(p => !isTestGuest(p.giverName));
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
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(p => !isTestGuest(p.giverName));
    } catch {
      return [];
    }
  },

  addPledge: async (giftId, giverName, quantity) => {
    const pledges = storageService.getPledges();
    const safeGiverName = sanitizeName(giverName || 'Amigo do Chá', 80);
    const safeQuantity = Math.max(1, Math.min(999, parseInt(quantity, 10) || 1));

    const newPledge = {
      id: generateUniqueId('pledge'),
      giftId,
      giverName: safeGiverName,
      quantity: safeQuantity,
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
    const pledgeToDelete = pledges.find(p => p.id === pledgeId);
    const updated = pledges.filter(p => p.id !== pledgeId);
    localStorage.setItem(KEYS.PLEDGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pledges_updated', { detail: updated }));

    if (pledgeToDelete) {
      storageService.addAdminLog({
        action: 'Contribuição Cancelada',
        details: `Contribuição de "${pledgeToDelete.giverName}" (${pledgeToDelete.quantity} un.) foi removida pelo administrador.`,
        category: 'gifts',
      });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('gift_pledges').delete().eq('id', pledgeId);
      } catch (err) {
        console.error('Erro ao deletar pledge no Supabase:', err);
      }
    }
    return updated;
  },

  // REGISTRO DE ATIVIDADES E AUDITORIA (LOGS)
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

      const currentLogs = storageService.getAdminLogs();
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
    const currentLogs = storageService.getAdminLogs();
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

  exportAdminLogsToCSV: () => {
    const logs = storageService.getAdminLogs();
    if (!logs.length) return null;

    const safeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).trim();
      if (!str || str === '-') return '"-"';
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = ['Data', 'Horário', 'Categoria', 'Ação Realizada', 'Detalhes da Alteração', 'Responsável'];
    const rows = logs.map(log => [
      safeCsv(log.formattedDate || new Date(log.timestamp).toLocaleDateString('pt-BR')),
      safeCsv(log.formattedTime || new Date(log.timestamp).toLocaleTimeString('pt-BR')),
      safeCsv(log.category ? log.category.toUpperCase() : 'SISTEMA'),
      safeCsv(log.action || ''),
      safeCsv(log.details || ''),
      safeCsv(log.author || 'Administrador')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    return encodeURI(csvContent);
  },

  exportFullDatabaseJSON: async () => {
    let dump = {
      exported_at: new Date().toISOString(),
      app: 'Chá da Maitê',
      tables: {}
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const [cfg, gft, pld, rsv, msg] = await Promise.all([
          supabase.from('event_config').select('*'),
          supabase.from('gifts').select('*'),
          supabase.from('gift_pledges').select('*'),
          supabase.from('rsvps').select('*'),
          supabase.from('messages').select('*')
        ]);
        dump.tables.event_config = cfg.data || [];
        dump.tables.gifts = gft.data || [];
        dump.tables.gift_pledges = pld.data || [];
        dump.tables.rsvps = rsv.data || [];
        dump.tables.messages = msg.data || [];
      } catch (err) {
        console.error('Erro ao buscar do Supabase para exportação, usando dados locais:', err);
        dump.tables = {
          event_config: [storageService.getConfig()],
          gifts: storageService.getGifts(),
          gift_pledges: storageService.getPledges(),
          rsvps: storageService.getRSVPs(),
          messages: storageService.getMessages()
        };
      }
    } else {
      dump.tables = {
        event_config: [storageService.getConfig()],
        gifts: storageService.getGifts(),
        gift_pledges: storageService.getPledges(),
        rsvps: storageService.getRSVPs(),
        messages: storageService.getMessages()
      };
    }

    return JSON.stringify(dump, null, 2);
  },

  exportFullDatabaseSQL: async () => {
    const jsonStr = await storageService.exportFullDatabaseJSON();
    const dump = JSON.parse(jsonStr);

    function escapeSql(val) {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (typeof val === 'number') return val;
      if (Array.isArray(val)) {
        if (val.length === 0) return "'{}'::text[]";
        const arrStr = val.map(name => '"' + String(name).replace(/"/g, '\\"') + '"').join(',');
        return `'{${arrStr.replace(/'/g, "''")}}'::text[]`;
      }
      if (typeof val === 'object') {
        return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
      }
      return "'" + String(val).replace(/'/g, "''") + "'";
    }

    let sql = `-- ====================================================================\n`;
    sql += `-- BACKUP DO BANCO DE DADOS - CHÁ DA MAITÊ\n`;
    sql += `-- Data: ${dump.exported_at}\n`;
    sql += `-- ====================================================================\n\n`;

    const tables = ['event_config', 'gifts', 'gift_pledges', 'rsvps', 'messages'];
    for (const tbl of tables) {
      const rows = dump.tables[tbl] || [];
      sql += `-- Tabela: ${tbl} (${rows.length} registros)\n`;
      for (const row of rows) {
        const cols = Object.keys(row);
        const vals = cols.map(c => escapeSql(row[c]));
        const updateClause = cols.filter(c => c !== 'id').map(c => `${c} = EXCLUDED.${c}`).join(', ');
        sql += `INSERT INTO public.${tbl} (${cols.join(', ')})\nVALUES (${vals.join(', ')})\nON CONFLICT (id) DO UPDATE SET ${updateClause};\n`;
      }
      sql += `\n`;
    }

    return sql;
  }
};

export default storageService;

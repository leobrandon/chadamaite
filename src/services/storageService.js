import { INITIAL_GIFTS, INITIAL_EVENT_CONFIG, INITIAL_MESSAGES, INITIAL_RSVPS, INITIAL_PLEDGES } from '../data/initialGifts';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { formatPhone } from '../utils/phoneMask';
import { formatRelativeOrExactDate, getMessageTimestamp } from '../utils/dateUtils';
import { sanitizeText, sanitizeName } from '../utils/security';

const KEYS = {
  GIFTS: 'cha_maite_gifts_v1',
  RSVPS: 'cha_maite_rsvps_v1',
  CONFIG: 'cha_maite_config_v1',
  MESSAGES: 'cha_maite_messages_v1',
  PLEDGES: 'cha_maite_pledges_v1',
  LOGS: 'cha_maite_admin_logs_v1',
  DISMISSED_GIFTS: 'cha_maite_dismissed_gifts_v1',
  DISMISSED_RSVPS: 'cha_maite_dismissed_rsvps_v1',
  DISMISSED_MESSAGES: 'cha_maite_dismissed_messages_v1',
  DISMISSED_PLEDGES: 'cha_maite_dismissed_pledges_v1',
};

// Higienização automática e autocura do localStorage
(function selfHealLocalStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    // 1. Remove a chave corrompida literal 'undefined' gerada anteriormente
    window.localStorage.removeItem('undefined');

    // 2. Higieniza descartados de RSVPs para remover resíduos indevidos
    const rsvpDismissedStr = window.localStorage.getItem(KEYS.DISMISSED_RSVPS);
    if (rsvpDismissedStr) {
      try {
        const parsed = JSON.parse(rsvpDismissedStr);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(id => {
            const s = String(id || '');
            return !s.includes('28bf3597-c708-44cd-b509-2eee0ae919ac') &&
                   !s.startsWith('msg-') &&
                   !s.startsWith('dismissed-msg-');
          });
          window.localStorage.setItem(KEYS.DISMISSED_RSVPS, JSON.stringify(cleaned));
        }
      } catch {}
    }

    // 3. Higieniza descartados de recados para remover falso descarte
    const msgDismissedStr = window.localStorage.getItem(KEYS.DISMISSED_MESSAGES);
    if (msgDismissedStr) {
      try {
        const parsed = JSON.parse(msgDismissedStr);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(id => {
            const s = String(id || '');
            return !s.includes('28bf3597-c708-44cd-b509-2eee0ae919ac');
          });
          window.localStorage.setItem(KEYS.DISMISSED_MESSAGES, JSON.stringify(cleaned));
        }
      } catch {}
    }
  } catch {}
})();

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

// Filtro para registros de teste e mocks de demonstração
export function isTestGuest(nameOrAuthor) {
  if (!nameOrAuthor) return false;
  const n = String(nameOrAuthor).trim().toLowerCase();

  // Lista e padrões de cadastros de teste que não devem poluir a lista nem os presentes
  if (
    n === 'teste' ||
    n === 'teste convidado' ||
    n === 'carlos eduardo' ||
    n === 'mariana silva' ||
    n === 'carlos eduardo (mock inicial)' ||
    n === 'mariana silva (mock inicial)' ||
    n === 'teste mural autor' ||
    n === 'teste tio joão' ||
    n === 'tio marcos' ||
    n.startsWith('teste ') ||
    n.startsWith('teste-') ||
    n.includes('teste mural') ||
    n.includes('teste tio') ||
    n.includes('teste convidado')
  ) {
    return true;
  }
  return false;
}

// Identificador universal para filtrar recados excluídos definitivamente
export function isExcludedOrTestMessage(m) {
  if (!m) return true;
  const author = String(m.author || '').trim().toLowerCase();
  const text = String(m.text || '').trim().toLowerCase();
  const id = String(m.id || '').trim().toLowerCase();

  // Descartar recados de usuários de teste
  if (isTestGuest(author)) {
    return true;
  }

  // Recados marcados como excluídos ou marcadores de controle no banco de dados
  if (
    author.includes('[excluido]') ||
    author.includes('[deleted]') ||
    author.includes('[resolvido]') ||
    text.includes('[excluido]') ||
    text.includes('[deleted]') ||
    text.includes('[restored]')
  ) {
    return true;
  }

  // IDs legados que foram descartados e marcados como removidos
  const legacyRemovedIds = [
    'test1-1789646180102',
    'test-approval-check-1',
    'msg-test-upsert-1789646339583',
    'msg-probe-appr',
    'msg-test-ynyc5q',
    'msg-test-probe-x6ad8',
    'rsvp-probe-mural',
    'rsvp-msg-teste-1789732781327',
    'rsvp-msg-loop-1789732824597',
    'rsvp-msg-eb3220a6-63e4-4fc8-926c-58dc53ade8f1',
    'rsvp-msg-flow-1789732791804',
    'msg-rsvp-probe-mural',
    'msg-teste-1789732781327',
    'msg-loop-1789732824597',
    'msg-eb3220a6-63e4-4fc8-926c-58dc53ade8f1',
    'msg-flow-1789732791804',
  ];
  if (legacyRemovedIds.includes(id)) {
    return true;
  }

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

let adminToken = null;
let adminData = { gifts: null, rsvps: null, messages: null, pledges: null };

async function invokeAppApi(action, payload = {}) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('O Supabase de homologação não está configurado.');
  }
  const { data, error } = await supabase.functions.invoke('app-api', {
    body: { action, ...payload },
  });
  if (error) {
    let message = error.message || 'Não foi possível concluir a operação.';
    try {
      const response = error.context;
      if (response && typeof response.clone === 'function') {
        const body = await response.clone().json();
        if (body?.error) message = body.error;
      }
    } catch {
      // Mantém a mensagem segura da função.
    }
    throw new Error(message);
  }
  return data;
}

async function invokeAdminApi(action, payload = {}) {
  if (!adminToken) throw new Error('Sua sessão expirou. Entre novamente no painel.');
  try {
    const data = await invokeAppApi(action, { ...payload, token: adminToken });
    if (data?.token) adminToken = data.token;
    return data;
  } catch (error) {
    if (String(error?.message || '').includes('Sessão administrativa expirada')) {
      adminToken = null;
      adminData = { gifts: null, rsvps: null, messages: null, pledges: null };
    }
    throw error;
  }
}

export const storageService = {
  isCloudConnected: isSupabaseConfigured,
  loginAdmin: async (pin) => {
    const result = await invokeAppApi('admin-login', { pin: String(pin || '').trim() });
    adminToken = result?.token || null;
    adminData = { gifts: null, rsvps: null, messages: null, pledges: null };
    return Boolean(adminToken);
  },

  clearAdminSession: async () => {
    adminToken = null;
    adminData = { gifts: null, rsvps: null, messages: null, pledges: null };
    storageService._cachedTombstones = null;
    storageService._lastTombstoneFetch = 0;
    storageService._tombstonePromise = null;
    for (const key of [KEYS.GIFTS, KEYS.RSVPS, KEYS.MESSAGES, KEYS.PLEDGES]) {
      localStorage.removeItem(key);
    }
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: [] }));
    await Promise.allSettled([
      storageService.fetchGiftsFromCloud(),
      storageService.fetchMessagesFromCloud(),
      storageService.fetchPledgesFromCloud(),
    ]);
  },

  refreshAdminData: async () => {
    if (!adminToken) throw new Error('Entre novamente no painel.');
    const [giftRows, rsvpRows, messageRows, pledgeRows] = await Promise.all([
      invokeAdminApi('admin-gifts'),
      invokeAdminApi('admin-rsvps'),
      invokeAdminApi('admin-messages'),
      invokeAdminApi('admin-pledges'),
    ]);
    adminData = {
      gifts: (giftRows || []).map(mapGiftFromDB),
      rsvps: (rsvpRows || []).map(mapRSVPFromDB).filter((r) => r && !isTestGuest(r.name)),
      messages: (messageRows || []).map(mapMessageFromDB).filter((m) => m && !isExcludedOrTestMessage(m)),
      pledges: (pledgeRows || []).map(mapPledgeFromDB).filter((p) => p && !isTestGuest(p.giverName)),
    };
    window.dispatchEvent(new CustomEvent('gifts_updated', { detail: adminData.gifts }));
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: adminData.rsvps }));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: adminData.messages }));
    window.dispatchEvent(new CustomEvent('pledges_updated', { detail: adminData.pledges }));
    return adminData;
  },


  // Cache e sincronização centralizada de exclusões/lápides na nuvem
  _tombstonePromise: null,
  _lastTombstoneFetch: 0,
  _cachedTombstones: null,

  getDismissedGiftIds: () => {
    try {
      const saved = localStorage.getItem(KEYS.DISMISSED_GIFTS);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  fetchCloudTombstones: async (options = {}) => {
    if (!adminToken) {
      return {
        dismissedRsvps: new Set(storageService.getDismissedRSVPIds()),
        dismissedPledges: new Set(storageService.getDismissedPledgeIds()),
        dismissedMessages: new Set(storageService.getDismissedMessageIds()),
        dismissedGifts: new Set(storageService.getDismissedGiftIds()),
        rsvpOverrides: new Map(),
        messageOverrides: new Map(),
      };
    }
    const { force = false } = options;
    const now = Date.now();

    if (!force && storageService._cachedTombstones && (now - storageService._lastTombstoneFetch < 3000)) {
      return storageService._cachedTombstones;
    }

    if (!force && storageService._tombstonePromise) {
      return storageService._tombstonePromise;
    }

    storageService._tombstonePromise = (async () => {
      const dismissedRsvps = new Set(storageService.getDismissedRSVPIds());
      const dismissedPledges = new Set(storageService.getDismissedPledgeIds());
      const dismissedMessages = new Set(storageService.getDismissedMessageIds());
      const dismissedGifts = new Set(storageService.getDismissedGiftIds());
      const rsvpOverrides = new Map();
      const messageOverrides = new Map();

      if (!isSupabaseConfigured || !supabase) {
        const result = {
          dismissedRsvps,
          dismissedPledges,
          dismissedMessages,
          dismissedGifts,
          rsvpOverrides,
          messageOverrides,
        };
        storageService._cachedTombstones = result;
        storageService._lastTombstoneFetch = Date.now();
        storageService._tombstonePromise = null;
        return result;
      }

      try {
        const rows = adminToken ? await invokeAdminApi('admin-messages') : [];
        if (Array.isArray(rows)) {
          rows.forEach((row) => {
            if (!row) return;
            const author = String(row.author || '').trim();
            const text = String(row.text || '').trim();
            const id = String(row.id || '').trim();

            if (author.includes('[EXCLUIDO]') || text.includes('[DISMISSED')) {
              // Extrair IDs das tags no texto
              const matches = text.matchAll(/\[(DISMISSED_[A-Z]+|DISMISSED_ID):([^\]]+)\]/g);
              for (const m of matches) {
                const tag = m[1];
                let rawId = m[2].trim();
                if (!rawId) continue;
                // Remove prefixos "dismissed-" encadeados
                const cleanId = rawId.replace(/^(dismissed-)+/, '');
                const bareId = cleanId.replace(/^(rsvp-msg-|rsvp-|pledge-|msg-|gift-)/, '');

                // Mensagens nunca devem descartar confirmação de presença (RSVP)
                const isMsg = tag === 'DISMISSED_MSG' || cleanId.startsWith('msg-') || cleanId.startsWith('rsvp-msg-') || cleanId.includes('msg-');
                const isRsvp = (tag === 'DISMISSED_RSVP' || cleanId.startsWith('rsvp-')) && !isMsg;
                const isPledge = tag === 'DISMISSED_PLEDGE' || cleanId.startsWith('pledge-');
                const isGift = tag === 'DISMISSED_GIFT' || cleanId.startsWith('gift-');

                if (isRsvp) {
                  dismissedRsvps.add(cleanId);
                  dismissedRsvps.add(`rsvp-${bareId}`);
                  dismissedRsvps.add(bareId);
                } else if (isPledge) {
                  dismissedPledges.add(cleanId);
                  dismissedPledges.add(`pledge-${bareId}`);
                  dismissedPledges.add(bareId);
                } else if (isGift) {
                  dismissedGifts.add(cleanId);
                  dismissedGifts.add(`gift-${bareId}`);
                  dismissedGifts.add(bareId);
                } else if (isMsg) {
                  dismissedMessages.add(cleanId);
                  dismissedMessages.add(bareId);
                  dismissedMessages.add(`msg-${bareId}`);
                  dismissedMessages.add(`rsvp-msg-${bareId}`);
                  dismissedMessages.add(`rsvp-${bareId}`);
                  if (cleanId.startsWith('msg-')) {
                    dismissedMessages.add(cleanId.replace(/^msg-/, ''));
                  } else {
                    dismissedMessages.add(`msg-${cleanId}`);
                  }
                }
              }

              // Extrair IDs a partir do id da lápide
              if (id.startsWith('dismissed-')) {
                const cleanId = id.replace(/^(dismissed-)+/, '');
                const bareId = cleanId.replace(/^(rsvp-msg-|rsvp-|pledge-|msg-|gift-)/, '');
                const isMsg = cleanId.startsWith('msg-') || cleanId.startsWith('rsvp-msg-') || cleanId.includes('msg-');
                const isRsvp = cleanId.startsWith('rsvp-') && !isMsg;
                const isPledge = cleanId.startsWith('pledge-');
                const isGift = cleanId.startsWith('gift-');

                if (isRsvp) {
                  dismissedRsvps.add(cleanId);
                  dismissedRsvps.add(`rsvp-${bareId}`);
                  dismissedRsvps.add(bareId);
                } else if (isPledge) {
                  dismissedPledges.add(cleanId);
                  dismissedPledges.add(`pledge-${bareId}`);
                  dismissedPledges.add(bareId);
                } else if (isGift) {
                  dismissedGifts.add(cleanId);
                  dismissedGifts.add(`gift-${bareId}`);
                  dismissedGifts.add(bareId);
                } else if (isMsg) {
                  dismissedMessages.add(cleanId);
                  dismissedMessages.add(bareId);
                  dismissedMessages.add(`msg-${bareId}`);
                  dismissedMessages.add(`rsvp-msg-${bareId}`);
                  dismissedMessages.add(`rsvp-${bareId}`);
                  if (cleanId.startsWith('msg-')) {
                    dismissedMessages.add(cleanId.replace(/^msg-/, ''));
                  } else {
                    dismissedMessages.add(`msg-${cleanId}`);
                  }
                }
              }
            }

            if (author.includes('[OVERRIDE_RSVP]')) {
              try {
                const parsed = JSON.parse(text);
                if (parsed && parsed.rsvpId) {
                  const existing = rsvpOverrides.get(parsed.rsvpId) || {};
                  rsvpOverrides.set(parsed.rsvpId, { ...existing, ...parsed.fields });
                }
              } catch {}
            }

            if (author.includes('[OVERRIDE_MSG]')) {
              try {
                const parsed = JSON.parse(text);
                if (parsed && parsed.msgId) {
                  const existing = messageOverrides.get(parsed.msgId) || {};
                  messageOverrides.set(parsed.msgId, { ...existing, ...parsed.fields });
                }
              } catch {}
            }
          });

          try {
            localStorage.setItem(KEYS.DISMISSED_RSVPS, JSON.stringify(Array.from(dismissedRsvps)));
            localStorage.setItem(KEYS.DISMISSED_PLEDGES, JSON.stringify(Array.from(dismissedPledges)));
            localStorage.setItem(KEYS.DISMISSED_MESSAGES, JSON.stringify(Array.from(dismissedMessages)));
            localStorage.setItem(KEYS.DISMISSED_GIFTS, JSON.stringify(Array.from(dismissedGifts)));
          } catch {}
        }
      } catch (err) {
        console.error('Erro ao buscar lápides no Supabase:', err);
      } finally {
        storageService._tombstonePromise = null;
      }

      const result = {
        dismissedRsvps,
        dismissedPledges,
        dismissedMessages,
        dismissedGifts,
        rsvpOverrides,
        messageOverrides,
      };
      storageService._cachedTombstones = result;
      storageService._lastTombstoneFetch = Date.now();
      return result;
    })();

    return storageService._tombstonePromise;
  },

  // Inicialização e sincronização em tempo real otimizada
  initRealtimeSync: async (onDataUpdate) => {
    if (!isSupabaseConfigured || !supabase) {
      console.log('ℹ️ Operando no modo local (localStorage).');
      return;
    }

    try {
      console.log('⚡ Conectando ao banco em tempo real Supabase...');

      // Carregar lápides na nuvem primeiro para que qualquer exclusão anterior seja honrada imediatamente
      await storageService.fetchCloudTombstones({ force: true });

      // Carregar dados iniciais da nuvem com resiliência total
      const results = await Promise.allSettled([
        storageService.fetchConfigFromCloud(),
        storageService.fetchGiftsFromCloud(),
        storageService.fetchRSVPsFromCloud(),
        storageService.fetchMessagesFromCloud(),
        storageService.fetchPledgesFromCloud(),
      ]);
      const failedResult = results.find((result) => result.status === 'rejected');
      if (failedResult) throw failedResult.reason;
      const [configRes, giftsRes, rsvpsRes, messagesRes, pledgesRes] = results;
      const initialPayload = {};
      if (configRes.status === 'fulfilled' && configRes.value) initialPayload.config = configRes.value;
      if (giftsRes.status === 'fulfilled' && giftsRes.value) initialPayload.gifts = giftsRes.value;
      if (rsvpsRes.status === 'fulfilled' && rsvpsRes.value) initialPayload.rsvps = rsvpsRes.value;
      if (messagesRes.status === 'fulfilled' && messagesRes.value) initialPayload.messages = messagesRes.value;
      if (pledgesRes.status === 'fulfilled' && pledgesRes.value) initialPayload.pledges = pledgesRes.value;

      if (onDataUpdate && Object.keys(initialPayload).length > 0) {
        onDataUpdate(initialPayload);
      }

      // Batching & Debounce state for realtime postgres changes
      const pendingTables = new Set();
      let debounceTimer = null;

      const processBatchedUpdates = async () => {
        const tablesToFetch = Array.from(pendingTables);
        pendingTables.clear();
        debounceTimer = null;

        if (tablesToFetch.length === 0) return;

        // Sempre sincroniza lápides atualizadas antes de recarregar tabelas
        await storageService.fetchCloudTombstones({ force: true });

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
                  updatePayload.messages = await storageService.fetchMessagesFromCloud();
                  break;
                }
                case 'messages': {
                  updatePayload.messages = await storageService.fetchMessagesFromCloud();
                  updatePayload.rsvps = await storageService.fetchRSVPsFromCloud();
                  updatePayload.pledges = await storageService.fetchPledgesFromCloud();
                  updatePayload.gifts = await storageService.fetchGiftsFromCloud();
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
      throw err;
    }
  },

  // CONFIGURAÇÕES
  fetchConfigFromCloud: async () => {
    if (!isSupabaseConfigured || !supabase) return storageService.getConfig();
    const fields = 'id,baby_name,parents,event_date,event_time,display_date,display_time,location_name,address,city,map_url,pix_key,pix_name,welcome_message,updated_at';
    const { data, error } = await supabase
      .from('event_config')
      .select(fields)
      .eq('id', 'default_config')
      .maybeSingle();
    if (error) throw new Error('Não foi possível carregar as informações do evento.');
    if (!data) return storageService.getConfig();
    const mapped = mapConfigFromDB(data);
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(mapped));
    window.dispatchEvent(new CustomEvent('config_updated', { detail: mapped }));
    return mapped;
  },

  getConfig: () => {
    try {
      const saved = localStorage.getItem(KEYS.CONFIG);
      const config = saved ? JSON.parse(saved) : {};
      delete config.adminPinHash;
      delete config.adminPin;
      return { ...INITIAL_EVENT_CONFIG, ...config };
    } catch {
      return INITIAL_EVENT_CONFIG;
    }
  },

  saveConfig: async (newConfig, newPin = '') => {
    const safeConfig = { ...newConfig };
    delete safeConfig.adminPinHash;
    delete safeConfig.adminPin;
    if (isSupabaseConfigured && supabase) {
      const result = await invokeAdminApi('admin-save-config', { config: safeConfig, newPin: String(newPin || '').trim() });
      const mapped = mapConfigFromDB(result.config);
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(mapped));
      window.dispatchEvent(new CustomEvent('config_updated', { detail: mapped }));
      return mapped;
    }
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(safeConfig));
    window.dispatchEvent(new CustomEvent('config_updated', { detail: safeConfig }));
    return safeConfig;
  },

  fetchGiftsFromCloud: async () => {
    if (!isSupabaseConfigured || !supabase) return storageService.getGifts();
    try {
      const tombstones = await storageService.fetchCloudTombstones();
      let rows = [];
      if (adminToken) {
        rows = await invokeAdminApi('admin-gifts');
      } else {
        const { data, error } = await supabase.from('gifts_public').select('*').order('display_order', { ascending: true });
        if (error) throw error;
        rows = data || [];
      }
      const dismissedSet = tombstones?.dismissedGifts || new Set(storageService.getDismissedGiftIds());
      const mapped = (rows || []).map(mapGiftFromDB).filter((gift) => {
        if (!gift || !gift.id) return false;
        const idStr = String(gift.id);
        const bareId = idStr.replace(/^gift-/, '');
        return !dismissedSet.has(idStr) && !dismissedSet.has(bareId) && !dismissedSet.has('gift-' + bareId);
      });
      if (adminToken) adminData.gifts = mapped;
      else localStorage.setItem(KEYS.GIFTS, JSON.stringify(mapped));
      window.dispatchEvent(new CustomEvent('gifts_updated', { detail: mapped }));
      return mapped.length ? mapped : (adminToken ? mapped : INITIAL_GIFTS);
    } catch (error) {
      console.error('Erro ao carregar presentes do Supabase:', error);
      if (adminToken) throw error;
      return INITIAL_GIFTS;
    }
  },

  getGifts: () => {
    if (adminToken && Array.isArray(adminData.gifts)) return adminData.gifts;
    const safePublicGifts = (items) => (items || []).map((gift) => ({ ...gift, reservedBy: '', reservedAt: null }));
    try {
      const saved = localStorage.getItem(KEYS.GIFTS);
      const gifts = saved ? JSON.parse(saved) : INITIAL_GIFTS;
      return isSupabaseConfigured ? safePublicGifts(gifts) : gifts;
    } catch {
      return isSupabaseConfigured ? safePublicGifts(INITIAL_GIFTS) : INITIAL_GIFTS;
    }
  },

  saveGifts: (gifts) => {
    localStorage.setItem(KEYS.GIFTS, JSON.stringify(gifts));
    window.dispatchEvent(new CustomEvent('gifts_updated', { detail: gifts }));
    return gifts;
  },

  reserveGift: async (giftId, guestName) => {
    const safeName = sanitizeName(guestName || 'Convidado com carinho', 80) || 'Convidado com carinho';
    if (isSupabaseConfigured && supabase) {
      await invokeAppApi('public-reserve-gift', { giftId, guestName: safeName });
      return storageService.fetchGiftsFromCloud();
    }
    const gifts = storageService.getGifts();
    const nowIso = new Date().toISOString();
    const updated = gifts.map((gift) => gift.id === giftId
      ? { ...gift, status: 'reserved', reservedBy: safeName, reservedAt: nowIso }
      : gift);
    storageService.saveGifts(updated);
    return updated;
  },

  cancelReservation: async (giftId) => {
    if (isSupabaseConfigured && supabase) {
      await invokeAdminApi('admin-cancel-reservation', { id: giftId });
      return storageService.fetchGiftsFromCloud();
    }
    const gifts = storageService.getGifts();
    const updated = gifts.map((gift) => gift.id === giftId
      ? { ...gift, status: 'available', reservedBy: '', reservedAt: null }
      : gift);
    storageService.saveGifts(updated);
    return updated;
  },

  addGift: async (newGift) => {
    const gift = {
      ...newGift,
      targetQuantity: Number(newGift.targetQuantity || 5),
      displayOrder: Number(newGift.displayOrder || 999),
      id: generateUniqueId('gift'),
      status: 'available',
      reservedBy: '',
      reservedAt: null,
    };
    if (isSupabaseConfigured && supabase) {
      const row = await invokeAdminApi('admin-create-gift', { gift });
      const savedGift = mapGiftFromDB(row);
      adminData.gifts = [savedGift, ...(adminData.gifts || storageService.getGifts())];
      window.dispatchEvent(new CustomEvent('gifts_updated', { detail: adminData.gifts }));
      return adminData.gifts;
    }
    const updated = [gift, ...storageService.getGifts()];
    storageService.saveGifts(updated);
    return updated;
  },

  updateGift: async (giftId, fields) => {
    if (isSupabaseConfigured && supabase) {
      const row = await invokeAdminApi('admin-update-gift', { id: giftId, fields });
      const savedGift = mapGiftFromDB(row);
      const updated = (adminData.gifts || storageService.getGifts()).map((gift) => gift.id === giftId ? savedGift : gift);
      adminData.gifts = updated;
      window.dispatchEvent(new CustomEvent('gifts_updated', { detail: updated }));
      return updated;
    }
    const updated = storageService.getGifts().map((gift) => gift.id === giftId ? { ...gift, ...fields } : gift);
    storageService.saveGifts(updated);
    return updated;
  },

  deleteGift: async (giftId) => {
    if (isSupabaseConfigured && supabase) await invokeAdminApi('admin-delete-gift', { id: giftId });
    const gifts = (adminData.gifts || storageService.getGifts()).filter((gift) => gift.id !== giftId);
    if (adminToken) adminData.gifts = gifts;
    else localStorage.setItem(KEYS.GIFTS, JSON.stringify(gifts));
    const dismissed = storageService.getDismissedGiftIds();
    const bareId = String(giftId).replace(/^gift-/, '');
    for (const id of [String(giftId), bareId, 'gift-' + bareId]) {
      if (!dismissed.includes(id)) dismissed.push(id);
    }
    localStorage.setItem(KEYS.DISMISSED_GIFTS, JSON.stringify(dismissed));
    const pledges = (adminData.pledges || storageService.getPledges()).filter((pledge) => pledge.giftId !== giftId);
    if (adminToken) adminData.pledges = pledges;
    else localStorage.setItem(KEYS.PLEDGES, JSON.stringify(pledges));
    window.dispatchEvent(new CustomEvent('gifts_updated', { detail: gifts }));
    window.dispatchEvent(new CustomEvent('pledges_updated', { detail: pledges }));
    return gifts;
  },

  resetGiftsToDefault: async () => {
    if (isSupabaseConfigured && supabase) {
      await invokeAdminApi('admin-reset-gifts', { gifts: INITIAL_GIFTS.map(mapGiftToDB) });
      const rows = await invokeAdminApi('admin-gifts');
      adminData.gifts = (rows || []).map(mapGiftFromDB);
      window.dispatchEvent(new CustomEvent('gifts_updated', { detail: adminData.gifts }));
      return adminData.gifts;
    }
    storageService.saveGifts(INITIAL_GIFTS);
    return INITIAL_GIFTS;
  },

  getDismissedRSVPIds: () => {
    try {
      const saved = localStorage.getItem(KEYS.DISMISSED_RSVPS);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      // Higieniza qualquer resíduo indevido de recados gravados erroneamente como RSVP
      const cleaned = parsed.filter(id => {
        const str = String(id || '');
        if (str.includes('8dd0513e-e2a8-4262-ae62-41108ff2794d')) return false;
        if (str.includes('msg-') || str.startsWith('dismissed-msg-')) return false;
        return true;
      });
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(KEYS.DISMISSED_RSVPS, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  },

  fetchRSVPsFromCloud: async () => {
    if (!isSupabaseConfigured || !supabase || !adminToken) {
      localStorage.removeItem(KEYS.RSVPS);
      window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: [] }));
      return [];
    }
    const [tombstones, rows] = await Promise.all([
      storageService.fetchCloudTombstones({ force: true }),
      invokeAdminApi('admin-rsvps'),
    ]);
    const dismissedSet = tombstones?.dismissedRsvps || new Set(storageService.getDismissedRSVPIds());
    const overrides = tombstones?.rsvpOverrides || new Map();
    const mapped = (rows || []).map(mapRSVPFromDB).filter((rsvp) => {
      if (!rsvp || !rsvp.id || isTestGuest(rsvp.name)) return false;
      const id = String(rsvp.id);
      const bare = id.replace(/^rsvp-/, '');
      return !dismissedSet.has(id) && !dismissedSet.has(bare) && !dismissedSet.has('rsvp-' + bare);
    }).map((rsvp) => {
      const id = String(rsvp.id);
      const bare = id.replace(/^rsvp-/, '');
      return { ...rsvp, ...(overrides.get(id) || overrides.get(bare) || {}) };
    });
    adminData.rsvps = mapped;
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: mapped }));
    return mapped;
  },

  getRSVPs: () => {
    return adminToken && Array.isArray(adminData.rsvps) ? adminData.rsvps : [];
  },

  saveRSVP: async (rsvpData) => {
    const safeName = sanitizeName(rsvpData.name || '', 80);
    const safePhone = formatPhone(rsvpData.phone || '');
    const safeMessage = sanitizeText(rsvpData.message || '', 500);
    const safeCompanions = Array.isArray(rsvpData.companionNames)
      ? rsvpData.companionNames.map((name) => sanitizeName(name, 80)).filter(Boolean)
      : [];
    const rsvp = {
      name: safeName,
      attending: Boolean(rsvpData.attending),
      adultsCount: rsvpData.attending ? Math.max(1, Math.min(20, Number(rsvpData.adultsCount) || 1)) : 0,
      childrenCount: rsvpData.attending ? Math.max(0, Math.min(20, Number(rsvpData.childrenCount) || 0)) : 0,
      companionNames: rsvpData.attending ? safeCompanions : [],
      phone: safePhone,
      message: safeMessage,
    };
    if (isSupabaseConfigured && supabase) {
      const result = await invokeAppApi('public-submit-rsvp', { rsvp });
      return mapRSVPFromDB(result.rsvp);
    }
    return { id: generateUniqueId('rsvp'), createdAt: new Date().toISOString(), ...rsvp };
  },

  deleteRSVP: async (rsvpId) => {
    if (isSupabaseConfigured && supabase) await invokeAdminApi('admin-delete-rsvp', { id: rsvpId });
    const updated = (adminData.rsvps || storageService.getRSVPs()).filter((rsvp) => rsvp.id !== rsvpId);
    if (adminToken) adminData.rsvps = updated;
    localStorage.removeItem(KEYS.RSVPS);
    window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));
    return updated;
  },

  updateRSVP: async (rsvpId, fields) => {
    if (isSupabaseConfigured && supabase) {
      const row = await invokeAdminApi('admin-update-rsvp', { id: rsvpId, fields });
      const saved = mapRSVPFromDB(row);
      const updated = (adminData.rsvps || storageService.getRSVPs()).map((rsvp) => rsvp.id === rsvpId ? saved : rsvp);
      adminData.rsvps = updated;
      window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));
      return updated;
    }
    return storageService.getRSVPs();
  },

  getDismissedMessageIds: () => {
    const defaultDismissed = [
      'test1-1789646180102',
      'test-approval-check-1',
      'msg-test-upsert-1789646339583',
      'rsvp-msg-flow-1789732791804',
      'msg-flow-1789732791804',
      'msg-rsvp-1bb3cd4d-97bc-4c08-a156-8b73808b39d5',
      'rsvp-1bb3cd4d-97bc-4c08-a156-8b73808b39d5',
    ];
    try {
      const saved = localStorage.getItem(KEYS.DISMISSED_MESSAGES);
      if (!saved) return defaultDismissed;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(id => !String(id || '').includes('28bf3597-c708-44cd-b509-2eee0ae919ac'));
        defaultDismissed.forEach((id) => {
          if (!cleaned.includes(id)) cleaned.push(id);
        });
        return cleaned;
      }
      return defaultDismissed;
    } catch {
      return defaultDismissed;
    }
  },

  // MENSAGENS / MURAL DE CARINHO
  fetchMessagesFromCloud: async () => {
    if (!isSupabaseConfigured || !supabase) return storageService.getMessages();
    const [tombstones, result] = await Promise.all([
      storageService.fetchCloudTombstones({ force: true }),
      adminToken
        ? invokeAdminApi('admin-messages')
        : supabase.from('messages').select('id,author,text,date,likes,status,created_at').eq('status', 'approved').order('created_at', { ascending: false }),
    ]);
    if (!adminToken && result.error) throw new Error('Não foi possível carregar os recados públicos.');
    const rows = adminToken ? result : (result.data || []);
    const dismissed = new Set([
      ...(tombstones?.dismissedMessages || []),
      ...storageService.getDismissedMessageIds(),
    ]);
    const overrides = tombstones?.messageOverrides || new Map();
    const mapped = (rows || []).map(mapMessageFromDB).filter((message) => {
      if (!message || !message.id || isExcludedOrTestMessage(message)) return false;
      if (!adminToken && message.status !== 'approved') return false;
      const id = String(message.id);
      const bare = id.replace(/^msg-/, '');
      return !dismissed.has(id) && !dismissed.has(bare) && !dismissed.has('msg-' + bare);
    }).map((message) => ({ ...message, ...(overrides.get(message.id) || {}) }));
    if (adminToken) adminData.messages = mapped;
    else localStorage.setItem(KEYS.MESSAGES, JSON.stringify(mapped));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: mapped }));
    return mapped;
  },

  getMessages: () => {
    if (adminToken && Array.isArray(adminData.messages)) return adminData.messages;
    try {
      const saved = localStorage.getItem(KEYS.MESSAGES);
      const messages = saved ? JSON.parse(saved) : INITIAL_MESSAGES;
      return Array.isArray(messages)
        ? messages.filter((message) => message && message.status === 'approved' && !isExcludedOrTestMessage(message))
        : [];
    } catch {
      return INITIAL_MESSAGES.filter((message) => message.status === 'approved');
    }
  },

  addMessage: async (msgData, autoApprove = false) => {
    const author = sanitizeName(msgData.author || 'Amigo com carinho', 80) || 'Amigo com carinho';
    const text = sanitizeText(msgData.text || '', 500);
    if (!text) throw new Error('Escreva um recado antes de enviar.');
    if (isSupabaseConfigured && supabase) {
      const result = await invokeAppApi('public-submit-message', { message: { author, text } });
      let saved = mapMessageFromDB(result.message);
      if (autoApprove && adminToken && saved?.id) {
        saved = mapMessageFromDB(await invokeAdminApi('admin-approve-message', { id: saved.id }));
      }
      if (adminToken && saved) {
        adminData.messages = [saved, ...(adminData.messages || []).filter((message) => message.id !== saved.id)];
        window.dispatchEvent(new CustomEvent('messages_updated', { detail: adminData.messages }));
      }
      return saved;
    }
    return { id: generateUniqueId('msg'), author, text, date: new Date().toISOString(), likes: 0, status: 'pending' };
  },

  approveMessage: async (msgId) => {
    const approved = mapMessageFromDB(await invokeAdminApi('admin-approve-message', { id: msgId }));
    const messages = adminData.messages || storageService.getMessages();
    const updated = [approved, ...messages.filter((message) => message.id !== msgId && message.id !== approved.id)];
    adminData.messages = updated;
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
    return updated;
  },

  likeMessage: async (msgId, delta = 1) => {
    if (isSupabaseConfigured && supabase) {
      const result = await invokeAppApi('public-like-message', { messageId: msgId });
      const messages = storageService.getMessages();
      const updated = messages.map((message) => message.id === msgId ? { ...message, likes: Number(result.likes) || 0 } : message);
      localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
      return updated;
    }
    const messages = storageService.getMessages();
    const updated = messages.map((message) => message.id === msgId
      ? { ...message, likes: Math.max(0, (Number(message.likes) || 0) + delta) }
      : message);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
    return updated;
  },

  deleteMessage: async (msgId) => {
    if (!msgId) return storageService.getMessages();
    if (isSupabaseConfigured && supabase) await invokeAdminApi('admin-delete-message', { id: msgId });
    const updated = (adminData.messages || storageService.getMessages()).filter((message) => message.id !== msgId);
    if (adminToken) adminData.messages = updated;
    else localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    const dismissed = storageService.getDismissedMessageIds();
    if (!dismissed.includes(msgId)) dismissed.push(msgId);
    localStorage.setItem(KEYS.DISMISSED_MESSAGES, JSON.stringify(dismissed));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
    return updated;
  },

  updateMessage: async (msgId, fields) => {
    if (isSupabaseConfigured && supabase) await invokeAdminApi('admin-update-message', { id: msgId, fields });
    const messages = adminData.messages || storageService.getMessages();
    const updated = messages.map((message) => message.id === msgId ? { ...message, ...fields } : message);
    if (adminToken) adminData.messages = updated;
    else localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
    return updated;
  },

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
  getDismissedPledgeIds: () => {
    try {
      const saved = localStorage.getItem(KEYS.DISMISSED_PLEDGES);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  fetchPledgesFromCloud: async () => {
    if (!isSupabaseConfigured || !supabase) return storageService.getPledges();
    let rows = [];
    if (adminToken) {
      rows = await invokeAdminApi('admin-pledges');
    } else {
      const { data, error } = await supabase.from('gift_pledge_totals').select('gift_id,pledged_quantity').order('gift_id', { ascending: true });
      if (error) throw new Error('Não foi possível carregar as quantidades de presentes.');
      rows = (data || []).map((row) => ({ id: 'pledge-total-' + row.gift_id, gift_id: row.gift_id, giver_name: '', quantity: row.pledged_quantity }));
    }
    const tombstones = await storageService.fetchCloudTombstones();
    const dismissed = tombstones?.dismissedPledges || new Set(storageService.getDismissedPledgeIds());
    const mapped = (rows || []).map(mapPledgeFromDB).filter((pledge) => {
      if (!pledge || !pledge.id || (adminToken && isTestGuest(pledge.giverName))) return false;
      const id = String(pledge.id);
      const bare = id.replace(/^pledge-/, '');
      return !dismissed.has(id) && !dismissed.has(bare) && !dismissed.has('pledge-' + bare);
    });
    if (adminToken) adminData.pledges = mapped;
    else localStorage.setItem(KEYS.PLEDGES, JSON.stringify(mapped));
    window.dispatchEvent(new CustomEvent('pledges_updated', { detail: mapped }));
    return mapped;
  },

  getPledges: () => {
    if (adminToken && Array.isArray(adminData.pledges)) return adminData.pledges;
    try {
      const saved = localStorage.getItem(KEYS.PLEDGES);
      const pledges = saved ? JSON.parse(saved) : INITIAL_PLEDGES;
      if (!Array.isArray(pledges)) return [];
      return isSupabaseConfigured
        ? pledges.map((pledge) => ({ ...pledge, giverName: '' }))
        : pledges;
    } catch {
      return INITIAL_PLEDGES;
    }
  },

  addPledge: async (giftId, giverName, quantity) => {
    const safeGiverName = sanitizeName(giverName || 'Amigo do Chá', 80) || 'Amigo do Chá';
    const safeQuantity = Math.max(1, Math.min(999, parseInt(quantity, 10) || 1));
    if (isSupabaseConfigured && supabase) {
      const result = await invokeAppApi('public-add-pledge', { giftId, giverName: safeGiverName, quantity: safeQuantity });
      await storageService.fetchPledgesFromCloud();
      return mapPledgeFromDB(result.pledge);
    }
    return { id: generateUniqueId('pledge'), giftId, giverName: safeGiverName, quantity: safeQuantity, createdAt: new Date().toISOString() };
  },

  deletePledge: async (pledgeId) => {
    if (isSupabaseConfigured && supabase) await invokeAdminApi('admin-delete-pledge', { id: pledgeId });
    const updated = (adminData.pledges || storageService.getPledges()).filter((pledge) => pledge.id !== pledgeId);
    if (adminToken) adminData.pledges = updated;
    else localStorage.setItem(KEYS.PLEDGES, JSON.stringify(updated));
    const dismissed = storageService.getDismissedPledgeIds();
    const bareId = String(pledgeId).replace(/^pledge-/, '');
    for (const id of [String(pledgeId), bareId, 'pledge-' + bareId]) {
      if (!dismissed.includes(id)) dismissed.push(id);
    }
    localStorage.setItem(KEYS.DISMISSED_PLEDGES, JSON.stringify(dismissed));
    window.dispatchEvent(new CustomEvent('pledges_updated', { detail: updated }));
    return updated;
  },

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
    const dump = { exported_at: new Date().toISOString(), app: 'Chá da Maitê', tables: {} };
    if (isSupabaseConfigured && supabase) {
      if (!adminToken) throw new Error('Entre novamente no painel para exportar os dados.');
      const [gifts, pledges, rsvps, messages] = await Promise.all([
        invokeAdminApi('admin-gifts'),
        invokeAdminApi('admin-pledges'),
        invokeAdminApi('admin-rsvps'),
        invokeAdminApi('admin-messages'),
      ]);
      dump.tables.event_config = [mapConfigToDB(storageService.getConfig())];
      dump.tables.gifts = gifts || [];
      dump.tables.gift_pledges = (pledges || []).filter((p) => !isTestGuest(p.giver_name));
      dump.tables.rsvps = (rsvps || []).filter((r) => !isTestGuest(r.name) && r.phone !== 'mural_only' && !String(r.id || '').startsWith('rsvp-msg-'));
      dump.tables.messages = (messages || []).filter((m) => !isExcludedOrTestMessage(mapMessageFromDB(m)));
    } else {
      dump.tables = {
        event_config: [mapConfigToDB(storageService.getConfig())],
        gifts: storageService.getGifts(),
        gift_pledges: storageService.getPledges(),
        rsvps: storageService.getRSVPs(),
        messages: storageService.getMessages(),
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

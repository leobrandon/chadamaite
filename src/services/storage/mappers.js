import { INITIAL_EVENT_CONFIG } from '../../data/initialGifts.js';
import { formatPhone } from '../../utils/phoneMask.js';

// Helper: map DB column names to camelCase and vice-versa
export function mapConfigFromDB(row) {
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

export function mapConfigToDB(cfg) {
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

export function mapGiftFromDB(row, index = 0) {
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

export function mapGiftToDB(g) {
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
export function isSchemaColumnError(error) {
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

export function stripSchemaExtendedColumns(payload) {
  const { target_quantity, display_order, position, targetQuantity, displayOrder, ...safePayload } = payload;
  return safePayload;
}

export function mapRSVPFromDB(row) {
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

export function mapRSVPToDB(r) {
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

export function mapPledgeFromDB(row) {
  return { id: row.id, giftId: row.gift_id, giverName: row.giver_name, quantity: row.quantity, createdAt: row.created_at };
}
export function mapPledgeToDB(p) {
  return { id: p.id, gift_id: p.giftId, giver_name: p.giverName, quantity: p.quantity };
}

export function mapMessageFromDB(row) {
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

export function mapMessageToDB(m) {
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

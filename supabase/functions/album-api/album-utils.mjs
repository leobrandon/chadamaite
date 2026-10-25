const FILE = '\\d{13}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.jpg';
const PATH = new RegExp(`^(?:drafts|published|trash/(?:drafts|published))/${FILE}$`);
export function validateIds(ids) {
  if (!Array.isArray(ids) || !ids.length || ids.length > 100 || ids.some(id => typeof id !== 'string' || !PATH.test(id))) throw new Error('Seleção de fotos inválida.');
  return [...new Set(ids)];
}
export function transitionPath(id, action, now = Date.now()) {
  validateIds([id]);
  if (action === 'publish' && id.startsWith('drafts/')) return `published/${now}_${id.split('_')[1]}`;
  if (action === 'trash' && !id.startsWith('trash/')) return `trash/${id}`;
  if (action === 'restore' && id.startsWith('trash/')) return id.slice(6);
  if (action === 'delete' && id.startsWith('trash/')) return null;
  throw new Error('Esta ação não é permitida para a foto selecionada.');
}
function rank(value) {
  let hash = 2166136261;
  for (const c of value) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return hash >>> 0;
}
export function pagePhotos(items, order, seed, offset, limit) {
  const ordered = [...items].sort((a,b) => {
    if (order === 'random') return rank(`${seed}:${a.id}`) - rank(`${seed}:${b.id}`) || a.id.localeCompare(b.id);
    return order === 'oldest' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
  });
  return ordered.slice(offset, offset + limit);
}
function decode(value) {
  const normalized = value.replace(/-/g,'+').replace(/_/g,'/');
  return Uint8Array.from(atob(normalized + '='.repeat((4-normalized.length%4)%4)), c => c.charCodeAt(0));
}
export async function verifyAlbumSession(token, pinHash, audience, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 2048 || !/^[0-9a-f]{64}$/i.test(pinHash)) return false;
  try {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return false;
    const key=await crypto.subtle.importKey('raw',Uint8Array.from(pinHash.match(/../g),x=>parseInt(x,16)),{name:'HMAC',hash:'SHA-256'},false,['verify']);
    if (!await crypto.subtle.verify('HMAC',key,decode(signature),new TextEncoder().encode(payload))) return false;
    const data=JSON.parse(new TextDecoder().decode(decode(payload)));
    return data.sub==='admin' && data.aud===audience && Number(data.exp)>now && Number(data.iat)<=now+60000;
  } catch { return false; }
}

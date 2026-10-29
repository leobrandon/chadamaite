import { isTestGuest, isExcludedOrTestMessage } from './filters.js';
import { mapGiftFromDB, mapRSVPFromDB, mapMessageFromDB, mapPledgeFromDB } from './mappers.js';

// Regras únicas de "o que o app mostra" para cada tabela. Usadas tanto na carga
// pública/realtime quanto no login do admin, para os dois caminhos nunca divergirem.

const isDismissed = (dismissed, id, prefix) => {
  const full = String(id);
  const bare = full.startsWith(prefix) ? full.slice(prefix.length) : full;
  return dismissed.has(full) || dismissed.has(bare) || dismissed.has(prefix + bare);
};

export function visibleGifts(rows, dismissed) {
  return (rows || []).map(mapGiftFromDB).filter((gift) => (
    gift && gift.id && !isDismissed(dismissed, gift.id, 'gift-')
  ));
}

export function visibleRsvps(rows, dismissed, overrides = new Map()) {
  return (rows || []).map(mapRSVPFromDB)
    .filter((rsvp) => rsvp && rsvp.id && !isTestGuest(rsvp.name) && !isDismissed(dismissed, rsvp.id, 'rsvp-'))
    .map((rsvp) => {
      const id = String(rsvp.id);
      const bare = id.replace(/^rsvp-/, '');
      return { ...rsvp, ...(overrides.get(id) || overrides.get(bare) || {}) };
    });
}

export function visibleMessages(rows, { dismissed, overrides = new Map(), isAdmin = false }) {
  return (rows || []).map(mapMessageFromDB)
    .filter((message) => {
      if (!message || !message.id || isExcludedOrTestMessage(message)) return false;
      if (!isAdmin && message.status !== 'approved') return false;
      return !isDismissed(dismissed, message.id, 'msg-');
    })
    .map((message) => ({ ...message, ...(overrides.get(message.id) || {}) }));
}

export function visiblePledges(rows, dismissed, { isAdmin = false } = {}) {
  return (rows || []).map(mapPledgeFromDB).filter((pledge) => (
    pledge && pledge.id
      && !(isAdmin && isTestGuest(pledge.giverName))
      && !isDismissed(dismissed, pledge.id, 'pledge-')
  ));
}

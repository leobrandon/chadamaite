// Interpreta as "lápides" gravadas na tabela de recados: exclusões (`[DISMISSED_*:id]`)
// e sobrescritas de RSVP/recado (`[OVERRIDE_RSVP]`, `[OVERRIDE_MSG]`).

const ID_PREFIX = /^(rsvp-msg-|rsvp-|pledge-|msg-|gift-)/;

/**
 * Classifica um id descartado e adiciona suas variações ao conjunto correto.
 * `tag` é opcional (ex.: 'DISMISSED_MSG'); sem ela, só o prefixo do id decide.
 */
export function addDismissedId(ctx, cleanId, tag = '') {
  const bareId = cleanId.replace(ID_PREFIX, '');

  // Mensagens nunca devem descartar confirmação de presença (RSVP)
  const isMsg = tag === 'DISMISSED_MSG' || cleanId.startsWith('msg-') || cleanId.startsWith('rsvp-msg-') || cleanId.includes('msg-');
  const isRsvp = (tag === 'DISMISSED_RSVP' || cleanId.startsWith('rsvp-')) && !isMsg;
  const isPledge = tag === 'DISMISSED_PLEDGE' || cleanId.startsWith('pledge-');
  const isGift = tag === 'DISMISSED_GIFT' || cleanId.startsWith('gift-');

  if (isRsvp) {
    ctx.dismissedRsvps.add(cleanId);
    ctx.dismissedRsvps.add(`rsvp-${bareId}`);
    ctx.dismissedRsvps.add(bareId);
  } else if (isPledge) {
    ctx.dismissedPledges.add(cleanId);
    ctx.dismissedPledges.add(`pledge-${bareId}`);
    ctx.dismissedPledges.add(bareId);
  } else if (isGift) {
    ctx.dismissedGifts.add(cleanId);
    ctx.dismissedGifts.add(`gift-${bareId}`);
    ctx.dismissedGifts.add(bareId);
  } else if (isMsg) {
    ctx.dismissedMessages.add(cleanId);
    ctx.dismissedMessages.add(bareId);
    ctx.dismissedMessages.add(`msg-${bareId}`);
    ctx.dismissedMessages.add(`rsvp-msg-${bareId}`);
    ctx.dismissedMessages.add(`rsvp-${bareId}`);
    if (cleanId.startsWith('msg-')) {
      ctx.dismissedMessages.add(cleanId.replace(/^msg-/, ''));
    } else {
      ctx.dismissedMessages.add(`msg-${cleanId}`);
    }
  }
}

/**
 * Percorre as linhas de recados do admin e preenche `ctx` (conjuntos de ids
 * descartados e mapas de sobrescritas). Modifica `ctx` no lugar.
 */
export function collectTombstones(rows, ctx) {
  rows.forEach((row) => {
    if (!row) return;
    const author = String(row.author || '').trim();
    const text = String(row.text || '').trim();
    const id = String(row.id || '').trim();

    if (author.includes('[EXCLUIDO]') || text.includes('[DISMISSED')) {
      // Extrair IDs das tags no texto
      const matches = text.matchAll(/\[(DISMISSED_[A-Z]+|DISMISSED_ID):([^\]]+)\]/g);
      for (const m of matches) {
        const rawId = m[2].trim();
        if (!rawId) continue;
        // Remove prefixos "dismissed-" encadeados
        addDismissedId(ctx, rawId.replace(/^(dismissed-)+/, ''), m[1]);
      }

      // Extrair IDs a partir do id da lápide
      if (id.startsWith('dismissed-')) {
        addDismissedId(ctx, id.replace(/^(dismissed-)+/, ''));
      }
    }

    if (author.includes('[OVERRIDE_RSVP]')) {
      try {
        const parsed = JSON.parse(text);
        if (parsed && parsed.rsvpId) {
          const existing = ctx.rsvpOverrides.get(parsed.rsvpId) || {};
          ctx.rsvpOverrides.set(parsed.rsvpId, { ...existing, ...parsed.fields });
        }
      } catch {}
    }

    if (author.includes('[OVERRIDE_MSG]')) {
      try {
        const parsed = JSON.parse(text);
        if (parsed && parsed.msgId) {
          const existing = ctx.messageOverrides.get(parsed.msgId) || {};
          ctx.messageOverrides.set(parsed.msgId, { ...existing, ...parsed.fields });
        }
      } catch {}
    }
  });
}

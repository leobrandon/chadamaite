import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { KEYS } from './keys.js';
import { session, invokeAdminApi } from './session.js';
import { collectTombstones } from './tombstoneParser.js';

export function createTombstonesApi(service) {
  const emptyContext = () => ({
    dismissedRsvps: new Set(service.getDismissedRSVPIds()),
    dismissedPledges: new Set(service.getDismissedPledgeIds()),
    dismissedMessages: new Set(service.getDismissedMessageIds()),
    dismissedGifts: new Set(service.getDismissedGiftIds()),
    rsvpOverrides: new Map(),
    messageOverrides: new Map(),
  });

  return {
    // Cache e sincronização centralizada de exclusões/lápides na nuvem
    _tombstonePromise: null,
    _lastTombstoneFetch: 0,
    _cachedTombstones: null,

    fetchCloudTombstones: async (options = {}) => {
      if (!session.token) return emptyContext();

      const { force = false } = options;
      const now = Date.now();

      if (!force && service._cachedTombstones && (now - service._lastTombstoneFetch < 3000)) {
        return service._cachedTombstones;
      }

      if (!force && service._tombstonePromise) {
        return service._tombstonePromise;
      }

      service._tombstonePromise = (async () => {
        const ctx = emptyContext();

        if (!isSupabaseConfigured || !supabase) {
          service._cachedTombstones = ctx;
          service._lastTombstoneFetch = Date.now();
          service._tombstonePromise = null;
          return ctx;
        }

        try {
          const rows = session.token ? await invokeAdminApi('admin-messages') : [];
          if (Array.isArray(rows)) {
            collectTombstones(rows, ctx);

            try {
              localStorage.setItem(KEYS.DISMISSED_RSVPS, JSON.stringify(Array.from(ctx.dismissedRsvps)));
              localStorage.setItem(KEYS.DISMISSED_PLEDGES, JSON.stringify(Array.from(ctx.dismissedPledges)));
              localStorage.setItem(KEYS.DISMISSED_MESSAGES, JSON.stringify(Array.from(ctx.dismissedMessages)));
              localStorage.setItem(KEYS.DISMISSED_GIFTS, JSON.stringify(Array.from(ctx.dismissedGifts)));
            } catch {}
          }
        } catch (err) {
          console.error('Erro ao buscar lápides no Supabase:', err);
        } finally {
          service._tombstonePromise = null;
        }

        service._cachedTombstones = ctx;
        service._lastTombstoneFetch = Date.now();
        return ctx;
      })();

      return service._tombstonePromise;
    },
  };
}

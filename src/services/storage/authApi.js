import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { KEYS } from './keys.js';
import { session, invokeAppApi, invokeAdminApi } from './session.js';
import { isTestGuest, isExcludedOrTestMessage } from './filters.js';
import { mapGiftFromDB, mapRSVPFromDB, mapMessageFromDB, mapPledgeFromDB } from './mappers.js';

export function createAuthApi(service) {
  return {
    invokeAlbumAdmin: async (action, payload = {}) => {
      if (!session.token) throw new Error('Sua sessão expirou. Entre novamente no painel.');
      const { data, error } = await supabase.functions.invoke('album-api', {
        body: { ...payload, action, token: session.token },
      });
      if (error) {
        let message = 'Não foi possível concluir a operação do álbum.';
        try { message = (await error.context.clone().json()).error || message; } catch {}
        throw new Error(message);
      }
      return data;
    },
    loginAdmin: async (pin) => {
      // Somente em `npm run dev` e sem Supabase: PIN local definido em .env.local (VITE_DEV_ADMIN_PIN).
      // Em produção o build elimina este bloco.
      if (import.meta.env.DEV && !isSupabaseConfigured) {
        const devPin = import.meta.env.VITE_DEV_ADMIN_PIN;
        return Boolean(devPin) && String(pin || '').trim() === devPin;
      }
      const result = await invokeAppApi('admin-login', { pin: String(pin || '').trim() });
      session.token = result?.token || null;
      session.data = { gifts: null, rsvps: null, messages: null, pledges: null };
      return Boolean(session.token);
    },

    clearAdminSession: async () => {
      session.token = null;
      session.data = { gifts: null, rsvps: null, messages: null, pledges: null };
      service._cachedTombstones = null;
      service._lastTombstoneFetch = 0;
      service._tombstonePromise = null;
      for (const key of [KEYS.GIFTS, KEYS.RSVPS, KEYS.MESSAGES, KEYS.PLEDGES]) {
        localStorage.removeItem(key);
      }
      window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: [] }));
      await Promise.allSettled([
        service.fetchGiftsFromCloud(),
        service.fetchMessagesFromCloud(),
        service.fetchPledgesFromCloud(),
      ]);
    },

    refreshAdminData: async () => {
      if (import.meta.env.DEV && !isSupabaseConfigured) return;
      if (!session.token) throw new Error('Entre novamente no painel.');
      const [giftRows, rsvpRows, messageRows, pledgeRows] = await Promise.all([
        invokeAdminApi('admin-gifts'),
        invokeAdminApi('admin-rsvps'),
        invokeAdminApi('admin-messages'),
        invokeAdminApi('admin-pledges'),
      ]);
      session.data = {
        gifts: (giftRows || []).map(mapGiftFromDB),
        rsvps: (rsvpRows || []).map(mapRSVPFromDB).filter((r) => r && !isTestGuest(r.name)),
        messages: (messageRows || []).map(mapMessageFromDB).filter((m) => m && !isExcludedOrTestMessage(m)),
        pledges: (pledgeRows || []).map(mapPledgeFromDB).filter((p) => p && !isTestGuest(p.giverName)),
      };
      window.dispatchEvent(new CustomEvent('gifts_updated', { detail: session.data.gifts }));
      window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: session.data.rsvps }));
      window.dispatchEvent(new CustomEvent('messages_updated', { detail: session.data.messages }));
      window.dispatchEvent(new CustomEvent('pledges_updated', { detail: session.data.pledges }));
      return session.data;
    },
  };
}

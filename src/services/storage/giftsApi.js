import { INITIAL_GIFTS } from '../../data/initialGifts.js';
import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { sanitizeName } from '../../utils/security.js';
import { KEYS } from './keys.js';
import { generateUniqueId } from './ids.js';
import { session, invokeAppApi, invokeAdminApi } from './session.js';
import { mapGiftFromDB, mapGiftToDB } from './mappers.js';

export function createGiftsApi(service) {
  return {
    fetchGiftsFromCloud: async () => {
      if (!isSupabaseConfigured || !supabase) return service.getGifts();
      try {
        const tombstones = await service.fetchCloudTombstones();
        let rows = [];
        if (session.token) {
          rows = await invokeAdminApi('admin-gifts');
        } else {
          const { data, error } = await supabase.from('gifts_public').select('*').order('display_order', { ascending: true });
          if (error) throw error;
          rows = data || [];
        }
        const dismissedSet = tombstones?.dismissedGifts || new Set(service.getDismissedGiftIds());
        const mapped = (rows || []).map(mapGiftFromDB).filter((gift) => {
          if (!gift || !gift.id) return false;
          const idStr = String(gift.id);
          const bareId = idStr.replace(/^gift-/, '');
          return !dismissedSet.has(idStr) && !dismissedSet.has(bareId) && !dismissedSet.has('gift-' + bareId);
        });
        if (session.token) session.data.gifts = mapped;
        else localStorage.setItem(KEYS.GIFTS, JSON.stringify(mapped));
        window.dispatchEvent(new CustomEvent('gifts_updated', { detail: mapped }));
        return mapped.length ? mapped : (session.token ? mapped : INITIAL_GIFTS);
      } catch (error) {
        console.error('Erro ao carregar presentes do Supabase:', error);
        if (session.token) throw error;
        return INITIAL_GIFTS;
      }
    },

    getGifts: () => {
      if (session.token && Array.isArray(session.data.gifts)) return session.data.gifts;
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
        return service.fetchGiftsFromCloud();
      }
      const gifts = service.getGifts();
      const nowIso = new Date().toISOString();
      const updated = gifts.map((gift) => gift.id === giftId
        ? { ...gift, status: 'reserved', reservedBy: safeName, reservedAt: nowIso }
        : gift);
      service.saveGifts(updated);
      return updated;
    },

    cancelReservation: async (giftId) => {
      if (isSupabaseConfigured && supabase) {
        await invokeAdminApi('admin-cancel-reservation', { id: giftId });
        return service.fetchGiftsFromCloud();
      }
      const gifts = service.getGifts();
      const updated = gifts.map((gift) => gift.id === giftId
        ? { ...gift, status: 'available', reservedBy: '', reservedAt: null }
        : gift);
      service.saveGifts(updated);
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
        session.data.gifts = [savedGift, ...(session.data.gifts || service.getGifts())];
        window.dispatchEvent(new CustomEvent('gifts_updated', { detail: session.data.gifts }));
        return session.data.gifts;
      }
      const updated = [gift, ...service.getGifts()];
      service.saveGifts(updated);
      return updated;
    },

    updateGift: async (giftId, fields) => {
      if (isSupabaseConfigured && supabase) {
        const row = await invokeAdminApi('admin-update-gift', { id: giftId, fields });
        const savedGift = mapGiftFromDB(row);
        const updated = (session.data.gifts || service.getGifts()).map((gift) => gift.id === giftId ? savedGift : gift);
        session.data.gifts = updated;
        window.dispatchEvent(new CustomEvent('gifts_updated', { detail: updated }));
        return updated;
      }
      const updated = service.getGifts().map((gift) => gift.id === giftId ? { ...gift, ...fields } : gift);
      service.saveGifts(updated);
      return updated;
    },

    deleteGift: async (giftId) => {
      if (isSupabaseConfigured && supabase) await invokeAdminApi('admin-delete-gift', { id: giftId });
      const gifts = (session.data.gifts || service.getGifts()).filter((gift) => gift.id !== giftId);
      if (session.token) session.data.gifts = gifts;
      else localStorage.setItem(KEYS.GIFTS, JSON.stringify(gifts));
      const dismissed = service.getDismissedGiftIds();
      const bareId = String(giftId).replace(/^gift-/, '');
      for (const id of [String(giftId), bareId, 'gift-' + bareId]) {
        if (!dismissed.includes(id)) dismissed.push(id);
      }
      localStorage.setItem(KEYS.DISMISSED_GIFTS, JSON.stringify(dismissed));
      const pledges = (session.data.pledges || service.getPledges()).filter((pledge) => pledge.giftId !== giftId);
      if (session.token) session.data.pledges = pledges;
      else localStorage.setItem(KEYS.PLEDGES, JSON.stringify(pledges));
      window.dispatchEvent(new CustomEvent('gifts_updated', { detail: gifts }));
      window.dispatchEvent(new CustomEvent('pledges_updated', { detail: pledges }));
      return gifts;
    },

    resetGiftsToDefault: async () => {
      if (isSupabaseConfigured && supabase) {
        await invokeAdminApi('admin-reset-gifts', { gifts: INITIAL_GIFTS.map(mapGiftToDB) });
        const rows = await invokeAdminApi('admin-gifts');
        session.data.gifts = (rows || []).map(mapGiftFromDB);
        window.dispatchEvent(new CustomEvent('gifts_updated', { detail: session.data.gifts }));
        return session.data.gifts;
      }
      service.saveGifts(INITIAL_GIFTS);
      return INITIAL_GIFTS;
    },
  };
}

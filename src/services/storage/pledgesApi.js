import { INITIAL_PLEDGES } from '../../data/initialGifts.js';
import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { sanitizeName } from '../../utils/security.js';
import { KEYS } from './keys.js';
import { generateUniqueId } from './ids.js';
import { session, invokeAppApi, invokeAdminApi } from './session.js';
import { mapPledgeFromDB } from './mappers.js';
import { visiblePledges } from './visibility.js';

export function createPledgesApi(service) {
  return {
    fetchPledgesFromCloud: async () => {
      if (!isSupabaseConfigured || !supabase) return service.getPledges();
      let rows = [];
      if (session.token) {
        rows = await invokeAdminApi('admin-pledges');
      } else {
        const { data, error } = await supabase.from('gift_pledge_totals').select('gift_id,pledged_quantity').order('gift_id', { ascending: true });
        if (error) throw new Error('Não foi possível carregar as quantidades de presentes.');
        rows = (data || []).map((row) => ({ id: 'pledge-total-' + row.gift_id, gift_id: row.gift_id, giver_name: '', quantity: row.pledged_quantity }));
      }
      const tombstones = await service.fetchCloudTombstones();
      const dismissed = tombstones?.dismissedPledges || new Set(service.getDismissedPledgeIds());
      const mapped = visiblePledges(rows, dismissed, { isAdmin: Boolean(session.token) });
      if (session.token) session.data.pledges = mapped;
      else localStorage.setItem(KEYS.PLEDGES, JSON.stringify(mapped));
      window.dispatchEvent(new CustomEvent('pledges_updated', { detail: mapped }));
      return mapped;
    },

    getPledges: () => {
      if (session.token && Array.isArray(session.data.pledges)) return session.data.pledges;
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
        await service.fetchPledgesFromCloud();
        return mapPledgeFromDB(result.pledge);
      }
      return { id: generateUniqueId('pledge'), giftId, giverName: safeGiverName, quantity: safeQuantity, createdAt: new Date().toISOString() };
    },

    deletePledge: async (pledgeId) => {
      if (isSupabaseConfigured && supabase) await invokeAdminApi('admin-delete-pledge', { id: pledgeId });
      const updated = (session.data.pledges || service.getPledges()).filter((pledge) => pledge.id !== pledgeId);
      if (session.token) session.data.pledges = updated;
      else localStorage.setItem(KEYS.PLEDGES, JSON.stringify(updated));
      const dismissed = service.getDismissedPledgeIds();
      const bareId = String(pledgeId).replace(/^pledge-/, '');
      for (const id of [String(pledgeId), bareId, 'pledge-' + bareId]) {
        if (!dismissed.includes(id)) dismissed.push(id);
      }
      localStorage.setItem(KEYS.DISMISSED_PLEDGES, JSON.stringify(dismissed));
      window.dispatchEvent(new CustomEvent('pledges_updated', { detail: updated }));
      return updated;
    },
  };
}

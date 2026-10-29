import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { formatPhone } from '../../utils/phoneMask.js';
import { sanitizeText, sanitizeName } from '../../utils/security.js';
import { KEYS } from './keys.js';
import { generateUniqueId } from './ids.js';
import { session, invokeAppApi, invokeAdminApi } from './session.js';
import { mapRSVPFromDB } from './mappers.js';
import { visibleRsvps } from './visibility.js';

export function createRsvpsApi(service) {
  return {
    fetchRSVPsFromCloud: async () => {
      if (!isSupabaseConfigured || !supabase || !session.token) {
        localStorage.removeItem(KEYS.RSVPS);
        window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: [] }));
        return [];
      }
      const [tombstones, rows] = await Promise.all([
        service.fetchCloudTombstones(),
        invokeAdminApi('admin-rsvps'),
      ]);
      const dismissedSet = tombstones?.dismissedRsvps || new Set(service.getDismissedRSVPIds());
      const mapped = visibleRsvps(rows, dismissedSet, tombstones?.rsvpOverrides);
      session.data.rsvps = mapped;
      window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: mapped }));
      return mapped;
    },

    getRSVPs: () => {
      return session.token && Array.isArray(session.data.rsvps) ? session.data.rsvps : [];
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
      const updated = (session.data.rsvps || service.getRSVPs()).filter((rsvp) => rsvp.id !== rsvpId);
      if (session.token) session.data.rsvps = updated;
      localStorage.removeItem(KEYS.RSVPS);
      window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));
      return updated;
    },

    updateRSVP: async (rsvpId, fields) => {
      if (isSupabaseConfigured && supabase) {
        const row = await invokeAdminApi('admin-update-rsvp', { id: rsvpId, fields });
        const saved = mapRSVPFromDB(row);
        const updated = (session.data.rsvps || service.getRSVPs()).map((rsvp) => rsvp.id === rsvpId ? saved : rsvp);
        session.data.rsvps = updated;
        window.dispatchEvent(new CustomEvent('rsvps_updated', { detail: updated }));
        return updated;
      }
      return service.getRSVPs();
    },
  };
}

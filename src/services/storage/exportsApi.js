import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { session, invokeAdminApi } from './session.js';
import { isTestGuest, isExcludedOrTestMessage } from './filters.js';
import { mapConfigToDB, mapMessageFromDB } from './mappers.js';
import { buildRsvpsCsv, buildGiftsCsv, buildAdminLogsCsv } from './csv.js';
import { buildSqlBackup } from './sqlDump.js';

export function createExportsApi(service) {
  return {
    exportRSVPsToCSV: () => {
      const rsvps = service.getRSVPs();
      if (!rsvps.length) return null;
      return buildRsvpsCsv(rsvps);
    },

    exportGiftsToCSV: (customGifts = null, customPledges = null) => {
      const gifts = Array.isArray(customGifts) && customGifts.length > 0
        ? customGifts
        : service.getGifts();
      const pledges = Array.isArray(customPledges)
        ? customPledges
        : service.getPledges();

      if (!gifts.length && !pledges.length) return null;
      return buildGiftsCsv(gifts, pledges);
    },

    exportAdminLogsToCSV: () => {
      const logs = service.getAdminLogs();
      if (!logs.length) return null;
      return buildAdminLogsCsv(logs);
    },

    exportFullDatabaseJSON: async () => {
      const dump = { exported_at: new Date().toISOString(), app: 'Chá da Maitê', tables: {} };
      if (isSupabaseConfigured && supabase) {
        if (!session.token) throw new Error('Entre novamente no painel para exportar os dados.');
        const [gifts, pledges, rsvps, messages] = await Promise.all([
          invokeAdminApi('admin-gifts'),
          invokeAdminApi('admin-pledges'),
          invokeAdminApi('admin-rsvps'),
          invokeAdminApi('admin-messages'),
        ]);
        dump.tables.event_config = [mapConfigToDB(service.getConfig())];
        dump.tables.gifts = gifts || [];
        dump.tables.gift_pledges = (pledges || []).filter((p) => !isTestGuest(p.giver_name));
        dump.tables.rsvps = (rsvps || []).filter((r) => !isTestGuest(r.name) && r.phone !== 'mural_only' && !String(r.id || '').startsWith('rsvp-msg-'));
        dump.tables.messages = (messages || []).filter((m) => !isExcludedOrTestMessage(mapMessageFromDB(m)));
      } else {
        dump.tables = {
          event_config: [mapConfigToDB(service.getConfig())],
          gifts: service.getGifts(),
          gift_pledges: service.getPledges(),
          rsvps: service.getRSVPs(),
          messages: service.getMessages(),
        };
      }
      return JSON.stringify(dump, null, 2);
    },

    exportFullDatabaseSQL: async () => {
      const dump = JSON.parse(await service.exportFullDatabaseJSON());
      return buildSqlBackup(dump);
    },
  };
}

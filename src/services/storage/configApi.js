import { INITIAL_EVENT_CONFIG } from '../../data/initialGifts.js';
import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { KEYS } from './keys.js';
import { invokeAdminApi } from './session.js';
import { mapConfigFromDB } from './mappers.js';

export function createConfigApi(service) {
  return {
    fetchConfigFromCloud: async () => {
      if (!isSupabaseConfigured || !supabase) return service.getConfig();
      const fields = 'id,baby_name,parents,event_date,event_time,display_date,display_time,location_name,address,city,map_url,pix_key,pix_name,welcome_message,updated_at';
      const { data, error } = await supabase
        .from('event_config')
        .select(fields)
        .eq('id', 'default_config')
        .maybeSingle();
      if (error) throw new Error('Não foi possível carregar as informações do evento.');
      if (!data) return service.getConfig();
      const mapped = mapConfigFromDB(data);
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(mapped));
      window.dispatchEvent(new CustomEvent('config_updated', { detail: mapped }));
      return mapped;
    },

    getConfig: () => {
      try {
        const saved = localStorage.getItem(KEYS.CONFIG);
        const config = saved ? JSON.parse(saved) : {};
        delete config.adminPinHash;
        delete config.adminPin;
        return { ...INITIAL_EVENT_CONFIG, ...config };
      } catch {
        return INITIAL_EVENT_CONFIG;
      }
    },

    saveConfig: async (newConfig, newPin = '') => {
      const safeConfig = { ...newConfig };
      delete safeConfig.adminPinHash;
      delete safeConfig.adminPin;
      if (isSupabaseConfigured && supabase) {
        const result = await invokeAdminApi('admin-save-config', { config: safeConfig, newPin: String(newPin || '').trim() });
        const mapped = mapConfigFromDB(result.config);
        localStorage.setItem(KEYS.CONFIG, JSON.stringify(mapped));
        window.dispatchEvent(new CustomEvent('config_updated', { detail: mapped }));
        return mapped;
      }
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(safeConfig));
      window.dispatchEvent(new CustomEvent('config_updated', { detail: safeConfig }));
      return safeConfig;
    },
  };
}

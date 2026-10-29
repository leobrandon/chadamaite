import { supabase, isSupabaseConfigured } from '../supabaseClient.js';

export function createRealtimeApi(service) {
  return {
    // Inicialização e sincronização em tempo real otimizada
    initRealtimeSync: async (onDataUpdate) => {
      if (!isSupabaseConfigured || !supabase) {
        console.log('ℹ️ Operando no modo local (localStorage).');
        return;
      }

      try {
        console.log('⚡ Conectando ao banco em tempo real Supabase...');

        // Carregar lápides na nuvem primeiro para que qualquer exclusão anterior seja honrada imediatamente
        await service.fetchCloudTombstones({ force: true });

        // Carregar dados iniciais da nuvem com resiliência total
        const results = await Promise.allSettled([
          service.fetchConfigFromCloud(),
          service.fetchGiftsFromCloud(),
          service.fetchRSVPsFromCloud(),
          service.fetchMessagesFromCloud(),
          service.fetchPledgesFromCloud(),
        ]);
        const failedResult = results.find((result) => result.status === 'rejected');
        if (failedResult) throw failedResult.reason;
        const [configRes, giftsRes, rsvpsRes, messagesRes, pledgesRes] = results;
        const initialPayload = {};
        if (configRes.status === 'fulfilled' && configRes.value) initialPayload.config = configRes.value;
        if (giftsRes.status === 'fulfilled' && giftsRes.value) initialPayload.gifts = giftsRes.value;
        if (rsvpsRes.status === 'fulfilled' && rsvpsRes.value) initialPayload.rsvps = rsvpsRes.value;
        if (messagesRes.status === 'fulfilled' && messagesRes.value) initialPayload.messages = messagesRes.value;
        if (pledgesRes.status === 'fulfilled' && pledgesRes.value) initialPayload.pledges = pledgesRes.value;

        if (onDataUpdate && Object.keys(initialPayload).length > 0) {
          onDataUpdate(initialPayload);
        }

        // Batching & Debounce state for realtime postgres changes
        const pendingTables = new Set();
        let debounceTimer = null;

        const processBatchedUpdates = async () => {
          const tablesToFetch = Array.from(pendingTables);
          pendingTables.clear();
          debounceTimer = null;

          if (tablesToFetch.length === 0) return;

          // Sempre sincroniza lápides atualizadas antes de recarregar tabelas
          await service.fetchCloudTombstones({ force: true });

          const updatePayload = {};

          await Promise.all(
            tablesToFetch.map(async (table) => {
              try {
                switch (table) {
                  case 'gifts': {
                    updatePayload.gifts = await service.fetchGiftsFromCloud();
                    break;
                  }
                  case 'rsvps': {
                    updatePayload.rsvps = await service.fetchRSVPsFromCloud();
                    updatePayload.messages = await service.fetchMessagesFromCloud();
                    break;
                  }
                  case 'messages': {
                    updatePayload.messages = await service.fetchMessagesFromCloud();
                    updatePayload.rsvps = await service.fetchRSVPsFromCloud();
                    updatePayload.pledges = await service.fetchPledgesFromCloud();
                    updatePayload.gifts = await service.fetchGiftsFromCloud();
                    break;
                  }
                  case 'gift_pledges': {
                    updatePayload.pledges = await service.fetchPledgesFromCloud();
                    break;
                  }
                  case 'event_config': {
                    updatePayload.config = await service.fetchConfigFromCloud();
                    break;
                  }
                  default: {
                    const [cfg, gft, rsv, msg, pld] = await Promise.all([
                      service.fetchConfigFromCloud(),
                      service.fetchGiftsFromCloud(),
                      service.fetchRSVPsFromCloud(),
                      service.fetchMessagesFromCloud(),
                      service.fetchPledgesFromCloud(),
                    ]);
                    updatePayload.config = cfg;
                    updatePayload.gifts = gft;
                    updatePayload.rsvps = rsv;
                    updatePayload.messages = msg;
                    updatePayload.pledges = pld;
                    break;
                  }
                }
              } catch (fetchErr) {
                console.error(`Erro ao sincronizar tabela ${table}:`, fetchErr);
              }
            })
          );

          if (onDataUpdate && Object.keys(updatePayload).length > 0) {
            onDataUpdate(updatePayload);
          }
        };

        // Canal de escuta em tempo real com nome único para evitar conflito com canais já subscritos
        const channelName = `cha_maite_realtime_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const channel = supabase
          .channel(channelName)
          .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
            const tableName = payload?.table || '*';
            console.log(`🔄 Atualização em tempo real recebida para a tabela: ${tableName}`);
            pendingTables.add(tableName);

            if (debounceTimer) {
              clearTimeout(debounceTimer);
            }
            debounceTimer = setTimeout(() => {
              processBatchedUpdates();
            }, 300);
          })
          .subscribe((status, error) => {
            if (error) {
              console.warn('Aviso no canal Realtime Supabase:', error);
            }
          });

        return () => {
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          if (channel) {
            supabase.removeChannel(channel);
          }
        };
      } catch (err) {
        console.error('Erro na sincronização com Supabase:', err);
        throw err;
      }
    },
  };
}

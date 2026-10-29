import { isSupabaseConfigured } from './supabaseClient';
import { createAuthApi } from './storage/authApi.js';
import { createTombstonesApi } from './storage/tombstonesApi.js';
import { createDismissedIdsApi } from './storage/dismissedIds.js';
import { createRealtimeApi } from './storage/realtimeApi.js';
import { createConfigApi } from './storage/configApi.js';
import { createGiftsApi } from './storage/giftsApi.js';
import { createRsvpsApi } from './storage/rsvpsApi.js';
import { createMessagesApi } from './storage/messagesApi.js';
import { createPledgesApi } from './storage/pledgesApi.js';
import { createAdminLogsApi } from './storage/adminLogsApi.js';
import { createExportsApi } from './storage/exportsApi.js';

export { generateUniqueId } from './storage/ids.js';
export { isTestGuest, isExcludedOrTestMessage } from './storage/filters.js';

// Fachada única usada pelo app. Cada área vive em ./storage/*Api.js e recebe
// esta mesma instância para poder chamar as demais (ex.: service.getGifts()).
export const storageService = {
  isCloudConnected: isSupabaseConfigured,
};

Object.assign(
  storageService,
  createAuthApi(storageService),
  createTombstonesApi(storageService),
  createDismissedIdsApi(storageService),
  createRealtimeApi(storageService),
  createConfigApi(storageService),
  createGiftsApi(storageService),
  createRsvpsApi(storageService),
  createMessagesApi(storageService),
  createPledgesApi(storageService),
  createAdminLogsApi(storageService),
  createExportsApi(storageService),
);

export default storageService;

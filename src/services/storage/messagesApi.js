import { INITIAL_MESSAGES } from '../../data/initialGifts.js';
import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { sanitizeText, sanitizeName } from '../../utils/security.js';
import { KEYS } from './keys.js';
import { generateUniqueId } from './ids.js';
import { isExcludedOrTestMessage } from './filters.js';
import { session, invokeAppApi, invokeAdminApi } from './session.js';
import { mapMessageFromDB } from './mappers.js';

export function createMessagesApi(service) {
  return {
    // MENSAGENS / MURAL DE CARINHO
    fetchMessagesFromCloud: async () => {
      if (!isSupabaseConfigured || !supabase) return service.getMessages();
      const [tombstones, result] = await Promise.all([
        service.fetchCloudTombstones({ force: true }),
        session.token
          ? invokeAdminApi('admin-messages')
          : supabase.from('messages').select('id,author,text,date,likes,status,created_at').eq('status', 'approved').order('created_at', { ascending: false }),
      ]);
      if (!session.token && result.error) throw new Error('Não foi possível carregar os recados públicos.');
      const rows = session.token ? result : (result.data || []);
      const dismissed = new Set([
        ...(tombstones?.dismissedMessages || []),
        ...service.getDismissedMessageIds(),
      ]);
      const overrides = tombstones?.messageOverrides || new Map();
      const mapped = (rows || []).map(mapMessageFromDB).filter((message) => {
        if (!message || !message.id || isExcludedOrTestMessage(message)) return false;
        if (!session.token && message.status !== 'approved') return false;
        const id = String(message.id);
        const bare = id.replace(/^msg-/, '');
        return !dismissed.has(id) && !dismissed.has(bare) && !dismissed.has('msg-' + bare);
      }).map((message) => ({ ...message, ...(overrides.get(message.id) || {}) }));
      if (session.token) session.data.messages = mapped;
      else localStorage.setItem(KEYS.MESSAGES, JSON.stringify(mapped));
      window.dispatchEvent(new CustomEvent('messages_updated', { detail: mapped }));
      return mapped;
    },

    getMessages: () => {
      if (session.token && Array.isArray(session.data.messages)) return session.data.messages;
      try {
        const saved = localStorage.getItem(KEYS.MESSAGES);
        const messages = saved ? JSON.parse(saved) : INITIAL_MESSAGES;
        return Array.isArray(messages)
          ? messages.filter((message) => message && message.status === 'approved' && !isExcludedOrTestMessage(message))
          : [];
      } catch {
        return INITIAL_MESSAGES.filter((message) => message.status === 'approved');
      }
    },

    addMessage: async (msgData, autoApprove = false) => {
      const author = sanitizeName(msgData.author || 'Amigo com carinho', 80) || 'Amigo com carinho';
      const text = sanitizeText(msgData.text || '', 500);
      if (!text) throw new Error('Escreva um recado antes de enviar.');
      if (isSupabaseConfigured && supabase) {
        const result = await invokeAppApi('public-submit-message', { message: { author, text } });
        let saved = mapMessageFromDB(result.message);
        if (autoApprove && session.token && saved?.id) {
          saved = mapMessageFromDB(await invokeAdminApi('admin-approve-message', { id: saved.id }));
        }
        if (session.token && saved) {
          session.data.messages = [saved, ...(session.data.messages || []).filter((message) => message.id !== saved.id)];
          window.dispatchEvent(new CustomEvent('messages_updated', { detail: session.data.messages }));
        }
        return saved;
      }
      return { id: generateUniqueId('msg'), author, text, date: new Date().toISOString(), likes: 0, status: 'pending' };
    },

    approveMessage: async (msgId) => {
      const approved = mapMessageFromDB(await invokeAdminApi('admin-approve-message', { id: msgId }));
      const messages = session.data.messages || service.getMessages();
      const updated = [approved, ...messages.filter((message) => message.id !== msgId && message.id !== approved.id)];
      session.data.messages = updated;
      window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
      return updated;
    },

    likeMessage: async (msgId, delta = 1) => {
      if (isSupabaseConfigured && supabase) {
        const result = await invokeAppApi('public-like-message', { messageId: msgId });
        const messages = service.getMessages();
        const updated = messages.map((message) => message.id === msgId ? { ...message, likes: Number(result.likes) || 0 } : message);
        localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
        return updated;
      }
      const messages = service.getMessages();
      const updated = messages.map((message) => message.id === msgId
        ? { ...message, likes: Math.max(0, (Number(message.likes) || 0) + delta) }
        : message);
      localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
      return updated;
    },

    deleteMessage: async (msgId) => {
      if (!msgId) return service.getMessages();
      if (isSupabaseConfigured && supabase) await invokeAdminApi('admin-delete-message', { id: msgId });
      const updated = (session.data.messages || service.getMessages()).filter((message) => message.id !== msgId);
      if (session.token) session.data.messages = updated;
      else localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
      const dismissed = service.getDismissedMessageIds();
      if (!dismissed.includes(msgId)) dismissed.push(msgId);
      localStorage.setItem(KEYS.DISMISSED_MESSAGES, JSON.stringify(dismissed));
      window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
      return updated;
    },

    updateMessage: async (msgId, fields) => {
      if (isSupabaseConfigured && supabase) await invokeAdminApi('admin-update-message', { id: msgId, fields });
      const messages = session.data.messages || service.getMessages();
      const updated = messages.map((message) => message.id === msgId ? { ...message, ...fields } : message);
      if (session.token) session.data.messages = updated;
      else localStorage.setItem(KEYS.MESSAGES, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('messages_updated', { detail: updated }));
      return updated;
    },
  };
}

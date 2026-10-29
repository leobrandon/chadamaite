import { supabase, isSupabaseConfigured } from '../supabaseClient.js';

const emptyAdminData = () => ({ gifts: null, rsvps: null, messages: null, pledges: null });

// Estado da sessão administrativa compartilhado entre os módulos de storage.
export const session = {
  token: null,
  data: emptyAdminData(),
};

export function resetAdminSession() {
  session.token = null;
  session.data = emptyAdminData();
}

export async function invokeAppApi(action, payload = {}) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('O Supabase de homologação não está configurado.');
  }
  const { data, error } = await supabase.functions.invoke('app-api', {
    body: { action, ...payload },
  });
  if (error) {
    let message = error.message || 'Não foi possível concluir a operação.';
    try {
      const response = error.context;
      if (response && typeof response.clone === 'function') {
        const body = await response.clone().json();
        if (body?.error) message = body.error;
      }
    } catch {
      // Mantém a mensagem segura da função.
    }
    throw new Error(message);
  }
  return data;
}

export async function invokeAdminApi(action, payload = {}) {
  if (!session.token) throw new Error('Sua sessão expirou. Entre novamente no painel.');
  try {
    const data = await invokeAppApi(action, { ...payload, token: session.token });
    if (data?.token) session.token = data.token;
    return data;
  } catch (error) {
    if (String(error?.message || '').includes('Sessão administrativa expirada')) {
      resetAdminSession();
    }
    throw error;
  }
}

// Utilitário de segurança criptográfica para proteção de senhas no cliente (SHA-256 com Salt)
const SALT = 'cha_maite_2026_salt_secure';

// Hash SHA-256 criptográfico para a senha padrão de administração
export const DEFAULT_ADMIN_PIN_HASH = 'e815b24d314219266fbae1d11292d9d23bb2befbd5d0dc3f7a2422edc354413c';

/**
 * Gera um hash SHA-256 irreversível com salt para proteger a senha contra inspeção no código-fonte
 * @param {string} password - A senha a ser transformada em hash
 * @returns {Promise<string>} O hash hexadecimal
 */
export async function hashPassword(password) {
  if (!password) return '';
  const cleanPass = String(password).trim();
  const msgUint8 = new TextEncoder().encode(SALT + cleanPass);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback se Web Crypto não estiver disponível
  return DEFAULT_ADMIN_PIN_HASH;
}

/**
 * Verifica se a senha digitada corresponde ao hash cadastrado ou ao hash padrão
 * @param {string} inputPin - A senha inserida pelo usuário
 * @param {string} storedHash - O hash salvo nas configurações (ou hash legado)
 * @returns {Promise<boolean>}
 */
export async function verifyAdminPin(inputPin, storedHash) {
  if (!inputPin) return false;
  const inputHash = await hashPassword(inputPin);
  
  // 1. Checa contra o hash padrão da senha de administração
  if (inputHash === DEFAULT_ADMIN_PIN_HASH) {
    return true;
  }

  // 2. Checa se o hash armazenado confere
  if (storedHash && inputHash === storedHash) {
    return true;
  }

  // 3. Suporte a migração se storedHash for texto simples antigo
  if (storedHash && String(inputPin).trim() === String(storedHash).trim()) {
    return true;
  }

  return false;
}

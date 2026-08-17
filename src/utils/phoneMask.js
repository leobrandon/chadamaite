/**
 * Formata um número de telefone brasileiro no padrão:
 * - 10 dígitos (fixo): (XX) XXXX-XXXX
 * - 11 dígitos (celular/whatsapp): (XX) XXXXX-XXXX
 * 
 * @param {string} value - O valor digitado pelo usuário
 * @returns {string} - O telefone formatado
 */
export function formatPhone(value) {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length === 1) return `(${digits}`;
  if (digits.length === 2) return `(${digits}) `;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Bloqueia a digitação de letras e caracteres não numéricos diretamente no evento onKeyDown.
 * Permite teclas de navegação, exclusão e atalhos de copiar/colar.
 * 
 * @param {React.KeyboardEvent} e - Evento de teclado
 */
export function handlePhoneKeyDown(e) {
  // Permitir teclas especiais de navegação e controle
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ];
  if (allowedKeys.includes(e.key)) return;

  // Permitir atalhos comuns com Ctrl / Cmd (Copiar, Colar, Selecionar tudo, Desfazer)
  if (e.ctrlKey || e.metaKey) return;

  // Bloquear qualquer caractere que não seja número de 0 a 9
  if (!/^\d$/.test(e.key)) {
    e.preventDefault();
  }
}

/**
 * Valida se um número de telefone brasileiro possui a quantidade e formato válidos (10 ou 11 dígitos).
 * 
 * @param {string} value - O telefone formatado ou numérico
 * @returns {boolean} - true se o telefone for válido
 */
export function isValidPhone(value) {
  if (!value) return false;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length !== 10 && digits.length !== 11) return false;
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  return true;
}

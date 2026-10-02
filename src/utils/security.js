/**
 * Sanitiza texto de entrada removendo tags HTML, caracteres de controle e limitando o tamanho.
 */
export function sanitizeText(str, maxLength = 500) {
  if (str === null || str === undefined) return '';
  let clean = String(str)
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();

  if (clean.length > maxLength) clean = clean.slice(0, maxLength).trim();
  return clean;
}

/**
 * Sanitiza nomes próprios e limita o tamanho.
 */
export function sanitizeName(name, maxLength = 80) {
  if (!name) return '';
  let clean = String(name)
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length > maxLength) clean = clean.slice(0, maxLength).trim();
  return clean;
}

import { formatPhone } from '../../utils/phoneMask.js';

// Sanitização contra injeção de fórmulas CSV (OWASP)
export function safeCsv(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  if (!str || str === '-') return '"-"';
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export function formatCsvDate(dateVal) {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
}

export function toCsvDataUri(headers, rows) {
  const csvContent = 'data:text/csv;charset=utf-8,﻿' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
  return encodeURI(csvContent);
}

export function buildRsvpsCsv(rsvps) {
  const headers = ['Data Envio', 'Nome Principal', 'Vai ao Chá?', 'Adultos', 'Crianças', 'Acompanhantes', 'Telefone', 'Recado'];
  const rows = rsvps.map((r) => [
    safeCsv(formatCsvDate(r.createdAt || Date.now())),
    safeCsv(r.name),
    r.attending ? 'SIM' : 'NÃO',
    Number(r.adultsCount) || 1,
    Number(r.childrenCount) || 0,
    safeCsv((r.companionNames || []).join(', ')),
    safeCsv(formatPhone(r.phone || '')),
    safeCsv(r.message || ''),
  ]);
  return toCsvDataUri(headers, rows);
}

export function buildGiftsCsv(gifts, pledges) {
  const headers = [
    'Presente',
    'Categoria',
    'Status / Meta',
    'Quem vai dar (Presenteador)',
    'Quantidade',
    'Data da Reserva',
    'Detalhes/Tamanho',
  ];

  const rows = [];
  const sortedGifts = [...gifts].sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

  sortedGifts.forEach((gift) => {
    const giftPledges = (pledges || []).filter((p) => p && (p.giftId === gift.id || p.gift_id === gift.id));
    const targetQty = Number(gift.targetQuantity) || 5;
    const totalUnits = giftPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
    const isCompleted = totalUnits >= targetQty;
    const progressPercent = Math.min(100, Math.round((totalUnits / targetQty) * 100));

    if (giftPledges.length > 0) {
      // Se houver contribuições registradas por convidados, listar cada uma
      giftPledges.forEach((p) => {
        rows.push([
          safeCsv(gift.title),
          safeCsv(gift.category),
          safeCsv(isCompleted ? 'META ATINGIDA' : `${totalUnits}/${targetQty} un. (${progressPercent}%)`),
          safeCsv(p.giverName || p.giver_name || 'Convidado'),
          safeCsv(`${Number(p.quantity) || 1} un.`),
          safeCsv(formatCsvDate(p.createdAt || p.created_at)),
          safeCsv(gift.description || ''),
        ]);
      });
    } else if (gift.reservedBy || gift.status === 'reserved') {
      // Suporte a reservas diretas legadas
      rows.push([
        safeCsv(gift.title),
        safeCsv(gift.category),
        safeCsv('RESERVADO'),
        safeCsv(gift.reservedBy || 'Convidado'),
        safeCsv('1 un.'),
        safeCsv(formatCsvDate(gift.reservedAt)),
        safeCsv(gift.description || ''),
      ]);
    } else {
      // Presente disponível sem contribuições ainda
      rows.push([
        safeCsv(gift.title),
        safeCsv(gift.category),
        safeCsv('DISPONÍVEL'),
        safeCsv('-'),
        safeCsv('-'),
        safeCsv('-'),
        safeCsv(gift.description || ''),
      ]);
    }
  });

  // Incluir contribuições que possam referenciar presentes excluídos ou renomeados
  const knownGiftIds = new Set(sortedGifts.map((g) => g.id));
  const orphanedPledges = (pledges || []).filter((p) => p && !knownGiftIds.has(p.giftId || p.gift_id));
  orphanedPledges.forEach((p) => {
    rows.push([
      safeCsv(`Item #${p.giftId || p.gift_id}`),
      safeCsv('Outros'),
      safeCsv('CONTRIBUIÇÃO'),
      safeCsv(p.giverName || p.giver_name || 'Convidado'),
      safeCsv(`${Number(p.quantity) || 1} un.`),
      safeCsv(formatCsvDate(p.createdAt || p.created_at)),
      safeCsv('-'),
    ]);
  });

  return toCsvDataUri(headers, rows);
}

export function buildAdminLogsCsv(logs) {
  const headers = ['Data', 'Horário', 'Categoria', 'Ação Realizada', 'Detalhes da Alteração', 'Responsável'];
  const rows = logs.map((log) => [
    safeCsv(log.formattedDate || new Date(log.timestamp).toLocaleDateString('pt-BR')),
    safeCsv(log.formattedTime || new Date(log.timestamp).toLocaleTimeString('pt-BR')),
    safeCsv(log.category ? log.category.toUpperCase() : 'SISTEMA'),
    safeCsv(log.action || ''),
    safeCsv(log.details || ''),
    safeCsv(log.author || 'Administrador'),
  ]);
  return toCsvDataUri(headers, rows);
}

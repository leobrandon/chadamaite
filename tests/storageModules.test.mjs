import test from 'node:test';
import assert from 'node:assert/strict';

import { isTestGuest, isExcludedOrTestMessage } from '../src/services/storage/filters.js';
import { mapGiftFromDB, mapGiftToDB, mapMessageFromDB, mapPledgeToDB } from '../src/services/storage/mappers.js';
import { safeCsv, buildRsvpsCsv, buildGiftsCsv, buildAdminLogsCsv } from '../src/services/storage/csv.js';
import { addDismissedId, collectTombstones } from '../src/services/storage/tombstoneParser.js';
import { escapeSql, buildSqlBackup } from '../src/services/storage/sqlDump.js';
import { generateUniqueId } from '../src/services/storage/ids.js';

const newContext = () => ({
  dismissedRsvps: new Set(),
  dismissedPledges: new Set(),
  dismissedMessages: new Set(),
  dismissedGifts: new Set(),
  rsvpOverrides: new Map(),
  messageOverrides: new Map(),
});

const decodeCsv = (uri) => decodeURI(uri.replace('data:text/csv;charset=utf-8,', ''));

test('generateUniqueId usa o prefixo informado', () => {
  assert.match(generateUniqueId('gift'), /^gift-[0-9a-f-]{36}$/);
  assert.notEqual(generateUniqueId('x'), generateUniqueId('x'));
});

test('isTestGuest reconhece cadastros de teste e ignora convidados reais', () => {
  assert.equal(isTestGuest('Teste'), true);
  assert.equal(isTestGuest('  teste convidado '), true);
  assert.equal(isTestGuest('Teste-123'), true);
  assert.equal(isTestGuest('Maria Souza'), false);
  assert.equal(isTestGuest(''), false);
  assert.equal(isTestGuest(null), false);
});

test('isExcludedOrTestMessage filtra testes, marcadores de exclusão e ids legados', () => {
  assert.equal(isExcludedOrTestMessage(null), true);
  assert.equal(isExcludedOrTestMessage({ id: '1', author: 'Teste', text: 'oi' }), true);
  assert.equal(isExcludedOrTestMessage({ id: '1', author: 'Ana [EXCLUIDO]', text: 'oi' }), true);
  assert.equal(isExcludedOrTestMessage({ id: '1', author: 'Ana', text: 'x [deleted]' }), true);
  assert.equal(isExcludedOrTestMessage({ id: 'msg-probe-appr', author: 'Ana', text: 'oi' }), true);
  assert.equal(isExcludedOrTestMessage({ id: 'abc', author: 'Ana', text: 'Parabéns!' }), false);
});

test('mapGiftToDB/mapGiftFromDB preservam meta e ordem na descrição', () => {
  const db = mapGiftToDB({ id: 'g1', title: 'Fralda', category: 'Higiene', description: 'Tam P', targetQuantity: 3, displayOrder: 7 });
  assert.equal(db.description, 'Tam P [meta:3] [order:7]');
  assert.equal(db.target_quantity, 3);

  const legacy = mapGiftFromDB({ id: 'g1', title: 'Fralda', category: 'Higiene', description: 'Tam P [meta:3] [order:7]' });
  assert.equal(legacy.description, 'Tam P');
  assert.equal(legacy.targetQuantity, 3);
  assert.equal(legacy.displayOrder, 7);

  const native = mapGiftFromDB({ id: 'g2', title: 'Body', description: '[meta:9]', target_quantity: 2, display_order: 4 });
  assert.equal(native.targetQuantity, 2);
  assert.equal(native.displayOrder, 4);
});

test('mappers de recado e contribuição aplicam valores padrão', () => {
  assert.equal(mapMessageFromDB(null), null);
  const msg = mapMessageFromDB({ id: 'm', author: 'Ana', text: 'oi', likes: '3' });
  assert.equal(msg.likes, 3);
  assert.equal(msg.status, 'approved');
  assert.deepEqual(mapPledgeToDB({ id: 'p', giftId: 'g', giverName: 'Ana', quantity: 2 }), {
    id: 'p', gift_id: 'g', giver_name: 'Ana', quantity: 2,
  });
});

test('safeCsv neutraliza fórmulas e escapa aspas', () => {
  assert.equal(safeCsv('=SOMA(A1)'), `"'=SOMA(A1)"`);
  assert.equal(safeCsv('+55 62'), `"'+55 62"`);
  assert.equal(safeCsv('ele disse "oi"'), '"ele disse ""oi"""');
  assert.equal(safeCsv(null), '""');
  assert.equal(safeCsv('  '), '"-"');
});

test('buildRsvpsCsv gera cabeçalho com BOM e uma linha por confirmação', () => {
  const csv = decodeCsv(buildRsvpsCsv([
    { name: 'Ana', attending: true, adultsCount: 2, childrenCount: 1, companionNames: ['Bia'], phone: '62999998888', message: 'Até lá', createdAt: '2026-10-01T12:00:00Z' },
    { name: 'Caio', attending: false },
  ]));
  assert.ok(csv.startsWith('﻿Data Envio;Nome Principal;Vai ao Chá?'));
  const lines = csv.split('\n');
  assert.equal(lines.length, 3);
  assert.match(lines[1], /SIM;2;1;/);
  assert.match(lines[2], /NÃO/);
});

test('buildGiftsCsv lista contribuições, reservas legadas, disponíveis e órfãs', () => {
  const gifts = [
    { id: 'g1', title: 'Fralda', category: 'Higiene', targetQuantity: 2, displayOrder: 1 },
    { id: 'g2', title: 'Berço', category: 'Quarto', status: 'reserved', reservedBy: 'Tio Zé', displayOrder: 2 },
    { id: 'g3', title: 'Body', category: 'Roupas', displayOrder: 3 },
  ];
  const pledges = [
    { giftId: 'g1', giverName: 'Ana', quantity: 2 },
    { giftId: 'zzz', giverName: 'Bia', quantity: 1 },
  ];
  const rows = decodeCsv(buildGiftsCsv(gifts, pledges)).split('\n').slice(1);
  assert.equal(rows.length, 4);
  assert.match(rows[0], /META ATINGIDA/);
  assert.match(rows[1], /RESERVADO/);
  assert.match(rows[2], /DISPONÍVEL/);
  assert.match(rows[3], /CONTRIBUIÇÃO/);
});

test('buildAdminLogsCsv usa SISTEMA quando não há categoria', () => {
  const rows = decodeCsv(buildAdminLogsCsv([
    { timestamp: '2026-10-01T12:00:00Z', formattedDate: '01/10/2026', formattedTime: '09:00:00', action: 'Editou', details: 'x' },
  ])).split('\n');
  assert.match(rows[1], /"SISTEMA";"Editou"/);
});

test('addDismissedId classifica o id pelo prefixo e pela tag', () => {
  const ctx = newContext();
  addDismissedId(ctx, 'rsvp-abc');
  addDismissedId(ctx, 'pledge-1');
  addDismissedId(ctx, 'gift-7');
  addDismissedId(ctx, 'rsvp-msg-9');
  assert.deepEqual([...ctx.dismissedRsvps].sort(), ['abc', 'rsvp-abc']);
  assert.deepEqual([...ctx.dismissedPledges].sort(), ['1', 'pledge-1']);
  assert.deepEqual([...ctx.dismissedGifts].sort(), ['7', 'gift-7']);
  assert.ok(ctx.dismissedMessages.has('rsvp-msg-9'));
  assert.ok(ctx.dismissedMessages.has('msg-9'));

  const byTag = newContext();
  addDismissedId(byTag, 'xyz', 'DISMISSED_GIFT');
  assert.ok(byTag.dismissedGifts.has('gift-xyz'));
  addDismissedId(byTag, 'xyz2', 'DISMISSED_MSG');
  assert.ok(byTag.dismissedMessages.has('msg-xyz2'));
});

test('collectTombstones lê tags de exclusão, ids de lápide e sobrescritas', () => {
  const ctx = newContext();
  collectTombstones([
    null,
    { id: 'dismissed-1', author: '[EXCLUIDO]', text: '[DISMISSED_RSVP:dismissed-rsvp-42] [DISMISSED_PLEDGE:pledge-5]' },
    { id: 'dismissed-gift-8', author: '[EXCLUIDO]', text: '' },
    { id: 'o1', author: '[OVERRIDE_RSVP]', text: JSON.stringify({ rsvpId: 'r1', fields: { name: 'Novo' } }) },
    { id: 'o2', author: '[OVERRIDE_RSVP]', text: JSON.stringify({ rsvpId: 'r1', fields: { phone: '1' } }) },
    { id: 'o3', author: '[OVERRIDE_MSG]', text: JSON.stringify({ msgId: 'm1', fields: { text: 'ok' } }) },
    { id: 'o4', author: '[OVERRIDE_MSG]', text: 'json inválido' },
    { id: 'm9', author: 'Ana', text: 'recado normal' },
  ], ctx);

  assert.ok(ctx.dismissedRsvps.has('rsvp-42'));
  assert.ok(ctx.dismissedPledges.has('pledge-5'));
  assert.ok(ctx.dismissedGifts.has('gift-8'));
  assert.deepEqual(ctx.rsvpOverrides.get('r1'), { name: 'Novo', phone: '1' });
  assert.deepEqual(ctx.messageOverrides.get('m1'), { text: 'ok' });
  assert.equal(ctx.dismissedMessages.size, 0);
});

test('escapeSql trata nulos, textos com aspas, arrays e objetos', () => {
  assert.equal(escapeSql(null), 'NULL');
  assert.equal(escapeSql(true), 'true');
  assert.equal(escapeSql(5), 5);
  assert.equal(escapeSql("d'Água"), "'d''Água'");
  assert.equal(escapeSql([]), "'{}'::text[]");
  assert.equal(escapeSql(['Ana', 'Bia']), `'{"Ana","Bia"}'::text[]`);
  assert.equal(escapeSql({ a: 1 }), `'{"a":1}'::jsonb`);
});

test('buildSqlBackup gera upsert por tabela', () => {
  const sql = buildSqlBackup({
    exported_at: '2026-10-29T00:00:00Z',
    tables: { gifts: [{ id: 'g1', title: 'Fralda' }], messages: [] },
  });
  assert.match(sql, /-- Tabela: gifts \(1 registros\)/);
  assert.match(sql, /INSERT INTO public\.gifts \(id, title\)\nVALUES \('g1', 'Fralda'\)\nON CONFLICT \(id\) DO UPDATE SET title = EXCLUDED\.title;/);
  assert.match(sql, /-- Tabela: messages \(0 registros\)/);
});

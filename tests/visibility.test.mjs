import test from 'node:test';
import assert from 'node:assert/strict';

import { visibleGifts, visibleRsvps, visibleMessages, visiblePledges } from '../src/services/storage/visibility.js';

test('visibleMessages: público só vê aprovados; admin vê pendentes', () => {
  const rows = [
    { id: 'm1', author: 'Ana', text: 'oi', status: 'approved' },
    { id: 'm2', author: 'Bia', text: 'oi', status: 'pending' },
  ];
  const dismissed = new Set();
  assert.deepEqual(visibleMessages(rows, { dismissed }).map((m) => m.id), ['m1']);
  assert.deepEqual(visibleMessages(rows, { dismissed, isAdmin: true }).map((m) => m.id), ['m1', 'm2']);
});

test('visibleMessages: ids descartados saem em qualquer variação de prefixo (o "recado fantasma")', () => {
  const rows = [
    { id: 'msg-abc', author: 'Ana', text: 'oi', status: 'pending' },
    { id: 'xyz', author: 'Bia', text: 'oi', status: 'pending' },
    { id: 'keep', author: 'Caio', text: 'oi', status: 'pending' },
  ];
  const dismissed = new Set(['abc', 'msg-xyz']);
  const ids = visibleMessages(rows, { dismissed, isAdmin: true }).map((m) => m.id);
  assert.deepEqual(ids, ['keep']);
});

test('visibleMessages: sobrescritas e testes', () => {
  const rows = [
    { id: 'm1', author: 'Ana', text: 'antigo', status: 'approved' },
    { id: 'm2', author: 'Teste', text: 'x', status: 'approved' },
  ];
  const out = visibleMessages(rows, { dismissed: new Set(), overrides: new Map([['m1', { text: 'novo' }]]) });
  assert.equal(out.length, 1);
  assert.equal(out[0].text, 'novo');
});

test('visibleRsvps: remove testes e descartados e aplica sobrescritas', () => {
  const rows = [
    { id: 'rsvp-1', name: 'Ana', attending: true },
    { id: '2', name: 'Teste Convidado', attending: true },
    { id: 'rsvp-3', name: 'Caio', attending: true },
  ];
  const out = visibleRsvps(rows, new Set(['3']), new Map([['rsvp-1', { name: 'Ana Maria' }]]));
  assert.deepEqual(out.map((r) => r.name), ['Ana Maria']);
});

test('visibleGifts e visiblePledges respeitam descartados', () => {
  const gifts = visibleGifts([{ id: 'gift-1', title: 'A' }, { id: 'g2', title: 'B' }], new Set(['1']));
  assert.deepEqual(gifts.map((g) => g.title), ['B']);

  const pledges = [
    { id: 'pledge-1', gift_id: 'g', giver_name: 'Ana', quantity: 1 },
    { id: 'p2', gift_id: 'g', giver_name: 'Teste', quantity: 1 },
  ];
  assert.equal(visiblePledges(pledges, new Set()).length, 2);
  assert.deepEqual(visiblePledges(pledges, new Set(), { isAdmin: true }).map((p) => p.id), ['pledge-1']);
  assert.equal(visiblePledges(pledges, new Set(['p2'])).length, 1);
});

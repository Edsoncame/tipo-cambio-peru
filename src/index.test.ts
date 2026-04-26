/**
 * Tests para tipo-cambio-peru
 * Corre con: npx tsx --test src/index.test.ts
 *
 * Algunos tests requieren red (BCRP API). Si no tienes red, fallarán.
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { calcStats, convert, getBCRPRange, getTCToday, VERSION } from './index.ts';

test('VERSION exists', () => {
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);
});

test('calcStats handles empty array', () => {
  assert.equal(calcStats([]), null);
});

test('calcStats computes mean correctly', () => {
  const rows = [
    { date: '2026-01-01', buy: 3.50, sell: 3.55 },
    { date: '2026-01-02', buy: 3.52, sell: 3.57 },
  ];
  const stats = calcStats(rows);
  assert.ok(stats);
  assert.equal(stats!.days, 2);
  assert.equal(stats!.min, 3.50);
  assert.equal(stats!.max, 3.57);
  assert.equal(stats!.avg, 3.535);
});

test('convert PEN→USD divides by sell rate', () => {
  const r = convert(1000, 'PEN', 'USD', { buy: 3.50, sell: 3.55 });
  assert.equal(r, +(1000 / 3.55).toFixed(2));
});

test('convert USD→PEN multiplies by buy rate', () => {
  const r = convert(100, 'USD', 'PEN', { buy: 3.50, sell: 3.55 });
  assert.equal(r, +(100 * 3.50).toFixed(2));
});

test('convert same currency returns same amount', () => {
  assert.equal(convert(123, 'USD', 'USD', { buy: 3.50, sell: 3.55 }), 123);
});

test('getTCToday returns a row or null (network)', async () => {
  const r = await getTCToday();
  if (r) {
    assert.ok(r.buy > 3 && r.buy < 5, `buy ${r.buy} debe estar en rango razonable`);
    assert.ok(r.sell > r.buy, 'sell debe ser > buy');
  }
});

test('getBCRPRange returns sorted dates (network)', async () => {
  const today = new Date();
  const past = new Date(today);
  past.setDate(past.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const range = await getBCRPRange(fmt(past), fmt(today));
  assert.ok(range.length > 0, 'debe haber al menos 1 día');
  for (let i = 1; i < range.length; i++) {
    assert.ok(range[i].date >= range[i - 1].date, 'fechas deben estar ordenadas');
  }
});

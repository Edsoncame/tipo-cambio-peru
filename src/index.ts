/**
 * tipo-cambio-peru
 * Tipo de cambio oficial del Perú: BCRP, SBS y SUNAT
 *
 * Mantenido por Securex (https://securex.pe) — casa de cambio digital regulada por SBS.
 */

const BCRP_BASE = 'https://estadisticas.bcrp.gob.pe/estadisticas/series/api';
const SBS_BASE = 'https://www.sbs.gob.pe';

export type ISODate = string; // YYYY-MM-DD

export interface RateRow {
  date: ISODate;
  buy: number;
  sell: number;
}

export interface BCRPSeriesPoint {
  date: ISODate;
  value: number;
}

const BCRP_SERIES = {
  buy: 'PD04637PD',  // Tipo de cambio interbancario - compra
  sell: 'PD04638PD', // Tipo de cambio interbancario - venta
  bancario_compra: 'PD04640PD', // Tipo de cambio bancario - compra
  bancario_venta: 'PD04641PD',  // Tipo de cambio bancario - venta
} as const;

export type BCRPSeriesName = keyof typeof BCRP_SERIES;

interface BCRPApiResponse {
  config: { title: string; series: { name: string; dec: string }[] };
  periods: { name: string; values: string[] }[];
}

const SPANISH_MONTHS: Record<string, string> = {
  Ene: '01', Feb: '02', Mar: '03', Abr: '04', May: '05', Jun: '06',
  Jul: '07', Ago: '08', Set: '09', Sep: '09', Oct: '10', Nov: '11', Dic: '12',
};

function parseBCRPDate(name: string): ISODate {
  // BCRP devuelve formato "27.Mar.26" para fechas diarias
  const m = name.match(/^(\d{1,2})\.(\w{3})\.(\d{2,4})$/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = SPANISH_MONTHS[m[2]] ?? '01';
    const yearShort = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${yearShort}-${month}-${day}`;
  }
  return name;
}

/**
 * Obtiene una serie histórica de TC del BCRP entre dos fechas.
 *
 * @example
 * const buy = await getBCRPSeries('buy', '2026-04-01', '2026-04-26');
 * console.log(buy.length, 'días');
 */
export async function getBCRPSeries(
  series: BCRPSeriesName,
  startDate: ISODate,
  endDate: ISODate,
): Promise<BCRPSeriesPoint[]> {
  const code = BCRP_SERIES[series];
  if (!code) throw new Error(`Serie BCRP desconocida: ${series}`);
  const url = `${BCRP_BASE}/${code}/json/${startDate}/${endDate}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`BCRP API ${code}: HTTP ${res.status}`);
  const text = await res.text();
  // BCRP API agrega HTML basura después del JSON. Cortar en primer '<'.
  const htmlStart = text.indexOf('<');
  const jsonOnly = htmlStart > 0 ? text.slice(0, htmlStart).trim() : text.trim();
  const data = JSON.parse(jsonOnly) as BCRPApiResponse;
  return data.periods
    .map((p) => ({ date: parseBCRPDate(p.name), value: parseFloat(p.values[0]) }))
    .filter((r) => !isNaN(r.value));
}

/**
 * Obtiene el tipo de cambio interbancario del BCRP (compra y venta) en un rango.
 */
export async function getBCRPRange(
  startDate: ISODate,
  endDate: ISODate,
): Promise<RateRow[]> {
  const [buyData, sellData] = await Promise.all([
    getBCRPSeries('buy', startDate, endDate),
    getBCRPSeries('sell', startDate, endDate),
  ]);
  const buyByDate = new Map(buyData.map((p) => [p.date, p.value]));
  const sellByDate = new Map(sellData.map((p) => [p.date, p.value]));
  const allDates = new Set([...buyByDate.keys(), ...sellByDate.keys()]);
  return Array.from(allDates)
    .sort()
    .map((date) => ({
      date,
      buy: buyByDate.get(date) ?? 0,
      sell: sellByDate.get(date) ?? 0,
    }))
    .filter((r) => r.buy > 0 && r.sell > 0);
}

/**
 * Obtiene el TC de hoy (BCRP). Si hoy no hay dato (fin de semana / feriado),
 * devuelve el último día hábil disponible.
 */
export async function getTCToday(): Promise<RateRow | null> {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 7); // ventana de 7 días para garantizar al menos 1 hit
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const range = await getBCRPRange(fmt(start), fmt(today));
  return range.length > 0 ? range[range.length - 1] : null;
}

/**
 * Calcula stats básicos sobre una serie temporal.
 */
export function calcStats(rows: RateRow[]) {
  if (rows.length === 0) return null;
  const values = rows.flatMap((r) => [r.buy, r.sell]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  const volatilityPct = (std / avg) * 100;
  return {
    days: rows.length,
    min: +min.toFixed(4),
    max: +max.toFixed(4),
    avg: +avg.toFixed(4),
    std: +std.toFixed(4),
    volatilityPct: +volatilityPct.toFixed(2),
  };
}

/**
 * Convierte un monto entre PEN y USD usando un tipo de cambio dado.
 */
export function convert(
  amount: number,
  from: 'PEN' | 'USD',
  to: 'PEN' | 'USD',
  rate: { buy: number; sell: number },
): number {
  if (from === to) return amount;
  if (from === 'USD' && to === 'PEN') return +(amount * rate.buy).toFixed(2);
  if (from === 'PEN' && to === 'USD') return +(amount / rate.sell).toFixed(2);
  throw new Error(`Conversión no soportada: ${from} → ${to}`);
}

export const VERSION = '0.1.0';

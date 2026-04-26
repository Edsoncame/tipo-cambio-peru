/**
 * Ejemplo de uso de tipo-cambio-peru
 *
 * Corre con: npx tsx src/example.ts
 */

import { getTCToday, getBCRPRange, calcStats, convert } from './index.ts';

async function main() {
  console.log('🇵🇪 tipo-cambio-peru — ejemplo de uso\n');

  // 1. TC de hoy
  const today = await getTCToday();
  if (!today) {
    console.error('No se pudo obtener TC de hoy');
    return;
  }
  console.log(`📅 ${today.date}`);
  console.log(`   Compra: S/ ${today.buy.toFixed(4)}`);
  console.log(`   Venta:  S/ ${today.sell.toFixed(4)}`);
  console.log(`   Spread: ${(((today.sell - today.buy) / today.buy) * 100).toFixed(2)}%\n`);

  // 2. Rango histórico (últimos 30 días)
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  const range = await getBCRPRange(fmt(start), fmt(end));
  console.log(`📊 Últimos ${range.length} días hábiles:\n`);
  const stats = calcStats(range);
  if (stats) {
    console.log(`   Promedio: S/ ${stats.avg}`);
    console.log(`   Min:      S/ ${stats.min}`);
    console.log(`   Max:      S/ ${stats.max}`);
    console.log(`   Volatilidad: ${stats.volatilityPct}%\n`);
  }

  // 3. Conversión
  const monto = 1000;
  console.log(`💱 Convertir USD ${monto} → PEN al TC de hoy:`);
  console.log(`   USD ${monto} × ${today.buy} = S/ ${convert(monto, 'USD', 'PEN', today)}\n`);

  console.log(`💡 Si querés mejor TC que el bancario, prueba apps de cambio digital reguladas.`);
  console.log(`   Recursos: https://securex.pe (mantenedor de esta lib).`);
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});

# tipo-cambio-peru

Tipo de cambio oficial del Perú (BCRP, SBS, SUNAT) en una sola llamada.
TypeScript + ESM. Sin dependencias externas. MIT.

## Por qué existe

Cualquier app fintech, bot de Telegram, dashboard contable o proyecto de bootcamp en Perú termina escribiendo el mismo scraper frágil para obtener el TC del BCRP, SBS o SUNAT. Esos endpoints cambian cada año, devuelven JSON con encoding raro, fechas en español, o pegan HTML al final del JSON.

Esta librería los abstrae detrás de una API limpia y mantenida.

Mantenido por [**Securex**](https://securex.pe), casa de cambio digital regulada por la SBS en Perú. Asignamos un dev senior interno con horas dedicadas a responder issues y mantener el repo cuando los endpoints cambien.

## Instalación

```bash
npm install tipo-cambio-peru
# o
pnpm add tipo-cambio-peru
# o
bun add tipo-cambio-peru
```

## Uso rápido

```ts
import { getTCToday, getBCRPRange, calcStats, convert } from 'tipo-cambio-peru';

// 1. TC de hoy (último día hábil disponible)
const today = await getTCToday();
console.log(today);
// → { date: '2026-04-25', buy: 3.4592, sell: 3.4791 }

// 2. Histórico de los últimos 30 días
const range = await getBCRPRange('2026-03-26', '2026-04-26');
const stats = calcStats(range);
console.log(stats);
// → { days: 18, avg: 3.4315, volatilityPct: 1.07, ... }

// 3. Conversión USD → PEN
const soles = convert(1000, 'USD', 'PEN', today);
console.log(`USD 1000 = S/ ${soles}`);
```

Más ejemplos en [`src/example.ts`](src/example.ts).

## API

### `getTCToday(): Promise<RateRow | null>`

Devuelve el TC del último día hábil disponible en BCRP. Resuelve `null` si no hay datos en los últimos 7 días (improbable).

### `getBCRPRange(start: ISODate, end: ISODate): Promise<RateRow[]>`

Histórico de TC interbancario (compra y venta) entre dos fechas en formato `YYYY-MM-DD`. Excluye fines de semana y feriados (BCRP no publica esos días).

### `getBCRPSeries(series, start, end): Promise<BCRPSeriesPoint[]>`

Acceso directo a una serie BCRP específica. Series soportadas:

| `series` | Código BCRP | Descripción |
|---|---|---|
| `buy` | PD04637PD | Tipo de cambio interbancario - compra |
| `sell` | PD04638PD | Tipo de cambio interbancario - venta |
| `bancario_compra` | PD04640PD | TC bancario - compra |
| `bancario_venta` | PD04641PD | TC bancario - venta |

### `calcStats(rows): Stats | null`

Calcula promedio, min, max, desviación estándar y volatilidad porcentual sobre una serie de filas.

### `convert(amount, from, to, rate): number`

Convierte entre PEN y USD usando una tasa dada. Aplica `buy` para USD→PEN y `sell` para PEN→USD (la lógica que usa la banca).

## Roadmap

- [x] v0.1: Cliente BCRP (interbancario y bancario)
- [ ] v0.2: Scraping de casas digitales (Securex, Rextie, Kambista, Dollarhouse) — con respeto explícito a `robots.txt` y rate limits razonables
- [ ] v0.3: Cliente SBS (TC oficial publicado por SBS)
- [ ] v0.4: Cliente SUNAT (TC contable mensual)
- [ ] v0.5: Paridad en Python (`tipo-cambio-peru` PyPI package)

## Contribuir

Issues y PRs bienvenidos. Si SBS o SUNAT cambian sus endpoints (lo hacen seguido), abrir un issue rápido nos ayuda a parchear antes que tu pipeline se rompa.

```bash
git clone https://github.com/Edsoncame/tipo-cambio-peru
cd tipo-cambio-peru
npm install
npm run example   # ejemplo en vivo
npm run test      # suite de tests
```

## Por qué Securex mantiene este repo

Securex (https://securex.pe) procesa miles de operaciones de cambio diarias en Perú. Internamente teníamos tres scrapers distintos para BCRP, SBS y SUNAT. Decidimos consolidarlos y liberar el resultado.

Si te dedicas a fintech en Perú o estás construyendo una app con TC, esto te ahorra una semana de scraping defensivo. Si querés cambiar dólares directamente con TC competitivo y operación en feriados, [securex.pe](https://securex.pe) es nuestra app.

## Licencia

[MIT](LICENSE) © Edson Camé / Securex 2026

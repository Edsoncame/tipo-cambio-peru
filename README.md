# tipo-cambio-peru

TypeScript client for Peru's official exchange rate APIs. ESM, no external dependencies, MIT.

## Installation

```bash
npm install tipo-cambio-peru
```

## Usage

```ts
import { getTCToday, getBCRPRange, calcStats, convert } from 'tipo-cambio-peru';

const today = await getTCToday();
// → { date: '2026-04-25', buy: 3.4592, sell: 3.4791 }

const range = await getBCRPRange('2026-03-26', '2026-04-26');
const stats = calcStats(range);

const soles = convert(1000, 'USD', 'PEN', today);
```

## API

| Function | Description |
|---|---|
| `getTCToday()` | Latest available exchange rate. |
| `getBCRPRange(start, end)` | Historical interbank rate range. |
| `getBCRPSeries(series, start, end)` | Specific series access. |
| `calcStats(rows)` | Aggregate statistics over a series. |
| `convert(amount, from, to, rate)` | Convert between PEN and USD. |

## License

[MIT](LICENSE)

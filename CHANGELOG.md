# Changelog

Todos los cambios notables de este proyecto se documentan acá.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-04-26

### Agregado
- Cliente del BCRP API: `getBCRPSeries`, `getBCRPRange`
- `getTCToday()` — TC del último día hábil disponible
- `calcStats()` — promedio, min, max, volatilidad sobre series
- `convert()` — conversión PEN ↔ USD con un TC dado
- Tipos TypeScript completos
- Suite de tests con `node:test`
- Ejemplo ejecutable en `src/example.ts`
- Licencia MIT

### Roadmap
- v0.2: scraping de TC de casas digitales (Securex, Rextie, Kambista, Dollarhouse) con respeto a robots.txt
- v0.3: client de SBS (TC oficial publicado por SBS, distinto del bancario BCRP)
- v0.4: client de SUNAT (TC contable mensual)
- v0.5: cliente Python (paridad de API)

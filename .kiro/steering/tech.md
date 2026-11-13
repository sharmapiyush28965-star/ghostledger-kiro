---
inclusion: always
---

# Tech — GhostLedger

## Stack
- Static web app, zero build step, zero runtime dependencies. `index.html` + `styles.css` + `engine.js` + `app.js`. Runs by opening `index.html` or any static host (e.g. GitHub Pages). No server, no npm install to run the app.
- Vanilla JavaScript (ES2021), no framework. Charts are hand-drawn on `<canvas>` so the app works fully offline with no CDN.
- Money is integer cents everywhere (`amountCents`). Never use floating-point dollars for arithmetic. `formatCents` is the only place dollars are rendered.
- Node.js 20+ is used only for tests (`node --test tests/`). No test dependency is shipped to the browser.

## Engine (`engine.js`, UMD)
The engine is pure functions with no DOM access, so it is unit- and property-testable in Node and reusable in the browser:
- `parseCSV(text)` — RFC-4180-ish parser: quoted fields, embedded commas/newlines, CRLF, BOM.
- `detectColumns(header, rows)` — scores header names and cell shapes to find date / description / amount / debit / credit columns.
- `parseDate(value)` — YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY (first field > 12 means DD/MM), DD-Mon-YYYY, Mon DD YYYY. Returns ISO `YYYY-MM-DD` or `null`.
- `parseAmount(value)` — strips currency symbols/commas/spaces, `(123.45)` is negative, returns integer cents or `null`.
- `categorize(description)` — deterministic keyword rules, returns `{category, confidence}`.
- `normalizePayee(description)` — lowercase, strip card suffixes, `*`, reference numbers, extra spaces.
- `detectSubscriptions(txns)` — groups by normalized payee + amount, requires >= 3 occurrences, classifies cadence monthly (25–35d), weekly (6–8d), yearly (360–370d); reports price hikes > 10%.
- `detectAnomalies(txns)` — duplicates (same payee+amount within 2 days), large outliers (> 3x category median and > $100), price hikes.
- `summarize(txns)` — income, spending, net, byCategory, byMonth. All in cents.
- `formatCents(cents, currency)` — `$1,234.56`, `- $45.00`; supports `$`, `₹`, `€`, `£`.

## Rules
- Never send data anywhere. No `fetch`, no `XMLHttpRequest`, no analytics, no fonts/CDN in the app. Grep must find no network calls in `app.js`/`engine.js`.
- Never guess a date format silently: ambiguous `01/02/2026` is resolved by the documented rule (first > 12 = DD/MM, else MM/DD) and the chosen interpretation is shown in the import report.
- Every parser failure is reported, never silently dropped: `parseCSV` returns `{transactions, skipped, errors[]}` and the UI shows the skipped count.
- Accessibility: all controls are real buttons/inputs with labels, focus-visible styles, sufficient contrast (dark theme, text >= #E8E6F0 on #12101A), charts have a text table alternative.
- Performance: 10,000 transactions must import and render in under 2 seconds on a laptop CPU (tested).

## Tests
- `node --test` (bare, discovers `tests/`) must pass with 0 failures before any submission. Note: `node --test tests/` fails on Node 24, which treats the directory as a module.
- Property tests (custom generator, no external library): CSV round-trip, totals balance, cents are always integers, subscription detector finds planted recurring charges with 100% recall on synthetic data.
- Every bug fix gets a regression test first.

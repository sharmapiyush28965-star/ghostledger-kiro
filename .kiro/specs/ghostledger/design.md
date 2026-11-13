# Spec: GhostLedger — Design

## Architecture
Static app, no server. `engine.js` is pure logic (UMD, no DOM); `app.js` is UI + state + localStorage; `index.html` is semantic markup; `styles.css` is the dark theme. This split exists so the money logic can be property-tested in Node without a browser.

## Data flow
```
CSV file / sample CSV
  -> parseCSV (rows) -> detectColumns -> build transactions {id, date, payee, description, amountCents, category, confidence}
  -> categorize + user overrides
  -> summarize / detectSubscriptions / detectAnomalies
  -> render: dashboard, ghosts, transactions, budgets, charts (canvas)
  -> persist state to localStorage key ghostledger.v1
```

## Money
Integer cents throughout. `parseAmount` returns cents or null. `formatCents` renders. Summation is integer addition, so totals always balance exactly.

## UI layout
Header (name, tagline, privacy badge "100% offline — 0 network requests") → Import card (drop zone, file input, sample-data button, import report) → Dashboard stat cards (Income, Spending, Net, Ghosts / month) → Ghosts section (cards with Exorcise / Restore) → Charts (monthly trend bars, category bars, canvas + text table) → Budgets → Transactions (search, category filter, sort, override) → Footer (export, clear data, about Mint).

## Kiro usage in this build
The app was built in **live `kiro-cli chat` v3 sessions** (claude-haiku-4.5 model, Kiro CLI 3.0.0, sessions 05–12 on 2026-11-06). See `docs/KIRO_SESSION_LOG.md` for the full honest rebuild log including the initial failure on 2026-11-05 (v2 server error, v3 timeout, login timeout) and the recovery on 2026-11-06. One hand-fix (debit/credit column gating in `detectColumns`) is logged and verified in the session log. Kiro-built code includes `engine.js`, `app.js`, `index.html`, `styles.css`, and all tests (61 tests, 61 pass, 0 fail). The Kiro build was supported by:
- Spec-driven: requirements → design → tasks were written before implementation and checked by Kiro during development.
- Steering: product/tech/structure docs at `.kiro/steering/`.
- Hooks: `test-on-save.json` runs `node --test tests/` on test file save; `lint-on-save.json` runs network-call grep on engine/app save.
- Custom agent: `.kiro/agents/money-detective.md` — a review agent for money maths and privacy.
- MCP: `.kiro/settings/mcp.json` declares a local filesystem MCP server for Kiro file access.

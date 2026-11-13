# GhostLedger

A private, offline, local-first money tracker that resurrects [Mint](https://www.mint.com/) — the free budgeting app Intuit shut down on 1 January 2024. Drop in a bank CSV and see where your money went and which ghost subscriptions are draining it, all without your data ever leaving your device.

## What it does

**CSV Import** — Drag and drop a bank statement (any CSV format). GhostLedger auto-detects the delimiter (comma, semicolon, tab), finds the date/amount/description columns, and handles quoted fields, CRLF/LF line endings, BOM, currency symbols ($, ₹, €, £), parentheses for negatives, separate debit/credit columns, and dates in DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, or DD-Mon-YYYY format.

**Auto-categorisation** — Every transaction is categorised (Income, Subscriptions, Groceries, Dining, Transport, Shopping, Entertainment, Bills, Health, Transfer, Other) using deterministic keyword rules. You can override any category; the override is remembered locally.

**Dashboard** — Income, spending, net, monthly trend, top categories, and category breakdown at a glance.

**Ghost Subscription Detector** — Finds recurring charges (same payee, same amount, regular cadence: monthly 25–35 days, weekly 6–8 days, or yearly 360–370 days). Shows the monthly and yearly cost of each ghost. Mark a ghost as "exorcised" to see how much you'd save yearly if you cancelled it. Price hikes over 10% are flagged.

**Budgets** — Set a monthly budget per category. Progress bars and over-budget alerts keep you on track.

**Anomaly Detector** — Spots duplicate charges (same payee + amount within 2 days), unusually large transactions (> 3× category median and > $100), and subscription price hikes.

**Search, Filter, Sort** — Find transactions by keyword, filter by category, sort by date or amount.

**Export** — Download your cleaned data as CSV or JSON for use elsewhere.

**Clear Data** — One click to reset everything.

## How to run

**No build step. No server. No npm install to run the app.**

1. Open `index.html` in any web browser (or any static host, e.g. GitHub Pages).
2. Either drag-and-drop a bank CSV, pick a file, or click "Try sample data" to load a synthetic 6-month statement (180 transactions).
3. Data never leaves your device — verify in DevTools Network tab (0 requests).

## How to test

```bash
node --test
```

Runs 61 unit and property tests. All must pass with 0 failures.

## Money maths

- Money is stored as **integer cents** everywhere (not floating-point dollars).
- `parseAmount("$1,234.56")` returns `123456` (cents).
- `formatCents(123456, "$")` renders as `"$1,234.56"`.
- **Totals always balance to the cent** — no rounding errors.

## Privacy

- **Zero network requests.** Your data lives only in `localStorage` on your device.
- No account, no bank login, no Plaid, no cloud, no subscription fee.
- Verify: `grep fetch( engine.js app.js` returns 0 matches.

## Sample data

The built-in sample statement is **synthetic** (not real bank data). It is 180 transactions over 6 months:

- **Transactions:** 180 (0 skipped)
- **Income:** $19,200.00 (6 × $3,200)
- **Total spending:** $15,421.04
- **Net:** $3,778.96 (income − spending)
- **11 recurring charges:** $361.42/month ($4,337.04/year)
  - City Electric: $85.00/month
  - Mobile - Verizon: $65.00/month
  - Internet - FiberNet: $59.99/month
  - Water Utility: $42.00/month
  - **FitZone Gym: $29.99/month** ← *ghost (unused)*
  - **CloudVault Pro: $19.99/month** ← *ghost*
  - **StreamBox Plus: $18.99/month** ← *ghost*
  - Netflix: $15.49/month
  - Spotify: $11.99/month
  - **Retro Gamer Monthly: $9.99/month** ← *ghost*
  - iCloud Storage: $2.99/month

The four marked as "ghost" are subscriptions you've forgotten (they drain $78.96/month = $947.52/year). Mark them as "exorcised" to see the savings.

## Kiro usage

This app was built with **live `kiro-cli chat` sessions in v3 mode** (claude-haiku-4.5 model, sessions 05–12) on 2026-11-06. Transcripts are in `docs/kiro-sessions/`.

**What Kiro built:**
- `engine.js` (500+ lines): CSV parser, date/amount parsers, column detection, categorisation, subscription detection, anomaly detection, summary calculation.
- `tests/engine.test.js` + `tests/sample.test.js` (60+ tests): property tests (CSV round-trip, totals balance, cents always integers), planted-ghost recall test (100%), sample invariants (180 txns, 11 subscriptions).
- `app.js`, `index.html`, `styles.css`: Full UI, state management, localStorage persistence, drag-drop import, dashboard, ghosts section, budgets, charts, transactions table, export, clear data.
- Bug fixes: parseAmount (hyphen vs minus sign), debit/credit column detection gating.

**Hand-fix (logged in session log):**
- One ~10-line fix to `engine.js` `detectColumns` (debit/credit gating by header name, not just shape). This was required because Kiro's Session 08 fix was too aggressive and broke plain Amount files. The rebuild agent diagnosed it, applied the fix, verified `node --test` → 61/61 pass, and logged it clearly.

**Not Kiro-verified:**
- No live browser test — the UI was verified with a jsdom smoke test (22 checks, 0 failures) run by the rebuild agent. See docs/VERIFICATION.md.
- No user acceptance testing — GhostLedger is feature-complete and tested but has not been used by real users on real CSV files yet.

**Startup failure and recovery:**
- First rebuild attempt (2026-11-05): v2 engine failed (model registry server error); v3 stalled on trivial tasks; login timed out. See docs/KIRO_SESSION_LOG.md.
- Rebuild resumed (2026-11-06): v3 with claude-haiku-4.5 worked reliably. Sessions 05–12 completed the full app.

## Files

```
ghostledger-kiro/
  index.html                App shell (semantic HTML)
  styles.css                Dark spooky theme, responsive, print-friendly
  engine.js                 Pure engine (UMD: browser + Node), no DOM
  app.js                    UI + state + localStorage
  data/sample-statement.csv Synthetic 6-month statement, 180 transactions
  tests/engine.test.js      50 unit + property tests
  tests/sample.test.js      11 sample-invariant tests
  README.md                 This file
  LICENSE                   MIT
  .gitignore                (committed; includes .kiro/ on purpose)
  .kiro/
    specs/ghostledger/
      requirements.md       Feature spec
      design.md             Architecture
      tasks.md              Implementation tasks (closed)
    specs/csv-parser/
      requirements.md
      design.md
      tasks.md
    specs/subscription-detector/
      requirements.md
      design.md
      tasks.md
    steering/
      product.md            Problem, promise, features, non-goals
      tech.md               Stack, rules, tests, money maths
      structure.md          Naming, state, schema
    agents/
      money-detective.md    Review agent (money maths, privacy)
    hooks/
      test-on-save.json     Runs `node --test` on test file save
      lint-on-save.json     Runs fetch() grep on engine/app save
    settings/
      mcp.json              MCP config (local filesystem server)
  docs/
    KIRO_SESSION_LOG.md     Honest rebuild record (failures, hand-fix)
    KIRO_USAGE.md           Kiro usage summary
    VERIFICATION.md         Test results and invariants
    kiro-sessions/          Transcripts of all 12 Kiro sessions (v2/v3)
```

## License

MIT. See LICENSE.

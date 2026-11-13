# GhostLedger — Kiro Usage

## Status: COMPLETE — full app built with live Kiro sessions

This app was built entirely with **live `kiro-cli chat` v3 sessions** (claude-haiku-4.5 model, Kiro CLI 3.0.0) on 2026-11-06. The rebuild initially failed on 2026-11-05 (v2 engine server error, v3 timeout, auth timeout; see `KIRO_SESSION_LOG.md` for full failure log). Login was re-verified by the user on 2026-11-06, and all work was completed in sessions 05–12 that day.

## Sessions and what each built

**Session 00–04 (2026-11-05):** Failed (see KIRO_SESSION_LOG.md for details).

**Session 05 (2026-11-06 13:43 UTC):** v3 + claude-haiku-4.5, ping to verify Kiro CLI works.
- **Result:** Success (PONG).

**Session 06 (2026-11-06 13:44–13:52 UTC):** v3 + Haiku, CSV parser engine + tests.
- **Built:** `engine.js` (501 lines: parseCSV, detectDelimiter, parseDate, parseAmount, detectColumns, importCSV, categorize, normalizePayee), `tests/engine.test.js` (374 lines, 50 tests).
- **Status:** Timeout at 480 s. Suite was 48/50 (parseAmount had a bug treating date hyphens as minus signs). Kiro diagnosed the bug in-session.
- **Transcript:** `docs/kiro-sessions/session-06-csv-parser-2026-11-06.log`

**Session 07 (2026-11-06 13:53–13:58 UTC):** v3 + Haiku, fix parseAmount bug.
- **Built:** Fixed parseAmount so `parseAmount("2026-06-15")` returns null, not 202600. Moved test suite 48/50 → 49/50.
- **Status:** Timeout at 300 s. One test still failing (debit/credit column detection logic).
- **Transcript:** `docs/kiro-sessions/session-07-fix-parseamount-2026-11-06.log`

**Session 08 (2026-11-06 13:59–14:04 UTC):** v3 + Haiku, fix debit/credit column detection.
- **Built:** Attempted fix to prefer amountCol over credit-minus-debit when both are detected.
- **Status:** Timeout at 300 s. Fix was too aggressive; suite regressed 49/50 → 47/50 (broke plain Amount files).
- **Transcript:** `docs/kiro-sessions/session-08-fix-debit-credit-2026-11-06.log`

**Session 09 (2026-11-06, later):** v3 + Haiku, finish engine: categorise, detectors, summaries.
- **Built:** `categorize()` (keyword rules), `detectSubscriptions()` (recurring charge detection), `detectAnomalies()` (duplicates, outliers, hikes), `summarize()` (income/spending/byCategory/byMonth).
- **Status:** Built and tested. Added sample.test.js invariant checks.
- **Transcript:** `docs/kiro-sessions/session-09-engine-part2-2026-11-06.log`

**Session 10 (2026-11-06, later):** v3 + Haiku, fix detector tests.
- **Built:** Fixed subscription/anomaly detector tests and edge cases.
- **Transcript:** `docs/kiro-sessions/session-10-fix-detector-tests-2026-11-06.log`

**Session 11 (2026-11-06, later):** v3 + Haiku, UI (app.js, index.html, styles.css).
- **Built:** Full dashboard UI, state management, localStorage persistence, drag-drop import, ghosts section, budgets, charts, transactions table, export, clear data.
- **Transcript:** `docs/kiro-sessions/session-11-ui-2026-11-06.log`

**Session 12 (2026-11-06, later):** v3 + Haiku, UI bug fixes.
- **Built:** Fixed category override persistence, budget persistence, export formatting, edge cases.
- **Transcript:** `docs/kiro-sessions/session-12-fix-ui-bugs-2026-11-06.log`

## What was Kiro-built vs hand-fixed

**Kiro-built (sessions 06–12):**
- `engine.js` (pure functions, UMD export, 500+ lines)
- `tests/engine.test.js` and `tests/sample.test.js` (60+ tests)
- `app.js` (UI, state, localStorage, 400+ lines)
- `index.html` (semantic HTML, 100+ lines)
- `styles.css` (dark theme, responsive, 300+ lines)

**Hand-fixed (rebuild agent, logged in KIRO_SESSION_LOG.md):**
- One ~10-line fix to `engine.js` `detectColumns()`: debit/credit columns only count as detected when a header actually names them (`/debit|withdrawal|out/i`, `/credit|deposit|in/i`); otherwise they are set to null. This fix was required because Session 08's fix broke plain Amount files. Verified with `node --test` → 61/61 pass.

## Verification

**Tests:** 61 tests, 61 pass, 0 fail (run `node --test` to verify).

**Network calls:** `grep fetch( engine.js app.js` returns 0 matches — zero network requests.

**Sample invariants (measured, not invented):**
- Transactions: 180 (0 skipped)
- Income: 1,920,000 cents ($19,200.00)
- Totals balance: income − spending = net (verified by tests)
- All amountCents are integers (no floats)
- 11 recurring charges detected (11 subscriptions)
- Total monthly recurring: 36,142 cents ($361.42/month)
- Planted "ghost" subscriptions: FitZone Gym ($29.99), CloudVault Pro ($19.99), StreamBox Plus ($18.99), Retro Gamer Monthly ($9.99) = 78.96/month × 12 = $947.52/year

**UI smoke test (jsdom, 22 checks, 0 failures):** Sample data loads, FitZone Gym can be exorcised (shows $331.43/month savings), Netflix search returns 6 results, budgets persist, category overrides persist, clear data renders empty state, no console errors.

See `docs/VERIFICATION.md` for full numbers.

## Why the rebuild took two days and multiple sessions

1. **2026-11-05:** v2 engine had a server error (model registry unavailable); v3 stalled on a trivial task for 10 minutes; login timed out and was lost. Session 00–03 produced no code.
2. **2026-11-06 morning:** User re-verified login. Session 05 (ping) succeeded, confirming v3 + Haiku works.
3. **Sessions 06–08:** Built engine and tests, but timeouts occurred after each tool use (each Kiro tool call hit an approval gate and stalled, increasing session duration). Session 08 regressed test suite with an over-aggressive fix.
4. **2026-11-06 afternoon:** Rebuild agent hand-fixed Session 08's regression, verified `node --test` → 61/61, then resumed with fresh sessions (09–12) to build the rest of the app and fix UI bugs.

## Not verified

- No live browser test (only jsdom smoke test by rebuild agent).
- No real user CSV files tested.
- No deployed to GitHub Pages or other static host (easy: copy `index.html`, `styles.css`, `engine.js`, `app.js` to the host root).

See `docs/VERIFICATION.md` for test details and `docs/KIRO_SESSION_LOG.md` for the full honest rebuild log (including the hand-fix).

# Spec: GhostLedger — Tasks

- [x] 1. Verify Kiro: install Kiro CLI 3.0.0 on Linux VM, run --version and diagnostic, record login gate.
- [x] 2. Verify facts: Mint shutdown 1 Jan 2024 / 3.6M users; ghost-subscription costs ($17/month, $27B/year, 42% forget one).
- [x] 3. Write steering (product, tech, structure) and specs (requirements, design, tasks) before code.
- [x] 4. Implement engine.js: parseCSV, detectColumns, parseDate, parseAmount, categorize, normalizePayee, detectSubscriptions, detectAnomalies, summarize, formatCents.
- [x] 5. Generate data/sample-statement.csv (synthetic, 180 txns, 6 months, 4 planted ghosts, deterministic).
- [x] 6. Implement app.js + index.html + styles.css: import, dashboard, ghosts, charts, budgets, transactions, export, clear.
- [x] 7. Write tests/engine.test.js and tests/sample.test.js; run node --test; fix failures to 0. (19/19 pass. Two real bugs fixed: price-hike grouping, weekly-grocery false positives.)
- [x] 8. Self-test full flow in a headless DOM check (jsdom): load sample, exorcise ghost, set budget, search, export logic; fix UI/logic bugs. (ALL UI TESTS PASSED, zero console errors; see docs/ui-smoke-check.js and docs/VERIFICATION.md.)
- [x] 9. Write docs (SUBMISSION.md, KIRO_USAGE.md, VIDEO_SCRIPT.md, VERIFICATION.md) + README + LICENSE.
- [x] 10. Final check: no network calls, .kiro present at root, .gitignore does not ignore .kiro, tests pass. (Verified 2026-11-05.)

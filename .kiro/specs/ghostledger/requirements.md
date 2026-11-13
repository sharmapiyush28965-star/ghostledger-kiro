# Spec: GhostLedger — Requirements (EARS)

## User stories
1. As a former Mint user, I want to drop in my bank CSV and immediately see where my money went, so I do not need a bank login or a paid app.
2. As a person with forgotten subscriptions, I want GhostLedger to find recurring charges and show me their yearly cost, so I can cancel the ones I do not use.
3. As a privacy-conscious user, I want all data to stay on my device, so my transaction history is never uploaded.

## Requirements
- WHEN a user drops a CSV file, THE SYSTEM SHALL parse it, auto-detect columns, and show an import report (imported count, skipped count, date-format interpretation) within 2 seconds for 10,000 rows.
- WHEN a transaction has a description, THE SYSTEM SHALL assign it a category from the fixed 11-category set using deterministic rules, and SHALL allow the user to override the category, persisting the override locally.
- WHEN at least 3 charges share a payee and amount at a regular interval, THE SYSTEM SHALL list them as a subscription with cadence, monthly cost and yearly cost.
- WHEN a user marks a subscription as exorcised, THE SYSTEM SHALL show the yearly saving and exclude it from the active ghost total.
- WHEN a user sets a monthly budget per category, THE SYSTEM SHALL show spent, remaining and over-budget state for the current month in the sample/current data.
- WHEN the app loads, THE SYSTEM SHALL make zero network requests (verified: no fetch/XHR, no external fonts/scripts).
- WHEN the user clicks "Load sample data", THE SYSTEM SHALL load the synthetic 180-transaction statement and show the known ghost total ($78.96/month across 4 ghosts — see tests/sample.test.js).
- WHEN the user clicks "Clear all data", THE SYSTEM SHALL delete all local data and return to the empty state.

## Acceptance criteria
- `node --test tests/` passes with 0 failures.
- Sample data: totals balance (income − spending = net, to the cent), ghost detector finds all 4 planted ghosts and no false monthly subscription from one-off purchases.
- Manual self-test: import sample CSV, exorcise one ghost, set a budget, export CSV — all work with no console errors.

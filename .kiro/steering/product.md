---
inclusion: always
---

# Product — GhostLedger

## What it is
GhostLedger resurrects Mint, the free budgeting app Intuit shut down on 1 January 2024, leaving 3.6 million users without a budgeting tool. It is a private, offline, local-first money tracker. No account. No bank login. No cloud. No subscription fee. Your money data never leaves your device.

## The problem
- Mint is dead. Credit Karma, where Intuit sent users, is a credit-score app, not a budgeting app: budgets and custom categories did not make the cut.
- Replacements (YNAB, Monarch, Rocket Money) charge a monthly fee and require a bank login through a third party (Plaid). Users hand over bank credentials and their full transaction history to a company's servers.
- Ghost subscriptions drain money silently: CNET's 2025 survey found the average American spends $17/month (over $200/year) on subscriptions they no longer use or forgot; C+R Research found people underestimate subscription spending by 2.5x ($86 guessed vs $219 actual). 42% of consumers have forgotten at least one recurring charge.

## Who uses it
Anyone with a bank statement: students, freelancers, families, retirees — in any country. Primary persona: a former Mint user with a CSV export from their bank who wants to know, in 30 seconds, where the money went and which subscriptions are haunting them.

## Core promise (one sentence)
Drop in a bank CSV, and in 30 seconds GhostLedger shows where your money went and which ghost subscriptions to exorcise — without your data ever leaving your device.

## Features (v1, all local, all tested)
1. CSV import: drag-and-drop or file picker. Auto-detects delimiter, header row, date/amount/description columns. Handles quoted fields, CRLF, BOM, $/₹/€ symbols, parentheses for negatives, separate debit/credit columns, and DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD and DD-Mon-YYYY dates.
2. Auto-categorisation: deterministic keyword rules (no cloud AI, no API). User can override a category; the override is remembered locally.
3. Dashboard: income, spending, net, monthly trend, top categories, category breakdown.
4. Ghost Subscription detector: finds recurring charges (same payee, same amount, regular interval), shows monthly and yearly cost, flags price hikes, and lets the user "exorcise" a ghost to see yearly savings.
5. Budgets: monthly budget per category with progress bars and over-budget alerts.
6. Anomaly detector: duplicate charges, unusually large transactions, subscription price hikes.
7. Privacy and portability: all data in localStorage only. Export cleaned CSV and JSON. Clear-all-data button. Zero network requests after page load (verify in DevTools Network tab: 0 requests).
8. Sample data: one click loads a synthetic 6-month statement (180 transactions) so anyone can try it without their own bank file.

## Non-goals (v1)
- No bank login, no Plaid, no sync, no accounts, no cloud backup, no investment tracking, no bill pay, no AI chat. If a feature needs a server or a login, it is out of scope.
- No financial advice. GhostLedger shows facts from the user's own file; it never recommends a financial product.

## Tone
Spooky but professional. Ghosts are the metaphor for forgotten charges, never a joke at the user's expense. Plain language. Money is shown in integer cents internally and formatted to 2 decimals; totals must always balance to the cent.

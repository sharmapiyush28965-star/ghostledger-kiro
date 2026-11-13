# Demo video script — under 3 minutes, public YouTube
# Screen recording of the app + AI voice narration. No face on camera.
# Total target: ~2:30. Speak slowly. Show, don't just tell.
# Adapted from the old (Muse-built) script for the Kiro-built version:
# 61 tests (was 19), built with live kiro-cli chat v3, claude-haiku-4.5,
# sessions 05–12. Sample numbers verified in docs/VERIFICATION.md.

## 0:00–0:16 — Hook (show the hero, not your face)
"Mint is dead. Intuit shut it down on the first of January, 2024, and 3.6
million people lost their budgeting app. This is GhostLedger. I brought
Mint back — private, and offline. No account, no bank login, no cloud."
[Show the header + privacy badge.]

## 0:16–0:38 — The demo (the whole product in one shot)
"Watch. I load the sample statement — 180 transactions over six months.
Income, spending, and net, all worked out to the cent. And here — 11
recurring charges, 361 dollars 42 a month. Four of them are ghosts —
subscriptions nobody uses any more."
[Click Load Sample Data. Stats fill in: Income $19,200, Recurring
$361.42/month. Scroll to Ghost subscriptions.]

## 0:38–1:08 — Exorcise a ghost (the money moment)
"FitZone Gym, 29 dollars 99 a month. CloudVault Pro, 19.99. StreamBox
Plus, 18.99. And Retro Gamer Monthly, 9.99. Together, that's 78 dollars
96 every month — 947 dollars 52 a year — for things nobody uses. One
click, and FitZone Gym is exorcised — 359 dollars 88 a year back.
Exorcise all four, and it's 947 dollars 52 a year."
[Point at each ghost card. Click Exorcise on FitZone Gym. Savings banner
appears: $359.88/year. Exorcise the other three.]

## 1:08–1:36 — Depth (charts, budgets, anomalies)
"It also draws monthly charts, tracks budgets per category, and flags
duplicates and price hikes automatically. All from your own CSV file.
Your data never leaves this device — zero network requests. Money is
stored as integer cents, so totals always balance."
[Show monthly trend, category bars, a budget row, the anomalies section.]

## 1:36–2:06 — How Kiro built it (judges score this)
"I built it spec-first with Kiro — requirements, design, and tasks in
dot-kiro specs, steering docs, hooks that run the tests on save, and
property-based tests. Sixty-one tests, zero failures, all written and run
with the live Kiro agent. Sessions five to twelve, in Kiro's v3 mode."
[Show the dashboard; on-screen text: "Built with Kiro • 61 tests,
0 failures".]

## 2:06–2:20 — Close
"GhostLedger — your bank account is haunted. Now you can see the ghosts,
and exorcise them. The repo and the live app are linked in the
description."
[End on the dashboard.]

## Recording checklist
- [ ] Screen record at 1280x720, app window only, no face.
- [ ] AI voice narration throughout; no copyrighted music.
- [ ] Under 3:00 (aim ~2:30). Judges are not required to watch past 3:00.
- [ ] Upload to YouTube as Public (not Unlisted), paste the link in the
      Devpost form.
- [ ] Say the app name and the Kiroween category (Resurrection) in the
      first 15 seconds.

# Spec: Subscription Detector — Design

- `normalizePayee`: lowercase, remove `*`, digits-only tokens, card suffixes (`*1234`, `visa *`), collapse spaces, trim. `NETFLIX.COM*8472` and `Netflix` both become `netflix`.
- Group by `normalizedPayee`. A subscription charges (nearly) the same amount every time, so the tight tolerance is 2% / $1 around the median. Habitual spending (weekly groceries $62-$118) must NOT qualify. A genuine price hike is a single step change (first N charges at A, rest at B, B 10-25% above A, both sides tight) — the two sides merge into one subscription with a price-hike flag. Fixed by a real test failure on 2026-11-05: the earlier 20% tolerance flagged weekly grocery runs as subscriptions (16 found instead of 7).
- For each cluster with >= 3 charges: sort dates, compute gaps in days, median gap decides cadence. Require at least 2 gaps in the cadence band (allows one irregular gap).
- Price hike: compare first and last amount in the cluster; if last > first * 1.10, flag with both amounts.
- Ghost total: sum of monthly-equivalent costs of active (non-exorcised) subscriptions: monthly = amount, weekly = amount * 52/12, yearly = amount / 12.
- All money in cents; monthly-equivalent is rounded to the nearest cent only at display time.

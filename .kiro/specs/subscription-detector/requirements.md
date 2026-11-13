# Spec: Subscription Detector — Requirements

- WHEN the same normalized payee charges the same amount at least 3 times, THE SYSTEM SHALL report it as a subscription.
- WHEN intervals are 25–35 days, THE SYSTEM SHALL label cadence monthly; 6–8 days weekly; 360–370 days yearly.
- WHEN the amount for a payee rises by more than 10% between consecutive charges, THE SYSTEM SHALL flag a price hike with old and new amounts.
- WHEN a charge is a one-off purchase (1–2 occurrences), THE SYSTEM SHALL NOT report it as a subscription.
- WHEN amounts vary slightly (e.g. tax changes under 5%), THE SYSTEM SHALL still group them if the payee and the median amount match within 5% — and SHALL report the median as the amount.
- WHEN a user exorcises a subscription, THE SYSTEM SHALL compute yearly saving as monthly cost x 12 (or yearly cost x 1 for yearly cadence).

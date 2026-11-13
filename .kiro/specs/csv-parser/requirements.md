# Spec: CSV Parser — Requirements

- WHEN a CSV contains quoted fields with commas or newlines, THE SYSTEM SHALL parse them as one field (RFC-4180).
- WHEN a file starts with a UTF-8 BOM or uses CRLF, THE SYSTEM SHALL handle it without producing a phantom column or row.
- WHEN the delimiter is `,` `;` or tab, THE SYSTEM SHALL detect it from the first non-empty line.
- WHEN headers are present, THE SYSTEM SHALL detect date/description/amount/debit/credit columns by header name and by cell shape; WHEN headers are absent, THE SYSTEM SHALL fall back to shape detection.
- WHEN an amount is `(123.45)`, `$1,234.56`, `₹1,234`, or `-45.00`, THE SYSTEM SHALL return integer cents with the correct sign.
- WHEN a date is ambiguous (`01/02/2026`), THE SYSTEM SHALL apply the documented rule (first field > 12 means DD/MM, else MM/DD) and report the interpretation.
- WHEN a row cannot be parsed, THE SYSTEM SHALL count it in `skipped` with a reason, never crash, and never silently drop a parseable row.

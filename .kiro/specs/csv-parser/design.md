# Spec: CSV Parser — Design

- `parseCSV(text)`: state-machine parser, states: in-field, in-quotes, in-quotes-quote. Returns `string[][]` rows, skipping fully-empty rows.
- `detectDelimiter(sampleLine)`: counts `,`, `;`, `\t` outside quotes; picks the highest count, default `,`.
- `detectColumns(header, rows)`: scores each column: date score = fraction of cells parseable by `parseDate`; amount score = fraction parseable by `parseAmount`; description score = average text length and non-numeric share. Header-name bonuses: date/description/amount/debit/credit/merchant/payee.
- `parseDate`: tries YYYY-MM-DD, DD-Mon-YYYY, Mon DD YYYY, then slash dates with the documented ambiguity rule.
- `parseAmount`: strips currency symbols and spaces, removes thousands commas, `(...)` negates, returns `Math.round(value * 100)`.
- Transactions get a stable id: `sha-like` hash is overkill; use `date|payee|amountCents|index`.

---
inclusion: always
---

# Structure — GhostLedger

```
ghostledger/
  index.html              App shell (semantic HTML, no inline JS except module load)
  styles.css              Dark spooky theme, responsive, print-friendly
  engine.js               Pure engine (UMD: browser + Node), no DOM
  app.js                  UI only: state, rendering, events, localStorage
  data/sample-statement.csv   Synthetic 6-month statement, 180 txns (generated, no real data)
  tests/engine.test.js    Node built-in tests + property tests
  tests/sample.test.js    Sample-data invariants (known ghost totals)
  .kiro/
    steering/product.md tech.md structure.md
    specs/ghostledger/{requirements,design,tasks}.md
    specs/csv-parser/{requirements,design,tasks}.md
    specs/subscription-detector/{requirements,design,tasks}.md
    hooks/test-on-save.json lint-on-save.json
    settings/mcp.json
    agents/money-detective.md
  docs/
    SUBMISSION.md         Devpost submission text draft
    KIRO_USAGE.md         Honest Kiro usage write-up draft
    VIDEO_SCRIPT.md       3-minute video script (screen-recording + own voice)
    VERIFICATION.md       What was verified vs unverified
  README.md               Setup, run, test, privacy
  LICENSE                 MIT
  .gitignore              Must NOT ignore .kiro/
```

## Naming
- Files: kebab-case. Functions: camelCase. CSS classes: kebab-case with `gl-` prefix.
- Categories (fixed set, v1): Income, Subscriptions, Groceries, Dining, Transport, Shopping, Entertainment, Bills, Health, Transfer, Other.
- A "ghost" is a subscription the user marks as unused/forgotten. "Exorcise" = mark cancelled; savings are computed from its monthly cost x 12.

## State
- Single state object in `app.js`: `{transactions, budgets, overrides, exorcised, currency, filter}`.
- Persisted key: `ghostledger.v1` in localStorage. Schema version is in the key; a future version migrates, never silently drops user data.
- Sample data is labelled synthetic in the UI and in the CSV header comment.

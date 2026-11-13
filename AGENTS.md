# AGENTS.md — GhostLedger

Kiro also reads this file as steering context.

- Money is integer cents. Never float dollars for arithmetic.
- No network calls in the app. No fetch, no CDN, no analytics.
- Spec first: update `.kiro/specs/` before changing behaviour, then implement, then test.
- Run `node --test tests/` — it must pass with 0 failures.
- Sample data is synthetic. Never add real bank data to this repo.
- `.kiro/` is committed. Never add it to `.gitignore`.

# Publishing GhostLedger to GitHub (public)

The local repo in this folder is committed and ready. The `gh` CLI is **not
authenticated** on this machine, so the push must be done by the repo owner
(or after running `gh auth login`).

## Option A — GitHub website + git (no `gh` login needed)

1. On https://github.com/new create a **PUBLIC** repository named
   `ghostledger-kiro`. Do NOT add a README, `.gitignore`, or license —
   they are already in this repo.
2. In this folder, run (replace `<YOUR-USERNAME>` with your GitHub username):

```bash
git remote add origin https://github.com/<YOUR-USERNAME>/ghostledger-kiro.git
git branch -M main
git push -u origin main
```

## Option B — `gh` CLI (after login)

```bash
gh auth login
gh repo create ghostledger-kiro --public --source=. --remote=origin --push
```

## Checks before pushing

- `.kiro/` is at the repo root and is committed (Kiroween rules require it).
- `.gitignore` does **not** ignore `.kiro/`.
- `LICENSE` (MIT) is present.
- `node --test` passes 61/61.

# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex and others) working in this repo.
`CLAUDE.md` is a symlink to this file: edit `AGENTS.md` only.

## What this is

Marek Rom's personal site: CV, portfolio and consulting pitch in one. Static Astro, four pages
(Landing, Journey, AI Delivery, CV), EN + CS, light/dark, deployed to GitHub Pages at
`https://marcus172.github.io/ai-delivery/` (base path `/ai-delivery`, `noindex`).

The design spec is the source of truth for intent, audience, copy rules and number rules:
`docs/superpowers/specs/2026-11-03-ai-delivery-site-design.md`. Read it before changing copy or
structure.

## The repo is public

Everything committed is public, including history, commit messages and file paths.

- Copy about the current role is anonymized. The current employer and client may be named **only on
  the CV page** (and the CV PDFs). Never name them, internal systems, ticket keys, colleagues or
  the client's industry anywhere else, including code, comments, tests, docs and commit messages.
- `.private/` (git-ignored) holds the NDA denylist, raw research pointers (`.private/SOURCES.md`) and
  the visual reference. Read it, never copy from it verbatim, never commit it, never print the
  denylist into output.
- Research is a source of ideas, architecture and numbers, never of code, names, URLs or hosts.
- No phone number anywhere. No real screenshots, strings or data from client applications: use a
  fictional brand and invented strings.
- `npm run nda` is the backstop, not the check. Think before you write.

## Commands

```sh
npm run dev            # astro dev at http://localhost:4321/ai-delivery/
npm run build          # static build into dist/
npm run pdf            # CV PDFs from the built CV page (runs astro preview itself)
npm run nda            # NDA gate: dist/ (all rules) + git-tracked files (never rules)
npm run test:unit      # vitest, tests/unit
npm run test:postbuild # vitest over dist/ (PDFs)
npm run test:e2e       # playwright over astro preview, incl. axe a11y
npm run check          # the full gate, same as CI; run before saying "done"
```

The NDA gate needs `.private/nda-denylist.txt` or an `NDA_DENYLIST` env var. Source mode scans only
git-tracked files: `git add -N <file>` a new file before running `npm run nda` on it.

## Map

| Path | What |
| --- | --- |
| `src/pages/` | Routes. EN at `/…`, CS at `/cs/…`; each page is a thin wrapper over a view. |
| `src/views/` | Page bodies shared by both locales. |
| `src/content/ai-delivery/{en,cs}/NN-*.mdx` | AI Delivery chapters, one file per chapter per locale. |
| `src/data/*.ts` | Copy and figures as `l(en, cs)` pairs: landing, CV, journey, offer, metrics. |
| `src/components/diagrams/` | Inline SVG diagrams with localized labels. |
| `src/i18n/` | Locales, routes, UI strings, date formatting. |
| `src/styles/tokens.css` | Design tokens (light/dark via `light-dark()`). |
| `scripts/` | NDA gate, denylist parser, CV PDF generator. |
| `tests/` | `unit/`, `e2e/`, `post-build/`. |
| `docs/superpowers/` | Specs and implementation plans. |

## Content rules

- Positioning: **Senior Product Engineer**; current role "Product Engineering & AI Lead". Never call
  him "front-end" in copy the site writes; historical job titles on the CV stay factual.
- Framing: the process stays, AI does the grunt work, people decide and approve. No hype ("AI does
  everything", "10×"). The words *ratchet* and *ráčna* are banned (the dist gate enforces it).
- Numbers: every figure is labeled **measured** (with period/baseline) or **estimate**. The 5–10×
  is Marek's estimate and is always shown separately. Follow the number rules in spec §5.3.
- The site reads as the current state. History belongs to Journey.
- EN and CS stay structurally in sync: same chapters, same order, same components. Change both in the
  same commit. CS copy uses Czech typography (the `l()` helper handles it in data files).
- Never hard-code the base path; use the i18n route helpers.
- Accessibility is a showcased result: WCAG 2.2 AA, axe-clean, diagrams legible in both themes,
  motion off under `prefers-reduced-motion`.

## Workflow

- Never push to `main` directly. When work is ready (`npm run check` or the relevant subset green),
  commit it on a branch, push it and open a GitHub PR against `main` (`gh pr create`) without asking.
  Marek reviews in GitHub. Branch names: `<type>/<topic>`, e.g. `docs/agents-md`.
- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`). PR title = commit-style summary; the
  body says what changed and how it was verified.
- Merging to `main` deploys the site (`.github/workflows/deploy.yml`).
- The pre-push hook (`.githooks/pre-push`, wired by `npm install`) builds, runs the NDA gate and scans
  every outgoing commit's message, paths and files. Do not bypass it.
- Git identity is Marek's personal GitHub account; never a work identity.
- Repo docs, code and commit messages in English; site copy in both EN and CS.

## Agent setup

- `AGENTS.md`: this file, the one source of agent instructions. `CLAUDE.md` -> `AGENTS.md`.
- `.agents/skills/<name>/SKILL.md`: project skills, shared by all agents. `.claude/skills` is a
  symlink to it, so Claude Code and Codex see the same set. See `.agents/skills/README.md`.
- `.claude/settings.json`: shared Claude Code settings (allowlist for the npm scripts above).
  Personal overrides go to `.claude/settings.local.json` (git-ignored).
- New specs go to `docs/superpowers/specs/`, plans to `docs/superpowers/plans/`, named
  `YYYY-MM-DD-<topic>.md`. Working notes that must not be public go to `.private/`.

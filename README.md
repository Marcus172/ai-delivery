# AI Delivery site

**Live: [marcus172.github.io/ai-delivery](https://marcus172.github.io/ai-delivery/)**

Static Astro site (Landing, Journey, AI Delivery, Wins & cases, CV, Toolkit; EN/CS, light/dark) deployed to GitHub Pages under `/ai-delivery/`.

- `npm run dev` - local dev server
- `npm run check` - build, CV PDFs, NDA gate, unit, post-build and e2e tests (the full gate)
- `npm run pdf` - render `dist/cv/marek-rom-cv-en.pdf` + `dist/cs/cv/marek-rom-cv-cs.pdf` from the built CV page (starts and stops `astro preview` itself)

`.private/` holds the NDA denylist and design references. It is git-ignored and never committed. `npm run nda` scans the built `dist/` (all rules) and every git-tracked source file (`never` rules only); the pre-push hook runs it.

## Publishing

The site is `noindex` and lives at <https://marcus172.github.io/ai-delivery/>. Deploys run from `.github/workflows/deploy.yml` on every push to `main`.

One-time setup:

1. Repo Settings -> Secrets and variables -> Actions: create the secret `NDA_DENYLIST` with the contents of `.private/nda-denylist.txt` (one rule per line, same format). If it is empty the NDA step fails and nothing is deployed.
2. Settings -> Pages -> Source: "GitHub Actions".
3. Push `main`. The workflow runs build, CV PDFs, NDA gate, unit, post-build and e2e tests, then deploys `dist`.

Locally, `npm run check` runs the same gate (needs `.private/nda-denylist.txt` or an `NDA_DENYLIST` env var, and `npx playwright install chromium` once). The pre-push hook is wired by the `prepare` script, so run `npm install` once after cloning.

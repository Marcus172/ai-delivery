# ai-delivery site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A four-page static personal site (Landing, Journey, AI Delivery, CV) in EN/CS with light/dark mode, a build-time CV PDF, and an NDA gate, deployable to GitHub Pages.

**Architecture:** Astro static output with built-in i18n routing (EN at root, CS under `/cs/`). Each page is a locale-agnostic view component rendered by two thin route files. Copy lives in typed data modules and per-locale MDX; numbers live in one metrics module that labels each figure measured or estimate. Post-build scripts render CV PDFs with Playwright and scan `dist/` against a private denylist.

**Tech Stack:** Node 24, npm, Astro 7.x (`astro@^7.4`), `@astrojs/mdx`, TypeScript strict, Vitest, `@playwright/test@^1.64` + `@axe-core/playwright`, `@fontsource-variable/bricolage-grotesque@^5.3`, `unpdf` (PDF text extraction), GitHub Actions + `actions/deploy-pages`.

**Spec:** `docs/superpowers/specs/2026-11-03-ai-delivery-site-design.md` (read it first, along with `.private/SOURCES.md`). Astro APIs have moved since v5 — check the current docs for i18n routing, content collections and `astro:assets` before writing config; never write them from memory.

## Global Constraints

- Positioning: "Senior Product Engineer"; current role "Product Engineering & AI Lead". No "front-end" in copy about the author; historical titles on the CV page stay factual.
- Employer/client names of the current role appear **only** on the CV page and CV PDFs. AI Delivery and the 2026 Journey chapter never refer to a bank or the client's industry.
- Context sentence: "a large product monorepo with several parallel release lines and a cross-functional team of developers, analysts and testers."
- No phone number anywhere. Contact: `marek.marcus.rom@gmail.com`, `https://www.linkedin.com/in/marek-rom-a91445b8`.
- Every page: `<meta name="robots" content="noindex, nofollow">`, correct `<html lang>`, `hreflang` alternates.
- `site: "https://marcus172.github.io"`, `base: "/ai-delivery"`; no hard-coded base path — always `import.meta.env.BASE_URL` via the `href()` helper.
- Orbit tokens (light / dark): `--bg #f6f6f3/#131416`, `--ink #17191c/#ededea`, `--mute #5e6369/#a2a7ad`, `--line #dcddd8/#2b2d31`, `--tint #ecece7/#1b1d20`, `--acc #e8530e/#ff7a3d`. Font: Bricolage Grotesque variable, self-hosted; display headings `wdth 75`, weight 800, uppercase.
- Visual reference: `.private/design/visual-direction-v2.html`, **tab 1 (Orbit) only**.
- Landing stats (exact): In-Progress → PR −70 %; PRs with tests 1 % → 56 %; 2,423 accessibility findings → 18 systemic patterns.
- 5–10× is always labeled as the author's estimate, never shown among measured figures.
- Banned words: "ratchet", "ráčna"; no hype ("AI does everything", "10× engineer").
- Never claim the whole team uses the full flow daily, nor any client reaction to the AI persona.
- No real client screenshots/strings; persona and a11y examples use a fictional brand.
- WCAG 2.2 AA; `prefers-reduced-motion` disables all animation.
- No analytics, cookies or third-party runtime requests.
- Git: personal identity only (already configured). **Commit locally; never push** — the author pushes after approving copy (spec §6a).

## Review Focus

1. **Base path** — every internal link, asset, font and PDF link must work under `/ai-delivery/` in `astro preview`, not just at `/` in dev. → Task 2 e2e crawls all links on all 8 pages and asserts 200.
2. **Blocked storage** — with `localStorage` throwing (private mode), the theme toggle still switches and no console error is raised. → Task 2 e2e.
3. **Entity-encoded / hidden NDA terms** — a name written as `J&amp;T`, inside SVG `<text>`, in `alt`/`aria-label`/`title`, or in PDF text must be caught. → Task 3 unit tests.
4. **Phone width** — at 360 px no page scrolls horizontally; wide diagrams scroll inside their own container. → Task 9 e2e.
5. **Language switch from a chapter anchor** — switching language on `/ai-delivery/#guardrails` lands on `/cs/ai-delivery/#guardrails` (chapter ids are locale-independent). → Task 2 unit + Task 8 e2e.

---

## File map

```
astro.config.mjs                 site, base, i18n, mdx
playwright.config.ts             webServer = `npm run preview`, baseURL http://localhost:4321/ai-delivery/
vitest.config.ts
src/i18n/locales.ts              Locale type, LOCALES, DEFAULT_LOCALE
src/i18n/ui.ts                   UI string dictionary + t()
src/i18n/routes.ts               PageId, href(), localizedPath(), switchLocalePath()
src/styles/tokens.css            Orbit tokens (light-dark)
src/styles/global.css            base type, layout primitives, print rules
src/layouts/Base.astro           head (noindex, hreflang, no-flash theme script), Rail, Footer
src/components/{Rail,ThemeToggle,LangSwitch,CtaRow,Eyebrow,Stat,Note,Section}.astro
src/components/diagrams/{Orbit,FlowLayers,ToolSwimlane,GatesTable,TestPyramid,Timeline}.astro
src/data/metrics.ts              Metric[] (single source of numbers)
src/data/cv.ts                   CV data (bilingual)
src/data/journey.ts              Journey milestones (bilingual)
src/data/offer.ts                consulting offer cards (bilingual)
src/content/ai-delivery/{en,cs}/NN-<chapter-id>.mdx
src/content.config.ts            ai-delivery collection schema
src/views/{Landing,Journey,AiDelivery,Cv}View.astro
src/pages/{index,journey,ai-delivery,cv}.astro          EN routes
src/pages/cs/{index,journey,ai-delivery,cv}.astro       CS routes
src/assets/photo.jpg             from ~/Downloads/Profile photo (2).jpeg
scripts/denylist.ts              parseDenylist()
scripts/nda-gate.ts              scanDist() + CLI
scripts/generate-pdf.ts          CV → PDF
.githooks/pre-push               runs build + nda gate locally
.github/workflows/deploy.yml
tests/unit/*.test.ts  tests/e2e/*.spec.ts
README.md
```

---

### Task 1: Scaffold, tokens, fonts, i18n routing

**Files:** Create `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `src/i18n/locales.ts`, `src/styles/tokens.css`, `src/styles/global.css`, placeholder `src/pages/index.astro` + `src/pages/cs/index.astro`, `README.md`. Test: `tests/e2e/smoke.spec.ts`.

**Interfaces — Produces:** `type Locale = "en" | "cs"`; `LOCALES: readonly Locale[]`; `DEFAULT_LOCALE = "en"`. npm scripts: `dev`, `build`, `preview`, `test:unit` (vitest run), `test:e2e` (playwright test), `pdf`, `nda`, `check` (= build && pdf && nda && test:unit && test:e2e).

- [ ] **Step 1:** Scaffold with `npm create astro@latest . -- --template minimal --typescript strict --no-git --install`; add `@astrojs/mdx`, `@fontsource-variable/bricolage-grotesque`, dev deps `vitest`, `@playwright/test`, `@axe-core/playwright`, `unpdf`, `tsx`; `npx playwright install chromium`.
- [ ] **Step 2: Write failing e2e** `smoke.spec.ts`: `GET /ai-delivery/` → `html[lang="en"]`; `GET /ai-delivery/cs/` → `html[lang="cs"]`; computed `background-color` of `body` = `rgb(246, 246, 243)` under `colorScheme: "light"` and `rgb(19, 20, 22)` under `"dark"`.
- [ ] **Step 3:** Run `npm run build && npx playwright test smoke` → FAIL.
- [ ] **Step 4:** Configure `astro.config.mjs` (site, base, `i18n: { locales: ["en","cs"], defaultLocale: "en", routing: { prefixDefaultLocale: false } }`, mdx); tokens per Global Constraints with `color-scheme: light dark` on `:root` and `:root[data-theme=light|dark]` overrides; import the font in `global.css`.
- [ ] **Step 5:** Run again → PASS. README: what the site is, `npm run dev`, `npm run check`, that `.private/` holds the denylist and is never committed.
- [ ] **Step 6: Commit** `chore: scaffold astro site with orbit tokens and i18n routing`.

### Task 2: Routing helpers, Base layout, nav, theme + language switch

**Files:** Create `src/i18n/ui.ts`, `src/i18n/routes.ts`, `src/layouts/Base.astro`, `src/components/{Rail,ThemeToggle,LangSwitch,CtaRow,Eyebrow,Stat,Note,Section}.astro`, the 8 route files rendering empty views, `src/views/*View.astro` stubs. Tests: `tests/unit/routes.test.ts`, `tests/e2e/layout.spec.ts`.

**Interfaces — Consumes:** Task 1 locale types. **Produces:**
- `type PageId = "landing" | "journey" | "ai-delivery" | "cv"`
- `href(path: string): string` — prefixes `import.meta.env.BASE_URL`, no double slashes.
- `localizedPath(locale: Locale, page: PageId, hash?: string): string` — e.g. `("cs","ai-delivery","guardrails")` → `/ai-delivery/cs/ai-delivery/#guardrails`; `("en","landing")` → `/ai-delivery/`.
- `switchLocalePath(pathname: string, hash: string, target: Locale): string`.
- `t(locale: Locale, key: UiKey): string` with keys for nav labels, CTA labels (`cta.cv`, `cta.email`, `cta.linkedin`), toggle labels, "measured"/"estimate" badges.
- `<Base locale page title description>`; `<CtaRow locale />` renders the three CTAs (PDF link = `localizedPath`-based `cv/marek-rom-cv-<locale>.pdf`).

- [ ] **Step 1: Write failing unit tests** for `localizedPath` (all 4 pages × 2 locales, with/without hash) and `switchLocalePath("/ai-delivery/ai-delivery/", "#guardrails", "cs") === "/ai-delivery/cs/ai-delivery/#guardrails"` and the reverse.
- [ ] **Step 2:** `npm run test:unit` → FAIL. **Step 3:** implement `routes.ts` / `ui.ts` → PASS.
- [ ] **Step 4: Write failing e2e** `layout.spec.ts`, for each of the 8 URLs: has `meta[name=robots][content="noindex, nofollow"]`; has `link[rel=alternate][hreflang=en]` and `[hreflang=cs]`; every `a[href]` and `link[href]` on the page that is internal returns 200 (Review Focus 1); LangSwitch link targets the same page in the other locale; ThemeToggle click flips `data-theme` and survives reload; with `page.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } }); })` the toggle still flips and `page.on("pageerror")` fires nothing (Review Focus 2); no flash: `data-theme` is set before first paint (assert attribute present on `DOMContentLoaded`).
- [ ] **Step 5:** Run → FAIL. **Step 6:** Build Base (head inline theme script reading storage in try/catch, falls back to `prefers-color-scheme`), Rail (sticky left icon rail on ≥ 900 px, top bar below; page links + LangSwitch + ThemeToggle; accent scroll-progress bar), footer with CtaRow. Visuals follow the Orbit tab of the reference. **Step 7:** Run → PASS.
- [ ] **Step 8: Commit** `feat: base layout with rail nav, theme and language switch`.

### Task 3: NDA gate + denylist + pre-push hook

**Files:** Create `scripts/denylist.ts`, `scripts/nda-gate.ts`, `.githooks/pre-push`, `.private/nda-denylist.txt` (git-ignored). Test: `tests/unit/nda-gate.test.ts` (fixture terms only — never real ones).

**Interfaces — Produces:**
- Denylist file format: one rule per line, `cv-only: <term>` | `never: <term>` | `never-re: <regex>`; `#` comments. Loaded from `process.env.NDA_DENYLIST` (whole file content) or else `.private/nda-denylist.txt`; missing both → exit 2 with a message (never pass silently).
- `parseDenylist(text: string): Rule[]` where `Rule = { scope: "cv-only" | "never"; pattern: RegExp }` (terms → escaped, case-insensitive, word-boundary).
- `scanDocuments(docs: { path: string; text: string }[], rules: Rule[]): Hit[]`, `Hit = { path; rule; excerpt }`. A doc is CV-scoped when its path matches `/(^|\/)(cs\/)?cv\//`. Built-in rules (always `never`, in code): phone `/\+?\d{3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}\b|\+420/`, `/\bratchet\b|ráčn/i`.
- `scanDist(dir = "dist"): Promise<Hit[]>` — reads `.html` (strip `data:` URIs, decode HTML entities, keep attribute values and SVG text) and `.pdf` (via `unpdf`). CLI prints hits and exits 1 on any hit.

- [ ] **Step 1: Write failing tests:** `cv-only` term passes in `dist/cv/index.html` and `dist/cs/cv/marek-rom-cv-cs.pdf`, fails in `dist/index.html`; `never` term fails even in CV; `ACME&amp;Co` matched by term `ACME&Co`; term inside `<svg><text>` and inside `aria-label="…"` caught; `+420 111 222 333` fails everywhere; `data:image/...base64` containing the term bytes does not trigger; empty denylist + no env → CLI exits 2.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement → PASS.
- [ ] **Step 4:** Draft `.private/nda-denylist.txt` from the NDA dictionaries in the private research notes (`.private/SOURCES.md`): current employer + client names as `cv-only`; internal system names, ticket-key regex, colleague names as `never`. Add `.githooks/pre-push` running `npm run build && npm run nda`; `"prepare": "git config core.hooksPath .githooks"`.
- [ ] **Step 5:** Verify `git status` does not list `.private/`. **Commit** `feat: nda gate over built html and pdf`.

### Task 4: Data modules — metrics, CV, journey, offer

**Files:** Create `src/data/{metrics,cv,journey,offer}.ts`, `src/assets/photo.jpg` (copy of the source photo). Test: `tests/unit/data.test.ts`.

**Interfaces — Produces:**
- `type L10n = Record<Locale, string>`.
- `type Metric = { id: string; value: L10n; label: L10n; kind: "measured" | "estimate"; period: L10n; caveat?: L10n }`; `METRICS: Metric[]`; `LANDING_METRIC_IDS = ["in-progress-to-pr", "prs-with-tests", "a11y-patterns"] as const`; `metric(id): Metric` (throws on unknown id).
- `CV: { headline: L10n; profile: L10n; roles: Role[]; skills: {group: L10n; items: string[]}[]; languages: L10n[]; contact: { email: string; linkedin: string } }`, `Role = { company: string; client?: string; title: L10n; from: string; to: string | null; summary: L10n }` (dates `YYYY-MM`).
- `JOURNEY: Milestone[]`, `Milestone = { date: string; weight: "compact" | "expanded"; title: L10n; body: L10n }`.
- `OFFER: { id: string; title: L10n; body: L10n }[]` — 3 cards per spec §5.1.

- [ ] **Step 1: Write failing tests:** landing ids resolve and their `kind === "measured"`; values equal `"−70 %"`, `"1 % → 56 %"`, `"2,423 → 18"` (EN); a metric `five-to-ten-x` exists with `kind === "estimate"`; every metric has non-empty `period` in both locales; every `L10n` in all modules has both locales non-empty; `CV.roles[0]` = company "Finshape", title.en "Product Engineering & AI Lead", `to === null`; no string anywhere in `CV` matches the phone regex from Task 3; journey entries before `2024-01` are `compact`, from `2024-01` `expanded`; journey 2026 entries contain no `cv-only` denylist term (load via `parseDenylist`, skip if file absent).
- [ ] **Step 2:** Run → FAIL. **Step 3:** Fill data from the private research + CV PDF following spec §5 and the "Number rules" in §5.3 (as-of October 2026, rounding, separate context-layer measurements, PR-metrics baseline 2026-03-31). **Step 4:** Run → PASS.
- [ ] **Step 5: Commit** `feat: bilingual data for metrics, cv, journey and offer`.

### Task 5: CV page + print stylesheet + PDF generation

**Files:** Create `src/views/CvView.astro`, `scripts/generate-pdf.ts`, print rules in `global.css`. Test: `tests/e2e/cv.spec.ts`, `tests/unit/pdf.test.ts`.

**Interfaces — Consumes:** `CV`, `Base`, `CtaRow`. **Produces:** `generatePdfs(baseUrl: string, outDir = "dist"): Promise<string[]>` writing `dist/cv/marek-rom-cv-en.pdf` and `dist/cs/cv/marek-rom-cv-cs.pdf` (A4, `printBackground: true`, rendered from the CV route with `emulateMedia({ media: "print" })`); `npm run pdf` starts `astro preview`, calls it, stops the server.

- [ ] **Step 1: Write failing e2e:** CV page lists all roles in order (newest first) with photo, skills, languages, contact; the only page containing "Finshape" is the CV page (check the other 3 EN pages); print media hides rail and footer.
- [ ] **Step 2: Write failing unit test** (runs after `npm run pdf`): both PDFs exist, `unpdf` text contains "Senior Product Engineer" and "Product Engineering & AI Lead", contains no phone match, ≤ 2 pages.
- [ ] **Step 3:** Run → FAIL. **Step 4:** Implement view (Orbit `.xrow` style rows, current role accent-bordered) + print CSS + script. **Step 5:** Run → PASS.
- [ ] **Step 6: Commit** `feat: cv page and build-time pdf`.

### Task 6: Landing page + Orbit hero diagram

**Files:** Create `src/views/LandingView.astro`, `src/components/diagrams/Orbit.astro`. Test: `tests/e2e/landing.spec.ts`.

**Interfaces — Consumes:** `metric()`, `LANDING_METRIC_IDS`, `OFFER`, `CtaRow`, `t()`. **Produces:** `<Orbit locale />` — SVG with core "shared flow", inner ring roles (developer, analyst, tester, PM), outer ring tools (Claude Code, Paseo, Superset, worktrunk, Wayfinder, …), `role="img"` + localized `<title>`/`<desc>`; slow rotation of the outer ring only when motion is allowed.

- [ ] **Step 1: Write failing e2e:** hero h1 present; exactly three `[data-metric]` items with ids in `LANDING_METRIC_IDS` order, each with a visible "measured" badge; 5–10× shown in the about block with the "estimate" badge and **not** inside the stats group; 3 offer cards; photo has localized `alt`; links to Journey, AI Delivery and CV; with `reducedMotion: "reduce"` the orbit has no running animations (`document.getAnimations().length === 0`).
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement per spec §5.1 and the Orbit reference (hero grid, condensed display heading, stats trio, offer cards, short about with photo, chapter teasers, CTAs). Copy EN + CS. **Step 4:** Run → PASS.
- [ ] **Step 5: Commit** `feat: landing page with orbit hero`.

### Task 7: Journey page + timeline

**Files:** Create `src/views/JourneyView.astro`, `src/components/diagrams/Timeline.astro`. Test: `tests/e2e/journey.spec.ts`.

**Interfaces — Consumes:** `JOURNEY`. **Produces:** `<Timeline items locale />` — compact items render as a dense single-line strip, expanded items as cards with body; months of 2026 grouped under one "2026" band.

- [ ] **Step 1: Write failing e2e:** first item is 2014 and rendered compact; all 2024+ items expanded; 2026 band contains Apr, Jun, Jul, Aug, Sep, Oct, Nov entries; page text contains none of the `cv-only` terms (load denylist; skip if absent); the 2026 band contains no "bank"/"banka" (case-insensitive) — earlier years may name past clients as on the CV.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement per spec §5.2. **Step 4:** Run → PASS.
- [ ] **Step 5: Commit** `feat: journey page with weighted timeline`.

### Task 8: AI Delivery — layout, chapters 1–6, diagrams

**Files:** Create `src/content.config.ts`, `src/views/AiDeliveryView.astro`, `src/components/diagrams/{FlowLayers,ToolSwimlane,GatesTable}.astro`, `src/content/ai-delivery/{en,cs}/01-principle.mdx … 06-planning.mdx`. Test: `tests/e2e/ai-delivery.spec.ts`, `tests/unit/chapters.test.ts`.

**Interfaces — Produces:**
- Collection `aiDelivery`, frontmatter `{ id: ChapterId; order: number; title: string; summary: string }`, `ChapterId = "principle" | "flow" | "tooling" | "guardrails" | "enablement" | "planning" | "case-persona" | "case-a11y" | "case-tailwind" | "results" | "offer"` — ids are identical across locales (anchors, Review Focus 5).
- View renders chapters sorted by `order` as `<section id={id}>`, sticky TOC on ≥ 1100 px, `<details>` TOC below. MDX may embed `<Stat id>` (from `metric()`), `<Note>`, and the diagrams.

- [ ] **Step 1: Write failing unit test:** for each locale the set of `id`s equals the other locale's set and `order`s match.
- [ ] **Step 2: Write failing e2e:** TOC lists chapters 1–6 in order and each link scrolls to its section; on `/ai-delivery/ai-delivery/#guardrails`, LangSwitch href ends `/cs/ai-delivery/#guardrails`; every `<Stat>` shows a measured/estimate badge; page text contains no `cv-only` term and no "bank"/"banka" (case-insensitive).
- [ ] **Step 3:** Run → FAIL. **Step 4:** Implement view + diagrams + chapters 1–6 per spec §5.3 (EN first, then CS with the same structure). **Step 5:** Run → PASS.
- [ ] **Step 6: Commit** `feat: ai delivery chapters 1-6 with diagrams`.

### Task 9: AI Delivery — case studies, results, offer; a11y + responsive sweep

**Files:** Create `src/content/ai-delivery/{en,cs}/07-case-persona.mdx … 11-offer.mdx`, `src/components/diagrams/TestPyramid.astro`. Test: extend `ai-delivery.spec.ts`, create `tests/e2e/a11y.spec.ts`.

- [ ] **Step 1: Write failing e2e:** chapters 7–11 present; Results contains a caveats block with ≥ 4 items; persona chapter examples use the fictional brand (no `cv-only` term); 5–10× appears only with the estimate badge.
- [ ] **Step 2: Write failing a11y/responsive e2e** over all 8 pages × light/dark: `AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"])` → zero violations; at viewport 360×800 `document.documentElement.scrollWidth <= 360` (Review Focus 4).
- [ ] **Step 3:** Run → FAIL. **Step 4:** Write chapters 7–11 per spec §5.3 and fix every a11y/overflow finding. **Step 5:** `npm run check` → all green.
- [ ] **Step 6: Commit** `feat: case studies, results and site-wide a11y`.

### Task 10: CI workflow + author handoff

**Files:** Create `.github/workflows/deploy.yml`; update `README.md`.

- [ ] **Step 1:** Workflow on push to `main` + `workflow_dispatch`: Node 24 → `npm ci` → `npx playwright install --with-deps chromium` → `npm run build` → `npm run pdf` → `npm run nda` with `env: NDA_DENYLIST: ${{ secrets.NDA_DENYLIST }}` → `npm run test:unit && npm run test:e2e` → `actions/upload-pages-artifact` (`dist`) → `actions/deploy-pages`. Permissions `pages: write`, `id-token: write`; concurrency group `pages`.
- [ ] **Step 2:** Verify locally: `npx --yes @action-validator/cli .github/workflows/deploy.yml` passes; `npm run check` green.
- [ ] **Step 3:** README "Publishing": author creates secret `NDA_DENYLIST` (= contents of `.private/nda-denylist.txt`), enables Pages → "GitHub Actions", pushes `main`.
- [ ] **Step 4: Commit** `ci: build, gate and deploy to github pages`. **Do not push.**
- [ ] **Step 5:** Hand off to the author: `npm run preview` URL, the two PDF paths, and the spec §8 checklist (approve EN + CS copy, NDA + a11y green, check PDFs).

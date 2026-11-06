# Site review fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the findings from the 2026-11-06 site review (content, visual, audience readability) that the author accepted.

**Architecture:** Copy and figure changes go to `src/data/*.ts`, `src/i18n/ui.ts` and the MDX content. Layout fixes go to `src/styles/*.css` and the affected components. Every change lands in EN and CS together. Four PRs, one per group below, each green on `npm run check` before it opens.

**Tech Stack:** Astro, TypeScript, CSS (`light-dark()` tokens), Vitest, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-11-03-ai-delivery-site-design.md`, `docs/superpowers/specs/2026-11-05-wins-and-cases-design.md`. The review and the author's decisions on it are summarised in "Decisions" below.

## Decisions (author, 2026-11-06)

Accepted:
- Wins leads with results, not caveats.
- Visible nav labels.
- Facts line for recruiters.
- CV/PDF improvements.
- Unambiguous figures.
- All visual findings.
- CS grammar.
- The "What AI made affordable" heading.
- A licence note.

Added from a second review, confirmed by the author:
- One consistent account of team vs personal tool layers.
- A dated context-size figure.
- Less absolute case headings.
- A sticky chapter list on mobile.
- A CV that opens with contact, not the photo.
- Two reader paths on the landing.
- A section index on case pages.

Rejected, do **not** change:
- Length of AI Delivery. Collapsed `<details>` are the intended reading model.
- "One with AI for the whole team".
- "Several teams / several clients".
- No line on the author's role in the backend migration.
- English loanwords in CS copy and insider terms (preset, doctor, ledger, grill gate…). They are the author's voice.
- No engagement-format section.
- No sentence explaining why the client is anonymous. The site never mentions it and must not start; the employer stays CV-only.

## Global Constraints

- EN and CS change in the same commit; same structure, same components. CS strings go through `l()` / `csTypo` for Czech typography.
- The employer and client are named only on the CV page and CV PDFs. Not in code, comments, tests, docs or commit messages.
- Every figure is labelled measured (with period) or estimate. 5–10× stays separate.
- The words "ratchet" / "ráčna" are banned. No hype.
- Never hard-code the base path; use `localizedPath` / `subPagePath`.
- WCAG 2.2 AA, axe-clean in both themes, motion off under `prefers-reduced-motion`.
- Branches `<type>/<topic>`, conventional commits, PR against `main`, never push to `main`.

## Review Focus

1. CS strings longer than EN (nav labels, facts line, Wins jump links) overflowing at 390 px: the rail and the hero must not scroll horizontally.
2. Dark theme after the `--strong` swap: buttons and text inside the contact block keep ≥ 4.5:1 (axe colour-contrast in dark).
3. CV PDF still renders on two pages after the facts line, site link and figures are added (`npm run pdf` + `test:postbuild`).
4. Diagram scroll regions at 390 px: an overflowing region must look scrollable, and the role matrix must not overflow at all.
5. The `7 / 5` contributors figure moving onto Wins: its label must name five roles, matching the count.

---

## PR 1 — `fix/visual-p1`: CS headings, mobile diagrams, nav labels

### Task 1: Czech diacritics clear the line above

**Files:**
- Modify: `src/styles/global.css:61-68` (h1, h2 block)
- Modify: `src/layouts/Base.astro` (`.contact h2 { line-height: 0.95 }`)
- Test: `tests/e2e/layout.spec.ts`

- [ ] **Step 1: Write the failing test.** Add `test("CS display headings leave room for diacritics")`. On `/cs/` and `/cs/ai-delivery/` at 1440×900, for the first `h1` and every `h2`, assert `parseFloat(lineHeight) / parseFloat(fontSize) >= 1.05`.
- [ ] **Step 2: Run it.** `npx playwright test tests/e2e/layout.spec.ts -g diacritics`. Expected: FAIL (ratio 0.92).
- [ ] **Step 3: Implement.**
  - Add `:lang(cs) :is(h1, h2) { line-height: 1.06; }` after the h1/h2 block.
  - Add `:lang(cs) .contact h2 { line-height: 1.06; }` in `Base.astro`.
  - Leave the EN line height at 0.92; no EN glyph needs the room.
- [ ] **Step 4: Run it.** Expected: PASS. Look at a CS hero screenshot: the accents on Á/Í no longer touch the line above.
- [ ] **Step 5: Commit.** `fix: room for Czech diacritics in display headings`

### Task 2: Mobile diagrams — role matrix fits, other regions show they scroll

**Files:**
- Modify: `src/components/diagrams/RoleMatrix.astro` (`.matrix { min-width: 42.5rem }` at :97, column headers)
- Modify: `src/styles/global.css` (new `.hscroll` utility)
- Modify: the `.scroll` container in `DecisionTrail`, `FlowLayers`, `WinsMap`, `MigrationBand`, `PersonaPipeline`, `GatesTable`, `ToolMap`, `RoleMatrix` (add `class="scroll hscroll"`)
- Test: `tests/e2e/layout.spec.ts`

**Interfaces:**
- Produces: global class `.hscroll` and UI key `diagram.scrollHint` ("Swipe sideways" / "Posuňte do strany").

- [ ] **Step 1: Write the failing tests.**
  - `test("role matrix fits a 390 px screen")`: on `/ai-delivery/` and `/cs/ai-delivery/` at 390×844, the RoleMatrix `.scroll` has `scrollWidth <= clientWidth`.
  - `test("overflowing diagram regions say they scroll")`: at 390×844, every `.hscroll` with `scrollWidth > clientWidth` has a visible `.hscroll-hint` sibling.
- [ ] **Step 2: Run them.** Expected: both FAIL.
- [ ] **Step 3: Implement the role matrix.**
  - Under `@media (max-width: 40rem)`, drop the `min-width`.
  - The column headers switch to a short label: add a `short: L10n` field next to each column title.
  - The role column narrows to `9rem`.
  - Dots stay the same size; tap targets are not interactive, so no 44 px rule applies.
- [ ] **Step 4: Implement `.hscroll`.**
  - Edge shadows that appear only while content is hidden: the CSS-only `background-attachment: local, local, scroll, scroll` scroll-shadow pattern on `--bg`.
  - A `<p class="hscroll-hint">` after each region, shown under 900 px only, text from `diagram.scrollHint` with a `→` icon. It is hidden when the region does not overflow: a 6-line inline script sets `data-overflow` on load and resize, and CSS shows the hint only for `[data-overflow]`.
- [ ] **Step 5: Run the tests.** Expected: PASS. Check both themes on a 390 px screenshot of AI Delivery ch. 02 and 05.
- [ ] **Step 6: Commit.** `fix: mobile diagrams fit or show they scroll`

### Task 3a: Sources becomes Toolkit, URL included

Journey keeps its name (author's call). Sources is renamed everywhere, and its URL moves to `/toolkit/`. The old URLs redirect.

**Files:**
- Modify: `src/i18n/routes.ts`
  - `PageId` `"sources"` → `"toolkit"`
  - `PAGE_SEGMENT` `toolkit: "toolkit/"`
  - `PAGE_IDS` order unchanged
- Rename:
  - `src/pages/sources.astro` → `src/pages/toolkit.astro`
  - `src/pages/cs/sources.astro` → `src/pages/cs/toolkit.astro`
  - `src/views/SourcesView.astro` → `ToolkitView.astro`
  - `src/data/sources.ts` → `toolkit.ts`
  - `tests/e2e/sources.spec.ts` → `toolkit.spec.ts`
- Modify: `src/i18n/ui.ts`
  - keys `sources.*` → `toolkit.*`
  - `nav.toolkit`, `page.toolkit.title`: "Toolkit" / "Nástroje"
- Modify: every link and label that says Sources / Zdroje:
  - `ToolLayers.astro` `MORE_LINK`
  - `03-tooling.mdx`
  - the case MDX that link it
  - `README.md`, `AGENTS.md:82-83`
  - Find the rest with `grep -rn "sources\|Sources\|Zdroje" src tests README.md AGENTS.md`.
- Modify: `astro.config.mjs`, a `redirects` entry `/sources/` → `/toolkit/` and `/cs/sources/` → `/cs/toolkit/`. Check how Astro applies `base` to redirect targets; the test decides.
- Test:
  - `tests/unit/routes.test.ts`: `localizedPath("en", "toolkit") === "/ai-delivery/toolkit/"`; CS `/ai-delivery/cs/toolkit/`
  - `tests/e2e/toolkit.spec.ts`: `/ai-delivery/sources/` ends on `/ai-delivery/toolkit/`

- [ ] **Step 1: Update the route tests and add the redirect test.** Run them. Expected: FAIL.
- [ ] **Step 2: Rename and repoint.** Then `grep -rn "sources" src` returns nothing except the redirect config.
- [ ] **Step 3: Run** `npm run test:unit && npm run build && npm run test:e2e && npm run nda`. Expected: PASS.
- [ ] **Step 4: Commit.** `feat: Sources becomes Toolkit, old URLs redirect`

### Task 3b: Nav with visible labels

**Files:**
- Modify: `src/components/Rail.astro`
- Modify: `src/i18n/ui.ts` (new `nav.short.*` keys)
- Test: `tests/e2e/layout.spec.ts`

**Interfaces:**
- Consumes: `PageId` with `toolkit` from Task 3a.
- Produces: UI keys `nav.short.<PageId>`.
  - EN: Intro, Journey, AI, Wins, Toolkit, CV
  - CS: Úvod, Cesta, AI, Výsledky, Nástroje, CV

- [ ] **Step 1: Write the failing tests.**
  - `test("rail shows a text label for every page")`: at 1440×900 and 390×844, in EN and CS, each `nav.rail a[href]` except `.mark` contains a visible `.label` with the `nav.short` text.
  - At 390 px, `nav.rail` has `scrollWidth <= clientWidth`.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Replace the hover `.tip` with a `.label` under the icon: 0.6875rem, weight 600, `--mute`, `--ink` when current.
  - `aria-label` keeps the full `nav.*` label.
  - Desktop rail width `4rem` → `4.75rem`, and update `Base.astro` `.shell` grid `4rem` to match.
  - Mobile: icons and labels in equal-width cells; the language and theme toggles stay at the end.
- [ ] **Step 4: Run** `npm run test:e2e`. Expected: PASS, axe clean.
- [ ] **Step 5: Commit.** `feat: rail with visible labels`
- [ ] **Step 6: Open the PR.** Run `npm run check`, push `fix/visual-p1`, `gh pr create`.

---

## PR 2 — `fix/visual-p2`: dark surfaces, measure, CTA hierarchy

### Task 4: Dark theme keeps strong surfaces dark

**Files:**
- Modify: `src/styles/tokens.css` (new tokens)
- Modify: `src/layouts/Base.astro` (`.contact`, :150 onward)
- Modify: `src/components/diagrams/Orbit.astro:170,177` (orbit centre)
- Modify: `src/components/diagrams/ToolLayers.astro` (the "my choice" card)
- Modify: `src/components/diagrams/MigrationBand.astro:147-160` (harness band, conversion segments)
- Test: `tests/e2e/a11y.spec.ts`

**Interfaces:**
- Produces:
  - `--strong: light-dark(#17191c, #262a30)`
  - `--on-strong: light-dark(#f6f6f3, #ededea)`
  - Use these for every surface that should read "strong" in both themes. `--ink` stays the text colour.

- [ ] **Step 1: Add the tokens.** Swap `background: var(--ink)` + `color: var(--bg)` to `--strong` / `--on-strong` in the contact block and its `.btn` / `.btn.ghost` overrides, and the same for the Orbit centre, the ToolLayers card and the MigrationBand harness band.
- [ ] **Step 2: Make the conversion segments visible in dark.** In MigrationBand, `#1b1d20` on `#131416` is too close; use `color-mix(in srgb, var(--ink) 18%, var(--bg))`.
- [ ] **Step 3: Run** `npx playwright test tests/e2e/a11y.spec.ts`. Expected: PASS in both themes. Screenshot the landing in dark: no cream block in the hero or footer.
- [ ] **Step 4: Commit.** `fix: dark theme keeps strong surfaces dark`

### Task 5: Reading measure

**Files:**
- Modify: `src/styles/global.css` (the `.lead` rule)
- Modify: `src/views/JourneyView.astro` (entry text)
- Test: `tests/e2e/layout.spec.ts`

- [ ] **Step 1: Write the failing test.** `test("lead paragraphs keep a readable measure")`: at 1440×900 on `/ai-delivery/`, `/journey/`, `/wins/`, every `.lead` is ≤ 760 px wide.
- [ ] **Step 2: Run it.** Expected: FAIL (≈1180 px).
- [ ] **Step 3: Implement.**
  - `.lead { max-width: 68ch; }`.
  - Journey entry text `max-width: 72ch`.
- [ ] **Step 4: Run it.** Expected: PASS.
- [ ] **Step 5: Commit.** `fix: readable line length for leads and journey entries`

### Task 6: CTA hierarchy — email first

**Files:**
- Modify: `src/components/CtaRow.astro`
- Test: `tests/e2e/landing.spec.ts`

- [ ] **Step 1: Write the failing test.** On `/` and `/cs/`, the first `.cta a` is the `mailto:` link with class `btn` and without `ghost`. LinkedIn and GitHub are icon-only links with an `aria-label` and a box ≥ 44×44 px. At 1440 and 1024 the whole row sits on one line: all `.cta a` share one `offsetTop`.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Order: email (primary), CV (ghost), LinkedIn, GitHub (icon-only, `aria-label` from `cta.linkedin` / `cta.github`).
  - Inside the contact block the primary uses `--on-strong` / `--strong`.
- [ ] **Step 4: Run** `npm run test:e2e`. Expected: PASS, axe clean.
- [ ] **Step 5: Commit.** `feat: email is the primary call to action`

### Task 6b: AI Delivery chapters reachable on mobile

**Files:**
- Modify: `src/views/AiDeliveryView.astro`:
  - `:55-60`: the `toc-details` block becomes a sticky bar under 900 px
  - `:139`: the scroll-spy script also feeds the bar
- Test: `tests/e2e/ai-delivery.spec.ts`

**Interfaces:**
- Consumes: the existing `nav[data-toc]` links and the scroll-spy that marks the current chapter.

- [ ] **Step 1: Write the failing test.** `test("chapter list stays reachable while reading on mobile")`. At 390×844 on `/ai-delivery/` and `/cs/ai-delivery/`:
  - scroll to `#guardrails`;
  - `[data-toc-bar]` is in the viewport and shows the current chapter's title;
  - clicking it opens the chapter list;
  - choosing `#planning` scrolls there.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Under 900 px, `toc-details` becomes `position: sticky` below the rail. Add `data-toc-bar`; the summary shows "Chapters · <current chapter title>".
  - On link click the list closes.
  - No scroll animation under `prefers-reduced-motion`.
  - Desktop keeps the side TOC unchanged.
- [ ] **Step 4: Run** `npm run test:e2e`. Expected: PASS, axe clean.
- [ ] **Step 5: Commit, then open the PR.**
  - Commit: `feat: sticky chapter list on mobile AI Delivery`
  - Then `npm run check`, push `fix/visual-p2`, `gh pr create`.

---

## PR 3 — `fix/copy-review`: Czech grammar, case copy, figures, licence

### Task 7: Czech grammar

**Files:**
- Modify: `src/data/landing.ts:12` (`statsPeriodBefore` CS: "…výhrady jsou v " → "…výhrady jsou ve ")
- Modify: `src/i18n/ui.ts:219-220`
- Modify: `src/views/AlongTheWayView.astro:45`
- Create: `src/i18n/plural.ts`
- Modify: every "kvalitativní brán*" (`src/data/cv.ts:31,42`, `src/data/offer.ts:20`, `grep -rn kvalitativn src` for the rest) → "brány kvality" in the right case
- Modify: `src/content/ai-delivery/cs/01-principle.mdx:33` ("tiket se přečte a vyptá" → "tiket se přečte a doptají se nejasnosti")
- Test: `tests/unit/plural.test.ts`

**Interfaces:**
- Produces: `plural(locale: Locale, n: number, forms: { one: string; few?: string; other: string }): string` in `src/i18n/plural.ts`. It uses `Intl.PluralRules`; `few` is used for CS only.
- UI keys `atw.countWins` and `atw.countAreas` become objects `{ one, few, other }`.
  - CS: menší výhra / menší výhry / menších výher; oblast / oblasti / oblastí
  - EN: smaller win / smaller wins; area / areas

- [ ] **Step 1: Write the failing test.**
  - `plural("cs", 1, A) === "oblast"`, `plural("cs", 3, A) === "oblasti"`, `plural("cs", 5, A) === "oblastí"`
  - `plural("en", 1, B) === "area"`, `plural("en", 3, B) === "areas"`
- [ ] **Step 2: Run it.** `npx vitest run tests/unit/plural.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement** `plural` and use it in `AlongTheWayView.astro:45`. Apply the string fixes listed under Files.
- [ ] **Step 4: Run** `npm run test:unit`, then build and grep `dist/cs` for "jsou v Výsledcích", "3 oblastí" and "kvalitativn". Expected: no hits.
- [ ] **Step 5: Commit.** `fix: Czech grammar and plural forms`

### Task 8: Case copy

**Files:**
- Modify: `src/content/cases/en/04-stack.mdx:5` → title as the author confirms (recommended: "Six years of upgrade debt, paid down as a procedure")
- Modify: `src/content/cases/cs/04-stack.mdx:5` → title as the author confirms (recommended: "Šest let odkládaných upgradů, dohnaných postupem")
- Modify: `src/data/metrics.ts`, a new measured figure `stack-drift`. Show it in the "Why" section of case 04 in both locales: `<Stat id="stack-drift">` right after the Glance.
  - value: `l("6 years", "6 let")`
  - EN label: "how long the oldest part of the stack, the package manager, had been superseded when the upgrade began; the GraphQL library was 4.5 years behind, Node.js a year past its end of life"
  - CS label: "jak dlouho už měla nejstarší část stacku, správce balíčků, nástupce, když upgrade začal; knihovna GraphQL byla 4,5 roku pozadu, Node.js rok po konci podpory"
  - kind: `"measured"`
  - period: `l("repository history · April 2020 → May 2026", "historie repozitáře · duben 2020 → květen 2026")`
  - Source: the product repository's package manifests just before the May 2026 platform upgrade (Yarn 1.22, graphql 15, Node.js 18, Next.js 15, Storybook 8, Apollo Client 3), against registry release dates of their successors (Yarn 2 January 2020, graphql 16 October 2021, Node.js 18 end of life April 2025).
- Modify: the closing heading of every case.
  - EN: `## Why this was not possible without AI` → `## What AI made affordable`
  - CS: `## Proč to bez AI nešlo` / `## Proč by to bez AI nešlo` → `## Co AI umožnila zvládnout v tomto rozsahu`
- Modify: the `Point` title at `src/content/cases/{en,cs}/05-security.mdx:27`
  - EN: "Agents that cannot leak" → "Rules for the agents come first"
  - CS: "Agenti, kteří nic nevynesou" → "Pravidla pro agenty napřed"
  - The point's own text already says this; the old title promised more than the measures prove.
- Modify: `src/data/metrics.ts:565-566` (the `5 days` label)
  - EN: "from the first commit to the merge, with agents running through the weekend: the last backend group from Java 11 / Spring Boot 2.5 to Java 21 / Spring Boot 3.4; the ticket had estimated 35–50 person-days"
  - CS: "od prvního commitu po merge, s agenty běžícími i přes víkend: poslední skupina backendu z Javy 11 / Spring Bootu 2.5 na Javu 21 / Spring Boot 3.4; tiket ji odhadoval na 35–50 člověkodnů"

- [ ] **Step 1: Make the edits.** Grep `src` and `tests` for the old titles and headings, and update any reference (Journey links, tests).
- [ ] **Step 2: Run** `npm run test:unit && npm run build && npx playwright test tests/e2e/wins.spec.ts`. Expected: PASS. Then `grep -r "prehistor" dist` gives no hits.
- [ ] **Step 3: Commit.** `fix: case titles and closing headings say what AI changed`

### Task 9: Unambiguous figures

**Files:**
- Modify: `src/data/metrics.ts:69-72` (`a11y-patterns`)
  - value: `l("2,423 / 18", "2 423 / 18")`
  - EN label: "audit findings / systemic patterns behind them, fixed in shared components"
  - CS label: "nálezů auditu / systémových vzorců za nimi, opravených ve sdílených komponentách"
- Modify: `src/data/metrics.ts:450-453` (`a11y-fix-reach`)
  - value: `l("~130", "~130")`
  - EN label: "pages a single fix in a shared component reaches; 18 of 27 criteria were failing on almost every page"
  - CS label: "stránek, kam dosáhne jediná oprava ve sdílené komponentě; 18 z 27 kritérií padalo téměř na každé stránce"
- Modify: the spec's §5.1 hero line in `docs/superpowers/specs/2026-11-03-ai-delivery-site-design.md:81`, to the same notation
- Test: `tests/unit/data.test.ts`

- [ ] **Step 1: Write the failing test.** No metric `value` contains `→` unless both sides are the same quantity before and after. Assert that `a11y-patterns` and `a11y-fix-reach` do not contain `→`.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Make the edits.**
- [ ] **Step 4: Run** `npm run test:unit && npm run test:e2e`. Expected: PASS.
- [ ] **Step 5: Commit.** `fix: accessibility figures read as counts, not as a drop`

### Task 10: Licence note

**Files:**
- Modify: `src/content/ai-delivery/en/05-enablement.mdx:43`, after "The flow is built on Claude Code, and its plugins are distributed through a Claude Code plugin marketplace."
- Modify: the CS mirror in `src/content/ai-delivery/cs/05-enablement.mdx`

Copy, inserted as its own sentence:
- EN: "Most of the AI work runs on Claude Code Team licences at the 5× usage tier, one for each person on the team."
- CS: "Většina AI práce běží na licencích Claude Code Team v úrovni 5× využití, jedna pro každého v týmu."

"5×" names the licence tier. Keep "licence" and "usage tier" next to it so it never reads as a speed-up figure.

- [ ] **Step 1: Make the edit.** Claude Code is already in `src/data/tools.ts`, so the link appears automatically (once per paragraph).
- [ ] **Step 2: Run** `npm run test:unit && npm run build && npm run nda`. Expected: PASS.
- [ ] **Step 3: Commit.** `docs: say which licence the AI work runs on`

### Task 10b: Layers say the same thing everywhere; the context figure shows its date

The contradiction:
- `FlowLayers` says tools appear "only in the personal layer" and that it is "the only place a tool is named".
- `ToolLayers` and `ToolMap` place the agent runtime and the plugin marketplace in a shared **team** layer.

Both are true once two kinds of tool are told apart:
- **orchestration tools** (workspaces, sessions, fleet) are personal and swappable;
- **the shared agent setup** (the agent runtime, its plugin marketplace, team configuration in the repository) is a team default.

The contract names neither.

**Files:**
- Modify: `src/components/diagrams/FlowLayers.astro`
  - `:16-17` caption, EN: "Values are read top-down and merge per key, the lower layer wins. Procedures are looked up bottom-up and the first file found is used whole. Orchestration tools are named only in the personal layer, through seven closed extension points; the shared agent setup is a team default in the repository."
  - `:16-17` caption, CS: "Hodnoty se čtou shora dolů a slučují se po klíčích, vyhrává nižší vrstva. Procedury se hledají zdola nahoru a první nalezený soubor platí celý. Orchestrační nástroje se jmenují jen v osobní vrstvě, přes sedm uzavřených bodů rozšíření; sdílený setup agentů je týmový default v repozitáři."
  - `:27` and `:33` tag: "the only place an orchestration tool is named" / "jediné místo, kde se jmenuje orchestrační nástroj"
- Modify: `src/components/diagrams/ToolLayers.astro:83-84` note
  - EN: "The contract names none of them: the shared agent setup is a team default, orchestration is each developer's own choice, so a swap never touches the process."
  - CS: "Kontrakt nezná žádný z nich: sdílený setup agentů je týmový default, orchestrace je volba každého vývojáře, takže výměna nikdy nesáhne na proces."
- Modify: `src/content/ai-delivery/{en,cs}/03-tooling.mdx:5` summary. The first sentence names "operations" as orchestration operations, so it matches.
- Modify: `src/data/metrics.ts:249-259` (`context-diet`). AI Delivery hides the period, so the date and today's size go into the label.
  - EN label: "always-loaded agent instructions after the context diet in July 2026; about 28 KB today, with release and tracker knowledge added"
  - CS label: "trvale načtené instrukce pro agenta po dietě kontextu v červenci 2026; dnes zhruba 28 kB, s přidanými znalostmi o release liniích a trackeru"
  - The caveat keeps only "Verified by behavioural probes, not by feel; the probes check that the added knowledge stays reachable." (and the CS mirror)

- [ ] **Step 1: Make the edits.** Then grep `src` for "only in the personal layer", "jen v osobní vrstvě" and "the only place a tool"; each remaining hit must say "orchestration".
- [ ] **Step 2: Run** `npm run test:unit && npm run build && npm run nda`. Expected: PASS.
- [ ] **Step 3: Commit, then open the PR.**
  - Commit: `fix: one consistent account of team and personal tool layers; date the context figure`
  - Then `npm run check`, push `fix/copy-review`, `gh pr create`.

---

## PR 4 — `feat/wins-and-cv-for-readers`: Wins order, recruiter facts, CV

### Task 11: Wins leads with results

**Files:**
- Modify: `src/content/results/en.mdx`, `src/content/results/cs.mdx`
- Modify: `src/views/WinsView.astro:28-34` (jump links)
- Modify: `src/i18n/ui.ts` (keys `wins.jump.results`, `wins.jump.cases`, `wins.jump.more`)
- Modify: `src/data/metrics.ts:335-339` (`marketplace-contributors` label names five roles)
- Modify: `docs/superpowers/specs/2026-11-05-wins-and-cases-design.md:76,165` (results first, caveats after; author decision 2026-11-06)
- Test: `tests/e2e/wins.spec.ts:28-40`

- [ ] **Step 1: Flip the test.** Rename it to "results: figures come before their context…". Assert:
  - `[data-diagram=results-grid]` precedes `[data-caveats]`;
  - `[data-stat=marketplace-contributors]` sits between them;
  - the three jump links `a[href="#results"]`, `a[href="#cases"]`, `a[href="#along-the-way"]` are in `header.head`.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Reorder the MDX** in both locales:
  1. `### Measured, before and after` + `<ResultsGrid>`
  2. new `### Who works in the flow` / `### Kdo ve flow pracuje` + `<Stat id="marketplace-contributors">`
  3. `### Context for the figures` + the caveats list
  4. the estimate block
- [ ] **Step 4: Retitle the results.**
  - EN: "Results, and what else changed"
  - CS: "Výsledky a co dalšího se změnilo"
- [ ] **Step 5: Fix the `7 / 5` label.** Read `05-enablement.mdx` to name the fifth role; the label must list five roles.
- [ ] **Step 6: Add the jump links.** One line under the lead: "Results · Cases (5) · Smaller wins (11)", with counts from `cases.length` / `WINS.length`, CS via `plural`.
- [ ] **Step 7: Run** `npx playwright test tests/e2e/wins.spec.ts`. Expected: PASS.
- [ ] **Step 8: Commit.** `feat: Wins leads with results, context follows`

### Task 12: Facts line for recruiters

**Files:**
- Modify: `src/data/cv.ts` (new `facts` field on `Cv`)
- Modify: `src/views/LandingView.astro:42` (under `.role`)
- Modify: `src/views/CvView.astro:24` (under `.headline`, printed too)
- Test: `tests/e2e/landing.spec.ts`, `tests/e2e/cv.spec.ts`

**Interfaces:**
- Produces: `CV.facts: L10n[]`, rendered joined by " · " in a `<p class="facts" data-facts>`.
  - EN: `["Now: Product Engineering & AI Lead", "Prague or remote", "English, Czech", "Available from January 2027"]`
  - CS: `["Teď: Product Engineering & AI Lead", "Praha nebo remote", "čeština, angličtina", "K dispozici od ledna 2027"]`
- Modify also `LANDING.badge` (`src/data/landing.ts:41`): "Prague or remote · available from January 2027" / "Praha nebo remote · k dispozici od ledna 2027".

- [ ] **Step 1: Write the failing test.** On `/`, `/cs/`, `/cv/`, `/cs/cv/` at 390×844, `[data-facts]` is visible within the first viewport (`boundingBox().y + height <= 844`) and contains "Product Engineering & AI Lead".
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement.** Style: `--mute`, 0.9375rem, wraps on mobile.
- [ ] **Step 4: Run it.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: recruiter facts under the name on landing and CV`

### Task 13: CV page and PDF

**Files:**
- Modify: `src/views/CvView.astro` (PDF button beside the h1, screen only; site link in the contact list)
- Modify: `src/data/cv.ts`
  - `contact.site: "https://marcus172.github.io/ai-delivery/"`
  - current role `summary` gains a sentence:
    - EN: "Measured on the team, six months before the flow against five after: In Progress to pull request −70 %, pull requests that add or change tests 1 % → 56 %."
    - CS: "Měřeno na týmu, šest měsíců před flow proti pěti po něm: od In Progress k pull requestu −70 %, pull requesty, které přidávají nebo mění testy, 1 % → 56 %."
  - `languages`: "Czech — native" / "čeština – rodilý mluvčí"
- Test: `tests/e2e/cv.spec.ts`, `tests/post-build/*`

- [ ] **Step 1: Write the failing tests.**
  - e2e: on `/cv/` at 390×844, `a[download][href$=".pdf"]` is visible in the first viewport.
  - e2e: the contact list has a link to the site URL.
  - post-build: both PDFs contain the text "marcus172.github.io/ai-delivery" and "native" / "rodilý mluvčí", and have exactly 2 pages.
- [ ] **Step 2: Run them.** `npm run build && npm run pdf && npm run test:postbuild && npx playwright test tests/e2e/cv.spec.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - The button reuses the `.btn ghost` style and the `cta.cv` label, and is hidden under `@media print`.
  - The site link label strips the protocol, like the LinkedIn and GitHub labels.
- [ ] **Step 4: Run the same commands.** Expected: PASS. Open both PDFs and check the layout by eye: contact readable, no orphaned skill tag.
- [ ] **Step 5: Commit.** `feat: CV links back to the site, shows measured results and a PDF button up top`

### Task 13b: CV header carries contact; smaller photo on mobile

**Files:**
- Modify: `src/views/CvView.astro`
  - header `:21-25`: a contact line under the facts line; email · LinkedIn · GitHub · site, same labels as the contact list
  - remove the bottom `cv-contact` section `:82-95`; the header line replaces it
  - mobile `.photo` `:242`
- Test: `tests/e2e/cv.spec.ts`, `tests/post-build/*`

- [ ] **Step 1: Write the failing tests.**
  - e2e: at 390×844 on `/cv/` and `/cs/cv/`, `[data-cv-contact] a[href^="mailto:"]` and the first `[data-role]` title are both in the first viewport.
  - post-build: page 1 of each PDF contains the email address and "Prague" / "Praha".
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement the mobile photo.** Under 900 px it becomes a 6rem round avatar beside the name, the same treatment as the landing hero avatar.
- [ ] **Step 4: Implement the contact line in print.** It prints under the name, and the print styles keep page 1 to name, facts, contact, profile and the current role.
- [ ] **Step 5: Run** `npm run build && npm run pdf && npm run test:postbuild && npx playwright test tests/e2e/cv.spec.ts`. Expected: PASS. The PDFs stay at 2 pages.
- [ ] **Step 6: Commit.** `feat: CV opens with contact and the current role, not the photo`

### Task 14: Two reader paths on the landing hero

**Files:**
- Modify: `src/data/landing.ts` (new `paths`)
- Modify: `src/views/LandingView.astro:48-49` (between `.lead` and `CtaRow`)
- Test: `tests/e2e/landing.spec.ts`

**Interfaces:**
- Produces: `LANDING.paths: { label: L10n; text: L10n; page: PageId }[]`
  - `{ label: l("For your team", "Pro váš tým"), text: l("Wins & cases", "Výsledky a případy"), page: "wins" }`
  - `{ label: l("About me", "O mně"), text: l("Journey & CV", "Cesta a životopis"), page: "cv" }`

- [ ] **Step 1: Write the failing test.** On `/` and `/cs/` at 1440×900 and 390×844, `[data-reader-paths] a` has 2 links to `localizedPath(locale, "wins")` and `localizedPath(locale, "cv")`, both in the first viewport.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement.** Two compact link rows: small eyebrow label, bold text, arrow. Styled as links, not buttons, so they do not compete with the CTA row.
- [ ] **Step 4: Run** `npm run test:e2e`. Expected: PASS, axe clean.
- [ ] **Step 5: Commit.** `feat: two reader paths under the landing headline`

### Task 15: Section index on case pages

**Files:**
- Modify: `src/views/CaseView.astro:43-46` (after the highlight stats)
- Modify: `src/i18n/ui.ts` (key `case.onThisPage`: "On this page" / "Na této stránce")
- Test: `tests/e2e/wins.spec.ts`

**Interfaces:**
- Consumes: `render(entry)` returns `headings`. Use the depth-2 headings with their slugs.

- [ ] **Step 1: Write the failing test.** On every case page in EN and CS, `nav[data-case-index] a` count equals the number of `article h2` elements, and each `href` matches an `h2` id.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement.** A compact inline list of anchor links. No new summary box: the lead and the highlight stats are the quick answer.
- [ ] **Step 4: Run** `npm run test:e2e`. Expected: PASS.
- [ ] **Step 5: Commit, then open the PR.**
  - Commit: `feat: section index on case pages`
  - Then `npm run check`, push `feat/wins-and-cv-for-readers`, `gh pr create`.

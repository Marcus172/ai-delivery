# ai-delivery — personal site design

Date: 2026-11-03 · Status: draft for author approval

## 1. Intent

A personal site for Marek Rom that works as **CV, portfolio and consulting pitch at once**. It is never found by accident: Marek sends the link personally, so every reader arrives warm and knows who sent it.

Readers:

1. **CTOs / architects at software companies** deciding whether to bring Marek in externally to set up AI-assisted delivery for their teams.
2. **Hiring managers / interviewers** evaluating him for a senior role.

What each reader must leave with: *this person is not a vibecoder.* He has delivered software for 12 years, kept the process that works, and built a system in which AI is part of the delivery process for a whole team — with guardrails, measurements and results — while also being willing to build things that were not possible before AI.

The core message, in priority order:

1. **Team enablement, not a hero.** The goal was never one person going fast; it was developers, analysts and testers each getting AI into *their own* flow, plus standards that pull reluctant people along.
2. **One shared flow, swappable tooling.** The delivery flow is a contract; tools live in a personal layer. The team swapped orchestrators (Superset → Paseo) without touching the flow.
3. **Guardrails that hold without AI.** Gates, rules and behavioral tests on the agent setup set a bar everyone hits.
4. **Same craft, boosted.** Most of the process predates AI; AI made it roughly 5–10× faster (Marek's own estimate) and opened genuinely new solutions (the AI persona).

Positioning: **Senior Product Engineer** — never "front-end" in any copy the site writes about him. *(Builder's call: historical job titles on the CV page stay factual — e.g. "Front-end Engineer" at a past employer — because readers verify them against LinkedIn and references.)* The current role is written **"Product Engineering & AI Lead"**.

## 2. Goals, non-goals, anti-goals

**Goals**
- Four pages: **Landing**, **Journey**, **AI Delivery**, **CV**; shared navigation.
- EN and CS, with a language switch that lands on the same page in the other language.
- Light and dark mode: follows `prefers-color-scheme`, toggle overrides, choice persisted per visitor.
- Three calls to action everywhere: **Download CV (PDF)**, **Email**, **LinkedIn**.
- Free hosting on GitHub Pages, deployed on every push to `main`.

**Non-goals**
- Search-engine discoverability, blog, CMS, contact form, calendar booking, analytics, cookies, comments.
- Showing code from any employer or client.

**Anti-goals** (the site fails even if it works, if it…)
- names the current employer or client **anywhere outside the CV page** (see §6);
- reads as hype: "AI does everything", "10× engineer", rocket-scientist tone; the words *ratchet* / *ráčna* are banned;
- claims more than the data supports — in particular *"the whole team uses the full flow daily"* (data: the full flow is used daily by developers; other roles use shared plugins and gates; 7 contributors from 5 roles built the plugin marketplace) and any client reaction to the AI persona (not documented);
- mixes Marek's 5–10× estimate with measured numbers without labeling it;
- labels him "front-end" outside the factual historical titles on the CV page;
- is itself inaccessible — accessibility is one of the showcased wins.

## 3. Constraints

- **Repo is public** (`github.com/Marcus172/ai-delivery`). Only finished, anonymized copy is committed. Raw research and the chosen visual reference live in `.private/` (git-ignored); `.private/SOURCES.md` lists them.
- **Git identity**: personal GitHub account `Marcus172` over SSH (`git@github.com:Marcus172/ai-delivery.git`), personal e-mail, SSH-signed commits — already configured via `includeIf`. Never a work identity.
- **Hosting**: GitHub Pages project site → `https://marcus172.github.io/ai-delivery/` (base path `/ai-delivery`). Custom domain may be added later; nothing may hard-code the base path.
- **No phone number** anywhere (site or PDF). Contact = `marek.marcus.rom@gmail.com` + `linkedin.com/in/marek-rom-a91445b8`.
- **No real screenshots, texts or data from client applications.** Where an example is needed (AI persona, a11y finding), use a fictional brand and invented sample strings.
- **Not indexed**: `<meta name="robots" content="noindex, nofollow">` on every page. (A `robots.txt` under a project path is ignored by crawlers, so the meta tag is the mechanism.)

## 4. Decided "how"

- **Astro**, static output, built-in i18n routing: `defaultLocale: "en"`, `prefixDefaultLocale: false` → EN at `/…`, CS at `/cs/…`. Correct `lang` on `<html>`, `hreflang` alternates.
- **Visual direction: "Orbit"** — reference mockup at `.private/design/visual-direction-v2.html`, **tab 1 only**. Key traits to carry over:
  - Off-white / near-black surfaces with a single saturated orange accent. Tokens (via `light-dark()`):
    `--bg #f6f6f3 / #131416`, `--ink #17191c / #ededea`, `--mute #5e6369 / #a2a7ad`, `--line #dcddd8 / #2b2d31`, `--tint #ecece7 / #1b1d20`, `--acc #e8530e / #ff7a3d`.
  - **Bricolage Grotesque** (variable `opsz`/`wdth`); display headings condensed (`wdth 75`), uppercase, weight 800, tight leading.
  - Left sticky icon rail with page links + EN/CS + theme toggle (collapses to a top bar on mobile); thin accent scroll-progress bar.
  - Hero: condensed headline + **orbit diagram** (flow at the core, roles on the inner ring, swappable tools on the outer ring) + stats trio.
  - Eyebrow labels with a short rule, bordered stat columns, pill skill tags, accent-bordered notes, 1px section dividers.
- Fonts self-hosted (no third-party requests at runtime).
- Diagrams are **inline SVG components** with localized labels, legible in both themes; motion only where meaningful and fully disabled under `prefers-reduced-motion`.
- Theme toggle: inline no-flash script in `<head>`; `localStorage` access wrapped in try/catch, site works without it.
- **CV PDF generated at build** from the CV page (print stylesheet) in both languages, e.g. `/cv/marek-rom-cv-en.pdf` and `/cs/cv/marek-rom-cv-cs.pdf`, so the PDF never drifts from the site and carries the new positioning. The author's existing PDF is a *source of facts only*.
- **Accessibility**: WCAG 2.2 AA; automated axe check of built pages in CI.
- **NDA gate in CI** (see §6) runs before deploy and fails the build.
- **GitHub Actions**: install → build → generate PDFs → NDA gate → a11y check → deploy with the official Pages actions.
- Repo docs (README, specs) in English.

## 5. Pages

Shared on every page: rail/top nav (Landing · Journey · AI Delivery · CV), EN/CS, theme toggle, footer with the three CTAs.

### 5.1 Landing — "one minute"

For the reader who gives it a minute. Content:
- Hero: name, "Senior Product Engineer", one-sentence claim (team-wide AI-enabled delivery), orbit diagram, three measured stats with a "measured" label — **decided by the author**: **In-Progress → PR −70 %**, **PRs with tests 1 % → 56 %**, **2,423 accessibility findings / 18 systemic patterns** (period and baseline on AI Delivery). Lead time and returns-from-test figures appear only in the Results chapter, with their reliability caveats.
- **What I can set up for you** (consulting offer), three cards — builder's call on wording:
  1. AI-SDLC assessment of an existing team and codebase;
  2. setting up a shared delivery flow with guardrails (agent context, gates, behavioral tests, personal tooling layer);
  3. enablement beyond developers — analysts, testers, PM.
- Short "about" with photo; 5–10× labeled as personal estimate.
- Teasers linking to AI Delivery chapters and Journey.
- CTAs.

### 5.2 Journey — full career, weighted to the last two years

- **2014–2023, compressed**: a dense milestone line — web apps/CMS, a set-top-box & streaming platform, React Native and taking over team leadership at a localization-platform company, architecture roles (IoT monitoring, a Web3 crowdfunding platform), L2 production support for a UK bank. Proves history; does not narrate it.
- **2024 → now, expanded**: modernizing a portfolio of ~20 apps at a large Czech bank (React + Kotlin), AI in delivery at a product company (Claude Code/Cursor, CI agents), then **April → November 2026 month by month**: AI setup of the repo (Apr), Biome/tooling modernization (Jun), visual plans (Jul), delivery-flow contract (Aug), Superset → Paseo + two-machine fleet (Sep), Wayfinder & symmetric fleet (Oct), AI persona & copy audit (Oct–Nov).
- Journey is the *why and how*; the CV page is the factual list. Overlap is intentional.
- Names on Journey *(builder's call)*: past employers **and** past clients may be named exactly as they already appear in the author's CV (ApiTree/Česká spořitelna, Gloat, Valatron/Veolia, Phrase, nangu.TV, Diebold Nixdorf/Lloyds, FutureTek). **The 2026 chapter is anonymized and does not refer to any bank** — "current role at a fintech vendor".

### 5.3 AI Delivery — the long, detailed page

Long-form with a sticky chapter table of contents (desktop) / collapsible TOC (mobile). Every number labeled **measured** (with source type and period) or **estimate**. Every chapter has at least one diagram or visualization.

Context sentence used throughout: *a large product monorepo with several parallel release lines and a cross-functional team of developers, analysts and testers.* **Decided by the author: AI Delivery never refers to a bank or to the client's industry** — the presentation must stand on the method, not on the client.

Chapters:
1. **Principle** — the process stays, AI does the grunt work, humans decide and approve; "almost nothing by hand, never 100 %".
2. **The delivery flow** — layered architecture: generic contract → client preset (~20 capabilities) → repository procedures → personal layer (7 closed extension points); keys merge, first procedure wins. Diagram. The same contract was adopted for a second client by another developer unchanged.
3. **Swappable tooling & the fleet** — current state only, no history of swaps (the history belongs to Journey): the contract names operations, each developer implements them with their own tool (Paseo / worktrunk + direct session / none); a swap touches only personal-layer files. Two symmetric machines, git-replicated state with a custom merge driver, per-ticket workspaces. Diagram: contract operations → three personal setups → one team layer.
4. **Guardrails** — rules (always-on vs path-scoped), 37 behavioral probes of the agent setup, a 23-step CI gate, the context diet (always-loaded rules 57.6 KB → 7 KB, verified by probes — and honestly noting it regrew), context layer measurements (impact query 161 s → 58 s, −89 % tokens via subagent). Table of gates: who enforces, holds without AI.
5. **Enablement beyond developers** — analysts (analysis lookup with verdicts), testers (E2E test ops, product coverage map of ~720 nodes, AI proposes / tester approves), incident triage calibrated on 57 real incidents; plugin marketplace: 10 plugins, 28 skills, 7 contributors across 5 roles. Phrase adoption strictly per §2 anti-goals.
6. **Planning with AI: Wayfinder & visual plans** — decision maps (4 maps, 47 decision tickets), visual plans/recaps run fully locally; one concrete anonymized example each.
7. **Case: AI persona — brand voice as code** — two rule layers (shared language base + brand persona), glossary, deterministic checker + tiered LLM pipeline with verification (~900 → ~700 findings survive), in-context screenshots of every string, closed loop from client decisions back into the persona. Scale: ~4,500 strings audited, ~700 proposed changes, ~4 weeks. Fictional brand + invented strings for examples. Why it was impossible without AI.
8. **Case: Accessibility at scale** — 2,423 external-audit findings collapsed into 18 systemic patterns; 18/21 systemic criteria and 182/212 page findings done; 134 component-level and 49 e2e a11y specs; six-layer test pyramid whose top layer (screen reader) stays human.
9. **Case: styled-components → Tailwind** — ~1,300 components in ~10 weeks, stories coverage 44.5 % → 100 %, −10 KB gzip per app, visual-regression harness built *before* the migration started.
10. **Results** — includes an open **caveats** block *(decided by the author)*: the delivering team shrank from 4–6 to 2–3 developers while output held — presented as an efficiency argument — and the author's share of PRs is high; lead time is partly driven by the flow auto-setting the test-ready state; lead time and returns-from-test are medium reliability; Jira does not separate front-end from back-end work. Then the measured before/after set (lead time, In-Progress→PR −70 %, returns from test, PRs with tests, test files and stories from the PR-metrics note), with periods and caveats; 5–10× shown separately as the author's estimate.
11. **What I'd set up for you** — closes into the consulting offer + CTAs.

**Number rules** *(builder's call, settled during review)*:
- The private research notes are the only source; no re-querying of any employer or client system. "Re-check" means: every published figure traces to a line in those notes.
- One stated **"as of November 2026"** for the site; each figure additionally names its period/baseline.
- Before/after test figures come from the PR-metrics note (baseline = state on 2026-03-31) — never mixed with the whole-tree file counts from the repo inventory.
- Context-layer figures are two separate measurements and are presented separately (precomputed impact query 161 s → 58 s; subagent route −89 % tokens).
- Absolute ticket/PR counts are rounded or omitted (NDA verdicts in the research).
- Known caveats stay visible on AI Delivery: the always-loaded context regrew after the diet. (Squash-merge authorship was checked and does not skew PR counts — no caveat.)

### 5.4 CV

Factual, print-friendly, source of the PDF. From the author's PDF CV, with these changes: headline "Senior Product Engineer"; current role **"Product Engineering & AI Lead · <employer> · <client and product> · Apr 2026 – now"** (the real names live in `src/data/cv.ts`) — the **only** place on the site where those names may appear; no phone. Sections: profile, experience (all roles), skills/toolkit, languages, contact.

## 6. NDA gate

- A denylist (company and client names, internal system names, ticket-key patterns, colleague names) is kept **out of the public repo**: locally in `.private/nda-denylist.txt`, in CI as an Actions secret `NDA_DENYLIST`.
- A script scans the built HTML text, SVG text and generated PDFs, case-insensitive, and fails the build on any hit — **except** the employer/client names on the CV page and CV PDFs. Phone-number patterns fail everywhere.
- The script itself contains no sensitive terms.
- The denylist has two categories: `cv-only` (current employer/client names — allowed on CV page and CV PDFs only) and `never` (internal system names, ticket-key patterns, colleague names). The builder drafts it from the NDA dictionaries in the private research; the author creates the Actions secret.
- The same check runs locally as a git pre-push hook against `.private/nda-denylist.txt`, so nothing sensitive reaches the public repo in the first place.

## 6a. Publishing workflow *(builder's call)*

- All content work happens locally with `astro dev` / `astro preview`. **Nothing is pushed until the author has approved EN + CS copy and the PDFs.**
- First push = approved content + CI; Pages is enabled after that first green run.

## 7. Left to the builder

- Exact copy (author reviews all EN and CS copy before first publish), chapter lengths, card wording of the consulting offer.
- Diagram designs beyond the orbit hero, component/file structure, content format (MDX vs data files) as long as EN and CS stay structurally in sync.
- Mobile adaptations of the rail and diagrams.
- How the PDFs are rendered (headless browser at build is the expected route).

## 8. Before first publish

- Author approves EN and CS copy.
- NDA gate and a11y check green.
- Author checks the rendered PDFs.

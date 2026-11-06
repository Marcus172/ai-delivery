# Wins & cases — a second long-read section

Date: 2026-11-05 · Status: draft for author approval

Extends `2026-11-03-ai-delivery-site-design.md` (the base spec). Everything there still holds —
NDA, number rules, copy rules, accessibility, EN/CS sync — unless this document says otherwise.

## 1. Intent

AI Delivery has grown into two different reads glued together: chapters 1–6 explain **how the
system works**, chapters 7–10 show **what it delivered**. The second half is where a technical
reader wants to go deepest, and a chapter on a long page cannot hold the depth (detail, screenshots,
recordings) without burying the first half.

The reader is the same as in the base spec, with sharper focus: a **CTO or architect** who wants to
know exactly *what Marek does and how*, because they are deciding whether to hire him into their
team, or bring him in externally to show it or set it up in their company. They read critically,
look for where the agent stops and the person starts, and want evidence, not adjectives.

So the cases move into their own section — **Wins & cases** — that stands **next to** AI Delivery as
an equal, not as an appendix:

- **AI Delivery** = how it works (principle → planning) and the offer.
- **Wins & cases** = what it delivered: a story-shaped landing with the measured numbers and a
  summary of each case, and one detailed subpage per case.

The two cross-reference each other; both are entered from the landing page's *Read on* section.

## 2. Goals, non-goals, anti-goals

**Goals**
- A new section `Wins & cases` with a section landing and one subpage per case, EN + CS, light/dark.
- AI Delivery shrinks to chapters 1–6 plus the offer; it links to Wins & cases where the cases were.
- Case subpages are built to grow: adding a screenshot, GIF/clip or YouTube video later is a file
  plus one line of MDX, no new component work.
- Both sections reachable from the landing *Read on* teasers and from the rail.

**Non-goals**
- Writing the deeper case copy now. This change moves the existing case content into the new
  structure; the author adds depth and media case by case afterwards (§8).
- A blog, tags, filtering, or a CMS. The case list is short and hand-ordered.
- New cases beyond the existing three.

**Anti-goals** (fails even if it works, if it…)
- turns AI Delivery into a teaser for the cases, or Wins & cases into an appendix — they are peers;
- shows anything from a client application, an internal name or a ticket key in a screenshot or
  recording (the NDA gate scans text, **not pixels**: every image is a manual check, see §6);
- loads anything from a third party on page load (YouTube included) — no cookies, no trackers, per
  the base spec's non-goals;
- separates the measured figures from their caveats when moving them.

## 3. Structure and URLs

| Page | EN | CS |
| --- | --- | --- |
| Wins & cases landing | `/wins/` | `/cs/wins/` |
| Case: brand voice as code | `/wins/brand-voice/` | `/cs/wins/brand-voice/` |
| Case: accessibility at scale | `/wins/accessibility/` | `/cs/wins/accessibility/` |
| Case: CSS-in-JS → Tailwind | `/wins/tailwind/` | `/cs/wins/tailwind/` |

URL segments are English in both locales (same convention as the existing pages). Built through the
i18n route helpers; the base path is never hard-coded.

**Names** *(builder's call, author may change)*: EN "Wins & cases", CS "Výsledky a případy". The
rail label can be shortened to "Wins" / "Výsledky" if the full name does not fit.

## 4. Pages

### 4.1 Wins & cases landing — the story

A narrative page, not a long read: numbers first, then the cases in summary, each leading to its
subpage. Shape *(builder's call on details)*:

1. **Header**: eyebrow, title, a lead of two or three sentences (what this section is, who it is
   for), the site-wide "as of" line.
2. **Results** — the current chapter 10 content moves here **whole**: the caveats block first, then
   the measured before/after set, then the 5–10× estimate kept visibly apart. Its anchor stays
   `#results`. The estimate block's link "in the first chapter" becomes a cross-page link to
   AI Delivery `#principle` in the same locale.
3. **Cases** — one summary card per case, in the current order (brand voice, accessibility,
   Tailwind): title, the existing chapter summary, two or three headline stats with their
   measured/estimate labels, and a link to the subpage. The whole card is clickable
   *(author's call, 2026-11-06)*, but it is one link named by the title, stretched over the card;
   "Read the case" is a visual cue only, not a second link.
4. **Closing**: a short pointer to AI Delivery ("how the system behind these works") and to the
   offer, plus the standard CTAs.

### 4.2 Case subpage — the depth

Template every case follows, so a reader who has read one knows where to look in the next:

1. **At a glance** (top, always present): back link to the Wins landing, eyebrow "Case 01/02/03",
   title, summary, the key stats, and a one-line scope (scale, duration). A reader who stops here
   has the essentials.
2. **The case body** — today the existing chapter MDX, moved as is (including its diagram).
3. **Later, added by the author** (§8), sections in this order where they apply:
   *How it is built* · *Who does what* (agent / deterministic script / person, per step) ·
   *Gates that hold without AI* · *What did not work / what I would do differently* ·
   *How it would look in your company* (links to the offer).
   The template does not render empty sections; nothing is scaffolded with placeholder text.
4. **Footer**: previous/next case, back to Wins & cases, link to the offer, CTAs.

### 4.3 AI Delivery after the move

- Chapters 1–6 unchanged; **offer becomes chapter 07** (renumbered; its anchor `#offer` stays).
- Between planning and the offer, a short bridge block (not a numbered chapter) points to Wins &
  cases: one or two sentences and the three case titles as links to their subpages.
- Header lead and the landing teaser copy stop listing "three cases, results".
- Anything elsewhere linking to `ai-delivery#case-*` or `ai-delivery#results` (e.g. the landing hero
  stats) is repointed to the new pages.
- **Old anchors keep working** *(builder's call)*: the site is live and shared by link, and GitHub
  Pages cannot redirect server-side. A small inline script on AI Delivery forwards `#results`,
  `#case-persona`, `#case-a11y` and `#case-tailwind` to the matching new page in the same locale
  (`location.replace`, so the back button is not polluted). Covered by an E2E test.

### 4.4 Shared navigation

- **Rail**: a fifth item, Wins & cases, between AI Delivery and CV, with its own icon in the
  existing 24-grid line style. Case subpages mark the Wins item as current.
- **Landing *Read on***: a fourth teaser card for Wins & cases next to AI Delivery; both teasers
  rewritten so each describes its own page.
- **Journey**'s "next" links get a Wins & cases entry if it reads naturally *(builder's call)*.
- **Language switch** on a case subpage lands on the same case in the other locale.

## 5. Media on case subpages

Media sit **inline**, next to the paragraph they illustrate, never in a gallery at the end.

Components to build now (usable from MDX, localized captions via the existing pattern):

- **Figure** — a still image (screenshot, photo of a whiteboard, exported diagram). Required `alt`
  and visible caption; optimized through Astro's image pipeline from a per-case asset folder;
  legible in both themes (a framed surface behind light screenshots in dark mode); zoomable to full
  size without a lightbox dependency (a plain link to the full image is enough).
- **Clip** — short animated captures. Prefer muted `mp4`/`webm` over GIF (size, and it can be
  paused). No autoplay under `prefers-reduced-motion`; always a visible pause/play control (WCAG
  2.2.2 for anything moving longer than 5 s); a poster frame; a caption. If the author supplies a
  GIF, it is shown with a static first-frame fallback under reduced motion.
- **YouTube** — a click-to-load facade: a self-hosted thumbnail, a title and a play button; only on
  click does it insert the `youtube-nocookie.com` iframe. Nothing is requested from YouTube on page
  load. The facade states that the video opens YouTube. Captions are the author's job on the
  YouTube side; the component accepts an optional link to a transcript.

Asset location *(builder's call)*: `src/assets/wins/<case>/…`, shared by both locales; captions and
alt text are per locale.

## 6. Constraints that bite here

- **Pixels are not scanned.** The NDA gate reads text (HTML, SVG text, PDF). Screenshots and
  recordings are outside it. Allowed: the author's own tooling (terminal, local visual plans,
  workspaces, the agent setup) with no internal names, ticket keys, colleague names, repository
  names or client data visible; product examples only with the fictional brand. Alt text and
  captions are text and do go through the gate.
- Image file names and paths are public — neutral names only.
- Accessibility: every new page axe-clean in both themes; media components keyboard-operable;
  reduced motion respected; headings keep a single logical outline per page.
- EN and CS stay structurally in sync: same cases, same order, same components, same media.

## 7. Tests and checks

- Routes and the page-id list cover the new pages (unit).
- The chapter collection: AI Delivery has the seven chapters; cases are their own collection or
  are otherwise kept out of AI Delivery *(builder's call on the content model)*.
- E2E: Wins landing renders results with caveats before figures, three case cards linking to the
  subpages; each subpage renders in EN and CS with prev/next; language switch round-trips on a
  case; AI Delivery no longer contains case chapters and links to Wins; old anchors forward.
- Media components *(builder's call)*: no media ship in this change and no demo page is deployed,
  so Figure, Clip and YouTube are tested in isolation with Astro's container API in unit tests
  (required alt/caption, no YouTube URL in the facade markup before interaction, reduced-motion
  attributes on clips). The page-level checks — no request to a YouTube host before the click,
  reduced motion stops a clip, axe over real media — are added in the first PR that puts real
  media on a case page.
- The a11y suite and the NDA gate include all new pages.
- `npm run check` green before the PR.

## 8. After this change (author's work, not in scope)

Per case, the author adds depth and media in the §4.2 order. Each addition is its own small PR,
EN + CS together.

## 9. Left to the builder

- Content model (separate `cases` collection vs. moving files), file and component structure.
- Exact copy of the new connective text (headers, bridge block, teasers, card links), EN + CS;
  the author reviews it in the PR.
- The rail icon, card layout, and how the Results block is restyled outside the chapter layout.

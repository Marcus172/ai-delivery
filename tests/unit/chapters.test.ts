import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadDenylistText, parseDenylist } from "../../scripts/denylist";
import { matchesRule } from "../helpers/denylist";
import { metric } from "../../src/data/metrics";
import { LOCALES, type Locale } from "../../src/i18n/locales";

const CONTENT = join(__dirname, "../../src/content");
const ROOT = join(CONTENT, "ai-delivery");
const CHAPTER_IDS = ["principle", "flow", "tooling", "guardrails", "enablement", "planning", "offer"] as const;
const CASE_IDS = ["brand-voice", "accessibility", "tailwind", "stack", "security"] as const;

type Chapter = { file: string; id: string; order: number; title: string; summary: string; teaser?: string; body: string };

function parse(file: string, text: string): Chapter {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text);
  if (!m) throw new Error(`${file}: no frontmatter`);
  const fm: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^"(.*)"$/, "$1");
  }
  return { file, id: fm.id, order: Number(fm.order), title: fm.title, summary: fm.summary, teaser: fm.teaser, body: m[2] };
}

function chapters(locale: Locale, root = ROOT): Chapter[] {
  const dir = join(root, locale);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .sort()
    .map((f) => parse(`${locale}/${f}`, readFileSync(join(dir, f), "utf8")));
}

const BY_LOCALE = Object.fromEntries(LOCALES.map((l) => [l, chapters(l)])) as Record<Locale, Chapter[]>;
const CASES = Object.fromEntries(LOCALES.map((l) => [l, chapters(l, join(CONTENT, "cases"))])) as Record<Locale, Chapter[]>;
const RESULTS = Object.fromEntries(
  LOCALES.map((l) => [l, parse(`results/${l}.mdx`, readFileSync(join(CONTENT, "results", `${l}.mdx`), "utf8"))]),
) as Record<Locale, Chapter>;
/** Every MDX body on the site: AI Delivery chapters, case pages and Results. The copy rules hold for all of them. */
const ALL = LOCALES.flatMap((l) => [...BY_LOCALE[l], ...CASES[l], RESULTS[l]]);
const DIAGRAM_RE =
  /<(AuditShape|Steps|A11yLifecycle|A11yAgents|FlowBand|FlowLayers|ToolMap|GatesTable|RoleMatrix|DecisionTrail|PersonaPipeline|TestPyramid|MigrationBand|ResultsGrid|OfferCards|ToolLayers|Glance|Point|Facts|Fact|Detail)\b/g;
const diagrams = (c: Chapter) => [...c.body.matchAll(DIAGRAM_RE)].map((m) => m[1]);

const denylist = loadDenylistText();
const rules = denylist ? parseDenylist(denylist) : [];
const BANNED = [
  /\bratchet/i,
  /ráčn/i,
  /AI does everything/i,
  /AI dělá všechno/i,
  /10× engineer/i,
  /front[\s-]?end/i,
  /\bbank|\bbanc|\bbanka|\bbankov/i,
  /whole team (uses|runs|works in) the full flow/i,
  /celý tým (používá|jede|pracuje v) (celý|plný|plné)/i,
];

describe("ai-delivery chapters", () => {
  it("keep HTML entities out of frontmatter, which renders as escaped text (use the literal U+00A0)", () => {
    for (const c of ALL) expect(`${c.title} ${c.summary} ${c.teaser ?? ""}`, c.file).not.toMatch(/&[#\w]+;/);
  });

  it("exist for both locales, all seven", () => {
    for (const l of LOCALES) expect(BY_LOCALE[l].map((c) => c.id), l).toEqual([...CHAPTER_IDS]);
  });

  it("have identical ids and orders across locales", () => {
    const [a, b] = LOCALES.map((l) => BY_LOCALE[l].map((c) => `${c.order}:${c.id}`));
    expect(a).toEqual(b);
  });

  it("use known chapter ids, unique within a locale, with 1-based contiguous orders", () => {
    for (const l of LOCALES) {
      const cs = BY_LOCALE[l];
      expect(new Set(cs.map((c) => c.id)).size, l).toBe(cs.length);
      for (const c of cs) expect(CHAPTER_IDS as readonly string[], c.file).toContain(c.id);
      expect(cs.map((c) => c.order), l).toEqual(cs.map((_, i) => i + 1));
    }
  });

  it("file names carry the order and the id", () => {
    for (const c of LOCALES.flatMap((l) => BY_LOCALE[l])) expect(c.file).toMatch(new RegExp(`/${String(c.order).padStart(2, "0")}-${c.id}\\.mdx$`));
  });

  it("have a non-empty title and summary", () => {
    for (const c of ALL) {
      expect(c.title?.trim(), c.file).toBeTruthy();
      expect(c.summary?.trim(), c.file).toBeTruthy();
    }
  });

  it("embed the same Stat ids in the same order in both locales, and every id resolves", () => {
    const ids = (c: Chapter) => [...c.body.matchAll(/<Stat\s[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    for (const c of ALL) for (const id of ids(c)) expect(() => metric(id), `${c.file}: ${id}`).not.toThrow();
    const [en, cs] = LOCALES.map((l) => [...BY_LOCALE[l], ...CASES[l], RESULTS[l]]);
    for (const [i, c] of en.entries()) expect(ids(cs[i]), c.file).toEqual(ids(c));
  });

  it("embed the same diagrams in both locales", () => {
    const [en, cs] = LOCALES.map((l) => [...BY_LOCALE[l], ...CASES[l], RESULTS[l]]);
    for (const [i, c] of en.entries()) expect(diagrams(cs[i]), c.file).toEqual(diagrams(c));
    // Spec §5.3: every chapter has at least one diagram; a Stat is a figure, not a visual.
    for (const c of BY_LOCALE.en) expect(diagrams(c).length, `${c.id} has a diagram`).toBeGreaterThan(0);
  });

  it("contain no banned phrasing, no bank, no front-end, no over-claim", () => {
    for (const c of ALL) {
      const text = `${c.title} ${c.summary} ${c.teaser ?? ""} ${c.body}`;
      for (const re of BANNED) expect(text, `${c.file} ${re}`).not.toMatch(re);
    }
  });

  it.skipIf(!denylist)("contain no denylist term of either scope", () => {
    for (const c of ALL) {
      const text = `${c.title} ${c.summary} ${c.teaser ?? ""} ${c.body}`;
      for (const r of rules) {
        expect(matchesRule(r, text), `${c.file}: ${r.label}`).toBe(false);
      }
    }
  });

  it("state the context sentence where the setting is introduced (chapter 1)", () => {
    const en = BY_LOCALE.en.find((c) => c.id === "principle");
    expect(en?.body).toMatch(/a large product monorepo with several parallel release lines and a cross-functional team of developers, analysts and testers/);
  });

  it("use the fictional brand in the persona and accessibility examples, and only fictional rule-id prefixes", () => {
    for (const c of ALL.filter((c) => c.id === "brand-voice" || c.id === "accessibility")) {
      expect(c.body, c.file).toMatch(/Ferrylane/);
      for (const [id] of c.body.matchAll(/\b[A-Z]{2,}-[A-Z]{2,}-\d{2}\b/g)) expect(id, c.file).toMatch(/^(BRAND|BASE)-/);
    }
  });

  it("never mention a client reaction to the persona nor a squash-merge caveat", () => {
    for (const c of ALL) {
      expect(c.body, c.file).not.toMatch(/client (was|were) (pleased|happy|delighted|impressed)|klient byl (nadšen|spokojen)/i);
      expect(c.body, c.file).not.toMatch(/squash/i);
    }
  });

  it("label 5–10× as an estimate only through its metric, never inline", () => {
    for (const c of ALL) expect(c.body, c.file).not.toMatch(/5\s?[–-]\s?10\s?×/);
  });
});

describe("wins & cases content", () => {
  it("has every case in both locales, same ids and orders, file names carrying both", () => {
    for (const l of LOCALES) {
      expect(CASES[l].map((c) => c.id), l).toEqual([...CASE_IDS]);
      expect(CASES[l].map((c) => c.order), l).toEqual(CASE_IDS.map((_, i) => i + 1));
      for (const c of CASES[l]) expect(c.file).toMatch(new RegExp(`/0${c.order}-${c.id}\\.mdx$`));
    }
  });

  it("gives every case a real diagram, not a stat grid or the offer cards", () => {
    for (const c of CASES.en) {
      expect(diagrams(c).some((d) => !["ResultsGrid", "OfferCards"].includes(d)), `${c.id} has a real diagram`).toBe(true);
    }
  });

  it("lists the same resolvable highlight metrics for a case in both locales", () => {
    const highlights = (c: Chapter) => {
      const m = /^highlights:\s*\[(.*)\]\s*$/m.exec(readFileSync(join(CONTENT, "cases", c.file), "utf8"));
      return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
    };
    for (const [i, c] of CASES.en.entries()) {
      const ids = highlights(c);
      expect(ids.length, c.id).toBeGreaterThan(0);
      for (const id of ids) expect(() => metric(id), `${c.id}: ${id}`).not.toThrow();
      expect(highlights(CASES.cs[i]), c.id).toEqual(ids);
    }
  });

  it("does not repeat an at-a-glance figure in the case body", () => {
    for (const l of LOCALES)
      for (const c of CASES[l]) {
        const src = readFileSync(join(CONTENT, "cases", c.file), "utf8");
        const ids = [...(/^highlights:\s*\[(.*)\]\s*$/m.exec(src)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((x) => x[1]);
        for (const id of ids) expect(src, `${l}/${c.id}: ${id}`).not.toContain(`<Stat id="${id}"`);
      }
  });

  it("keeps Results whole: caveats, the measured grid and the estimate pointer to AI Delivery", () => {
    for (const l of LOCALES) {
      const body = RESULTS[l].body;
      expect(body.indexOf("data-caveats"), l).toBeGreaterThan(-1);
      expect(body.indexOf("<ResultsGrid"), l).toBeLessThan(body.indexOf("data-caveats"));
      expect(body, l).toMatch(/localizedPath\(locale, "ai-delivery", "principle"\)/);
    }
  });
});

import { describe, expect, it } from "vitest";
import { CV } from "../../src/data/cv";
import { JOURNEY } from "../../src/data/journey";
import {
  AS_OF,
  LANDING_METRIC_IDS,
  METRICS,
  RESULTS_CAVEAT_IDS,
  RESULTS_GROUPS,
  RESULTS_METRIC_IDS,
  metric,
} from "../../src/data/metrics";
import { OFFER } from "../../src/data/offer";
import { LOCALES } from "../../src/i18n/locales";
import { loadDenylistText, parseDenylist } from "../../scripts/denylist";
import { matchesRule } from "../helpers/denylist";
import { PHONE_PATTERNS } from "../../scripts/nda-gate";

const NBSP = "\u00a0";

const isL10n = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).sort().join() === "cs,en";

/** Every L10n object (exactly the keys en + cs) found anywhere in `value`, with its path. */
function collectL10n(value: unknown, path = "$"): { path: string; v: Record<string, unknown> }[] {
  if (isL10n(value)) return [{ path, v: value }];
  if (Array.isArray(value)) return value.flatMap((x, i) => collectL10n(x, `${path}[${i}]`));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, x]) => collectL10n(x, `${path}.${k}`));
  return [];
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectStrings);
  return [];
}

const denylist = loadDenylistText();
const rules = denylist ? parseDenylist(denylist) : [];
const cvOnly = rules.filter((r) => r.scope === "cv-only");
const never = rules.filter((r) => r.scope === "never");

const BANNED = [/\bratchet/i, /ráčn/i, /AI does everything/i, /10× engineer/i, /AI dělá všechno/i];
const BANK = /bank/i;

describe("metrics", () => {
  it("landing ids resolve to measured metrics with the decided values", () => {
    const m = LANDING_METRIC_IDS.map((id) => metric(id));
    expect(m.map((x) => x.kind)).toEqual(["measured", "measured", "measured"]);
    expect(m.map((x) => x.value.en)).toEqual(["−70 %", "1 % → 56 %", "2,423 / 18"]);
    expect(m.map((x) => x.value.cs)).toEqual([
      `−70${NBSP}%`,
      `1${NBSP}% → 56${NBSP}%`,
      `2${NBSP}423 / 18`,
    ]);
  });

  it("count figures never read as a drop", () => {
    for (const id of ["a11y-patterns", "a11y-fix-reach"]) {
      expect(metric(id).value.en, id).not.toContain("→");
      expect(metric(id).value.cs, id).not.toContain("→");
    }
  });

  it("five-to-ten-x is an estimate and never part of a measured set", () => {
    const m = metric("five-to-ten-x");
    expect(m.kind).toBe("estimate");
    expect(m.value.en).toBe("5–10×");
    const sets: readonly string[] = [...LANDING_METRIC_IDS, ...RESULTS_METRIC_IDS, ...RESULTS_CAVEAT_IDS];
    expect(sets).not.toContain("five-to-ten-x");
    for (const id of sets) expect(metric(id).kind).toBe("measured");
  });

  it("every metric has a non-empty period in both locales and ids are unique", () => {
    for (const m of METRICS) for (const l of LOCALES) expect(m.period[l].trim(), m.id).not.toBe("");
    expect(new Set(METRICS.map((m) => m.id)).size).toBe(METRICS.length);
  });

  it("the stack-drift period starts where its 6 years count from (the package manager's successor, January 2020)", () => {
    const m = metric("stack-drift");
    expect(m.value.en).toBe("6 years");
    expect(m.period.en).toBe("repository history · January 2020 → May 2026");
    expect(m.period.cs).toBe("historie repozitáře · leden 2020 → květen 2026");
  });

  it("metric() throws on an unknown id", () => {
    expect(() => metric("no-such-metric")).toThrow();
  });

  it("results open with the sturdiest figure and keep the process measures last", () => {
    expect(RESULTS_GROUPS.map((g) => g.id)).toEqual(["speed", "quality", "process"]);
    expect(RESULTS_METRIC_IDS[0]).toBe("in-progress-to-pr");
    expect(new Set(RESULTS_METRIC_IDS).size).toBe(RESULTS_METRIC_IDS.length);
  });

  it("lead time and returns from test exist only as caveated results metrics", () => {
    for (const id of ["lead-time", "returns-from-test"]) {
      expect(RESULTS_METRIC_IDS as readonly string[]).toContain(id);
      expect(LANDING_METRIC_IDS as readonly string[]).not.toContain(id);
      expect(metric(id).caveat?.en, id).toBeTruthy();
    }
    expect(metric("lead-time").value.en).toBe("−57 %");
    expect(metric("returns-from-test").value.en).toBe("21 % → 11 %");
  });

  it("results caveat set covers team size, author share and tracker scope", () => {
    expect([...RESULTS_CAVEAT_IDS]).toEqual(["team-size", "author-pr-share", "tracker-scope"]);
    expect(metric("team-size").value.en).toBe("4–6 → 2–3");
    for (const id of RESULTS_CAVEAT_IDS) expect(metric(id).caveat?.en, id).toBeTruthy();
  });

  it("persona figures are rounded and no exact persona count appears anywhere", () => {
    expect(metric("persona-findings").value.en).toBe("~900 → ~700");
    expect(metric("persona-strings").value.en).toBe("~4,500");
    expect(metric("persona-strings").value.cs).toBe(`~4${NBSP}500`);
    for (const s of collectStrings({ METRICS, CV, JOURNEY, OFFER }))
      for (const re of [/902/, /710/, /4,45/, /4[\s\u00a0]45/]) expect(s, String(re)).not.toMatch(re);
  });

  it("author-pr-share caveat makes no squash-merge claim", () => {
    const c = metric("author-pr-share").caveat;
    expect(c?.en).toBeTruthy();
    for (const l of LOCALES) expect(c?.[l]).not.toMatch(/squash/i);
  });

  it("has no per-colleague productivity multiplier", () => {
    expect(() => metric("same-developer-prs")).toThrow();
    expect(RESULTS_METRIC_IDS as readonly string[]).not.toContain("same-developer-prs");
  });

  it("as-of date is November 2026", () => {
    expect(AS_OF.en).toMatch(/November 2026/);
    expect(AS_OF.cs).toMatch(/listopadu 2026/);
  });
});

describe("all data modules", () => {
  const modules = { METRICS, CV, JOURNEY, OFFER, AS_OF };

  it("every L10n has both locales non-empty", () => {
    const all = collectL10n(modules);
    expect(all.length).toBeGreaterThan(100);
    for (const { path, v } of all)
      for (const l of LOCALES) {
        expect(typeof v[l], `${path}.${l}`).toBe("string");
        expect((v[l] as string).trim(), `${path}.${l}`).not.toBe("");
      }
  });

  it("contain no banned phrasing", () => {
    for (const s of collectStrings(modules)) for (const re of BANNED) expect(s, String(re)).not.toMatch(re);
  });

  it.skipIf(!denylist)("contain no never-scope denylist term", () => {
    for (const s of collectStrings(modules)) for (const r of never) expect(matchesRule(r, s), r.label).toBe(false);
  });

  it.skipIf(!denylist)("metrics, offer and journey hold no cv-only term (they render outside the CV page)", () => {
    for (const s of collectStrings({ METRICS, OFFER, JOURNEY, AS_OF }))
      for (const r of cvOnly) expect(matchesRule(r, s), r.label).toBe(false);
  });

  it("metrics and offer never mention a bank (they render on AI Delivery and Landing)", () => {
    for (const s of collectStrings({ METRICS, OFFER, AS_OF })) expect(s).not.toMatch(BANK);
  });
});

describe("offer", () => {
  it("has three cards with unique ids", () => {
    expect(OFFER).toHaveLength(3);
    expect(new Set(OFFER.map((o) => o.id)).size).toBe(3);
  });
});

describe("cv", () => {
  it("leads with the current role", () => {
    const r = CV.roles[0];
    // The real names live only in cv.ts and render only on the CV page; the NDA gate checks the build.
    expect(r.company.trim()).not.toBe("");
    expect(r.client?.trim()).toBeTruthy();
    expect(r.title.en).toBe("Product Engineering & AI Lead");
    expect(r.from).toBe("2026-04");
    expect(r.to).toBeNull();
    expect(CV.headline.en).toBe("Senior Product Engineer");
  });

  it("keeps the current role summary generic: no figures next to the client name", () => {
    for (const l of LOCALES) expect(CV.roles[0].summary[l]).not.toMatch(/\d/);
  });

  it("lists roles newest first with YYYY-MM dates", () => {
    const ym = /^\d{4}-(0[1-9]|1[0-2])$/;
    for (const r of CV.roles) {
      expect(r.from).toMatch(ym);
      if (r.to !== null) {
        expect(r.to).toMatch(ym);
        expect(r.to >= r.from).toBe(true);
      }
    }
    const froms = CV.roles.map((r) => r.from);
    expect(froms).toEqual([...froms].sort().reverse());
    expect(CV.roles.at(-1)?.from).toBe("2014-08");
  });

  it("contains no phone number", () => {
    for (const s of collectStrings(CV)) {
      for (const p of PHONE_PATTERNS) expect(s).not.toMatch(p);
      expect(s).not.toMatch(/(\d[\s-]?){9,}/);
    }
  });

  it("has the public contact only", () => {
    expect(CV.contact).toEqual({
      email: "marek.marcus.rom@gmail.com",
      linkedin: "https://www.linkedin.com/in/marek-rom-a91445b8",
      github: "https://github.com/Marcus172",
      site: "https://marcus172.github.io/ai-delivery/",
    });
  });

  it("never calls him front-end outside factual historical titles", () => {
    const copy = [CV.headline, CV.profile, ...CV.roles.map((r) => r.summary)].flatMap(collectStrings);
    for (const s of copy) expect(s).not.toMatch(/front[\s-]?end/i);
    expect(CV.roles[0].title.en).not.toMatch(/front[\s-]?end/i);
  });
});

describe("journey", () => {
  const is2026 = (d: string) => d.startsWith("2026-");

  it("weights entries by date: compact before 2024-01, expanded from it", () => {
    for (const m of JOURNEY) {
      expect(m.date).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      expect(m.weight, m.date).toBe(m.date < "2024-01" ? "compact" : "expanded");
    }
  });

  it("is chronological, starts in 2014 and covers 2026 month by month", () => {
    const dates = JOURNEY.map((m) => m.date);
    expect(dates).toEqual([...dates].sort());
    expect(dates[0].startsWith("2014")).toBe(true);
    const months = new Set(dates.filter(is2026).map((d) => d.slice(5)));
    for (const mm of ["04", "06", "07", "08", "09", "10", "11"]) expect(months.has(mm), mm).toBe(true);
  });

  it("2026 entries never refer to a bank or say front-end", () => {
    for (const s of collectStrings(JOURNEY.filter((m) => is2026(m.date)))) {
      expect(s).not.toMatch(BANK);
      expect(s).not.toMatch(/front[\s-]?end/i);
    }
  });

  it.skipIf(!denylist)("2026 entries contain no cv-only denylist term", () => {
    for (const s of collectStrings(JOURNEY.filter((m) => is2026(m.date))))
      for (const r of cvOnly) expect(matchesRule(r, s), r.label).toBe(false);
  });
});


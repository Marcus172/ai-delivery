import { describe, expect, it } from "vitest";
import { AREAS, MONTHS, WINS, winPeriod, winsIn } from "../../src/data/alongTheWay";
import { metric } from "../../src/data/metrics";
import { LOCALES } from "../../src/i18n/locales";

describe("along the way: the smaller wins", () => {
  it("has unique ids, a known area, a period on the axis and copy in both locales", () => {
    const ids = WINS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of WINS) {
      expect(AREAS.map((a) => a.id), w.id).toContain(w.area);
      expect(w.from, w.id).toBeGreaterThanOrEqual(0);
      expect(w.to, w.id).toBeGreaterThanOrEqual(w.from);
      expect(w.to, w.id).toBeLessThan(MONTHS.length);
      expect(w.who.length, w.id).toBeGreaterThan(0);
      for (const l of LOCALES) {
        for (const s of [w.title, w.short, w.text]) expect(s[l].trim(), `${w.id} ${l}`).not.toBe("");
        expect(winPeriod(w, l), `${w.id} ${l}`).toMatch(/2026$/);
      }
    }
  });

  it("backs every figure with a labelled metric", () => {
    for (const w of WINS.filter((x) => x.metric)) {
      const m = metric(w.metric as string);
      expect(["measured", "estimate"], w.id).toContain(m.kind);
      for (const l of LOCALES) expect(m.period[l].trim(), `${w.id} ${l}`).not.toBe("");
    }
  });

  it("lists every area with at least two wins, in time order", () => {
    for (const a of AREAS) {
      const ws = winsIn(a.id);
      expect(ws.length, a.id).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < ws.length; i++) expect(ws[i].from, a.id).toBeGreaterThanOrEqual(ws[i - 1].from);
    }
  });
});

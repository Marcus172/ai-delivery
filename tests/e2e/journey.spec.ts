import { expect, test } from "@playwright/test";
import { loadDenylistText, parseDenylist } from "../../scripts/denylist";
import { matchesRule } from "../helpers/denylist";
import { JOURNEY } from "../../src/data/journey";
import { LOCALES, type Locale } from "../../src/i18n/locales";

const URL: Record<Locale, string> = { en: "journey/", cs: "cs/journey/" };
const MONTHS_2026 = ["04", "06", "07", "08", "09", "10", "11"];
const denylist = loadDenylistText();
const cvOnly = denylist ? parseDenylist(denylist).filter((r) => r.scope === "cv-only") : [];

for (const locale of LOCALES) {
  test.describe(`journey page (${locale})`, () => {
    test("renders every milestone in order as an ordered list with machine-readable dates", async ({ page }) => {
      await page.goto(URL[locale]);
      const items = page.locator("[data-milestone]");
      await expect(items).toHaveCount(JOURNEY.length);
      for (const [i, m] of JOURNEY.entries()) {
        const li = items.nth(i);
        await expect(li).toHaveAttribute("data-date", m.date);
        await expect(li).toHaveAttribute("data-weight", m.weight);
        await expect(li.locator(`time[datetime="${m.date}"]`)).toHaveCount(1);
        await expect(li).toContainText(m.title[locale]);
        await expect(li).toContainText(m.body[locale]);
      }
      // every milestone is a list item of an ordered list
      await expect(page.locator("ol > li[data-milestone]")).toHaveCount(JOURNEY.length);
    });

    test("starts in 2014 as a compact strip; everything from 2024 on is expanded", async ({ page }) => {
      await page.goto(URL[locale]);
      const first = page.locator("[data-milestone]").first();
      await expect(first).toHaveAttribute("data-date", /^2014-/);
      await expect(first).toHaveAttribute("data-weight", "compact");
      await expect(first).toContainText("2014");
      const expanded = page.locator("[data-milestone][data-weight=expanded]");
      const dates = await expanded.evaluateAll((els) => els.map((el) => el.getAttribute("data-date")));
      expect(dates.length).toBeGreaterThan(0);
      for (const d of dates) expect(d >= "2024-01").toBe(true);
      const compactLate = page.locator("[data-milestone][data-weight=compact]").filter({ has: page.locator('time[datetime^="202"]') });
      const late = await compactLate.evaluateAll((els) => els.map((el) => el.getAttribute("data-date")).filter((d) => d && d >= "2024-01"));
      expect(late).toEqual([]);
    });

    test("groups 2026 under one band with month labels", async ({ page }) => {
      await page.goto(URL[locale]);
      const band = page.locator("[data-band='2026']");
      await expect(band).toHaveCount(1);
      await expect(band.locator("ol > li[data-milestone]")).toHaveCount(JOURNEY.filter((m) => m.date.startsWith("2026-")).length);
      for (const mm of MONTHS_2026) {
        const entry = band.locator(`[data-milestone][data-date="2026-${mm}"]`);
        await expect(entry).toHaveCount(1);
        await expect(entry.locator(`time[datetime="2026-${mm}"]`)).toBeVisible();
      }
      // no 2026 milestone outside the band
      await expect(page.locator("[data-milestone][data-date^='2026-']")).toHaveCount(await band.locator("[data-milestone]").count());
    });

    test("the 2026 band never names a bank; the page carries no cv-only term", async ({ page }) => {
      await page.goto(URL[locale]);
      const bandText = await page.locator("[data-band='2026']").innerText();
      expect(bandText).not.toMatch(/bank|banc/i);
      const html = await page.locator("main").innerHTML();
      for (const rule of cvOnly) expect(matchesRule(rule, html), rule.label).toBe(false);
      expect(html).not.toMatch(/front-?end/i);
      expect(html).not.toMatch(/\bratchet\b|ráčn/i);
    });

    test("has an intro and closes with links to AI Delivery and the CV", async ({ page }) => {
      await page.goto(URL[locale]);
      const main = page.locator("main");
      await expect(main.locator("h1")).toHaveCount(1);
      await expect(main.locator("[data-journey-intro]")).toBeVisible();
      const prefix = locale === "cs" ? "/ai-delivery/cs/" : "/ai-delivery/";
      await expect(main.locator(`[data-journey-next] a[href="${prefix}ai-delivery/"]`)).toHaveCount(1);
      await expect(main.locator(`[data-journey-next] a[href="${prefix}cv/"]`)).toHaveCount(1);
    });

    test("no horizontal scroll at phone width and no running animation under reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(URL[locale]);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const animated = await page.evaluate(() => document.getAnimations().length);
      expect(animated).toBe(0);
    });
  });
}

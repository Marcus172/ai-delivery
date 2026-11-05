import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** All 8 pages, relative to the base URL. */
const PAGES = [
  "",
  "journey/",
  "ai-delivery/",
  "wins/",
  "wins/brand-voice/",
  "wins/accessibility/",
  "wins/tailwind/",
  "cv/",
  "cs/",
  "cs/journey/",
  "cs/ai-delivery/",
  "cs/wins/",
  "cs/wins/brand-voice/",
  "cs/wins/accessibility/",
  "cs/wins/tailwind/",
  "cs/cv/",
];
const THEMES = ["light", "dark"] as const;
const TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];

for (const url of PAGES) {
  test.describe(`a11y ${url || "/"}`, () => {
    for (const theme of THEMES) {
      test(`passes axe WCAG 2.2 AA in the ${theme} theme`, async ({ page }) => {
        await page.addInitScript((t) => {
          try {
            localStorage.setItem("theme", t);
          } catch {}
        }, theme);
        await page.goto(url);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        // Open the collapsible TOC so its links are checked too (it is closed by default below 1100 px).
        await page.locator("details[data-toc-details]").evaluateAll((els) => {
          for (const d of els) (d as HTMLDetailsElement).open = true;
        });
        const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        const report = results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => n.html.slice(0, 160)),
        }));
        expect(report).toEqual([]);
      });
    }

    test("does not scroll horizontally at 360 px", async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true });
      const page = await context.newPage();
      await page.goto(url);
      await page.locator("details[data-toc-details]").evaluateAll((els) => {
        for (const d of els) (d as HTMLDetailsElement).open = true;
      });
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width).toBeLessThanOrEqual(360);
      // Wide diagrams scroll inside their own box, which must be reachable by keyboard (WCAG 2.1.1).
      const boxes = page.locator(".scroll");
      const n = await boxes.count();
      for (let i = 0; i < n; i++) {
        const box = boxes.nth(i);
        const scrolls = await box.evaluate((el) => el.scrollWidth > el.clientWidth);
        if (!scrolls) continue;
        await expect(box).toHaveAttribute("tabindex", "0");
        await expect(box).toHaveAttribute("role", "region");
        expect(((await box.getAttribute("aria-label")) ?? "").length).toBeGreaterThan(3);
      }
      await context.close();
    });

    test("headings do not skip a level", async ({ page }) => {
      await page.goto(url);
      const levels = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
      expect(levels[0]).toBe(1);
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i] - levels[i - 1], `heading ${i}: h${levels[i - 1]} → h${levels[i]}`).toBeLessThanOrEqual(1);
      }
    });
  });
}

test("journey card dates read as year and month, not run together", async ({ page }) => {
  await page.goto("journey/");
  const times = page.locator("[data-era=recent] time");
  expect(await times.count()).toBeGreaterThan(0);
  for (const text of await times.allTextContents()) {
    expect(text.trim()).toMatch(/^\d{4}\s+\S/);
  }
});

test("language switch screen-reader suffix is marked with the page language", async ({ page }) => {
  await page.goto("");
  const sr = page.locator("a[data-lang-switch] .sr");
  await expect(sr).toHaveAttribute("lang", "en");
  await page.goto("cs/");
  await expect(page.locator("a[data-lang-switch] .sr")).toHaveAttribute("lang", "cs");
});

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { loadDenylistText, parseDenylist } from "../../scripts/denylist";
import { matchesRule } from "../helpers/denylist";
import { LOCALES, type Locale } from "../../src/i18n/locales";
import { t } from "../../src/i18n/ui";

const PREFIX: Record<Locale, string> = { en: "/ai-delivery/", cs: "/ai-delivery/cs/" };
const WINS: Record<Locale, string> = { en: "wins/", cs: "cs/wins/" };
const CASES = ["brand-voice", "accessibility", "tailwind", "stack", "security"] as const;
/** The fictional brand used for every persona and accessibility example. */
const FICTIONAL_BRAND = "Ferrylane";
const denylist = loadDenylistText();
const cvOnly = denylist ? parseDenylist(denylist).filter((r) => r.scope === "cv-only") : [];

for (const locale of LOCALES) {
  const caseUrl = (id: string) => `${WINS[locale]}${id}/`;

  test.describe(`wins & cases (${locale})`, () => {
    test("has one h1, results before the cases, and the rail marks Wins as the current page", async ({ page }) => {
      await page.goto(WINS[locale]);
      await expect(page.locator("main h1")).toHaveCount(1);
      const order = await page.locator("main section[id]").evaluateAll((els) => els.map((el) => el.id));
      expect(order.indexOf("results")).toBeLessThan(order.indexOf("cases"));
      await expect(page.locator(`nav.rail a[href="${PREFIX[locale]}wins/"]`)).toHaveAttribute("aria-current", "page");
    });

    test("results: figures come before their context, every measured figure has a period, the estimate stays apart", async ({ page }) => {
      await page.goto(WINS[locale]);
      const results = page.locator("section#results");
      const caveats = results.locator("[data-caveats]");
      await expect(caveats).toHaveCount(1);
      expect(await caveats.locator("li").count()).toBeGreaterThanOrEqual(4);
      const grid = results.locator("[data-diagram=results-grid]");
      await expect(grid).toHaveCount(1);
      const follows = (a: string, b: string) =>
        page.evaluate(
          ([x, y]) => {
            const ea = document.querySelector(x);
            const eb = document.querySelector(y);
            return !!ea && !!eb && !!(ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING);
          },
          [a, b],
        );
      expect(await follows("[data-diagram=results-grid]", "[data-caveats]")).toBe(true);
      expect(await follows("[data-diagram=results-grid]", "[data-metric=marketplace-contributors]")).toBe(true);
      expect(await follows("[data-metric=marketplace-contributors]", "[data-caveats]")).toBe(true);
      for (const id of ["results", "cases", "along-the-way"]) await expect(page.locator(`header.head a[href="#${id}"]`)).toHaveCount(1);
      const measured = results.locator(".stat[data-kind=measured]");
      expect(await measured.count()).toBeGreaterThanOrEqual(8);
      for (let i = 0; i < (await measured.count()); i++) await expect(measured.nth(i).locator(".period")).toBeVisible();
      const metricCaveats = caveats.locator("li[data-metric]");
      expect(await metricCaveats.count()).toBeGreaterThan(0);
      for (let i = 0; i < (await metricCaveats.count()); i++) await expect(metricCaveats.nth(i).locator(".period")).toBeVisible();
      // The estimate is shown, but only in its own block, apart from the measured set.
      const estimate = results.locator("[data-estimate]");
      await expect(results.locator(".stat[data-kind=estimate]")).toHaveCount(1);
      await expect(estimate.locator(".stat[data-kind=estimate]")).toContainText(/5\s?[–-]\s?10\s?×/);
      await expect(estimate.locator(".stat[data-kind=estimate] small")).toHaveText(t(locale, "badge.estimate"));
      await expect(estimate.locator(`a[href="${PREFIX[locale]}ai-delivery/#principle"]`)).toHaveCount(1);
    });

    test("the case cards in order, each linking to its case page, with labelled highlights", async ({ page }) => {
      await page.goto(WINS[locale]);
      const cards = page.locator("[data-case-cards] > li[data-case]");
      await expect(cards).toHaveCount(CASES.length);
      for (const [i, id] of CASES.entries()) {
        const card = cards.nth(i);
        await expect(card).toHaveAttribute("data-case", id);
        await expect(card.locator(`h3 a[href="${PREFIX[locale]}wins/${id}/"]`)).toHaveCount(1);
        // One link per card, named by the title; it covers the whole card.
        await expect(card.locator("a")).toHaveCount(1);
        const stats = card.locator(".stat");
        expect(await stats.count(), id).toBeGreaterThan(0);
        for (let j = 0; j < (await stats.count()); j++) {
          expect([t(locale, "badge.measured"), t(locale, "badge.estimate")]).toContain((await stats.nth(j).locator("small").textContent())?.trim());
        }
      }
    });

    test("the smaller wins: a card under the cases leads to a map whose every chip opens its card", async ({ page }) => {
      await page.goto(WINS[locale]);
      const more = page.locator("[data-more-wins]");
      await expect(more.locator("a")).toHaveCount(1);
      await more.locator("a").click();
      await expect(page).toHaveURL(new RegExp(`${PREFIX[locale]}wins/along-the-way/$`));
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.locator(`nav.rail a[href="${PREFIX[locale]}wins/"]`)).toHaveAttribute("aria-current", "true");
      const cards = page.locator("[data-win]");
      const n = await cards.count();
      expect(n).toBeGreaterThan(10);
      await expect(page.locator("[data-win-link]")).toHaveCount(n);
      for (const id of await page.locator("[data-win-link]").evaluateAll((els) => els.map((e) => e.getAttribute("data-win-link"))))
        await expect(page.locator(`#win-${id}`)).toHaveCount(1);
      await expect(page.locator("[data-atw-count] b").first()).toHaveText(String(n));
      for (const stat of await page.locator("[data-win] .stat[data-kind=measured]").all()) await expect(stat.locator(".period")).toBeVisible();
    });

    test("a click anywhere on a case card opens the case", async ({ page }) => {
      await page.goto(WINS[locale]);
      // A real mouse click on the stats: the title link's overlay covers them, so it takes the click.
      const stats = page.locator("[data-case-cards] > li").nth(1).locator(".card-stats");
      await stats.scrollIntoViewIfNeeded();
      const box = await stats.boundingBox();
      if (!box) throw new Error("case card stats not rendered");
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(page).toHaveURL(new RegExp(`${PREFIX[locale]}wins/${CASES[1]}/$`));
    });

    for (const [i, id] of CASES.entries()) {
      test(`case ${id}: at a glance, its diagram, pager and the way back`, async ({ page }) => {
        await page.goto(caseUrl(id));
        await expect(page.locator("main h1")).toHaveCount(1);
        await expect(page.locator("[data-case-number]")).toContainText(String(i + 1).padStart(2, "0"));
        expect(await page.locator("[data-case-glance] .stat").count()).toBeGreaterThan(0);
        for (const stat of await page.locator("[data-case-glance] .stat[data-kind=measured]").all())
          await expect(stat.locator(".period")).toBeVisible();
        expect(await page.locator("main [data-diagram]").count()).toBeGreaterThan(0);
        await expect(page.locator(`main a[href="${PREFIX[locale]}wins/#cases"]`)).toHaveCount(1);
        // The section stays marked in the rail, but this page is not the section page itself.
        await expect(page.locator(`nav.rail a[href="${PREFIX[locale]}wins/"]`)).toHaveAttribute("aria-current", "true");
        const prev = page.locator('nav.pager a[rel="prev"]');
        const next = page.locator('nav.pager a[rel="next"]');
        await expect(prev).toHaveCount(i > 0 ? 1 : 0);
        await expect(next).toHaveCount(i < CASES.length - 1 ? 1 : 0);
        if (i > 0) await expect(prev).toHaveAttribute("href", `${PREFIX[locale]}wins/${CASES[i - 1]}/`);
        if (i < CASES.length - 1) await expect(next).toHaveAttribute("href", `${PREFIX[locale]}wins/${CASES[i + 1]}/`);
        else await expect(page.locator(`nav.pager a[href="${PREFIX[locale]}ai-delivery/#offer"]`)).toHaveCount(1);
      });
    }

    test("a case screenshot zooms in a dialog that fits the viewport and closes by Esc and by its button", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(caseUrl("brand-voice"));
      const figure = page.locator("figure[data-media=figure]").first();
      const dialog = figure.locator("dialog[data-zoom]");
      await figure.locator("a.frame").click();
      await expect(dialog).toBeVisible();
      const img = dialog.locator("img");
      await expect(img).toBeVisible();
      await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
      const box = await img.boundingBox();
      expect(box && box.y + box.height).toBeLessThanOrEqual(800);
      expect(box && box.x + box.width).toBeLessThanOrEqual(1280);
      const a11y = await new AxeBuilder({ page }).include("dialog[data-zoom][open]").analyze();
      expect(a11y.violations.map((v) => v.id)).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await figure.locator("a.frame").click();
      await dialog.locator("[data-close]").click();
      await expect(dialog).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`${caseUrl("brand-voice")}$`));
    });

    test("persona and accessibility examples use the fictional brand only", async ({ page }) => {
      for (const id of ["brand-voice", "accessibility"]) {
        await page.goto(caseUrl(id));
        expect(await page.locator("main .example").count(), id).toBeGreaterThan(0);
        const text = (await page.locator("main").textContent()) ?? "";
        expect(text, id).toContain(FICTIONAL_BRAND);
        for (const rule of cvOnly) expect(matchesRule(rule, text), rule.label).toBe(false);
      }
    });

    test("say front-end only inside the tracker-scope caveat", async ({ page }) => {
      for (const url of [WINS[locale], ...CASES.map(caseUrl)]) {
        await page.goto(url);
        const text = (await page.locator("main").textContent()) ?? "";
        const caveat = (await page.locator("[data-metric=tracker-scope]").allTextContents()).join("");
        expect(text.replace(caveat, ""), url).not.toMatch(/front[-\s]?end/i);
      }
    });

    test("name no bank, no client industry, no cv-only term, no banned words", async ({ page }) => {
      for (const url of [WINS[locale], ...CASES.map(caseUrl)]) {
        await page.goto(url);
        const html = await page.content();
        expect(html, url).not.toMatch(/bank|banc/i);
        expect(html, url).not.toMatch(/ratchet|ráčn/i);
        expect(html, url).not.toMatch(/AI does everything|AI dělá všechno|10× engineer/i);
        for (const rule of cvOnly) expect(matchesRule(rule, html), `${url}: ${rule.label}`).toBe(false);
      }
    });

    test("nothing overflows sideways at 360 px", async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      for (const url of [WINS[locale], ...CASES.map(caseUrl)]) {
        await page.goto(url);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, url).toBeLessThanOrEqual(0);
      }
    });

    test("no running animations under reduced motion", async ({ browser }) => {
      const reduced = await browser.newContext({ reducedMotion: "reduce" });
      const page = await reduced.newPage();
      for (const url of [WINS[locale], ...CASES.map(caseUrl)]) {
        await page.goto(url);
        await page.waitForTimeout(200);
        expect(await page.evaluate(() => document.getAnimations().length), url).toBe(0);
      }
      await reduced.close();
    });

    for (const theme of ["light", "dark"] as const) {
      test(`text contrast passes WCAG AA in the ${theme} theme (axe color-contrast)`, async ({ page }) => {
        await page.addInitScript((th) => {
          try {
            localStorage.setItem("theme", th);
          } catch {}
        }, theme);
        for (const url of [WINS[locale], ...CASES.map(caseUrl)]) {
          await page.goto(url);
          await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
          const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
          expect(
            results.violations.map((v) => v.nodes.map((n) => n.html)),
            url,
          ).toEqual([]);
        }
      });
    }
  });
}

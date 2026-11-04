import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { loadDenylistText, parseDenylist } from "../../scripts/denylist";
import { matchesRule } from "../helpers/denylist";
import { LOCALES, type Locale } from "../../src/i18n/locales";
import { t } from "../../src/i18n/ui";

const URL: Record<Locale, string> = { en: "ai-delivery/", cs: "cs/ai-delivery/" };
const CHAPTERS_1_6 = ["principle", "flow", "tooling", "guardrails", "enablement", "planning"];
const CHAPTERS_7_11 = ["case-persona", "case-a11y", "case-tailwind", "results", "offer"];
const ALL_CHAPTERS = [...CHAPTERS_1_6, ...CHAPTERS_7_11];
/** The fictional brand used for every persona and accessibility example. */
const FICTIONAL_BRAND = "Ferrylane";
const denylist = loadDenylistText();
const cvOnly = denylist ? parseDenylist(denylist).filter((r) => r.scope === "cv-only") : [];

for (const locale of LOCALES) {
  const measured = t(locale, "badge.measured");
  const estimate = t(locale, "badge.estimate");

  test.describe(`ai-delivery (${locale})`, () => {
    test("has one h1 and chapters 1–6 as sections with eyebrow number and h2, in order", async ({ page }) => {
      await page.goto(URL[locale]);
      await expect(page.locator("main h1")).toHaveCount(1);
      const sections = page.locator("main section[data-chapter]");
      const ids = await sections.evaluateAll((els) => els.map((el) => el.id));
      expect(ids.slice(0, 6)).toEqual(CHAPTERS_1_6);
      for (const [i, id] of CHAPTERS_1_6.entries()) {
        const s = page.locator(`section#${id}`);
        await expect(s.locator("h2")).toHaveCount(1);
        await expect(s.locator("[data-chapter-number]")).toContainText(String(i + 1));
      }
    });

    test("TOC lists chapters 1–6 in order and each link scrolls to its section", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(URL[locale]);
      const toc = page.locator("nav[data-toc]:visible");
      await expect(toc).toHaveCount(1);
      const links = toc.locator("a");
      const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")));
      expect(hrefs.slice(0, 6)).toEqual(CHAPTERS_1_6.map((id) => `#${id}`));
      for (const id of CHAPTERS_1_6) {
        await toc.locator(`a[href="#${id}"]`).click();
        await expect(page).toHaveURL(new RegExp(`#${id}$`));
        // scroll-behavior is smooth: wait for the section to settle near the top.
        await expect
          .poll(() => page.locator(`section#${id}`).evaluate((el) => el.getBoundingClientRect().top), { message: id })
          .toBeLessThan(200);
        const top = await page.locator(`section#${id}`).evaluate((el) => el.getBoundingClientRect().top);
        expect(top, id).toBeGreaterThanOrEqual(-1);
      }
    });

    test("TOC is sticky on wide screens and a collapsible details below 1100 px", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(URL[locale]);
      const wide = page.locator("nav[data-toc]:visible");
      expect(await wide.evaluate((el) => getComputedStyle(el.closest("[data-toc-wrap]") ?? el).position)).toBe("sticky");
      await page.setViewportSize({ width: 1000, height: 900 });
      const details = page.locator("details[data-toc-details]:visible");
      await expect(details).toHaveCount(1);
      await expect(details.locator("nav[data-toc]")).toHaveCount(1);
    });

    test("language switch from a chapter anchor keeps the anchor", async ({ page }) => {
      await page.goto(`${URL[locale]}#guardrails`);
      const other = locale === "en" ? "/cs/ai-delivery/#guardrails" : "/ai-delivery/#guardrails";
      const link = page.locator("a[data-lang-switch]");
      await expect(link).toHaveAttribute("href", new RegExp(`${other.replace(/[/#]/g, "\\$&")}$`));
    });

    test("every Stat shows a measured or estimate badge, and 5–10× is the only estimate", async ({ page }) => {
      await page.goto(URL[locale]);
      const stats = page.locator("main .stat");
      const n = await stats.count();
      expect(n).toBeGreaterThanOrEqual(8);
      for (let i = 0; i < n; i++) {
        const badge = stats.nth(i).locator("small").first();
        await expect(badge).toBeVisible();
        const text = (await badge.textContent())?.trim();
        expect([measured, estimate]).toContain(text);
      }
      const estimates = page.locator("main .stat[data-kind=estimate]");
      await expect(estimates).toHaveCount(1);
      await expect(estimates).toContainText("5–10×");
    });

    test("diagrams are accessible images with localized titles; wide ones scroll in their own box", async ({ page }) => {
      await page.goto(URL[locale]);
      for (const name of ["flow-layers", "tool-map", "role-matrix", "decision-trail"]) {
        const svg = page.locator(`svg[data-diagram="${name}"]`);
        await expect(svg).toHaveCount(1);
        await expect(svg).toHaveAttribute("role", "img");
        const title = (await svg.locator("title").textContent())?.trim() ?? "";
        const desc = (await svg.locator("desc").textContent())?.trim() ?? "";
        expect(title.length, name).toBeGreaterThan(10);
        expect(desc.length, name).toBeGreaterThan(20);
        if (locale === "cs") expect(`${title} ${desc}`).toMatch(/[ěščřžýáíéůú]/);
      }
      await expect(page.locator("table[data-diagram=gates-table]")).toHaveCount(1);
      await expect(page.locator("table[data-diagram=gates-table] tbody tr")).toHaveCount(8);
      await page.setViewportSize({ width: 360, height: 800 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    for (const width of [390, 1000, 1440]) {
      test(`diagram text renders at 11 px or larger at ${width} px`, async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        const page = await context.newPage();
        await page.goto(URL[locale]);
        const sizes = await page.locator("svg[data-diagram] text").evaluateAll((els) =>
          els.map((el) => {
            const svg = (el as SVGTextElement).ownerSVGElement as SVGSVGElement;
            const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
            return parseFloat(getComputedStyle(el).fontSize) * scale;
          }),
        );
        expect(sizes.length).toBeGreaterThan(10);
        for (const s of sizes) expect(s, `${width}px`).toBeGreaterThanOrEqual(11);
        await context.close();
      });
    }

    test("no running animations under reduced motion; the tool map draws when motion is allowed", async ({ browser }) => {
      const reduced = await browser.newContext({ reducedMotion: "reduce" });
      const p1 = await reduced.newPage();
      await p1.goto(URL[locale]);
      await p1.locator("svg[data-diagram=tool-map]").scrollIntoViewIfNeeded();
      await p1.waitForTimeout(300);
      expect(await p1.evaluate(() => document.getAnimations().length)).toBe(0);
      await reduced.close();

      const allowed = await browser.newContext({ reducedMotion: "no-preference" });
      const p2 = await allowed.newPage();
      await p2.goto(URL[locale]);
      await p2.locator("svg[data-diagram=tool-map]").scrollIntoViewIfNeeded();
      await p2.waitForTimeout(300);
      expect(await p2.evaluate(() => document.getAnimations().length)).toBeGreaterThan(0);
      await allowed.close();
    });

    for (const theme of ["light", "dark"] as const) {
      test(`text contrast passes WCAG AA in the ${theme} theme (axe color-contrast)`, async ({ page }) => {
        await page.addInitScript((t) => {
          try {
            localStorage.setItem("theme", t);
          } catch {}
        }, theme);
        await page.goto(URL[locale]);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        expect(results.violations.map((v) => v.nodes.map((n) => n.html))).toEqual([]);
        // Accent-coloured small text must use the darker --acc-text token (plain --acc is 3.4:1 in light).
        const accent = page.locator("[data-chapter-number], nav[data-toc] .n, .example .k").first();
        const ratio = await accent.evaluate((el) => {
          const L = (c: string) => {
            const [r, g, b] = c.match(/\d+/g)!.slice(0, 3).map((v) => Number(v) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));

            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          const fg = L(getComputedStyle(el).color);
          const bg = L(getComputedStyle(document.body).backgroundColor);

          return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
        });
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }

    test("chapters 7–11 follow 1–6 as sections with their own h2 and TOC entry", async ({ page }) => {
      await page.goto(URL[locale]);
      const ids = await page.locator("main section[data-chapter]").evaluateAll((els) => els.map((el) => el.id));
      expect(ids).toEqual(ALL_CHAPTERS);
      for (const [i, id] of ALL_CHAPTERS.entries()) {
        const s = page.locator(`section#${id}`);
        await expect(s.locator("h2")).toHaveCount(1);
        await expect(s.locator("[data-chapter-number]")).toContainText(String(i + 1));
      }
      const hrefs = await page.locator("nav[data-toc]").first().locator("a").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
      expect(hrefs).toEqual(ALL_CHAPTERS.map((id) => `#${id}`));
    });

    test("the results chapter has the measured set with periods and an open caveats block of four or more", async ({ page }) => {
      await page.goto(URL[locale]);
      const results = page.locator("section#results");
      const measured = results.locator(".stat[data-kind=measured]");
      expect(await measured.count()).toBeGreaterThanOrEqual(8);
      for (let i = 0; i < (await measured.count()); i++) await expect(measured.nth(i).locator(".period")).toBeVisible();
      const caveats = results.locator("[data-caveats]");
      await expect(caveats).toHaveCount(1);
      expect(await caveats.locator("li").count()).toBeGreaterThanOrEqual(4);
      // The one estimate on the page lives in chapter 1; Results only points at it, never repeats it among measured figures.
      await expect(results.locator(".stat[data-kind=estimate]")).toHaveCount(0);
      const pointer = results.locator("[data-estimate]");
      await expect(pointer).toHaveCount(1);
      await expect(pointer.locator("a[href='#principle']")).toHaveCount(1);
      expect(await pointer.textContent()).not.toMatch(/5\s?[–-]\s?10\s?×/);
    });

    test("persona and accessibility examples use the fictional brand only", async ({ page }) => {
      await page.goto(URL[locale]);
      for (const id of ["case-persona", "case-a11y"]) {
        const examples = page.locator(`section#${id} .example`);
        expect(await examples.count(), id).toBeGreaterThan(0);
        const text = (await page.locator(`section#${id}`).textContent()) ?? "";
        expect(text, id).toContain(FICTIONAL_BRAND);
        for (const rule of cvOnly) expect(matchesRule(rule, text), rule.label).toBe(false);
      }
    });

    test("the offer chapter closes into the three offer cards and the calls to action", async ({ page }) => {
      await page.goto(URL[locale]);
      const offer = page.locator("section#offer");
      await expect(offer.locator("[data-offer-card]")).toHaveCount(3);
      await expect(offer.locator("a[href^='mailto:']")).toHaveCount(1);
      await expect(offer.locator("a[href*='linkedin.com']")).toHaveCount(1);
    });

    test("every chapter has at least one diagram or visualization", async ({ page }) => {
      await page.goto(URL[locale]);
      for (const id of ALL_CHAPTERS) {
        const visuals = page.locator(`section#${id} [data-diagram], section#${id} .stats, section#${id} [data-offer-card]`);
        expect(await visuals.count(), id).toBeGreaterThan(0);
      }
    });

    test("says front-end only inside the tracker-scope caveat", async ({ page }) => {
      await page.goto(URL[locale]);
      const text = (await page.locator("main").textContent()) ?? "";
      const caveat = (await page.locator(".stat[data-metric=tracker-scope]").textContent()) ?? "";
      const outside = text.replace(caveat, "");
      expect(outside).not.toMatch(/front[-\s]?end/i);
    });

    test("names no bank, no client industry, no cv-only term, no banned words", async ({ page }) => {
      await page.goto(URL[locale]);
      const html = await page.content();
      expect(html).not.toMatch(/bank|banc/i);
      expect(html).not.toMatch(/ratchet|ráčn/i);
      expect(html).not.toMatch(/AI does everything|AI dělá všechno|10× engineer/i);
      for (const rule of cvOnly) expect(matchesRule(rule, html), rule.label).toBe(false);
      const text = (await page.locator("main").textContent()) ?? "";
      expect(text).toMatch(/2026/);
    });
  });
}

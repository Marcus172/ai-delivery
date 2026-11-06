import { expect, test } from "@playwright/test";
import { loadDenylistText, parseDenylist } from "../../scripts/denylist";
import { matchesRule } from "../helpers/denylist";
import { LANDING } from "../../src/data/landing";
import { LANDING_METRIC_IDS, metric } from "../../src/data/metrics";
import { OFFER } from "../../src/data/offer";
import { LOCALES, type Locale } from "../../src/i18n/locales";
import { t } from "../../src/i18n/ui";

const URL_OF: Record<Locale, string> = { en: "", cs: "cs/" };
const PATH_OF: Record<
  Locale,
  Record<"journey" | "ai-delivery" | "wins" | "cv", string>
> = {
  en: {
    journey: "/ai-delivery/journey/",
    "ai-delivery": "/ai-delivery/ai-delivery/",
    wins: "/ai-delivery/wins/",
    cv: "/ai-delivery/cv/",
  },
  cs: {
    journey: "/ai-delivery/cs/journey/",
    "ai-delivery": "/ai-delivery/cs/ai-delivery/",
    wins: "/ai-delivery/cs/wins/",
    cv: "/ai-delivery/cs/cv/",
  },
};

const denylist = loadDenylistText();
const cvOnly = denylist
  ? parseDenylist(denylist).filter((r) => r.scope === "cv-only")
  : [];

for (const locale of LOCALES) {
  const measured = t(locale, "badge.measured");
  const estimate = t(locale, "badge.estimate");

  test.describe(`landing (${locale})`, () => {
    test("hero: the name is the h1, claim below it, three measured stats in order, period line", async ({
      page,
    }) => {
      await page.goto(URL_OF[locale]);
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page.locator("main h1")).toHaveText(t(locale, "site.name"));
      await expect(page.locator("[data-hero-claim]")).toHaveText(
        LANDING.headline[locale],
      );

      const stats = page.locator("[data-stats] [data-metric]");
      await expect(stats).toHaveCount(3);
      for (const [i, id] of LANDING_METRIC_IDS.entries()) {
        const stat = stats.nth(i);
        await expect(stat).toHaveAttribute("data-metric", id);
        await expect(stat).toContainText(metric(id).value[locale]);
        await expect(stat.getByText(measured, { exact: true })).toBeVisible();
      }
      await expect(page.locator("[data-stats-period]")).toBeVisible();
    });

    test("phone: the name and claim open the page, the orbit comes after", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(URL_OF[locale]);
      const who = page.locator("[data-hero-name]");
      await expect(who).toContainText(t(locale, "site.name"));
      await expect(who).toBeInViewport({ ratio: 1 });
      await expect(page.locator("[data-hero-claim]")).toBeInViewport();
      const whoBox = await who.boundingBox();
      const orbitBox = await page.locator(".hero-art").boundingBox();
      expect(whoBox!.y).toBeLessThan(orbitBox!.y);
    });

    test("5–10× lives in the about block as an estimate, not among the stats", async ({
      page,
    }) => {
      await page.goto(URL_OF[locale]);
      const five = metric("five-to-ten-x");
      const about = page.locator("[data-about]");
      await expect(about).toContainText(five.value[locale]);
      await expect(about.getByText(estimate, { exact: true })).toBeVisible();
      await expect(page.locator("[data-stats]")).not.toContainText(
        five.value[locale],
      );
      await expect(page.locator("[data-stats]")).not.toContainText(estimate);
    });

    test("three offer cards with their titles", async ({ page }) => {
      await page.goto(URL_OF[locale]);
      const cards = page.locator("[data-offer-card]");
      await expect(cards).toHaveCount(OFFER.length);
      for (const [i, card] of OFFER.entries()) {
        await expect(cards.nth(i)).toContainText(card.title[locale]);
        await expect(cards.nth(i)).toContainText(card.body[locale]);
      }
    });

    test("photo has a localized alt", async ({ page }) => {
      await page.goto(URL_OF[locale]);
      const img = page.locator("[data-about] img").first();
      await expect(img).toBeVisible();
      const alt = await img.getAttribute("alt");
      expect(alt).toContain("Marek Rom");
      expect(alt).toMatch(locale === "cs" ? /portrét/i : /portrait/i);
    });

    test("links to Journey, AI Delivery, Wins & cases and CV", async ({ page }) => {
      await page.goto(URL_OF[locale]);
      const main = page.locator("main");
      for (const key of ["journey", "ai-delivery", "wins", "cv"] as const) {
        const links = main.locator(`a[href^="${PATH_OF[locale][key]}"]`);
        expect(await links.count(), key).toBeGreaterThan(0);
      }
    });

    test("orbit diagram is an accessible image with localized title and desc", async ({
      page,
    }) => {
      await page.goto(URL_OF[locale]);
      const orbit = page.locator("svg[data-orbit]:visible");
      await expect(orbit).toHaveCount(1);
      await expect(orbit).toHaveAttribute("role", "img");
      const title = await orbit.locator("title").textContent();
      const desc = await orbit.locator("desc").textContent();
      expect(title?.trim().length ?? 0).toBeGreaterThan(10);
      expect(desc?.trim().length ?? 0).toBeGreaterThan(10);
      expect(title).toMatch(locale === "cs" ? /flow|tým/i : /flow|team/i);
      // Anti-goal: never claim every role works in the full flow; other roles plug in through plugins and gates.
      const text = `${title} ${desc}`;
      expect(text).not.toMatch(
        /all (work|run|use)|every role|všichni|všechny role|ve stejném flow|in the same flow/i,
      );
      expect(desc).toMatch(
        locale === "cs" ? /sdílené pluginy/i : /shared plugins/i,
      );
      for (const tool of ["Claude Code", "Paseo", "worktrunk", "CodeGraph"]) {
        await expect(orbit).toContainText(tool);
      }
    });

    test("the outer ring spins around the orbit centre on a wide screen", async ({
      page,
    }) => {
      // Wide enough that the fluid root font size is above 16 px.
      await page.setViewportSize({ width: 2560, height: 1440 });
      await page.goto(URL_OF[locale]);
      const orbit = page.locator("svg[data-orbit]:visible");
      await expect(orbit).toHaveCount(1);
      const centreOf = (sel: string) =>
        orbit.locator(sel).evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        });
      const core = await centreOf(".core");
      for (const t of [0, 22_500, 45_000, 67_500]) {
        await page.evaluate((ms) => {
          for (const a of document.getAnimations()) {
            a.pause();
            a.currentTime = ms;
          }
        }, t);
        const ring = await centreOf(".ring.dash");
        expect(Math.abs(ring.x - core.x), `x at ${t} ms`).toBeLessThan(1);
        expect(Math.abs(ring.y - core.y), `y at ${t} ms`).toBeLessThan(1);
      }
    });

    test("no running animations under reduced motion", async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(URL_OF[locale]);
      await expect(page.locator("svg[data-orbit]:visible")).toHaveCount(1);
      await page.waitForTimeout(300);
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(
        0,
      );
      await context.close();
    });

    test("outer ring rotates when motion is allowed", async ({ browser }) => {
      const context = await browser.newContext({
        reducedMotion: "no-preference",
      });
      const page = await context.newPage();
      await page.goto(URL_OF[locale]);
      await expect(page.locator("svg[data-orbit]:visible")).toHaveCount(1);
      expect(
        await page.evaluate(() => document.getAnimations().length),
      ).toBeGreaterThan(0);
      await context.close();
    });

    test("names no bank, no client industry and no cv-only term", async ({
      page,
    }) => {
      await page.goto(URL_OF[locale]);
      const html = await page.content();
      expect(html).not.toMatch(/bank|banc/i);
      expect(html).not.toMatch(/front-?end/i);
      for (const rule of cvOnly)
        expect(matchesRule(rule, html), rule.label).toBe(false);
    });

    for (const width of [390, 1000, 1440]) {
      test(`orbit labels render at 11 px or larger at ${width} px`, async ({
        browser,
      }) => {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
        });
        const page = await context.newPage();
        await page.goto(URL_OF[locale]);
        const orbit = page.locator("svg[data-orbit]:visible");
        await expect(orbit).toHaveCount(1);
        // Rendered font size = font size in viewBox units × (rendered width / viewBox width).
        const sizes = await orbit.locator("text").evaluateAll((els) =>
          els.map((el) => {
            const svg = (el as SVGTextElement).ownerSVGElement as SVGSVGElement;
            const scale =
              svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
            return parseFloat(getComputedStyle(el).fontSize) * scale;
          }),
        );
        expect(sizes.length).toBeGreaterThan(5);
        for (const h of sizes)
          expect(h, `${width}px`).toBeGreaterThanOrEqual(11);
        await context.close();
      });
    }
  });
}

for (const locale of LOCALES) {
  test.describe(`landing CTA hierarchy (${locale})`, () => {
    test("email is the primary action, social links are icon-only", async ({
      page,
    }) => {
      await page.goto(URL_OF[locale]);
      const links = page.locator(".cta").first().locator("a");
      await expect(links).toHaveCount(4);
      const first = links.nth(0);
      await expect(first).toHaveAttribute("href", /^mailto:/);
      await expect(first).toHaveClass(/\bbtn\b/);
      await expect(first).not.toHaveClass(/\bghost\b/);
      await expect(links.nth(1)).toHaveAttribute("download", "");
      for (const [i, name] of [
        [2, t(locale, "cta.linkedin")],
        [3, t(locale, "cta.github")],
      ] as const) {
        const a = links.nth(i);
        await expect(a).toHaveAttribute("aria-label", name);
        await expect(a).toHaveText("");
        const box = await a.boundingBox();
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
    });

    for (const width of [1440, 1024]) {
      test(`row stays on one line at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(URL_OF[locale]);
        const tops = await page
          .locator(".cta")
          .first()
          .locator("a")
          .evaluateAll((els) => els.map((e) => (e as HTMLElement).offsetTop));
        expect(new Set(tops).size).toBe(1);
      });
    }
  });
}

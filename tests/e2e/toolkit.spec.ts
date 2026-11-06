import { expect, test } from "@playwright/test";
import { PEOPLE, TOOL_GROUPS, toolsIn } from "../../src/data/toolkit";
import { LOCALES, type Locale } from "../../src/i18n/locales";

const URL: Record<Locale, string> = { en: "toolkit/", cs: "cs/toolkit/" };

for (const locale of LOCALES) {
  test.describe(`toolkit (${locale})`, () => {
    test("lists every grouped tool with what it is for and a link to its site", async ({ page }) => {
      await page.goto(URL[locale]);
      await expect(page.locator("main h1")).toHaveCount(1);
      for (const g of TOOL_GROUPS) {
        const items = page.locator(`[data-tool-group="${g.id}"] > li`);
        await expect(items, g.id).toHaveCount(toolsIn(g.id).length);
        for (const x of toolsIn(g.id)) {
          const item = page.locator(`[data-tool-group="${g.id}"] > li[data-tool="${x.id}"]`);
          await expect(item.locator(".what")).toHaveText(x.what?.[locale] ?? "");
          await expect(item.locator(`a[href="${x.url}"]`)).toHaveCount(1);
          if (x.docs) await expect(item.locator(`a[href="${x.docs}"]`)).toHaveCount(1);
          if (x.video) await expect(item.locator(`a[href="${x.video}"]`)).toHaveCount(1);
        }
      }
    });

    test("lists the people I learn from, each linked to their X profile", async ({ page }) => {
      await page.goto(URL[locale]);
      const people = page.locator("section#people [data-person]");
      await expect(people).toHaveCount(PEOPLE.length);
      for (const p of PEOPLE) await expect(page.locator(`[data-person="${p.handle}"] a[href="https://x.com/${p.handle}"]`)).toHaveCount(1);
    });

    test("is reachable from the rail and from the tool map on AI Delivery", async ({ page }) => {
      const prefix = locale === "cs" ? "/ai-delivery/cs/" : "/ai-delivery/";
      await page.goto(URL[locale]);
      await expect(page.locator(`nav.rail a[href="${prefix}toolkit/"]`)).toHaveAttribute("aria-current", "page");
      await page.goto(locale === "cs" ? "cs/ai-delivery/" : "ai-delivery/");
      await expect(page.locator(`[data-diagram="tool-layers"] a[href="${prefix}toolkit/"]`)).toHaveCount(1);
    });
  });
}

test.describe("toolkit: old URLs", () => {
  test("/toolkit/ redirects to /toolkit/", async ({ page }) => {
    await page.goto("toolkit/");
    await expect(page).toHaveURL(/\/ai-delivery\/toolkit\/$/);
    await expect(page.locator("main h1")).toHaveCount(1);
  });

  test("/cs/toolkit/ redirects to /cs/toolkit/", async ({ page }) => {
    await page.goto("cs/toolkit/");
    await expect(page).toHaveURL(/\/ai-delivery\/cs\/toolkit\/$/);
  });
});

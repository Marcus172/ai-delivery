import { expect, test, type Page } from "@playwright/test";

const BASE = "/ai-delivery/";

/** [relative url, expected other-locale url] */
const PAGES: Array<[string, string]> = [
  ["", `${BASE}cs/`],
  ["journey/", `${BASE}cs/journey/`],
  ["ai-delivery/", `${BASE}cs/ai-delivery/`],
  ["cv/", `${BASE}cs/cv/`],
  ["cs/", BASE],
  ["cs/journey/", `${BASE}journey/`],
  ["cs/ai-delivery/", `${BASE}ai-delivery/`],
  ["cs/cv/", `${BASE}cv/`],
];

async function internalUrls(page: Page): Promise<string[]> {
  const hrefs = await page.locator("a[href], link[href]").evaluateAll((els) =>
    els.map((el) => (el as HTMLAnchorElement | HTMLLinkElement).href),
  );
  const origin = new URL(page.url()).origin;
  // Includes the CV PDF links: `npm run pdf` writes them into dist/ before e2e runs (see `check`).
  const urls = hrefs.filter((h) => h.startsWith(origin)).map((h) => h.split("#")[0]);
  const pdfs = urls.filter((h) => h.endsWith(".pdf"));
  expect(pdfs.length, "both CTA rows link the locale's CV PDF").toBeGreaterThan(0);

  return [...new Set(urls)];
}

for (const [url, other] of PAGES) {
  test.describe(`page ${url || "/"}`, () => {
    test("has noindex and hreflang alternates", async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="cs"]')).toHaveCount(1);
    });

    test("every internal link resolves (200)", async ({ page }) => {
      await page.goto(url);
      const urls = await internalUrls(page);
      expect(urls.length).toBeGreaterThan(0);
      for (const u of urls) {
        const res = await page.request.get(u);
        expect(res.status(), u).toBe(200);
      }
    });

    test("declares the favicon and it resolves (200)", async ({ page }) => {
      await page.goto(url);
      const icons = page.locator('link[rel="icon"]');
      await expect(icons).toHaveCount(2);
      for (const h of await icons.evaluateAll((els) => els.map((el) => (el as HTMLLinkElement).href))) {
        const res = await page.request.get(h);
        expect(res.status(), h).toBe(200);
      }
    });

    test("language switch targets the same page in the other locale", async ({ page }) => {
      await page.goto(url);
      const link = page.locator("a[data-lang-switch]");
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("href", other);
    });
  });
}

test.describe("theme", () => {
  test("toggle flips data-theme and survives reload", async ({ page }) => {
    await page.goto("");
    const html = page.locator("html");
    const before = await html.getAttribute("data-theme");
    expect(before).toMatch(/^(light|dark)$/);
    const after = before === "dark" ? "light" : "dark";
    await page.locator("button[data-theme-toggle]").click();
    await expect(html).toHaveAttribute("data-theme", after);
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", after);
  });

  test("toggle works with localStorage blocked and raises no page error", async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", (e) => errors.push(e));
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("blocked");
        },
      });
    });
    await page.goto("");
    const html = page.locator("html");
    const before = await html.getAttribute("data-theme");
    expect(before).toMatch(/^(light|dark)$/);
    await page.locator("button[data-theme-toggle]").click();
    await expect(html).toHaveAttribute("data-theme", before === "dark" ? "light" : "dark");
    expect(errors).toEqual([]);
  });

  test("data-theme is set before first paint", async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        (window as unknown as { __themeAtDcl: string | null }).__themeAtDcl =
          document.documentElement.getAttribute("data-theme");
      });
    });
    await page.goto("");
    const at = await page.evaluate(() => (window as unknown as { __themeAtDcl: string | null }).__themeAtDcl);
    expect(at).toMatch(/^(light|dark)$/);
  });
});

test.describe("label in name (WCAG 2.5.3)", () => {
  for (const url of ["", "cs/"]) {
    test(`every control with visible text has it in its accessible name (${url || "/"})`, async ({ page }) => {
      await page.goto(url);
      const controls = page.locator("nav a, nav button, footer a, footer button");
      const count = await controls.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const control = controls.nth(i);
        const visible = await control.evaluate((el) => {
          const clone = el.cloneNode(true) as HTMLElement;
          clone.querySelectorAll(".sr, [aria-hidden='true']").forEach((n) => n.remove());

          return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
        });
        if (!visible) continue;
        const escaped = visible.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        await expect(control, visible).toHaveAccessibleName(new RegExp(`^${escaped}`));
      }
    });
  }
});

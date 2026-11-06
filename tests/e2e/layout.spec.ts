import { expect, test, type Page } from "@playwright/test";

const BASE = "/ai-delivery/";

/** [relative url, expected other-locale url] */
const PAGES: Array<[string, string]> = [
  ["", `${BASE}cs/`],
  ["journey/", `${BASE}cs/journey/`],
  ["ai-delivery/", `${BASE}cs/ai-delivery/`],
  ["wins/", `${BASE}cs/wins/`],
  ["wins/tailwind/", `${BASE}cs/wins/tailwind/`],
  ["wins/stack/", `${BASE}cs/wins/stack/`],
  ["cs/wins/security/", `${BASE}wins/security/`],
  ["wins/along-the-way/", `${BASE}cs/wins/along-the-way/`],
  ["sources/", `${BASE}cs/sources/`],
  ["cv/", `${BASE}cs/cv/`],
  ["cs/", BASE],
  ["cs/journey/", `${BASE}journey/`],
  ["cs/ai-delivery/", `${BASE}ai-delivery/`],
  ["cs/wins/", `${BASE}wins/`],
  ["cs/wins/brand-voice/", `${BASE}wins/brand-voice/`],
  ["cs/wins/along-the-way/", `${BASE}wins/along-the-way/`],
  ["cs/sources/", `${BASE}sources/`],
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

    test("text runs to its column edge and no diagram or media steps out of the column (1440 px)", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(url);
      const problems = await page.evaluate(() => {
        const out: string[] = [];
        const main = document.querySelector("main") as HTMLElement;
        const name = (el: Element) => `${el.tagName.toLowerCase()}${el.classList[0] ? "." + el.classList[0] : ""}`;
        for (const el of main.querySelectorAll<HTMLElement>("p, ul, ol, dl, details, aside, figcaption, .example, .estimate, .stats, .caveats")) {
          if (el.closest("svg, dialog, .toc-side")) continue;
          const cs = getComputedStyle(el);
          if (cs.display === "none" || !el.getBoundingClientRect().width) continue;
          const parent = el.parentElement as HTMLElement;
          const pcs = getComputedStyle(parent);
          // Grid and flex cells size their children; only a block's own max-width can make it narrower.
          if (/grid|flex/.test(pcs.display)) continue;
          const room = parent.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight);
          if (cs.maxWidth !== "none" && room - el.getBoundingClientRect().width > 24) out.push(`${name(el)} narrower than its column (max-width ${cs.maxWidth})`);
        }
        for (const el of main.querySelectorAll("[data-diagram], .scroll, figure, table")) {
          const col = (el.closest(".column, .chapters") ?? main).getBoundingClientRect();
          const r = el.getBoundingClientRect();
          if (r.left < col.left - 1 || r.right > col.right + 1) out.push(`${name(el)} steps out of the column`);
          if (el.matches(".scroll") && el.scrollWidth > el.clientWidth + 1) out.push(`${name(el.firstElementChild ?? el)} scrolls sideways`);
        }
        return [...new Set(out)];
      });
      expect(problems).toEqual([]);
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

// Large screens scale the whole page like a browser zoom; laptops and landscape tablets stay at 100 %.
const SCALE: Array<[number, number]> = [
  [1024, 16],
  [1366, 16],
  [1440, 16],
  [1990, 19],
  [2560, 19],
];
for (const [width, rootPx] of SCALE) {
  test(`root font size is ${rootPx}px at ${width}px and nothing overflows sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const url of ["", "journey/", "ai-delivery/", "wins/", "wins/brand-voice/", "sources/", "cv/"]) {
      await page.goto(`${BASE}${url}`);
      const { root, overflow } = await page.evaluate(() => ({
        root: parseFloat(getComputedStyle(document.documentElement).fontSize),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      expect(root, url).toBeCloseTo(rootPx, 0);
      expect(overflow, url).toBe(0);
    }
  });
}

test("CS display headings leave room for diacritics", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of ["cs/", "cs/ai-delivery/"]) {
    await page.goto(`${BASE}${path}`);
    const ratios = await page.evaluate(() =>
      [document.querySelector("h1"), ...document.querySelectorAll("h2")]
        .filter((el): el is Element => !!el)
        .map((el) => {
          const s = getComputedStyle(el);
          return parseFloat(s.lineHeight) / parseFloat(s.fontSize);
        }),
    );
    expect(ratios.length).toBeGreaterThan(1);
    for (const r of ratios) expect(r).toBeGreaterThanOrEqual(1.05);
  }
});

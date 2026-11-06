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
  ["toolkit/", `${BASE}cs/toolkit/`],
  ["cv/", `${BASE}cs/cv/`],
  ["cs/", BASE],
  ["cs/journey/", `${BASE}journey/`],
  ["cs/ai-delivery/", `${BASE}ai-delivery/`],
  ["cs/wins/", `${BASE}wins/`],
  ["cs/wins/brand-voice/", `${BASE}wins/brand-voice/`],
  ["cs/wins/along-the-way/", `${BASE}wins/along-the-way/`],
  ["cs/toolkit/", `${BASE}toolkit/`],
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
          // Leads and Journey entries are capped to a reading measure on purpose (see "lead paragraphs keep a readable measure").
          if (el.matches(".lead") || el.closest(".card-text, .month-text")) continue;
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
          if (!r.width) continue; // the role matrix variant that is not shown
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
    for (const url of ["", "journey/", "ai-delivery/", "wins/", "wins/brand-voice/", "toolkit/", "cv/"]) {
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

test.describe("mobile diagrams (390 px)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("role matrix fits a 390 px screen", async ({ page }) => {
    for (const path of ["ai-delivery/", "cs/ai-delivery/"]) {
      await page.goto(`${BASE}${path}`);
      const sizes = await page.locator('[data-diagram="role-matrix"]').evaluate((svg) => {
        const el = svg.closest(".scroll") as HTMLElement;
        return { sw: el.scrollWidth, cw: el.clientWidth };
      });
      expect(sizes.sw, path).toBeLessThanOrEqual(sizes.cw);
    }
  });

  test("overflowing diagram regions say they scroll", async ({ page }) => {
    for (const path of ["ai-delivery/", "cs/ai-delivery/", "wins/along-the-way/"]) {
      await page.goto(`${BASE}${path}`);
      const regions = await page.locator(".hscroll").evaluateAll((els) =>
        els.map((el) => {
          const h = el.nextElementSibling as HTMLElement | null;
          return {
            overflow: el.scrollWidth > el.clientWidth,
            hint: !!h && h.classList.contains("hscroll-hint") && h.getBoundingClientRect().height > 0,
          };
        }),
      );
      if (path.includes("ai-delivery")) expect(regions.some((r) => r.overflow), path).toBe(true);
      for (const r of regions) if (r.overflow) expect(r.hint, path).toBe(true);
    }
  });

  test("a hint appears when a hidden overflowing region is revealed", async ({ page }) => {
    await page.goto(`${BASE}ai-delivery/`);
    // No diagram lives inside a <details> today, so move one into a closed one and open it.
    await page.evaluate(() => {
      const region = [...document.querySelectorAll<HTMLElement>(".hscroll")].find((el) => el.scrollWidth > el.clientWidth)!;
      const hint = region.nextElementSibling!;
      const d = document.createElement("details");
      region.before(d);
      d.append(document.createElement("summary"), region, hint);
      d.id = "reveal-test";
    });
    const hint = page.locator("#reveal-test .hscroll-hint");
    await expect(hint).toBeHidden();
    await page.locator("#reveal-test summary").evaluate((el) => ((el.parentElement as HTMLDetailsElement).open = true));
    await expect(hint).toBeVisible();
  });
});

const SHORT: Record<string, string[]> = {
  "": ["Intro", "Journey", "AI", "Wins", "Toolkit", "CV"],
  "cs/": ["Úvod", "Cesta", "AI", "Výsledky", "Nástroje", "CV"],
};

test.describe("rail labels", () => {
  for (const [path, labels] of Object.entries(SHORT)) {
    for (const [w, h] of [
      [1440, 900],
      [390, 844],
      [360, 740],
      [320, 640],
    ]) {
      test(`rail shows a text label for every page (${path || "en"}, ${w}px)`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(`${BASE}${path}`);
        const links = page.locator("nav.rail a[href]:not(.mark):not([data-lang-switch])");
        await expect(links).toHaveCount(labels.length);
        for (let i = 0; i < labels.length; i++) {
          const label = links.nth(i).locator(".label");
          await expect(label).toBeVisible();
          await expect(label).toHaveText(labels[i]);
        }
        if (w < 900) {
          const fits = await page.locator("nav.rail").evaluate((el) => el.scrollWidth <= el.clientWidth);
          expect(fits, "rail needs no horizontal scroll").toBe(true);
          const box = await links.first().boundingBox();
          expect(box!.height).toBeGreaterThanOrEqual(44);
          // Labels sit side by side on a phone: each one ends before the next one starts, with air between.
          const boxes = await links.locator(".label").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
          for (let i = 1; i < boxes.length; i++)
            expect(boxes[i].left - boxes[i - 1].right, `gap between "${labels[i - 1]}" and "${labels[i]}"`).toBeGreaterThanOrEqual(2);
        }
      });
    }
  }

  for (const path of Object.keys(SHORT)) {
    test(`every rail link's accessible name contains its visible label (${path || "en"})`, async ({ page }) => {
      await page.goto(`${BASE}${path}`);
      const links = page.locator("nav.rail a[href]:has(.label)");
      expect(await links.count()).toBe(SHORT[path].length);
      for (const link of await links.all()) {
        const visible = (await link.locator(".label").textContent())!.trim().toLowerCase();
        const name = (await link.getAttribute("aria-label"))!.toLowerCase();
        expect(name, `aria-label of "${visible}"`).toContain(visible);
      }
    });
  }
});

test.describe("anchors clear the sticky mobile rail", () => {
  /** [page, selector of the in-page links to follow] */
  const JUMPS: Array<[string, string]> = [
    ["wins/stack/", "nav[data-case-index] a"],
    ["cs/wins/stack/", "nav[data-case-index] a"],
    ["wins/", "nav.jump a"],
    ["cs/wins/", "nav.jump a"],
  ];
  for (const [path, selector] of JUMPS) {
    test(`${path}: following ${selector} leaves the target below the rail (390px)`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      // Instant jumps: a smooth scroll in flight would pass the check before it settles under the rail.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${BASE}${path}`);
      const links = page.locator(selector);
      const n = await links.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        const href = (await links.nth(i).getAttribute("href"))!;
        await links.nth(i).click();
        await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe(href);
        const id = `[id="${href.slice(1)}"]`;
        const target = page.locator(id);
        const heading = page.locator(`${id}:is(h2, h3), ${id} :is(h2, h3)`).first();
        await expect
          .poll(async () => {
            const rail = await page.locator("nav.rail").boundingBox();
            const t = await target.boundingBox();
            const h = await heading.boundingBox();
            const bottom = rail!.y + rail!.height - 1;
            return t!.y >= bottom && h!.y >= bottom && h!.y < 844;
          }, `${href} lands below the rail and in view`)
          .toBe(true);
      }
    });
  }
});

test("lead paragraphs keep a readable measure", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of ["", "journey/", "wins/"]) {
    await page.goto(`${BASE}${path}`);
    const widths = await page.locator(".lead").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
    expect(widths.length, `${path || "/"} has a .lead`).toBeGreaterThan(0);
    for (const w of widths) expect(w, `${path || "/"} .lead width`).toBeLessThanOrEqual(760);
  }
});

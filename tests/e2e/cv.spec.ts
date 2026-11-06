import { expect, test } from "@playwright/test";
import { PHONE_PATTERNS } from "../../scripts/nda-gate";
import { CV } from "../../src/data/cv";
import { LOCALES, type Locale } from "../../src/i18n/locales";

const BASE = "/ai-delivery/";
const CV_URL: Record<Locale, string> = { en: "cv/", cs: "cs/cv/" };
const OTHER_PAGES = ["", "journey/", "ai-delivery/", "wins/", "wins/accessibility/", "cs/", "cs/journey/", "cs/ai-delivery/", "cs/wins/"];
const employer = CV.roles[0].company;

for (const locale of LOCALES) {
  test.describe(`cv page (${locale})`, () => {
    test("lists every role, newest first, with title and summary", async ({ page }) => {
      await page.goto(CV_URL[locale]);
      const roles = page.locator("[data-role]");
      await expect(roles).toHaveCount(CV.roles.length);
      for (const [i, role] of CV.roles.entries()) {
        const row = roles.nth(i);
        await expect(row.locator("[data-role-title]")).toHaveText(role.title[locale]);
        await expect(row).toContainText(role.company);
        await expect(row).toContainText(role.summary[locale]);
        if (role.client) await expect(row).toContainText(role.client);
      }
      await expect(roles.first()).toHaveAttribute("data-current", "");
      await expect(page.locator("[data-role][data-current]")).toHaveCount(1);
    });

    test("shows the photo with a localized alt", async ({ page }) => {
      await page.goto(CV_URL[locale]);
      const img = page.locator("main img").first();
      await expect(img).toBeVisible();
      const alt = await img.getAttribute("alt");
      expect(alt).toContain("Marek Rom");
      expect(alt).toMatch(locale === "cs" ? /portrét/i : /portrait/i);
    });

    test("shows headline, skills, languages and contact (no phone)", async ({ page }) => {
      await page.goto(CV_URL[locale]);
      const main = page.locator("main");
      await expect(main.locator("h1")).toContainText("Marek Rom");
      await expect(main).toContainText(CV.headline[locale]);
      for (const group of CV.skills) {
        await expect(main).toContainText(group.group[locale]);
        for (const item of group.items) await expect(main).toContainText(item);
      }
      for (const lang of CV.languages) await expect(main).toContainText(lang[locale]);
      await expect(main.locator(`a[href="mailto:${CV.contact.email}"]`)).toHaveText(CV.contact.email);
      await expect(main.locator(`a[href="${CV.contact.linkedin}"]`)).toHaveCount(1);
      await expect(main.locator(`a[href="${CV.contact.github}"]`)).toHaveCount(1);
      const html = await page.content();
      for (const re of PHONE_PATTERNS) expect(html, String(re)).not.toMatch(re);
    });

    test("print media hides rail, footer and toggles and forces the light theme", async ({ page }) => {
      await page.goto(CV_URL[locale]);
      await page.locator("html").evaluate((el) => el.setAttribute("data-theme", "dark"));
      await page.emulateMedia({ media: "print" });
      await expect(page.locator("nav.rail")).toBeHidden();
      await expect(page.locator("footer")).toBeHidden();
      await expect(page.locator("button[data-theme-toggle]")).toBeHidden();
      await expect(page.locator("a[data-lang-switch]")).toBeHidden();
      await expect(page.locator("[data-progress]")).toBeHidden();
      await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await expect(page.locator("[data-role]").first()).toBeVisible();
    });

    test("print at A4 width keeps the portrait photo, not the phone's ringed circle", async ({ page }) => {
      // A4 at 96 dpi is ~794 px wide, under the 899 px phone breakpoint: the phone rules must stay on screen.
      await page.setViewportSize({ width: 794, height: 1123 });
      await page.goto(CV_URL[locale]);
      await page.emulateMedia({ media: "print" });
      const photo = page.locator("figure.photo");
      await expect(photo).toHaveCSS("box-shadow", "none");
      const box = (await photo.boundingBox())!;
      expect(box.height, "portrait, taller than wide").toBeGreaterThan(box.width * 1.3);
    });
  });
}

test.describe("employer name is confined to the cv pages", () => {
  for (const locale of LOCALES) {
    test(`cv page (${locale}) names the employer`, async ({ page }) => {
      await page.goto(CV_URL[locale]);
      expect(await page.content()).toContain(employer);
    });
  }
  for (const url of OTHER_PAGES) {
    test(`page ${url || "/"} does not name the employer`, async ({ page }) => {
      await page.goto(url);
      expect((await page.content()).toLowerCase()).not.toContain(employer.toLowerCase());
    });
  }
});

for (const locale of LOCALES) {
  test.describe(`cv facts line (${locale})`, () => {
    test.use({ viewport: { width: 390, height: 844 } });
    test("facts line is in the first viewport and names the role", async ({ page }) => {
      await page.goto(CV_URL[locale]);
      const facts = page.locator("[data-facts]");
      await expect(facts).toBeVisible();
      await expect(facts).toContainText("Product Engineering & AI Lead");
      const box = await facts.boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(844);
    });
  });
}

for (const locale of LOCALES) {
  test.describe(`cv header (${locale}, phone)`, () => {
    test.use({ viewport: { width: 390, height: 844 } });
    test("PDF button is in the first viewport", async ({ page }) => {
      await page.goto(CV_URL[locale]);
      const button = page.locator('a[download][href$=".pdf"]').first();
      await expect(button).toBeVisible();
      const box = await button.boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(844);
    });

    test("header contact line carries email, LinkedIn, GitHub and the site", async ({ page }) => {
      await page.goto(CV_URL[locale]);
      const contact = page.locator("[data-cv-contact]");
      await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(1);
      await expect(contact.locator(`a[href="${CV.contact.site}"]`)).toHaveCount(1);
      await expect(contact.locator(`a[href="${CV.contact.linkedin}"]`)).toHaveCount(1);
      await expect(contact.locator(`a[href="${CV.contact.github}"]`)).toHaveCount(1);
    });

    test("email and the current role title are in the first viewport", async ({ page }) => {
      await page.goto(CV_URL[locale]);
      for (const target of [page.locator('[data-cv-contact] a[href^="mailto:"]'), page.locator("[data-role] [data-role-title]").first()]) {
        await expect(target).toBeVisible();
        const box = await target.boundingBox();
        expect(box!.y + box!.height).toBeLessThanOrEqual(844);
      }
    });
  });
}

import { existsSync, readFileSync } from "node:fs";
import { extractText, getDocumentProxy } from "unpdf";
import { describe, expect, it } from "vitest";
import { PHONE_PATTERNS } from "../../scripts/nda-gate";
import { CV } from "../../src/data/cv";
import { LOCALES, type Locale } from "../../src/i18n/locales";

/** Runs after `npm run pdf` (see `check`); asserts on the generated files, never renders anything itself. */
const PDF: Record<Locale, string> = {
  en: "dist/cv/marek-rom-cv-en.pdf",
  cs: "dist/cs/cv/marek-rom-cv-cs.pdf",
};

async function read(file: string) {
  const pdf = await getDocumentProxy(new Uint8Array(readFileSync(file)));
  const { text, totalPages } = await extractText(pdf, { mergePages: true });

  return { text: text.replace(/\s+/g, " "), totalPages };
}

for (const locale of LOCALES) {
  describe(`cv pdf (${locale})`, () => {
    const file = PDF[locale];

    it("exists in dist", () => {
      expect(existsSync(file), file).toBe(true);
    });

    it("fits on at most two A4 pages", async () => {
      const { totalPages } = await read(file);
      expect(totalPages).toBeLessThanOrEqual(2);
      expect(totalPages).toBeGreaterThan(0);
    });

    it("contains the headline, the current role, the employer and contact", async () => {
      const { text } = await read(file);
      // The display heading is uppercase by design, and Chromium exports the transformed text.
      expect(text).toMatch(/Marek Rom/i);
      expect(text).toContain("Senior Product Engineer");
      expect(text).toContain("Product Engineering & AI Lead");
      expect(text).toContain(CV.roles[0].company);
      expect(text).toContain(CV.contact.email);
      expect(text).toContain(CV.contact.linkedin.replace(/^https?:\/\/(www\.)?/, ""));
      expect(text).toContain(CV.contact.github.replace(/^https?:\/\/(www\.)?/, ""));
    });

    it("lists every role title", async () => {
      const { text } = await read(file);
      for (const role of CV.roles) expect(text).toContain(role.title[locale]);
    });

    it("contains no phone number", async () => {
      const { text } = await read(file);
      for (const re of PHONE_PATTERNS) expect(text, String(re)).not.toMatch(re);
    });
  });
}

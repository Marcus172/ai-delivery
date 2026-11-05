import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { href, localizedPath, subPagePath, switchLocalePath, type PageId } from "../../src/i18n/routes";
import type { Locale } from "../../src/i18n/locales";

beforeEach(() => {
  vi.stubEnv("BASE_URL", "/ai-delivery/");
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("href", () => {
  it("prefixes the base without double slashes", () => {
    expect(href("/journey/")).toBe("/ai-delivery/journey/");
    expect(href("journey/")).toBe("/ai-delivery/journey/");
    expect(href("/")).toBe("/ai-delivery/");
    expect(href("")).toBe("/ai-delivery/");
  });

  it("tolerates a base without trailing slash", () => {
    vi.stubEnv("BASE_URL", "/ai-delivery");
    expect(href("/cv/")).toBe("/ai-delivery/cv/");
    expect(href("")).toBe("/ai-delivery/");
  });

  it("keeps the root base plain", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(href("/cv/")).toBe("/cv/");
  });
});

describe("localizedPath", () => {
  const cases: Array<[Locale, PageId, string]> = [
    ["en", "landing", "/ai-delivery/"],
    ["en", "journey", "/ai-delivery/journey/"],
    ["en", "ai-delivery", "/ai-delivery/ai-delivery/"],
    ["en", "wins", "/ai-delivery/wins/"],
    ["en", "sources", "/ai-delivery/sources/"],
    ["en", "cv", "/ai-delivery/cv/"],
    ["cs", "landing", "/ai-delivery/cs/"],
    ["cs", "journey", "/ai-delivery/cs/journey/"],
    ["cs", "ai-delivery", "/ai-delivery/cs/ai-delivery/"],
    ["cs", "wins", "/ai-delivery/cs/wins/"],
    ["cs", "sources", "/ai-delivery/cs/sources/"],
    ["cs", "cv", "/ai-delivery/cs/cv/"],
  ];

  for (const [locale, page, expected] of cases) {
    it(`${locale} ${page} → ${expected}`, () => {
      expect(localizedPath(locale, page)).toBe(expected);
    });
    it(`${locale} ${page} with hash → ${expected}#guardrails`, () => {
      expect(localizedPath(locale, page, "guardrails")).toBe(`${expected}#guardrails`);
    });
  }

  it("accepts a hash with a leading #", () => {
    expect(localizedPath("cs", "ai-delivery", "#guardrails")).toBe("/ai-delivery/cs/ai-delivery/#guardrails");
  });
});

describe("switchLocalePath", () => {
  it("en → cs keeps page and hash", () => {
    expect(switchLocalePath("/ai-delivery/ai-delivery/", "#guardrails", "cs")).toBe(
      "/ai-delivery/cs/ai-delivery/#guardrails",
    );
  });

  it("cs → en keeps page and hash", () => {
    expect(switchLocalePath("/ai-delivery/cs/ai-delivery/", "#guardrails", "en")).toBe(
      "/ai-delivery/ai-delivery/#guardrails",
    );
  });

  it("handles the landing page in both directions", () => {
    expect(switchLocalePath("/ai-delivery/", "", "cs")).toBe("/ai-delivery/cs/");
    expect(switchLocalePath("/ai-delivery/cs/", "", "en")).toBe("/ai-delivery/");
  });

  it("is a no-op when already in the target locale", () => {
    expect(switchLocalePath("/ai-delivery/cs/cv/", "", "cs")).toBe("/ai-delivery/cs/cv/");
    expect(switchLocalePath("/ai-delivery/cv/", "", "en")).toBe("/ai-delivery/cv/");
  });
});

describe("subPagePath", () => {
  it("puts a case under its page in each locale, with one trailing slash", () => {
    expect(subPagePath("en", "wins", "tailwind")).toBe("/ai-delivery/wins/tailwind/");
    expect(subPagePath("cs", "wins", "tailwind")).toBe("/ai-delivery/cs/wins/tailwind/");
    expect(subPagePath("en", "wins", "/brand-voice/")).toBe("/ai-delivery/wins/brand-voice/");
  });

  it("appends a hash", () => {
    expect(subPagePath("cs", "wins", "accessibility", "#top")).toBe("/ai-delivery/cs/wins/accessibility/#top");
  });
});

import { describe, expect, it } from "vitest";
import { plural } from "../../src/i18n/plural";

const A = { one: "oblast", few: "oblasti", other: "oblastí" };
const B = { one: "area", other: "areas" };

describe("plural", () => {
  it("picks Czech forms", () => {
    expect(plural("cs", 1, A)).toBe("oblast");
    expect(plural("cs", 3, A)).toBe("oblasti");
    expect(plural("cs", 5, A)).toBe("oblastí");
  });
  it("picks English forms", () => {
    expect(plural("en", 1, B)).toBe("area");
    expect(plural("en", 3, B)).toBe("areas");
  });
});

import { describe, expect, it } from "vitest";
import { formatMonth, formatRange } from "../../src/i18n/dates";

describe("formatRange", () => {
  it("formats english months short", () => {
    expect(formatMonth("en", "2026-04")).toBe("Apr 2026");
    expect(formatRange("en", "2025-08", "2026-03")).toBe("Aug 2025 – Mar 2026");
    expect(formatRange("en", "2026-04", null)).toBe("Apr 2026 – now");
  });

  it("formats czech months long and lowercase", () => {
    expect(formatMonth("cs", "2026-04")).toBe("duben 2026");
    expect(formatRange("cs", "2019-11", "2022-10")).toBe("listopad 2019 – říjen 2022");
    expect(formatRange("cs", "2026-04", null)).toBe("duben 2026 – nyní");
  });
});

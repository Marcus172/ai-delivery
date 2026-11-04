import type { Locale } from "./locales";

const FORMAT: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }),
  cs: new Intl.DateTimeFormat("cs", { month: "long", year: "numeric" }),
};
const MONTH_ONLY: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en", { month: "short" }),
  cs: new Intl.DateTimeFormat("cs", { month: "long" }),
};
const NOW: Record<Locale, string> = { en: "now", cs: "nyní" };

/** `"2026-04"` → "Apr 2026" / "duben 2026". */
export function formatMonth(locale: Locale, ym: string): string {
  const [y, m] = ym.split("-").map(Number);

  return FORMAT[locale].format(new Date(Date.UTC(y, m - 1, 15)));
}

/** `("en", "2025-08", "2026-03")` → "Aug 2025 – Mar 2026"; `to === null` → "… – now". */
export function formatRange(locale: Locale, from: string, to: string | null): string {
  return `${formatMonth(locale, from)} – ${to ? formatMonth(locale, to) : NOW[locale]}`;
}

/** `"2026-04"` → "Apr" / "duben" — for a month inside a band that already names the year. */
export function formatMonthOnly(locale: Locale, ym: string): string {
  const [y, m] = ym.split("-").map(Number);

  return MONTH_ONLY[locale].format(new Date(Date.UTC(y, m - 1, 15)));
}

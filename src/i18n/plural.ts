import type { Locale } from "./locales";

export interface PluralForms {
  one: string;
  few?: string;
  other: string;
}

/** Picks the noun form for a count. `few` applies to Czech only (2-4). */
export function plural(locale: Locale, n: number, forms: PluralForms): string {
  const category = new Intl.PluralRules(locale).select(n);
  if (category === "one") return forms.one;
  if (category === "few" && locale === "cs") return forms.few ?? forms.other;
  return forms.other;
}

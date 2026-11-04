import type { Locale } from "../i18n/locales";

export type L10n = Record<Locale, string>;

const NBSP = "\u00a0";

/**
 * Czech typography: non-breaking space before % and units, inside thousands
 * ("2 423"), after a day number ("31. března") and after one-letter
 * prepositions and conjunctions ("s AI", "v týmu").
 */
export function csTypo(s: string): string {
  return s
    .replace(/(?<=^|(?<!\d)[\s\u00a0]|[(„])([KkSsVvZzOoUuAaIi]) /g, `$1${NBSP}`)
    .replace(/(\d) (%|×|kB|s|h|dne|dnů|týdnů|týdny|tis\.)(?![\p{L}\d])/gu, `$1${NBSP}$2`)
    .replace(/(\d) (\d{3})(?!\d)/g, `$1${NBSP}$2`)
    .replace(/(\d\.) (?=[\p{L}\d])/gu, `$1${NBSP}`);
}

/** A bilingual string; Czech gets Czech typography applied. */
export const l = (en: string, cs: string): L10n => ({ en, cs: csTypo(cs) });

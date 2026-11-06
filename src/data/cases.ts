import { getCollection } from "astro:content";
import type { CaseId } from "../content.config";
import type { Locale } from "../i18n/locales";
import { csTypo } from "./l10n";

/**
 * The cases of one locale in reading order, with typography applied. The MDX body is rendered by the
 * page that shows it (`render(entry)` inside an .astro file), or the dev server misses the styles of
 * the diagrams the body embeds.
 */
export async function loadCases(locale: Locale) {
  const typo = (s: string) => (locale === "cs" ? csTypo(s) : s);
  const entries = (await getCollection("cases", ({ id }) => id.startsWith(`${locale}/`))).sort((a, b) => a.data.order - b.data.order);

  return entries.map((entry) => ({
    ...entry.data,
    id: entry.data.id as CaseId,
    title: typo(entry.data.title),
    summary: typo(entry.data.summary),
    teaser: typo(entry.data.teaser),
    entry,
  }));
}

export type LoadedCase = Awaited<ReturnType<typeof loadCases>>[number];

export const caseNumber = (order: number) => String(order).padStart(2, "0");

import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locales";

export type PageId = "landing" | "journey" | "ai-delivery" | "wins" | "toolkit" | "cv";

export const PAGE_IDS: readonly PageId[] = ["landing", "journey", "ai-delivery", "wins", "toolkit", "cv"];

const PAGE_SEGMENT: Record<PageId, string> = {
  landing: "",
  journey: "journey/",
  "ai-delivery": "ai-delivery/",
  wins: "wins/",
  toolkit: "toolkit/",
  cv: "cv/",
};

/** Base path with exactly one trailing slash, e.g. `/ai-delivery/` or `/`. */
function base(): string {
  const raw = import.meta.env.BASE_URL ?? "/";

  return `${raw.replace(/\/+$/, "")}/`;
}

/** Prefix a site-relative path with the configured base; never a double slash. */
export function href(path: string): string {
  return `${base()}${path.replace(/^\/+/, "")}`;
}

function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "" : `${locale}/`;
}

/** Full path of a page in a locale, optionally with a `#hash`. */
export function localizedPath(locale: Locale, page: PageId, hash?: string): string {
  const fragment = hash ? `#${hash.replace(/^#/, "")}` : "";

  return `${href(`${localePrefix(locale)}${PAGE_SEGMENT[page]}`)}${fragment}`;
}

/** The generated CV PDF of a locale, e.g. `/ai-delivery/cv/marek-rom-cv-en.pdf`. */
export function cvPdfPath(locale: Locale): string {
  return `${localizedPath(locale, "cv")}marek-rom-cv-${locale}.pdf`;
}

/** Full path of a subpage under a page, e.g. a case under `wins`: `/ai-delivery/cs/wins/tailwind/`. */
export function subPagePath(locale: Locale, page: PageId, sub: string, hash?: string): string {
  const fragment = hash ? `#${hash.replace(/^#/, "")}` : "";
  const segment = sub.replace(/^\/+|\/+$/g, "");

  return `${href(`${localePrefix(locale)}${PAGE_SEGMENT[page]}${segment}/`)}${fragment}`;
}

/** Same page in another locale. `pathname` includes the base, `hash` includes its `#` (or is empty). */
export function switchLocalePath(pathname: string, hash: string, target: Locale): string {
  const b = base();
  const rel = pathname.startsWith(b) ? pathname.slice(b.length) : pathname.replace(/^\/+/, "");
  const seg = rel.split("/", 1)[0];
  const current = (LOCALES as readonly string[]).includes(seg) ? (seg as Locale) : DEFAULT_LOCALE;
  const bare = current === DEFAULT_LOCALE ? rel : rel.slice(seg.length + 1);
  const fragment = hash ? `#${hash.replace(/^#/, "")}` : "";

  return `${href(`${localePrefix(target)}${bare}`)}${fragment}`;
}

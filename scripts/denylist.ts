import { existsSync, readFileSync } from "node:fs";

export type Scope = "cv-only" | "never";
export type Rule = { scope: Scope; pattern: RegExp; label: string };

const WORD = "[\\p{L}\\p{N}_]";
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function parseDenylist(text: string): Rule[] {
  const rules: Rule[] = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const m = /^(cv-only|never-re|never)\s*:\s*(.+)$/.exec(line);
    if (!m) throw new Error(`denylist line ${i + 1}: unknown rule format`);
    const [, kind, value] = m;
    const term = value.trim();
    if (kind === "never-re") {
      let pattern: RegExp;
      try {
        pattern = new RegExp(term, "iu");
      } catch {
        // Never echo the pattern or the engine message: it would embed denylist content.
        throw new Error(`denylist line ${i + 1}: invalid pattern`);
      }
      rules.push({ scope: "never", pattern, label: `never-re@${i + 1}` });
      return;
    }
    const body = escape(term).replace(/\s+/g, "\\s+");
    rules.push({
      scope: kind as Scope,
      pattern: new RegExp(`(?<!${WORD})${body}(?!${WORD})`, "iu"),
      label: `${kind}@${i + 1}`,
    });
  });
  return rules;
}

/** Whole denylist text from NDA_DENYLIST or .private/nda-denylist.txt; null when neither yields rules. */
export function loadDenylistText(): string | null {
  const env = process.env.NDA_DENYLIST;
  if (env && env.trim()) return env;
  const file = ".private/nda-denylist.txt";
  if (existsSync(file)) {
    const text = readFileSync(file, "utf8");
    if (text.trim()) return text;
  }
  return null;
}

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { loadDenylistText, parseDenylist, type Rule } from "./denylist";

export type Hit = { path: string; rule: string; excerpt: string };
export type Doc = { path: string; text: string };

/** Built-in phone rules. Unprefixed digit runs are deliberately not matched: SVG path data looks like phone numbers. */
export const PHONE_PATTERNS: RegExp[] = [
  /\+\s?\d{3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}/,
  /tel:/i,
];
const BANNED: RegExp[] = [/\bratchet\b|ráčn/i];

/** Binary assets skipped by scanDist; every other file is scanned as text. */
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|eot|mp[34]|webm|zip|gz|br)$/i;
const CV_PATH = /(^|\/)(cs\/)?cv\//;
const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try {
        return String.fromCodePoint(code);
      } catch {
        return all;
      }
    }
    return NAMED[e.toLowerCase()] ?? all;
  });
}

/** Views of an html file to scan: raw (attributes, svg text) and tag-stripped (terms split by inline tags). */
export function htmlViews(html: string): string[] {
  const noData = html.replace(/data:[^"')\s>]+/gi, "data:");
  const raw = decodeEntities(noData);
  const stripped = decodeEntities(noData.replace(/<[^>]*>/g, ""));
  return [raw, stripped];
}

function excerpt(text: string, index: number, len: number): string {
  return text.slice(Math.max(0, index - 20), index + len + 20).replace(/\s+/g, " ");
}

export function scanDocuments(docs: Doc[], rules: Rule[]): Hit[] {
  const hits: Hit[] = [];
  for (const doc of docs) {
    const views = doc.path.endsWith(".html")
      ? htmlViews(doc.text)
      : doc.path.endsWith(".pdf")
        ? [doc.text]
        : [decodeEntities(doc.text.replace(/data:[^"')\s>]+/gi, "data:"))];
    const isCv = CV_PATH.test(doc.path.replace(/\\/g, "/"));
    const checks: { label: string; re: RegExp }[] = [
      ...rules.filter((r) => r.scope === "never" || !isCv).map((r) => ({ label: r.label, re: r.pattern })),
      ...PHONE_PATTERNS.map((re, i) => ({ label: `builtin-phone-${i + 1}`, re })),
      ...BANNED.map((re, i) => ({ label: `builtin-banned-${i + 1}`, re })),
    ];
    for (const { label, re } of checks) {
      for (const view of views) {
        const m = re.exec(view);
        if (m) {
          hits.push({ path: doc.path, rule: label, excerpt: excerpt(view, m.index, m[0].length) });
          break;
        }
      }
    }
  }
  return hits;
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

async function pdfText(file: string): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(readFileSync(file)));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

export async function scanDist(dir = "dist", rules?: Rule[]): Promise<Hit[]> {
  const active = rules ?? parseDenylist(loadDenylistText() ?? "");
  const docs: Doc[] = [];
  for (const file of walk(dir)) {
    if (file.endsWith(".pdf")) docs.push({ path: file, text: await pdfText(file) });
    else if (!BINARY.test(file)) docs.push({ path: file, text: readFileSync(file, "utf8") });
  }
  return scanDocuments(docs, active);
}

/**
 * Source mode: every git-tracked text file, `never` rules only. cv-only terms stay allowed in source (the CV
 * publishes them); built-in phone and banned-word patterns are not applied because the gate and its tests
 * carry them as literals.
 */
export function scanSource(rules: Rule[], cwd = process.cwd()): Hit[] {
  const files = execFileSync("git", ["ls-files", "-z"], { cwd, encoding: "utf8" }).split("\0").filter(Boolean);
  const never = rules.filter((r) => r.scope === "never");
  const docs: Doc[] = [];
  for (const file of files) {
    if (BINARY.test(file) || file.endsWith(".pdf")) continue;
    docs.push({ path: file, text: readFileSync(join(cwd, file), "utf8") });
  }
  return scanSourceDocuments(docs, never);
}

export function scanSourceDocuments(docs: Doc[], never: Rule[]): Hit[] {
  const hits: Hit[] = [];
  for (const doc of docs) {
    const text = decodeEntities(doc.text);
    // Extra views: hyphens as spaces (a term used as an id prefix, "TERM-01") and regex escapes as spaces
    // ("/\\bTERM-/" in a test) are still the term.
    const views = [text, text.replace(/-/g, " "), text.replace(/\\[a-zA-Z]|-/g, " ")];
    for (const r of never) {
      for (const view of views) {
        r.pattern.lastIndex = 0;
        const m = r.pattern.exec(view);
        if (m) {
          hits.push({ path: doc.path, rule: r.label, excerpt: excerpt(view, m.index, m[0].length) });
          break;
        }
      }
    }
  }
  return hits;
}

/**
 * Commit mode: every text file of every commit in `range` (git rev-list syntax, e.g. `a..b` or
 * `sha --not --remotes`), `never` rules only, read from the object store so the working tree is irrelevant.
 */
export function scanCommits(range: string[], rules: Rule[], cwd = process.cwd()): (Hit & { commit: string })[] {
  const git = (...args: string[]) => execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 1 << 28 });
  const never = rules.filter((r) => r.scope === "never");
  const commits = git("rev-list", "--reverse", ...range).split("\n").filter(Boolean);
  const hits: (Hit & { commit: string })[] = [];
  for (const sha of commits) {
    const entries = git("ls-tree", "-r", "-z", "--name-only", sha).split("\0").filter(Boolean);
    const docs: Doc[] = [];
    for (const path of entries) {
      if (BINARY.test(path) || path.endsWith(".pdf")) continue;
      docs.push({ path, text: git("show", `${sha}:${path}`) });
    }
    for (const h of scanSourceDocuments(docs, never)) hits.push({ ...h, commit: sha.slice(0, 7) });
  }
  return hits;
}

/** Outgoing ranges from the pre-push stdin lines: `<local ref> <local sha> <remote ref> <remote sha>`. */
export function prePushRanges(stdin: string): string[][] {
  const ranges: string[][] = [];
  for (const line of stdin.split("\n")) {
    const [, local, , remote] = line.trim().split(/\s+/);
    if (!local || /^0+$/.test(local)) continue; // deleting a remote branch pushes nothing
    ranges.push(/^0+$/.test(remote ?? "") ? [local, "--not", "--remotes"] : [`${remote}..${local}`]);
  }
  return ranges;
}

/** True when stdin has ref lines and every one deletes a remote branch (local sha all zeros). */
export function isDeleteOnly(stdin: string): boolean {
  const lines = stdin.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.length > 0 && lines.every((l) => /^0+$/.test(l.split(/\s+/)[1] ?? ""));
}

async function main() {
  const text = loadDenylistText();
  if (!text) {
    console.error("NDA gate: no denylist (set NDA_DENYLIST or create .private/nda-denylist.txt)");
    process.exit(2);
  }
  const rules = parseDenylist(text);
  if (rules.length === 0) {
    console.error("NDA gate: denylist has no rules");
    process.exit(2);
  }
  if (process.argv.includes("--commits")) {
    // Pre-push mode: ranges from the argument after --commits, or the pre-push ref lines on stdin.
    const arg = process.argv[process.argv.indexOf("--commits") + 1];
    let ranges: string[][];
    if (arg) ranges = [arg.trim().split(/\s+/)];
    else {
      const stdin = readFileSync(0, "utf8");
      ranges = prePushRanges(stdin);
      if (ranges.length === 0 && !isDeleteOnly(stdin)) {
        // Fail closed: an empty or unparsable ref list must never pass as "nothing to scan".
        console.error("NDA gate: no outgoing ranges to scan");
        process.exit(2);
      }
    }
    const hits = ranges.flatMap((r) => scanCommits(r, rules));
    if (hits.length) {
      // Never print the matched term: only the commit, the path and the rule label.
      for (const h of hits) console.error(`NDA hit: ${h.commit} ${h.path} (${h.rule})`);
      console.error(`NDA gate failed: ${hits.length} hit(s) in outgoing commits`);
      process.exit(1);
    }
    console.log(`NDA gate passed (${rules.length} rules, ${ranges.length} outgoing range(s))`);
    return;
  }
  const hits = [...(await scanDist("dist", rules)), ...scanSource(rules)];
  if (hits.length) {
    // Never print the matched term: CI logs of a public repo are public.
    for (const h of hits) console.error(`NDA hit: ${h.path} (${h.rule})`);
    console.error(`NDA gate failed: ${hits.length} hit(s)`);
    process.exit(1);
  }
  console.log(`NDA gate passed (${rules.length} rules, dist + tracked source)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    // Never print e.message or the stack: they may embed private denylist content.
    const safe = e instanceof Error && /^denylist line \d+: /.test(e.message) ? e.message : "unexpected error";
    console.error(`NDA gate error: ${safe}`);
    process.exit(2);
  });
}

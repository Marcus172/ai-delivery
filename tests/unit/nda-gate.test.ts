import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseDenylist } from "../../scripts/denylist";
import { PHONE_PATTERNS, isDeleteOnly, prePushRanges, scanCommits, scanDist, scanDocuments, scanSource, scanSourceDocuments } from "../../scripts/nda-gate";

const rules = parseDenylist(
  [
    "# fixture terms only",
    "cv-only: ACME&Co",
    "never: Globex",
    "never-re: ZZ-\\d{3}",
  ].join("\n"),
);
const html = (body: string) => `<!doctype html><html><body>${body}</body></html>`;
const scan = (path: string, text: string) => scanDocuments([{ path, text }], rules);

const pdfWith = (text: string) => {
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 100] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${`BT /F1 12 Tf 10 50 Td (${text}) Tj ET`.length} >>\nstream\nBT /F1 12 Tf 10 50 Td (${text}) Tj ET\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offs: number[] = [];
  objs.forEach((o, i) => {
    offs.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const o of offs) out += `${String(o).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
};

describe("parseDenylist", () => {
  it("ignores comments and blanks, maps scopes", () => {
    expect(rules.map((r) => r.scope)).toEqual(["cv-only", "never", "never"]);
  });
  it("matches whole words, case-insensitively", () => {
    const [r] = parseDenylist("never: Globex");
    expect(r.pattern.test("a GLOBEX b")).toBe(true);
    expect(r.pattern.test("Globexity")).toBe(false);
  });
});

describe("scanDocuments", () => {
  it("allows cv-only terms on CV page and CV PDFs", () => {
    expect(scan("dist/cv/index.html", html("ACME&Co"))).toEqual([]);
    expect(scan("dist/cs/cv/index.html", html("ACME&Co"))).toEqual([]);
    expect(scan("dist/cs/cv/marek-rom-cv-cs.pdf", "ACME&Co")).toEqual([]);
  });
  it("rejects cv-only terms elsewhere", () => {
    expect(scan("dist/index.html", html("ACME&Co"))).toHaveLength(1);
    expect(scan("dist/ai-delivery/index.html", html("ACME&Co"))).toHaveLength(1);
  });
  it("rejects never terms even in CV", () => {
    expect(scan("dist/cv/index.html", html("Globex"))).toHaveLength(1);
    expect(scan("dist/cs/cv/x.pdf", "ZZ-123")).toHaveLength(1);
  });
  it("decodes entities", () => {
    expect(scan("dist/index.html", html("ACME&amp;Co"))).toHaveLength(1);
    expect(scan("dist/index.html", html("ACME&#38;Co"))).toHaveLength(1);
    expect(scan("dist/index.html", html("ACME&#x26;Co"))).toHaveLength(1);
  });
  it("catches terms in svg text and attributes", () => {
    expect(scan("dist/index.html", html("<svg><text>Globex</text></svg>"))).toHaveLength(1);
    expect(scan("dist/index.html", html('<a aria-label="Globex">x</a>'))).toHaveLength(1);
    expect(scan("dist/index.html", html('<img alt="x" title="Globex">'))).toHaveLength(1);
  });
  it("catches terms split by inline tags", () => {
    expect(scan("dist/index.html", html("Glo<b>bex</b>"))).toHaveLength(1);
  });
  it("ignores data: URIs", () => {
    const uri = `data:image/png;base64,${Buffer.from("Globex").toString("base64")}Globex`;
    expect(scan("dist/index.html", html(`<img src="${uri}">`))).toEqual([]);
  });
  it("catches a term after a metadata: prefix in text (data: is only stripped in real data URIs)", () => {
    expect(scan("dist/index.html", html("<p>metadata:Globex</p>"))).toHaveLength(1);
    expect(scan("dist/a.txt", "metadata:Globex")).toHaveLength(1);
    expect(scan("dist/index.html", html('<a title="metadata:Globex">x</a>'))).toHaveLength(1);
  });
  it("strips only real data URIs in src, href, srcset and url()", () => {
    const uri = "data:image/png;base64,Globex";
    expect(scan("dist/index.html", html(`<img src="${uri}">`))).toEqual([]);
    expect(scan("dist/index.html", html(`<a href='${uri}'>x</a>`))).toEqual([]);
    expect(scan("dist/index.html", html(`<img srcset="${uri} 2x">`))).toEqual([]);
    expect(scan("dist/a.css", `a{background:url(${uri})}`)).toEqual([]);
    expect(scan("dist/index.html", html(`<img src="${uri}"> metadata:Globex`))).toHaveLength(1);
  });
  it("rejects phone numbers everywhere, CV included", () => {
    expect(scan("dist/index.html", html("+420 111 222 333"))).toHaveLength(1);
    expect(scan("dist/cv/index.html", html("+420 111 222 333"))).toHaveLength(1);
    expect(scan("dist/cv/x.pdf", "+420111222333")).toHaveLength(1);
    expect(scan("dist/cv/index.html", html('<a href="tel:123">x</a>'))).toHaveLength(1);
  });
  it("does not flag SVG path coordinates as phones", () => {
    expect(PHONE_PATTERNS.length).toBeGreaterThan(0);
    expect(scan("dist/index.html", html('<svg><path d="M120 340 560 780"/></svg>'))).toEqual([]);
  });
  it("rejects banned words", () => {
    expect(scan("dist/index.html", html("a Ratchet"))).toHaveLength(1);
    expect(scan("dist/cs/index.html", html("ráčna"))).toHaveLength(1);
  });
  it("hits carry path, rule and excerpt", () => {
    const [h] = scan("dist/index.html", html("see Globex here"));
    expect(h.path).toBe("dist/index.html");
    expect(h.excerpt).toContain("Globex");
    expect(h.rule).toBeTruthy();
  });
});

describe("scanDist", () => {
  it("scans html files recursively", async () => {
    const dir = mkdtempSync(join(tmpdir(), "nda-"));
    mkdirSync(join(dir, "cv"));
    writeFileSync(join(dir, "index.html"), html("Globex"));
    writeFileSync(join(dir, "cv", "index.html"), html("ACME&amp;Co"));
    const hits = await scanDist(dir, rules);
    expect(hits.map((h) => h.path)).toEqual([join(dir, "index.html")]);
  });
});

describe("scanDist non-html files and pdf", () => {
  it("scans xml, svg and other text files, skips binaries", async () => {
    const dir = mkdtempSync(join(tmpdir(), "nda-t-"));
    writeFileSync(join(dir, "sitemap.xml"), "<urlset><loc>Globex</loc></urlset>");
    writeFileSync(join(dir, "logo.svg"), "<svg><title>ACME&amp;Co</title></svg>");
    writeFileSync(join(dir, "x.png"), "Globex");
    const hits = await scanDist(dir, rules);
    expect(hits.map((h) => h.path).sort()).toEqual([join(dir, "logo.svg"), join(dir, "sitemap.xml")]);
  });

  it("extracts pdf text: hit outside cv/, allowed term inside cv/", async () => {
    const dir = mkdtempSync(join(tmpdir(), "nda-p-"));
    mkdirSync(join(dir, "cv"));
    writeFileSync(join(dir, "a.pdf"), pdfWith("ACME&Co"));
    writeFileSync(join(dir, "cv", "b.pdf"), pdfWith("ACME&Co"));
    const hits = await scanDist(dir, rules);
    expect(hits.map((h) => h.path)).toEqual([join(dir, "a.pdf")]);
  });

  it("rejects on a corrupt pdf", async () => {
    const dir = mkdtempSync(join(tmpdir(), "nda-c-"));
    writeFileSync(join(dir, "bad.pdf"), "not a pdf");
    await expect(scanDist(dir, rules)).rejects.toThrow();
  });
});

describe("parseDenylist errors", () => {
  it("malformed never-re reports line number, not the pattern", () => {
    let msg = "";
    try {
      parseDenylist("never: ok\nnever-re: SECRETPAT(unclosed");
    } catch (e) {
      msg = (e as Error).message;
    }
    expect(msg).toContain("line 2");
    expect(msg).not.toContain("SECRETPAT");
  });
});

describe("CLI", () => {
  it("exits 2 when no denylist is available", () => {
    const cwd = mkdtempSync(join(tmpdir(), "nda-cli-"));
    const r = spawnSync(
      resolve("node_modules/.bin/tsx"),
      [resolve("scripts/nda-gate.ts")],
      { cwd, env: { ...process.env, NDA_DENYLIST: "" }, encoding: "utf8" },
    );
    expect(r.status).toBe(2);
  });
  it("malformed pattern: exit 2 and output free of the pattern", () => {
    const cwd = mkdtempSync(join(tmpdir(), "nda-cli-"));
    const r = spawnSync(resolve("node_modules/.bin/tsx"), [resolve("scripts/nda-gate.ts")], {
      cwd,
      env: { ...process.env, NDA_DENYLIST: "never-re: SECRETPAT(unclosed" },
      encoding: "utf8",
    });
    expect(r.status).toBe(2);
    expect(r.stdout + r.stderr).not.toContain("SECRETPAT");
  });
});

describe("source mode", () => {
  const never = rules.filter((r) => r.scope === "never");
  it("applies never rules to any tracked file, including tests and entity-encoded text", () => {
    expect(scanSourceDocuments([{ path: "tests/unit/x.test.ts", text: "/\\bGlobex-/" }], never)).toHaveLength(1);
    expect(scanSourceDocuments([{ path: "src/a.mdx", text: "Glo&#98;ex" }], never)).toHaveLength(1);
    expect(scanSourceDocuments([{ path: "src/a.mdx", text: "ref ZZ-123" }], never)).toHaveLength(1);
  });
  it("leaves cv-only terms alone in source", () => {
    expect(scanSourceDocuments([{ path: "src/data/cv.ts", text: "ACME&Co" }], never)).toEqual([]);
    expect(scanSourceDocuments([{ path: "src/views/LandingView.astro", text: "ACME&Co" }], never)).toEqual([]);
  });
  it("scans git-tracked files of a repository and skips binaries", () => {
    const dir = mkdtempSync(join(tmpdir(), "nda-src-"));
    const git = (...args: string[]) => spawnSync("git", args, { cwd: dir, encoding: "utf8" });
    git("init", "-q");
    writeFileSync(join(dir, "clean.md"), "nothing here");
    writeFileSync(join(dir, "dirty.ts"), "const x = 'Globex';");
    writeFileSync(join(dir, "untracked.ts"), "Globex");
    writeFileSync(join(dir, "bin.png"), "Globex");
    git("add", "clean.md", "dirty.ts", "bin.png");
    const hits = scanSource(rules, dir);
    expect(hits.map((h) => h.path)).toEqual(["dirty.ts"]);
  });
  it("scans a tracked symlink as its target path, not the target's content, and survives directory links", () => {
    const dir = mkdtempSync(join(tmpdir(), "nda-link-"));
    const git = (...args: string[]) => spawnSync("git", args, { cwd: dir, encoding: "utf8" });
    git("init", "-q");
    mkdirSync(join(dir, "skills"));
    writeFileSync(join(dir, "doc.md"), "Globex");
    symlinkSync("skills", join(dir, "dir-link"));
    symlinkSync("doc.md", join(dir, "file-link.md"));
    symlinkSync("Globex.md", join(dir, "named-link.md"));
    git("add", "dir-link", "file-link.md", "named-link.md");
    const hits = scanSource(rules, dir);
    expect(hits.map((h) => h.path)).toEqual(["named-link.md"]);
  });
});

describe("commit mode", () => {
  it("derives outgoing ranges from pre-push stdin lines", () => {
    const stdin = [
      "refs/heads/main 1111111 refs/heads/main 2222222",
      "refs/heads/new 3333333 refs/heads/new 0000000000000000000000000000000000000000",
      "(delete) 0000000000000000000000000000000000000000 refs/heads/old 4444444",
      "",
    ].join("\n");
    expect(prePushRanges(stdin)).toEqual([["2222222..1111111"], ["3333333", "--not", "--remotes"]]);
  });
  it("treats a delete-only push as no ranges and not as a fail-closed case", () => {
    const del = "(delete) 0000000 refs/heads/x abc1234\n";
    expect(prePushRanges(del)).toEqual([]);
    expect(isDeleteOnly(del)).toBe(true);
  });
  it("flags empty or unparsable stdin as zero ranges that are not delete-only (gate exits 2)", () => {
    for (const stdin of ["", "\n", "garbage\n"]) {
      expect(prePushRanges(stdin).length === 0 && !isDeleteOnly(stdin)).toBe(true);
    }
    expect(isDeleteOnly("a 1111111 b 2222222\n")).toBe(false);
  });
  it("exits 2 for --commits without a range on empty stdin, 0 on delete-only stdin", () => {
    const run = (input: string) =>
      spawnSync("npx", ["tsx", resolve("scripts/nda-gate.ts"), "--commits"], {
        input,
        encoding: "utf8",
        env: { ...process.env, NDA_DENYLIST: "never: Globex" },
      });
    const empty = run("");
    expect(empty.status).toBe(2);
    expect(empty.stderr).toContain("no outgoing ranges");
    const del = run("(delete) 0000000000000000000000000000000000000000 refs/heads/x 1111111111111111111111111111111111111111\n");
    expect(del.status).toBe(0);
  });
  it("reports a never term in any commit of the range by short sha, path and label, even if later removed", async () => {
    const dir = mkdtempSync(join(tmpdir(), "nda-commits-"));
    const git = (...args: string[]) => spawnSync("git", args, { cwd: dir, encoding: "utf8" }).stdout.trim();
    git("init", "-q");
    git("config", "user.email", "t@example.com");
    git("config", "user.name", "t");
    git("config", "commit.gpgsign", "false");
    writeFileSync(join(dir, "a.md"), "clean");
    git("add", "a.md");
    git("commit", "-q", "-m", "one");
    const base = git("rev-parse", "HEAD");
    writeFileSync(join(dir, "b.ts"), "const x = /\\bGlobex-/;");
    writeFileSync(join(dir, "cv.ts"), "ACME&Co");
    git("add", "b.ts", "cv.ts");
    git("commit", "-q", "-m", "two");
    const dirty = git("rev-parse", "--short=7", "HEAD");
    writeFileSync(join(dir, "b.ts"), "clean again");
    git("add", "b.ts");
    git("commit", "-q", "-m", "three");
    const hits = await scanCommits([`${base}..HEAD`], rules, dir);
    expect(hits.map((h) => [h.commit, h.path, h.rule])).toEqual([[dirty, "b.ts", "never@3"]]);
    expect(await scanCommits([base], rules, dir)).toEqual([]);
  });
  const repo = () => {
    const dir = mkdtempSync(join(tmpdir(), "nda-meta-"));
    const git = (...args: string[]) => spawnSync("git", args, { cwd: dir, encoding: "utf8" }).stdout.trim();
    git("init", "-q");
    git("config", "user.email", "t@example.com");
    git("config", "user.name", "t");
    git("config", "commit.gpgsign", "false");
    return { dir, git };
  };
  it("scans commit messages and author names", async () => {
    const { dir, git } = repo();
    writeFileSync(join(dir, "a.md"), "clean");
    git("add", "a.md");
    git("commit", "-q", "-m", "mention Globex here");
    const sha = git("rev-parse", "--short=7", "HEAD");
    git("-c", "user.name=Zed Globex", "commit", "-q", "--allow-empty", "-m", "innocent");
    const sha2 = git("rev-parse", "--short=7", "HEAD");
    const hits = await scanCommits(["HEAD"], rules, dir);
    expect(hits.map((h) => [h.commit, h.path, h.rule])).toEqual([
      [sha, "(message)", "never@3"],
      [sha2, "(message)", "never@3"],
    ]);
  });
  it("scans file paths", async () => {
    const { dir, git } = repo();
    writeFileSync(join(dir, "Globex notes.md"), "clean");
    git("add", ".");
    git("commit", "-q", "-m", "x");
    const hits = await scanCommits(["HEAD"], rules, dir);
    expect(hits.map((h) => [h.path, h.rule])).toEqual([["Globex notes.md", "never@3"]]);
  });
  it("extracts text from committed pdfs", async () => {
    const { dir, git } = repo();
    writeFileSync(join(dir, "doc.pdf"), pdfWith("Globex"));
    writeFileSync(join(dir, "ok.pdf"), pdfWith("harmless"));
    git("add", ".");
    git("commit", "-q", "-m", "x");
    const hits = await scanCommits(["HEAD"], rules, dir);
    expect(hits.map((h) => [h.path, h.rule])).toEqual([["doc.pdf", "never@3"]]);
  });
});

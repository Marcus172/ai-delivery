import { describe, expect, it } from "vitest";
import { TOOLS, splitTools, tool } from "../../src/data/tools";
import { linkToolsInHtml } from "../../src/lib/link-tools-html";

const linked = (text: string) =>
  splitTools(text, new Set())
    .filter((p) => typeof p !== "string")
    .map((p) => (typeof p === "string" ? "" : `${p.tool.id}:${p.text}`));

describe("tools registry", () => {
  it("has unique ids and https links only", () => {
    expect(new Set(TOOLS.map((x) => x.id)).size).toBe(TOOLS.length);
    for (const x of TOOLS) expect(x.url, x.id).toMatch(/^https:\/\//);
  });

  it("finds Czech inflections and prefers the longer phrase", () => {
    expect(linked("jeden vývojář jede na Paseu, druhý na worktrunku")).toEqual(["paseo:Paseu", "worktrunk:worktrunku"]);
    expect(linked("přes marketplace pluginů pro Claude Code")).toEqual(["plugin-marketplace:marketplace pluginů pro Claude Code"]);
    expect(linked("návrh ve Figmě")).toEqual(["figma:Figmě"]);
  });

  it("links a guarded name only in its context, even after another link", () => {
    expect(linked("through OpenCode or Pi, including local models")).toEqual(["opencode:OpenCode", "pi:Pi"]);
    expect(linked("Pi is a number")).toEqual([]);
    expect(linked("secrets, encrypted with age")).toEqual(["age:age"]);
    expect(linked("the age of agents")).toEqual([]);
  });

  it("links each tool once per shared set", () => {
    const seen = new Set<string>();
    expect(splitTools("Paseo and Paseo", seen).filter((p) => typeof p !== "string")).toHaveLength(1);
    expect(splitTools("Paseo again", seen).filter((p) => typeof p !== "string")).toHaveLength(0);
  });

  it("prefers the longer framework name", () => {
    expect(linked("React Native and React Query, then React")).toEqual(["react-native:React Native", "react-query:React Query", "react:React"]);
    expect(linked("GitHub Pages and GitHub")).toEqual(["github-pages:GitHub Pages", "github:GitHub"]);
  });

  it("describes every tool on the Toolkit page in both locales, with https links", () => {
    const listed = TOOLS.filter((x) => x.group);
    expect(listed.length).toBeGreaterThan(25);
    for (const x of listed) {
      expect(x.what?.en.trim(), x.id).toBeTruthy();
      expect(x.what?.cs.trim(), x.id).toBeTruthy();
      if (x.docs) expect(x.docs, x.id).toMatch(/^https:\/\//);
    }
  });

  it("puts every tool either on the Toolkit page or explicitly in the text only", () => {
    for (const x of TOOLS) {
      expect(Boolean(x.group) !== Boolean(x.textOnly), `${x.id}: needs exactly one of group / textOnly`).toBe(true);
      if (x.textOnly) expect([x.what, x.docs, x.video, x.label].filter(Boolean), `${x.id}: Toolkit fields on a text-only tool`).toEqual([]);
    }
  });

  it("throws on an unknown id", () => {
    expect(tool("paseo").url).toBe("https://paseo.sh/");
    expect(() => tool("nope")).toThrow();
  });
});

describe("linkToolsInHtml", () => {
  it("links once per block, headings included; leaves links, attributes and SVG alone", () => {
    const html =
      '<h3>Paseo setup</h3><p title="Paseo">I run <strong>Paseo</strong>.</p><a href="#x">chezmoi</a><svg><text>Tailscale</text></svg><p>chezmoi and Tailscale</p>';
    const out = linkToolsInHtml(html);
    expect(out).toContain('<h3><a class="tool-link" href="https://paseo.sh/" data-tool="paseo">Paseo</a> setup</h3>');
    expect(out).toContain('<p title="Paseo">I run <strong><a class="tool-link" href="https://paseo.sh/" data-tool="paseo">Paseo</a></strong>.</p>');
    expect(out).toContain('<a href="#x">chezmoi</a>');
    expect(out).toContain("<svg><text>Tailscale</text></svg>");
    expect(out).toContain('<p><a class="tool-link" href="https://www.chezmoi.io/" data-tool="chezmoi">chezmoi</a> and <a class="tool-link" href="https://tailscale.com/" data-tool="tailscale">Tailscale</a></p>');
  });
});

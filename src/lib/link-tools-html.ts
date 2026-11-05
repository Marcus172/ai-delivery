import { splitTools } from "../data/tools";

/** Elements whose text is never linked: links already, code, SVG (a role="img" has no inner links), controls. */
const SKIP = new Set(["a", "code", "pre", "svg", "script", "style", "summary", "button", "title", "textarea"]);
/** Each of these starts a fresh count: a tool is linked once per paragraph, list item, cell or heading. */
const BLOCK = new Set(["p", "li", "dt", "dd", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6", "figcaption", "blockquote", "aside"]);
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

/**
 * Link every external tool in rendered HTML to its official site, once per block (paragraph, list item,
 * cell, heading). Works on the text between tags only, so attributes, existing links and markup stay.
 */
export function linkToolsInHtml(html: string): string {
  let skip = 0;
  let seen = new Set<string>();
  return html
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith("<")) {
        const m = /^<(\/?)([a-zA-Z][\w-]*)/.exec(part);
        if (m) {
          const name = m[2].toLowerCase();
          if (SKIP.has(name) && !VOID.has(name) && !part.endsWith("/>")) skip += m[1] ? -1 : 1;
          if (BLOCK.has(name)) seen = new Set();
        }
        return part;
      }
      if (skip > 0 || !part.trim()) return part;
      return splitTools(part, seen)
        .map((p) => (typeof p === "string" ? p : `<a class="tool-link" href="${p.tool.url}" data-tool="${p.tool.id}">${p.text}</a>`))
        .join("");
    })
    .join("");
}

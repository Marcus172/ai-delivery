import { spawn, type ChildProcess } from "node:child_process";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

/**
 * Renders the CV route of each locale to an A4 PDF under `outDir`, next to the page it was
 * rendered from, so the CTA links (`<cv path>marek-rom-cv-<locale>.pdf`) resolve from dist/.
 * Print media + the site's `@media print` rules: light theme, no rail/footer/toggles.
 */
export const PDF_TARGETS = [
  { locale: "en", route: "cv/", file: "cv/marek-rom-cv-en.pdf" },
  { locale: "cs", route: "cs/cv/", file: "cs/cv/marek-rom-cv-cs.pdf" },
] as const;

export async function generatePdfs(baseUrl: string, outDir = "dist"): Promise<string[]> {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const browser = await chromium.launch();
  const written: string[] = [];
  try {
    const context = await browser.newContext({ colorScheme: "light", locale: "en" });
    for (const target of PDF_TARGETS) {
      const page = await context.newPage();
      await page.addInitScript(() => {
        try {
          localStorage.setItem("theme", "light");
        } catch {}
      });
      await page.emulateMedia({ media: "print", colorScheme: "light" });
      const res = await page.goto(`${base}${target.route}`, { waitUntil: "networkidle" });
      if (!res || !res.ok()) throw new Error(`${base}${target.route} answered ${res?.status() ?? "nothing"}`);
      await page.evaluate(() => document.fonts.ready);
      const path = join(outDir, target.file);
      mkdirSync(dirname(path), { recursive: true });
      await page.pdf({ path, format: "A4", printBackground: true, preferCSSPageSize: true });
      written.push(path);
      await page.close();
    }
  } finally {
    await browser.close();
  }

  return written;
}

const PORT = Number(process.env.PDF_PORT ?? 4329);
const BASE_PATH = "/ai-delivery/";

async function waitFor(url: string, child: ChildProcess, timeoutMs = 30_000): Promise<void> {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    if (child.exitCode !== null) throw new Error(`astro preview exited with ${child.exitCode}`);
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`astro preview did not answer on ${url} within ${timeoutMs} ms`);
}

/** Starts `astro preview` in the foreground (`--ignore-lock` opts out of Astro's self-backgrounding), renders, stops it. */
async function main() {
  const require = createRequire(import.meta.url);
  const astroPkg = require.resolve("astro/package.json");
  const astroBin = join(dirname(astroPkg), require(astroPkg).bin.astro);
  const child = spawn(process.execPath, [astroBin, "preview", "--ignore-lock", "--port", String(PORT)], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  const baseUrl = `http://localhost:${PORT}${BASE_PATH}`;
  try {
    await waitFor(baseUrl, child);
    const files = await generatePdfs(baseUrl);
    for (const f of files) console.log(`pdf: ${f}`);
  } finally {
    child.kill("SIGTERM");
    await new Promise<void>((resolve) => {
      if (child.exitCode !== null) return resolve();
      child.once("exit", () => resolve());
      setTimeout(() => {
        child.kill("SIGKILL");
        resolve();
      }, 3_000).unref();
    });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}

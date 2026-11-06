// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

const base = "/ai-delivery";

export default defineConfig({
  site: "https://marcus172.github.io",
  base,
  trailingSlash: "always",
  redirects: {
    "/sources/": `${base}/toolkit/`,
    "/cs/sources/": `${base}/cs/toolkit/`,
  },
  integrations: [mdx()],
  i18n: {
    locales: ["en", "cs"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
});

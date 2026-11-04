// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://marcus172.github.io",
  base: "/ai-delivery",
  trailingSlash: "always",
  integrations: [mdx()],
  i18n: {
    locales: ["en", "cs"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
});

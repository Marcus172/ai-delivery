import { getViteConfig } from "astro/config";

// Astro's Vite config lets unit tests render .astro components through the container API.
export default getViteConfig({
  test: { include: ["tests/unit/**/*.test.ts"], passWithNoTests: true },
});

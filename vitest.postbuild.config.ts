import { defineConfig } from "vitest/config";

/** Assertions on build artefacts (`dist/`): run after `npm run build && npm run pdf`, never with `test:unit`. */
export default defineConfig({
  test: { include: ["tests/post-build/**/*.test.ts"], passWithNoTests: false },
});

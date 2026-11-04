import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:4321/ai-delivery/" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview -- --ignore-lock",
    url: "http://localhost:4321/ai-delivery/",
    reuseExistingServer: !process.env.CI,
  },
});

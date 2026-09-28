import { defineConfig } from "@playwright/test";
import { E2E_BASE_URL, sharedProjects, sharedWebServer } from "./playwright.shared";

// Baseline reference screenshots live under tests/e2e-baseline/ with their
// own config (playwright.baseline.config.ts) so they are never discovered
// or overwritten by a plain `npx playwright test` / `npm run test:e2e` run.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: E2E_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: sharedProjects,
  webServer: sharedWebServer,
});

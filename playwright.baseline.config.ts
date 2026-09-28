import { defineConfig } from "@playwright/test";
import { E2E_BASE_URL, sharedProjects, sharedWebServer } from "./playwright.shared";

// Deliberately separate from playwright.config.ts: a plain
// `npx playwright test` or `npm run test:e2e` never loads this file, so it
// can never touch the reviewed baseline images. Only
// `npm run test:e2e:baseline` runs this config, and the spec itself refuses
// to overwrite an existing baseline image unless ALLOW_BASELINE_OVERWRITE=1.
export default defineConfig({
  testDir: "./tests/e2e-baseline",
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: E2E_BASE_URL,
  },
  projects: sharedProjects,
  webServer: sharedWebServer,
});

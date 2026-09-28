import { defineConfig } from "@playwright/test";
import { E2E_ASTRO_BASE_URL, E2E_ASTRO_HOST, E2E_ASTRO_PORT, sharedProjects } from "./playwright.shared";

// Astro comparison screenshots — separate testDir/config from both the
// protected original baseline (playwright.baseline.config.ts) and the
// Astro behavioral suite (playwright.astro.config.ts), so none of the
// three can discover or interfere with each other.
export default defineConfig({
  testDir: "./tests/e2e-baseline-astro",
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: E2E_ASTRO_BASE_URL,
  },
  projects: sharedProjects,
  webServer: {
    command: `npm run astro:build && node scripts/static-preview-server.mjs --dir dist-astro --port ${E2E_ASTRO_PORT} --host ${E2E_ASTRO_HOST}`,
    url: E2E_ASTRO_BASE_URL,
    reuseExistingServer: false,
    timeout: 2 * 60 * 1000,
  },
});

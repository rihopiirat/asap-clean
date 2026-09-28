import { defineConfig } from "@playwright/test";
import { E2E_ASTRO_BASE_URL, E2E_ASTRO_HOST, E2E_ASTRO_PORT, sharedProjects } from "./playwright.shared";

// Runs the SAME spec files as playwright.config.ts (testDir below is the
// same tests/e2e/ directory) against the Astro static build instead of the
// original Next.js/vinext site — reusing the existing behavioral
// assertions rather than duplicating the suite. The one spec that must
// behave differently per target (tests/e2e/initial-html-lang.spec.ts) reads
// SITE_TARGET, set here, to know it's running against Astro (where the lang
// defect is fixed, so no test.fail() markers apply).
process.env.SITE_TARGET = "astro";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report-astro" }]],
  use: {
    baseURL: E2E_ASTRO_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: sharedProjects,
  webServer: {
    // Always builds fresh before serving — can never test stale output.
    // Not `astro preview`: this Astro version self-daemonizes it into a
    // detached background process (its own pidfile/lock), which exits the
    // direct child almost immediately — incompatible with Playwright's
    // webServer, which needs the process it spawns to stay alive as the
    // server. scripts/static-preview-server.mjs is a plain foreground
    // static server instead (no new dependency).
    command: `npm run astro:build && node scripts/static-preview-server.mjs --dir dist-astro --port ${E2E_ASTRO_PORT} --host ${E2E_ASTRO_HOST}`,
    url: E2E_ASTRO_BASE_URL,
    reuseExistingServer: false,
    timeout: 2 * 60 * 1000,
  },
});

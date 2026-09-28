import { defineConfig } from "@playwright/test";
import { E2E_ASTRO_BASE_URL, E2E_ASTRO_HOST, E2E_ASTRO_PORT, sharedProjects } from "./playwright.shared";

// Dedicated test directory for the Astro site — NOT tests/e2e (the
// original site's suite). The simplified launch version's content
// diverged too far from the original's (2 locales instead of 4, no
// "how it works" section, flat service list instead of cards, real
// tel:/wa.me contact buttons instead of a disabled placeholder) for
// literal spec-file reuse to still make sense; see tests/e2e-astro/.
export default defineConfig({
  testDir: "./tests/e2e-astro",
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

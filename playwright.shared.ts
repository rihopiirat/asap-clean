import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

// Port dedicated to Playwright's own server, distinct from `vinext dev`'s
// default 3000, so this never collides with (or gets mistaken for) a
// developer's already-running dev server.
export const E2E_PORT = 4173;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

// Separate port for the Astro static build's preview server (distinct from
// the original site's E2E_PORT above, so the two could even run
// concurrently without colliding). scripts/static-preview-server.mjs binds
// to 127.0.0.1 explicitly by default — using the same literal address here
// (not "localhost") guarantees Playwright's health check and the browser
// both hit the exact interface the server is actually listening on.
export const E2E_ASTRO_HOST = "127.0.0.1";
export const E2E_ASTRO_PORT = 4321;
export const E2E_ASTRO_BASE_URL = `http://${E2E_ASTRO_HOST}:${E2E_ASTRO_PORT}`;

// SITES_BUILD_TIMEOUT (default 3m) + SITES_BUILD_KILL_AFTER (default 10s) is
// the worst case for `npm run build` alone; add headroom for `vinext start`
// to boot afterwards.
export const WEB_SERVER_TIMEOUT_MS = 5 * 60 * 1000;

export const sharedProjects: PlaywrightTestConfig["projects"] = [
  {
    name: "chromium-desktop",
    use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
  },
  {
    name: "chromium-mobile",
    use: { ...devices["Pixel 7"] },
  },
];

export const sharedWebServer: PlaywrightTestConfig["webServer"] = {
  // Always a fresh build + fresh server: never reuse whatever might already
  // be listening on this port (e.g. a leftover `npm run dev`).
  command: `npm run build && PORT=${E2E_PORT} npm run start`,
  url: E2E_BASE_URL,
  reuseExistingServer: false,
  timeout: WEB_SERVER_TIMEOUT_MS,
};

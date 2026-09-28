import { defineConfig } from "astro/config";

// Static site (default output mode) for Cloudflare Pages — no adapter,
// no runtime, Pages just serves the built dist-astro/ files directly.
// outDir is temporarily "dist-astro" (not "dist") so this can never
// collide with the existing vinext build while both stacks coexist
// (see the migration plan, Milestone 1). Renamed back to "dist" at cutover.
export default defineConfig({
  output: "static",
  outDir: "dist-astro",
  i18n: {
    // Simplified launch version: Dutch and English only (Italian and
    // Romanian dropped per the approved business cards, which are NL/EN).
    locales: ["nl", "en"],
    defaultLocale: "nl",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    css: {
      // Without this, Vite auto-detects and applies the project ROOT's
      // postcss.config.mjs (wired in for the old Next.js/vinext + Tailwind
      // stack) to Astro's own CSS too. An inline config here (even empty)
      // stops that file-based auto-detection, keeping the two pipelines
      // isolated. Confirmed via a probe build: without this, Astro's build
      // failed trying to compile Tailwind's @apply directive.
      postcss: { plugins: [] },
    },
  },
});

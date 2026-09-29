import { defineConfig } from "astro/config";

// Static site (default output mode) for Cloudflare Pages — no adapter,
// no runtime, Pages just serves the built dist-astro/ files directly.
// outDir is temporarily "dist-astro" (not "dist") so this can never
// collide with the existing vinext build while both stacks coexist
// (see the migration plan, Milestone 1). Renamed back to "dist" at cutover.
export default defineConfig({
  output: "static",
  outDir: "dist-astro",
  // Not the default "./src": vinext/Next.js also recognizes a src/pages/
  // directory as its own legacy Pages Router convention, regardless of
  // where its own app/ router lives. While robots.txt.ts and sitemap.xml.ts
  // (now at astro-src/pages/) briefly lived at src/pages/, vinext started
  // building them as routes into the ORIGINAL site's production build —
  // real cross-stack interference, caught by the routine "does the
  // original build stay clean" check. A source directory name Next.js
  // doesn't recognize avoids it entirely.
  srcDir: "./astro-src",
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

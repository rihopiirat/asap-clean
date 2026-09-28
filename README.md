# vinext-starter

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Linux with `flock`, `curl`, and GNU `timeout` — required only for `npm run install:ci`, the remote Sites builder's own install path. Local development on macOS or Linux doesn't need these; use `npm ci` directly (see "Local Development Setup" below).

## Local Development Setup

For a fresh checkout:

```bash
npm ci
npx playwright install chromium
```

- `npm ci` installs the locked dependencies and is portable (macOS and Linux). Use it for local development rather than `npm run install:ci`, which is a Linux-only wrapper intended for the remote Sites builder (see "Sites Lifecycle" below) and will not run on macOS.
- `npx playwright install chromium` downloads the Chromium browser binary the Playwright regression suite needs (`npm run test:e2e` / `npm run test:e2e:baseline`). It isn't installed by `npm ci` itself and only needs to be run once per machine.

## Sites Lifecycle

The Sites lifecycle CLI runs the locked dependency install before returning this checkout. Edit the source under `app/`, then checkpoint when a coherent milestone is ready to inspect or share. The remote Sites builder runs `npm run build` against the pushed commit. Do not repeat install or build as a normal pre-checkpoint step.

This starter does not use `wrangler.jsonc`.

`install:ci` is intentionally a single, non-retrying `npm ci`. It refuses a concurrent install for the same project, consumes a matching image-seeded npm cache with `--prefer-offline` while retaining registry fallback for a missing cache object, otherwise downloads and verifies the complete vinext tarball recorded in `package-lock.json`, limits npm to one socket, and terminates a stalled install. `build` applies a short timeout. These helpers target Linux and use GNU `timeout`; they are not native macOS scripts.

Scripts that need writable project-scoped home, npm, XDG, and temporary paths use `scripts/sites-env.sh`. The `dev` and `start` scripts honor the caller's runtime environment and keep Wrangler logs inside the checkout. The generated `.sites-runtime/` directory is disposable and ignored by Git.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with
  `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper
  module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can
  prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned
  `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Diagnostic Commands

### Routine local verification

Run these as part of normal development — not only to diagnose a remote failure:

- `npm run lint`: ESLint across the project
- `npm run typecheck`: `tsc --noEmit` across the project
- `npm run build`: build the deployable Sites artifact
- `npm test`: build, then run the `node --test` suite in `tests/*.test.mjs`
- `npm run test:e2e`: run the Playwright regression suite (Chromium, desktop + mobile viewports) against a freshly built production server on `http://localhost:4173`

### Other commands

- `npm run dev`: start the Vite/Vinext development server
- `npm run start`: start the built Vinext application
- `npm run install:ci`: the remote Sites builder's own bounded lockfile install — Linux-only (GNU `flock`/`timeout`); use plain `npm ci` for local development instead (see "Local Development Setup")
- `npm run db:generate`: generate Drizzle migrations after schema changes

### Baseline screenshots (protected, separate from routine checks)

- `npm run test:e2e:baseline`: captures the 8 reference screenshots (4 locales × 2 viewports) into `tests/e2e-baseline/baseline-images/` for manual review. This is deliberately **not** part of `npm run test:e2e` or a plain `npx playwright test` — it runs from its own Playwright config (`playwright.baseline.config.ts`) against its own test directory (`tests/e2e-baseline/`), so routine verification can never discover or overwrite it. The capture script itself also refuses to overwrite an existing image; run `ALLOW_BASELINE_OVERWRITE=1 npm run test:e2e:baseline` only when you specifically intend to replace the reviewed baseline set.

---

The timeout defaults can be overridden for a controlled canary with `SITES_INSTALL_TIMEOUT`, `SITES_INSTALL_KILL_AFTER`, `SITES_BUILD_TIMEOUT`, and `SITES_BUILD_KILL_AFTER`. A timeout fails the command; the helpers never retry an unchanged install or build.

`npm run build` and `npm test` no longer require GNU `timeout` — `scripts/build-verified.sh` runs the build through `scripts/run-with-timeout.mjs`, a small Node-only equivalent (see its own tests in `tests/run-with-timeout.test.mjs`), so both work on macOS with no global tool installation. `npm run install:ci` is unchanged and still requires Linux `flock`/GNU `timeout` (see Prerequisites) — it wasn't touched, since local development uses `npm ci` instead.

## Astro site (simplified launch version)

A second, static Astro site lives alongside the original Next.js/vinext site during the migration (see "Sites Lifecycle" above — the original stack is untouched and still builds/deploys exactly as before). It's a from-scratch, minimal bilingual (Dutch/English) site sourced directly from the approved A.S.A.P. Clean business cards (`assets-source/*.pdf`, not committed — see `.gitignore`), not a port of the old prototype's placeholder copy.

**Local commands** (temporary `astro:*` naming while both stacks coexist — see the migration plan for the Milestone 3 rename):

```bash
npm run astro:check   # type-checks .astro files (scoped tsconfig.astro.json)
npm run astro:build   # builds the static site into dist-astro/
npm run astro:dev     # dev server
npm run test:astro    # builds fresh, then asserts on the generated HTML
npm run test:e2e:astro          # Playwright behavioral suite (tests/e2e-astro/)
npm run test:e2e:baseline:astro # reference screenshots for manual review only (not pixel-compared)
```

### Cloudflare Pages deployment settings

The Astro site builds to plain static HTML/CSS/assets — no adapter, no Worker runtime, no bindings, no environment variables required. Cloudflare Pages just needs to serve the output directory.

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `npm run astro:build` |
| Build output directory | `dist-astro` |
| Root directory | `/` (repo root) |
| Node version | `NODE_VERSION=24.21.0` — matches the runtime this was built and tested against locally |
| Environment variables | none required |
| Custom domain | `asapclean.nl` (add once the Pages project exists; if the domain's DNS is already on Cloudflare, this is a one-click "Add custom domain" in the Pages project settings) |

The site currently ships **two** noindex directives on every page (deliberately kept for this review/preview stage — see `src/layouts/CleaningLayout.astro`): `<meta name="robots" content="noindex, nofollow">` and `<meta name="googlebot" content="noindex, nofollow">`. Both must be removed — not just one — as a separate, explicit step whenever the site is ready to actually be indexed; nothing here does that automatically.

Not done as part of this milestone (per instruction): no Cloudflare Pages project was created, nothing was deployed, and no DNS was touched. The table above is what to enter when you're ready to do that yourself.

## Known gaps / backlog

- **No mobile menu.** Below 920px, `.desktop-nav` is hidden (`app/globals.css`) with nothing replacing it — only the brand and language switcher remain. Tracked as backlog work for after the Astro migration: an accessible toggle button with `aria-expanded` state, full keyboard operability, a closing interaction, and working section links once open.
- **Incorrect initial server-rendered `<html lang>`.** `app/layout.tsx` hard-codes `lang="nl"` for every route; the correct locale is only applied client-side via a `useEffect` in `app/site/CleaningPage.tsx`. So `/en`, `/it`, and `/ro` all serve `lang="nl"` in the raw HTML until hydration. Tracked via the three `test.fail()` cases in `tests/e2e/initial-html-lang.spec.ts` — remove the marker for a locale once its route renders the correct `lang` server-side (the Astro migration is the natural point to fix this properly, since each route can own its own server-rendered `<html>`).
- **Unsupported scrollbar utility classes in the (unused) shadcn component catalog.** `components/ui/message-scroller.tsx` and `components/ui/attachment.tsx` use the class names `scrollbar-thin`, `scrollbar-none`, and `scrollbar-gutter-stable`, but none of the three has a matching utility definition anywhere in this project's Tailwind setup: core `tailwindcss` defines none, `tw-animate-css` defines none, and the vendored `vendor/shadcn-tailwind-4.13.0.css` defines only a differently-named `no-scrollbar` utility (itself unused anywhere in scanned source). So none of the three currently produce any CSS. Neither component is imported by the live site, so this has no visitor-facing effect today. Fixing it (if these components are ever wired up) would mean either adding a scrollbar-styling Tailwind plugin — the class names resemble the convention used by such plugins, though none has been verified to supply exactly these three — or hand-authoring matching `@utility` definitions in the vendor catalog. `tests/ui-components.test.mjs` documents this gap with a comment rather than asserting on it.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)

// This starter declares its Cloudflare bindings via .openai/hosting.json +
// vite.config.ts rather than a wrangler.jsonc (see README), so there is no
// `wrangler types`-generated file to bring in @cloudflare/workers-types and
// merge this project's actual bindings into the ambient `Env` type. This
// file does that by hand, minimally, for exactly the bindings the app
// (worker/index.ts) and db/index.ts actually use.
/// <reference types="@cloudflare/workers-types" />

declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
  }
}

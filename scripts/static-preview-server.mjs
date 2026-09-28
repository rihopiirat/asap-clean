#!/usr/bin/env node
// Minimal static file server for previewing an Astro static build in tests.
// `astro preview` (this Astro version) self-daemonizes into a detached
// background process tracked by its own pidfile/lock — the direct process
// a caller spawns exits almost immediately, which is incompatible with
// Playwright's webServer (it needs the process it spawns to stay alive as
// the actual server, so it can manage the server's lifecycle directly).
// This is a plain foreground static server instead: no new dependency,
// consistent with this project's existing "Node is the only hard
// requirement" approach (see scripts/run-with-timeout.mjs).

import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

// Default to loopback-only: this server exists purely to let Playwright
// drive a local build during tests, never to be reachable from the LAN.
export const DEFAULT_HOST = "127.0.0.1";

export function parseArgs(argv) {
  let dir;
  let port;
  let host = DEFAULT_HOST;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dir") dir = argv[++i];
    else if (argv[i] === "--port") port = Number(argv[++i]);
    else if (argv[i] === "--host") host = argv[++i];
  }
  if (!dir) throw new Error("--dir <path> is required");
  if (!port) throw new Error("--port <number> is required");
  return { dir: path.resolve(dir), port, host };
}

// Boundary-aware containment: `target` must be `root` itself or a path
// strictly inside it. A plain `target.startsWith(root)` string-prefix
// check (the previous, incorrect version of this file) wrongly treats a
// SIBLING directory that merely shares a name prefix — e.g. root
// "/x/dist-astro" and target "/x/dist-astro-private/secret.html" — as
// contained, since the string "/x/dist-astro-private/..." does start with
// the string "/x/dist-astro". Comparing against `root + path.sep` closes
// that gap.
export function isPathContained(root, target) {
  return target === root || target.startsWith(root + path.sep);
}

// Resolves a request path to a real file inside `rootDir`, or null.
// `rootDir` must already be the fully resolved, symlink-free real path of
// the served directory (see run()). Containment is checked twice: once on
// the lexically resolved path (rejects `..` segments and sibling
// directories immediately, without touching the filesystem for anything
// outside rootDir), and again on the REAL path after resolving symlinks
// (rejects a symlink that lives inside rootDir but points outside it).
export async function resolveFile(rootDir, urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const candidates = decoded.endsWith("/")
    ? [path.join(rootDir, decoded, "index.html")]
    : [path.join(rootDir, decoded), path.join(rootDir, decoded, "index.html"), path.join(rootDir, `${decoded}.html`)];

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (!isPathContained(rootDir, resolved)) continue;

    try {
      const info = await stat(resolved);
      if (!info.isFile()) continue;

      const real = await realpath(resolved);
      if (!isPathContained(rootDir, real)) continue;

      return real;
    } catch {
      // Candidate doesn't exist (or isn't readable) — try the next one.
    }
  }
  return null;
}

export function createStaticServer(rootDir) {
  return createServer(async (req, res) => {
    try {
      const filePath = await resolveFile(rootDir, req.url ?? "/");
      if (!filePath) {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
      }
      const body = await readFile(filePath);
      const contentType = CONTENT_TYPES[path.extname(filePath)] ?? "application/octet-stream";
      res.writeHead(200, { "content-type": contentType });
      res.end(body);
    } catch (err) {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end(`Internal error: ${err.message}`);
    }
  });
}

async function run() {
  const { dir, port, host } = parseArgs(process.argv.slice(2));
  // Resolve the served root to its real (symlink-free) path once, up
  // front, so every per-request containment check compares against a
  // canonical root.
  const rootDir = await realpath(dir);

  const server = createStaticServer(rootDir);

  server.listen(port, host, () => {
    console.log(`static-preview-server: serving ${rootDir} at http://${host}:${port}`);
  });

  const shutdown = () => server.close(() => process.exit(0));
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  try {
    await run();
  } catch (err) {
    console.error(`static-preview-server: ${err.message}`);
    console.error("usage: static-preview-server.mjs --dir <path> --port <number> [--host <address>]");
    process.exit(2);
  }
}

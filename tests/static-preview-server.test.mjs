import assert from "node:assert/strict";
import { mkdtemp, mkdir, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { connect } from "node:net";
import path from "node:path";
import test, { after, before } from "node:test";

import { createStaticServer, isPathContained, resolveFile } from "../scripts/static-preview-server.mjs";

// --- isPathContained: the exact bug this file regression-tests ---
// The previous version used `target.startsWith(root)`, a plain string
// prefix check, which wrongly treats a SIBLING directory that merely
// shares a name prefix as contained.
test("isPathContained rejects a sibling directory that shares a name prefix", () => {
  assert.equal(isPathContained("/x/dist-astro", "/x/dist-astro-private/secret.html"), false);
});

test("isPathContained accepts the root itself and a proper nested child", () => {
  assert.equal(isPathContained("/x/dist-astro", "/x/dist-astro"), true);
  assert.equal(isPathContained("/x/dist-astro", "/x/dist-astro/en/index.html"), true);
});

test("isPathContained rejects a path that escapes via ..", () => {
  const root = "/x/dist-astro";
  const escaped = path.resolve(root, "../dist-astro-private/secret.html");
  assert.equal(isPathContained(root, escaped), false);
});

// --- Fixture-backed integration tests, against a real server ---
let fixtureRoot;
let servedDir; // realpath of <fixtureRoot>/dist-astro
let server;
let port;

before(async () => {
  fixtureRoot = await mkdtemp(path.join(tmpdir(), "static-preview-server-"));

  const publicDir = path.join(fixtureRoot, "dist-astro");
  const privateDir = path.join(fixtureRoot, "dist-astro-private");
  await mkdir(path.join(publicDir, "en"), { recursive: true });
  await mkdir(privateDir, { recursive: true });

  await writeFile(path.join(publicDir, "index.html"), "<html><body>INDEX_MARKER</body></html>");
  await writeFile(path.join(publicDir, "en", "index.html"), "<html><body>EN_MARKER</body></html>");
  await writeFile(path.join(publicDir, "style.css"), "body{color:red}");
  await writeFile(path.join(privateDir, "secret.html"), "SECRET_MARKER");

  // A symlink INSIDE the served root pointing OUTSIDE it — the specific
  // case realpath-based containment exists to catch.
  await symlink(privateDir, path.join(publicDir, "escape-link"));

  servedDir = await realpath(publicDir);
  server = createStaticServer(servedDir);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  port = server.address().port;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(fixtureRoot, { recursive: true, force: true });
});

// Sends a request with the EXACT raw path bytes given, bypassing any
// client-side URL normalization (fetch/http.request may normalize `..`
// segments before a request is even sent) — the point is to prove the
// SERVER rejects traversal, not that some HTTP client cleaned it up first.
function rawGet(rawPath) {
  return new Promise((resolve, reject) => {
    const socket = connect(port, "127.0.0.1", () => {
      socket.write(`GET ${rawPath} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n`);
    });
    let data = "";
    socket.on("data", (chunk) => (data += chunk));
    socket.on("end", () => {
      const [head, ...bodyParts] = data.split("\r\n\r\n");
      const statusLine = head.split("\r\n")[0];
      const status = Number(statusLine.split(" ")[1]);
      resolve({ status, body: bodyParts.join("\r\n\r\n") });
    });
    socket.on("error", reject);
  });
}

test("serves a normal page at the root", async () => {
  const { status, body } = await rawGet("/");
  assert.equal(status, 200);
  assert.match(body, /INDEX_MARKER/);
});

test("serves a normal nested page", async () => {
  const { status, body } = await rawGet("/en/");
  assert.equal(status, 200);
  assert.match(body, /EN_MARKER/);
});

test("serves a normal asset with the correct content-type", async () => {
  const { status, body } = await rawGet("/style.css");
  assert.equal(status, 200);
  assert.match(body, /color:red/);
});

test("rejects unencoded traversal into a similarly named sibling directory", async () => {
  const { status, body } = await rawGet("/../dist-astro-private/secret.html");
  assert.notEqual(status, 200);
  assert.doesNotMatch(body, /SECRET_MARKER/);
});

test("rejects percent-encoded traversal into a similarly named sibling directory", async () => {
  const { status, body } = await rawGet("/%2e%2e/dist-astro-private/secret.html");
  assert.notEqual(status, 200);
  assert.doesNotMatch(body, /SECRET_MARKER/);
});

test("rejects a symlink inside the served root that points outside it", async () => {
  const { status, body } = await rawGet("/escape-link/secret.html");
  assert.notEqual(status, 200);
  assert.doesNotMatch(body, /SECRET_MARKER/);
});

test("resolveFile returns null (not the private file) for a sibling-escaping request", async () => {
  const result = await resolveFile(servedDir, "/../dist-astro-private/secret.html");
  assert.equal(result, null);
});

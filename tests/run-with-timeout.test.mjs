import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { setTimeout as sleep } from "node:timers/promises";

const wrapperPath = new URL("../scripts/run-with-timeout.mjs", import.meta.url);
const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures", "timeout");

function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code !== "ESRCH";
  }
}

// Best-effort: used in `finally` blocks so a failing assertion never leaves
// a real fixture process behind on the machine.
function killIfRunning(pid) {
  try {
    if (isRunning(pid)) process.kill(pid, "SIGKILL");
  } catch {
    // Already gone, or we raced its exit — either way, nothing to do.
  }
}

function readPidFile(pidFile) {
  try {
    return Number(readFileSync(pidFile, "utf8"));
  } catch {
    return null;
  }
}

async function waitUntil(predicate, { timeoutMs = 3000, intervalMs = 50 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return true;
    await sleep(intervalMs);
  }
  return predicate();
}

// Spawns the wrapper around the given fixture, waits for the fixture to
// signal it's running (it writes its own pid to `pidFile`), sends `signal`
// to the wrapper, and returns the wrapper's own exit status plus whether the
// fixture process was cleaned up. Always cleans up both processes, even if
// an assertion made from the result later throws.
async function spawnWrapperAndInterrupt({ timeout, killAfter, fixture, signal = "SIGINT" }) {
  const dir = mkdtempSync(path.join(tmpdir(), "run-with-timeout-interrupt-"));
  const pidFile = path.join(dir, "pid");
  let wrapper;
  try {
    wrapper = spawn(process.execPath, [
      fileURLToPath(wrapperPath),
      `--timeout=${timeout}`,
      `--kill-after=${killAfter}`,
      "--",
      process.execPath,
      path.join(fixturesDir, fixture),
      pidFile,
    ]);

    await waitUntil(() => readPidFile(pidFile) !== null);
    const fixturePid = readPidFile(pidFile);

    const wrapperExit = new Promise((resolve) => wrapper.once("exit", (code, sig) => resolve({ code, signal: sig })));
    wrapper.kill(signal);
    const result = await wrapperExit;

    const fixtureDied = await waitUntil(() => !isRunning(fixturePid));
    return { ...result, fixtureDied };
  } finally {
    if (wrapper && wrapper.exitCode === null && wrapper.signalCode === null) {
      try {
        wrapper.kill("SIGKILL");
      } catch {
        // ignore
      }
    }
    killIfRunning(readPidFile(pidFile));
    rmSync(dir, { recursive: true, force: true });
  }
}

test("forwards the wrapped command's real exit code on normal completion", () => {
  const result = spawnSync(process.execPath, [
    fileURLToPath(wrapperPath),
    "--timeout=30s",
    "--",
    process.execPath,
    path.join(fixturesDir, "exit-with-code.mjs"),
    "7",
  ]);
  assert.equal(result.status, 7);
});

test("exits 124 and kills a hung single process on timeout", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "run-with-timeout-"));
  const pidFile = path.join(dir, "pid");
  try {
    const result = spawnSync(process.execPath, [
      fileURLToPath(wrapperPath),
      "--timeout=300ms",
      "--kill-after=300ms",
      "--",
      process.execPath,
      path.join(fixturesDir, "sleep-forever.mjs"),
      pidFile,
    ]);
    assert.equal(result.status, 124);

    const pid = readPidFile(pidFile);
    const died = await waitUntil(() => !isRunning(pid));
    assert.ok(died, `fixture process ${pid} should have been killed`);
  } finally {
    killIfRunning(readPidFile(pidFile));
    rmSync(dir, { recursive: true, force: true });
  }
});

test("cleans up subprocesses spawned by the timed-out command (whole process group)", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "run-with-timeout-group-"));
  const parentPidFile = path.join(dir, "parent-pid");
  const childPidFile = path.join(dir, "child-pid");
  try {
    const result = spawnSync(process.execPath, [
      fileURLToPath(wrapperPath),
      "--timeout=400ms",
      "--kill-after=300ms",
      "--",
      process.execPath,
      path.join(fixturesDir, "spawn-child-and-sleep.mjs"),
      parentPidFile,
      childPidFile,
    ]);
    assert.equal(result.status, 124);

    await waitUntil(() => readPidFile(childPidFile) !== null);

    const parentPid = readPidFile(parentPidFile);
    const childPid = readPidFile(childPidFile);

    const parentDied = await waitUntil(() => !isRunning(parentPid));
    const childDied = await waitUntil(() => !isRunning(childPid));
    assert.ok(parentDied, `spawned parent ${parentPid} should have been killed`);
    assert.ok(childDied, `nested child ${childPid} should have been killed`);
  } finally {
    killIfRunning(readPidFile(parentPidFile));
    killIfRunning(readPidFile(childPidFile));
    rmSync(dir, { recursive: true, force: true });
  }
});

test("kills a descendant that ignores SIGTERM even after the group leader has already exited", async () => {
  // Regression test: the wrapper used to call process.exit() as soon as the
  // group LEADER exited, which canceled the pending SIGKILL escalation
  // outright (process.exit() drops all pending timers). A leader that dies
  // promptly from SIGTERM while a descendant it spawned ignores that same
  // signal would leave that descendant running forever. The fix keeps the
  // kill-after escalation as the sole trigger for finishing once a
  // termination sequence has started, regardless of whether the leader
  // itself has already exited by then.
  const dir = mkdtempSync(path.join(tmpdir(), "run-with-timeout-ignore-term-"));
  const leaderPidFile = path.join(dir, "leader-pid");
  const childPidFile = path.join(dir, "child-pid");
  try {
    const result = spawnSync(process.execPath, [
      fileURLToPath(wrapperPath),
      "--timeout=300ms",
      "--kill-after=400ms",
      "--",
      process.execPath,
      path.join(fixturesDir, "leader-with-signal-ignoring-child.mjs"),
      leaderPidFile,
      childPidFile,
    ]);
    assert.equal(result.status, 124);

    await waitUntil(() => readPidFile(childPidFile) !== null);
    const leaderPid = readPidFile(leaderPidFile);
    const childPid = readPidFile(childPidFile);

    const leaderDied = await waitUntil(() => !isRunning(leaderPid));
    const childDied = await waitUntil(() => !isRunning(childPid), { timeoutMs: 3000 });
    assert.ok(leaderDied, `leader ${leaderPid} should have exited from the initial SIGTERM`);
    assert.ok(
      childDied,
      `signal-ignoring child ${childPid} should still be killed via the SIGKILL escalation, even though the leader already exited`,
    );
  } finally {
    killIfRunning(readPidFile(leaderPidFile));
    killIfRunning(readPidFile(childPidFile));
    rmSync(dir, { recursive: true, force: true });
  }
});

test("forwards a manual interrupt (SIGINT) to the whole process group and reports exit code 130", async () => {
  const { code, signal, fixtureDied } = await spawnWrapperAndInterrupt({
    timeout: "30s", // long enough that the real timeout never fires
    killAfter: "300ms",
    fixture: "sleep-forever.mjs",
  });
  assert.equal(code, 130, "SIGINT should be reported as 128+2=130, not the child's own exit code");
  assert.equal(signal, null);
  assert.ok(fixtureDied, "fixture should be killed after the wrapper is interrupted");
});

test("a manual interrupt before the timeout deadline still reports 130, even when that deadline would otherwise expire during the kill-after grace period", async () => {
  // Regression test for a real bug: the wrapper used to leave the original
  // wall-clock timeout timer running even after a manual interrupt had
  // already begun its own TERM->KILL escalation. With timeout=1s and
  // kill-after=1200ms, interrupting immediately (well before the 1s
  // deadline) meant the deadline could still fire ~1s later, *during* the
  // interrupt's own kill-after grace window, silently overwriting the
  // termination reason and making the wrapper report 124 (timeout) instead
  // of 130 (manual SIGINT). The fix clears the deadline the moment ANY
  // termination begins and never overwrites the first recorded reason.
  const { code, signal } = await spawnWrapperAndInterrupt({
    timeout: "1s",
    killAfter: "1200ms",
    fixture: "sleep-forever.mjs",
  });
  assert.equal(code, 130, "manual SIGINT should report 130, not the 124 reserved for a genuine timeout");
  assert.equal(signal, null);
});

test("a manual interrupt is reported as non-zero even if the interrupted process handles the signal and exits(0) itself", async () => {
  const { code, signal } = await spawnWrapperAndInterrupt({
    timeout: "30s",
    killAfter: "1s",
    fixture: "graceful-sigint-handler.mjs",
  });
  assert.equal(code, 130, "the wrapper must report the interrupt itself, not the child's own successful exit(0)");
  assert.equal(signal, null);
});

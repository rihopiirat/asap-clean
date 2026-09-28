#!/usr/bin/env node
// Portable stand-in for GNU `timeout --signal=TERM --kill-after=<t> <t> <cmd>`.
// macOS ships no `timeout`; this avoids requiring a global coreutils install.
// POSIX-only (relies on process groups via `detached: true` + negative-pid kill),
// which matches this project's existing macOS/Linux-only scope.

import { spawn } from "node:child_process";

const SIGNAL_NUMBERS = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGQUIT: 3,
  SIGILL: 4,
  SIGTRAP: 5,
  SIGABRT: 6,
  SIGFPE: 8,
  SIGKILL: 9,
  SIGSEGV: 11,
  SIGPIPE: 13,
  SIGALRM: 14,
  SIGTERM: 15,
};

function parseDuration(raw, flagName) {
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h|d)?$/.exec(raw ?? "");
  if (!match) {
    throw new Error(`Invalid duration for ${flagName}: ${JSON.stringify(raw)}`);
  }
  const value = Number(match[1]);
  const unit = match[2] ?? "s";
  const multiplier = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return value * multiplier;
}

function parseArgs(argv) {
  let timeoutRaw;
  let killAfterRaw = "0s";
  let i = 0;
  for (; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      i++;
      break;
    }
    if (arg.startsWith("--timeout=")) {
      timeoutRaw = arg.slice("--timeout=".length);
    } else if (arg.startsWith("--kill-after=")) {
      killAfterRaw = arg.slice("--kill-after=".length);
    } else {
      throw new Error(`Unrecognized argument: ${arg}`);
    }
  }
  const command = argv.slice(i);
  if (!timeoutRaw) throw new Error("--timeout=<duration> is required");
  if (command.length === 0) throw new Error("No command given after --");
  return {
    timeoutMs: parseDuration(timeoutRaw, "--timeout"),
    killAfterMs: parseDuration(killAfterRaw, "--kill-after"),
    command,
  };
}

function killGroup(pid, signal) {
  try {
    process.kill(-pid, signal);
  } catch {
    // Group may already be gone; nothing to clean up.
  }
}

function run() {
  const { timeoutMs, killAfterMs, command } = parseArgs(process.argv.slice(2));
  const [cmd, ...args] = command;

  // `detached: true` makes the child its own process group leader, so a
  // negative-pid kill reaches it and every process it spawns.
  const child = spawn(cmd, args, { stdio: "inherit", detached: true });

  // Set once, by whichever termination trigger fires first ("timeout",
  // "SIGINT", or "SIGTERM"), and never overwritten afterwards — the exit
  // code is entirely determined by this first reason.
  let terminationReason = null;
  let settled = false;
  let childExitInfo = null;
  let killAfterTimer;

  const timeoutTimer = setTimeout(() => beginEscalation("timeout"), timeoutMs);

  function beginEscalation(reason) {
    if (terminationReason) return; // first reason wins; ignore anything after
    terminationReason = reason;
    // The wall-clock deadline is moot the moment ANY termination begins
    // (including a manual interrupt that arrives before it would have
    // fired) — clearing it here is what stops it from firing mid-way
    // through a manual interrupt's own kill-after grace period and
    // clobbering the reason we already recorded.
    clearTimeout(timeoutTimer);
    const signal = reason === "timeout" ? "SIGTERM" : reason;
    if (child.pid) killGroup(child.pid, signal);
    // Escalate to SIGKILL after the grace period regardless of whether the
    // group leader itself has already exited by then: a leader can die from
    // the initial signal while a descendant it spawned ignores that same
    // signal and keeps running. Only a live process needs to receive
    // SIGKILL for it to matter, and killing-by-process-group still reaches
    // it even after the leader is gone, as long as the group still exists.
    killAfterTimer = setTimeout(() => {
      if (child.pid) killGroup(child.pid, "SIGKILL");
      finish();
    }, killAfterMs);
  }

  process.once("SIGINT", () => beginEscalation("SIGINT"));
  process.once("SIGTERM", () => beginEscalation("SIGTERM"));

  function finish() {
    if (settled) return;
    settled = true;
    clearTimeout(timeoutTimer);
    clearTimeout(killAfterTimer);
    if (terminationReason === "timeout") {
      process.exit(124);
    } else if (terminationReason) {
      // Manually interrupted: always non-zero, regardless of how the child
      // itself ended up exiting — even if it caught the forwarded signal
      // and exited(0) on its own, the wrapper still reports the interrupt.
      process.exit(128 + (SIGNAL_NUMBERS[terminationReason] ?? 1));
    } else if (childExitInfo?.signal) {
      process.exit(128 + (SIGNAL_NUMBERS[childExitInfo.signal] ?? 1));
    } else {
      process.exit(childExitInfo?.code ?? 1);
    }
  }

  child.on("error", (err) => {
    clearTimeout(timeoutTimer);
    clearTimeout(killAfterTimer);
    console.error(`run-with-timeout: failed to start command: ${err.message}`);
    process.exit(127);
  });

  child.on("exit", (code, signal) => {
    childExitInfo = { code, signal };
    if (terminationReason) {
      // Don't finish yet: the kill-after escalation above is the sole
      // trigger for exiting once we're terminating, precisely so that a
      // leader exiting early doesn't skip the SIGKILL sweep that a
      // surviving descendant still needs.
      return;
    }
    finish();
  });
}

try {
  run();
} catch (err) {
  console.error(`run-with-timeout: ${err.message}`);
  console.error("usage: run-with-timeout.mjs --timeout=<duration> [--kill-after=<duration>] -- <command> [args...]");
  process.exit(2);
}

// Fixture for run-with-timeout.mjs's own test suite: the leader has no
// SIGTERM handler (default action terminates it immediately), while its own
// child explicitly ignores SIGTERM (see signal-ignoring-sleeper.mjs). This
// reproduces a real build-tool shape: the top-level process exits promptly
// on TERM, but something it spawned does not.
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [, , leaderPidFile, childPidFile] = process.argv;
writeFileSync(leaderPidFile, String(process.pid));

const sleeperPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "signal-ignoring-sleeper.mjs");
spawn(process.execPath, [sleeperPath, childPidFile], { stdio: "ignore" });

setInterval(() => {}, 1 << 30);

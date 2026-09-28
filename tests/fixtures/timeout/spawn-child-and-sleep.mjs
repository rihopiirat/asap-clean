// Fixture for run-with-timeout.mjs's own test suite: spawns a grandchild
// process (without `detached`, so it stays in the wrapper's process group)
// to verify that killing the group also cleans up nested subprocesses.
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [, , parentPidFile, childPidFile] = process.argv;
writeFileSync(parentPidFile, String(process.pid));

const sleeperPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "sleep-forever.mjs");
spawn(process.execPath, [sleeperPath, childPidFile], { stdio: "ignore" });

setInterval(() => {}, 1 << 30);

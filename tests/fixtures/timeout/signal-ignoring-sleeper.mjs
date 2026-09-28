// Fixture for run-with-timeout.mjs's own test suite: ignores SIGTERM, so
// only SIGKILL can stop it. Simulates a subprocess that survives its
// parent/group-leader's own termination.
import { writeFileSync } from "node:fs";

const pidFile = process.argv[2];
if (pidFile) writeFileSync(pidFile, String(process.pid));

process.on("SIGTERM", () => {});

setInterval(() => {}, 1 << 30);

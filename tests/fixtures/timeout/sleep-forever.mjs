// Fixture for run-with-timeout.mjs's own test suite: never exits on its own,
// so the wrapper's timeout+kill path has something to terminate.
import { writeFileSync } from "node:fs";

const pidFile = process.argv[2];
if (pidFile) writeFileSync(pidFile, String(process.pid));

setInterval(() => {}, 1 << 30);

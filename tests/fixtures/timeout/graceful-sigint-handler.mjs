// Fixture for run-with-timeout.mjs's own test suite: handles SIGINT itself
// and exits(0) cleanly, simulating a well-behaved tool with its own graceful
// shutdown. The wrapper must still report the manual interrupt (non-zero),
// not this process's own successful exit code.
import { writeFileSync } from "node:fs";

const pidFile = process.argv[2];
if (pidFile) writeFileSync(pidFile, String(process.pid));

process.on("SIGINT", () => {
  process.exit(0);
});

setInterval(() => {}, 1 << 30);

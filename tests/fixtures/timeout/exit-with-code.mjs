// Fixture for run-with-timeout.mjs's own test suite: exits promptly with a
// caller-supplied code, to verify the wrapper forwards real exit codes.
process.exit(Number(process.argv[2] ?? "0"));

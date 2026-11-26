// The Long Roast: Lawmakers and the File They Cannot Convert — entry program (v1).
// Writes one satirical sentence to /output/entry.txt.
// Deterministic: the same bytes on every run, no input, no network.
//
// v1 hardening: the line is written to a temp file in the same directory
// and atomically renamed into place, then read back and verified byte for
// byte (single line, one sentence, 1-320 chars) before the program exits.
// /output itself is never deleted or recreated — it is a grader mount.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LINE =
  "The committee that regulates the machines that can write novels, trade coins, and run the internet cannot convert a Word file to PDF — so it hired a consultant to click the button for them.";

// Resolve paths from this file's location via import.meta.url, never from
// the working directory. The grader mount is always the absolute path
// /output/entry.txt (an absolute second argument wins in resolve()).
const scriptDir = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(scriptDir, "/output", "entry.txt");
const tmpPath = resolve(dirname(outPath), `.entry.txt.tmp-${process.pid}`);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(tmpPath, LINE, "utf8");
renameSync(tmpPath, outPath);

// Post-write verification: what landed must be exactly the line.
const written = readFileSync(outPath, "utf8");
if (written !== LINE) {
  throw new Error("verification failed: /output/entry.txt does not match the line");
}
if ([...written].length < 1 || [...written].length > 320) {
  throw new Error("verification failed: line length outside 1-320 characters");
}
if (written.includes("\n") || written.includes("\r")) {
  throw new Error("verification failed: entry is not a single line");
}
if (written.trim().length === 0) {
  throw new Error("verification failed: entry is whitespace-only");
}
// One sentence only: exactly one terminal period.
if ((written.match(/\./g) ?? []).length !== 1 || !written.endsWith(".")) {
  throw new Error("verification failed: entry is not exactly one sentence");
}

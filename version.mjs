import { execFileSync } from "node:child_process";

// The release version is the git tag (v1.0.0, v1.1.0, ...); no file carries a hand-kept number.
// Between tags git describe adds the commit count and hash (v1.0.0-3-gabc1234).
export function readVersion(dir, run = execFileSync) {
  try {
    return run("git", ["describe", "--tags", "--always", "--dirty"], { cwd: dir, encoding: "utf8", timeout: 5000, stdio: ["ignore", "pipe", "ignore"] }).trim() || "unknown";
  } catch {
    return "unknown";
  }
}

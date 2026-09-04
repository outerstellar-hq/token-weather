import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const SNAPSHOT_PATH = resolve(process.cwd(), "data", "snapshot.json");

export function isPublicSnapshot(snapshot) {
  if (snapshot?.schema !== "token-weather.snapshot.v1" || !Array.isArray(snapshot.events)) return false;
  if ("account_collectors" in snapshot || "telemetry_adapters" in snapshot) return false;
  return snapshot.events.every((event) => {
    if (!event || typeof event !== "object") return false;
    if (typeof event.event_type === "string" && event.event_type.startsWith("ACCOUNT_")) return false;
    if ("is_estimate" in event) {
      if (event.is_estimate !== true) return false;
      if (!["source_url", "retrieved_at", "scope", "confidence", "method"].every((key) => typeof event[key] === "string" && event[key].length > 0)) return false;
    }
    return !Object.keys(event).some((key) => /account|api_key|workspace_id|personal/i.test(key));
  });
}

export async function readSnapshot() {
  try {
    const value = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));
    if (!isPublicSnapshot(value)) return null;
    return value;
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw new Error(`Could not read Token Weather snapshot: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function writeSnapshot(snapshot) {
  if (!isPublicSnapshot(snapshot)) throw new Error("refusing to write non-public Token Weather snapshot");
  await mkdir(dirname(SNAPSHOT_PATH), { recursive: true });
  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return SNAPSHOT_PATH;
}

export { SNAPSHOT_PATH };

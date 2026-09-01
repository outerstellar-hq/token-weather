import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const SNAPSHOT_PATH = resolve(process.cwd(), "data", "snapshot.json");

export async function readSnapshot() {
  try {
    const value = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));
    if (value?.schema !== "token-weather.snapshot.v1" || !Array.isArray(value.events)) throw new Error("snapshot schema is invalid");
    return value;
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw new Error(`Could not read Token Weather snapshot: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function writeSnapshot(snapshot) {
  if (snapshot?.schema !== "token-weather.snapshot.v1" || !Array.isArray(snapshot.events)) throw new Error("refusing to write invalid Token Weather snapshot");
  await mkdir(dirname(SNAPSHOT_PATH), { recursive: true });
  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return SNAPSHOT_PATH;
}

export { SNAPSHOT_PATH };

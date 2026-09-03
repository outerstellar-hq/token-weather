import { createHash } from "node:crypto";
import { copyFile, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const caddyfilePath = process.env.CADDYFILE_PATH || "/srv/docker/caddy/caddy_config/Caddyfile";
const snippetPath = process.env.CADDY_SNIPPET_PATH || fileURLToPath(new URL("./tokenweather.caddy", import.meta.url));
const expectedHash = process.env.CADDYFILE_SHA256;
const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
const backupPath = `${caddyfilePath}.backup-before-token-weather-${timestamp}`;
const temporaryPath = `${caddyfilePath}.token-weather.tmp`;

if (!expectedHash) throw new Error("CADDYFILE_SHA256 is required");

const current = await readFile(caddyfilePath, "utf8");
const currentHash = createHash("sha256").update(current).digest("hex");
if (currentHash !== expectedHash) throw new Error(`Caddyfile changed: expected ${expectedHash}, found ${currentHash}`);
if (current.includes("tokenweather.outerstellar.net")) throw new Error("Token Weather route already exists; refusing to duplicate it");

const snippet = await readFile(snippetPath, "utf8");
const next = `${current.trimEnd()}\n\n${snippet.trim()}\n`;
await copyFile(caddyfilePath, backupPath);
try {
  await writeFile(temporaryPath, next, "utf8");
  await rename(temporaryPath, caddyfilePath);
} finally {
  await unlink(temporaryPath).catch(() => {});
}

const nextHash = createHash("sha256").update(next).digest("hex");
console.log(JSON.stringify({ backupPath, caddyfilePath, previousSha256: currentHash, nextSha256: nextHash }));

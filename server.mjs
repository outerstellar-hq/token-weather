import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { accountReadiness, collectDocumentation } from "./collector.mjs";
import { readSnapshot, writeSnapshot } from "./snapshot-store.mjs";

const HOST = "127.0.0.1";
const PORT = 4173;
const ROOT = resolve(process.cwd());
const mimeTypes = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8" };
let snapshot = await readSnapshot();

function fallbackSnapshot() {
  return { schema: "token-weather.snapshot.v1", mode: "seeded", generated_at: null, events: [], account_collectors: accountReadiness(), errors: [] };
}

function sendJson(response, status, value) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(value));
}

async function serveStatic(request, response) {
  const requested = request.url === "/" ? "/index.html" : new URL(request.url, `http://${HOST}:${PORT}`).pathname;
  const file = normalize(join(ROOT, requested));
  if (file !== ROOT && !file.startsWith(`${ROOT}${process.platform === "win32" ? "\\" : "/"}`)) return sendJson(response, 403, { error: "forbidden path" });
  try {
    const body = await readFile(file);
    response.writeHead(200, { "content-type": mimeTypes[extname(file)] || "application/octet-stream" });
    response.end(body);
  } catch (error) {
    if (error?.code === "ENOENT") return sendJson(response, 404, { error: "not found" });
    throw error;
  }
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/api/health") return sendJson(response, 200, { status: "ok", origin: `http://${HOST}:${PORT}` });
    if (request.method === "GET" && request.url === "/api/snapshot") return sendJson(response, 200, snapshot || fallbackSnapshot());
    if (request.method === "POST" && request.url === "/api/refresh") {
      const report = await collectDocumentation({ includeAccounts: true });
      snapshot = { schema: "token-weather.snapshot.v1", mode: report.events.some((event) => event.status === "error") ? "degraded" : "source-connected", generated_at: report.collected_at, events: report.events, account_collectors: report.account_collectors, errors: report.events.filter((event) => event.status === "error") };
      await writeSnapshot(snapshot);
      return sendJson(response, snapshot.errors.length ? 502 : 200, snapshot);
    }
    if (request.method !== "GET") return sendJson(response, 405, { error: "method not allowed" });
    return await serveStatic(request, response);
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.on("error", (error) => { console.error(`Token Weather server failed on ${HOST}:${PORT}: ${error.message}`); process.exitCode = 1; });
server.listen(PORT, HOST, () => console.log(`Token Weather listening at http://${HOST}:${PORT}`));

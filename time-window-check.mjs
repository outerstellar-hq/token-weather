import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const registryPath = resolve(process.cwd(), "docs", "provider-registry.json");
const windowsPath = resolve(process.cwd(), "docs", "provider-time-windows.json");
const forbidden = /(?:account_id|api_key|workspace_id|private_console|request_headers|quota_remaining|usage_percent)/i;
const statuses = new Set(["published_clock_window", "published_rolling_window", "published_calendar_reset", "no_published_schedule"]);

function assert(condition, message) {
  if (!condition) throw new Error(`Provider time-window registry invalid: ${message}`);
}

const registry = JSON.parse(await readFile(registryPath, "utf8"));
const windows = JSON.parse(await readFile(windowsPath, "utf8"));
assert(windows.schema === "token-weather.provider-time-windows.v1", "schema is missing or incorrect");
assert(Array.isArray(windows.records), "records are missing");
assert(Array.isArray(windows.tracked_surface_ids), "tracked surface IDs are missing");
const ids = new Set();
for (const record of windows.records) {
  assert(windows.tracked_surface_ids.includes(record.provider_id), `unknown tracked surface ${record.provider_id}`);
  assert(!ids.has(record.provider_id), `duplicate time-window record ${record.provider_id}`);
  ids.add(record.provider_id);
  assert(statuses.has(record.public_schedule_status), `${record.provider_id} has an invalid schedule status`);
  assert(Array.isArray(record.windows) && Array.isArray(record.reset_rules), `${record.provider_id} needs windows and reset_rules arrays`);
  assert(record.source?.official === true && /^https:\/\//.test(record.source.url), `${record.provider_id} needs an official HTTPS source`);
  for (const window of record.windows) assert(window.kind && window.start && window.end && window.timezone && window.effect, `${record.provider_id} has an incomplete clock window`);
  for (const reset of record.reset_rules) assert(reset.kind, `${record.provider_id} has an incomplete reset rule`);
}
assert(!forbidden.test(JSON.stringify(windows)), "private or personalized data field present");
assert(ids.size === windows.tracked_surface_ids.length, `surface coverage is ${ids.size}/${windows.tracked_surface_ids.length}`);
console.log(JSON.stringify({ schema: windows.schema, surface_count: ids.size, clock_window_count: windows.records.filter((record) => record.windows.length).length, no_clock_schedule_count: windows.records.filter((record) => record.public_schedule_status === "no_published_schedule").length, as_of: windows.as_of }));

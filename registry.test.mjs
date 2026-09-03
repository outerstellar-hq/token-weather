import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("provider registry is source-linked and contains no private telemetry fields", async () => {
  const registry = JSON.parse(await readFile(new URL("./docs/provider-registry.json", import.meta.url), "utf8"));
  const providers = [...registry.model_owners, ...registry.inference_providers];
  assert.equal(registry.schema, "token-weather.provider-registry.v1");
  assert.ok(providers.length >= 20);
  assert.ok(providers.every((provider) => /^https:\/\//.test(provider.official_catalog_url)));
  assert.ok(providers.flatMap((provider) => provider.models || []).every((model) => /^https:\/\//.test(model.source_url)));
  assert.doesNotMatch(JSON.stringify(registry), /"(?:account_id|api_key|workspace_id|quota_remaining|usage_percent)"/i);
});

test("public time-window registry covers every provider without private data", async () => {
  const registry = JSON.parse(await readFile(new URL("./docs/provider-registry.json", import.meta.url), "utf8"));
  const windows = JSON.parse(await readFile(new URL("./docs/provider-time-windows.json", import.meta.url), "utf8"));
  const surfaceIds = new Set(windows.tracked_surface_ids);
  assert.equal(new Set(windows.records.map((record) => record.provider_id)).size, windows.records.length);
  assert.equal(windows.records.length, surfaceIds.size);
  assert.ok(windows.records.every((record) => surfaceIds.has(record.provider_id) && record.source.official === true));
  assert.doesNotMatch(JSON.stringify(windows), /(?:account_id|api_key|workspace_id|private_console|request_headers|quota_remaining|usage_percent)/i);
});

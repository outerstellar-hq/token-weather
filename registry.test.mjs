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

import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const registryPath = resolve(process.cwd(), "docs", "provider-registry.json");
const forbiddenKeys = /^(account|api_key|workspace_id|personal|quota_remaining|usage_percent|request_headers)/i;
const maxResponseBytes = 8_000_000;
const timeoutMs = 10_000;

function assert(condition, message) {
  if (!condition) throw new Error(`Provider registry invalid: ${message}`);
}

const registry = JSON.parse(await readFile(registryPath, "utf8"));
assert(registry.schema === "token-weather.provider-registry.v1", "schema is missing or incorrect");
assert(registry.hard_fact_policy?.missing_evidence_value === "unavailable", "missing-evidence rule is missing");

const groups = ["model_owners", "inference_providers"];
const providers = groups.flatMap((group) => registry[group] || []);
const providerIds = new Set();
let modelCount = 0;
for (const provider of providers) {
  assert(provider.provider_id && provider.name && provider.role, "every provider needs an id, name, and role");
  assert(!providerIds.has(provider.provider_id), `duplicate provider ${provider.provider_id}`);
  providerIds.add(provider.provider_id);
  assert(/^https:\/\//.test(provider.official_catalog_url), `${provider.provider_id} needs an HTTPS catalog source`);
  for (const model of provider.models || []) {
    modelCount += 1;
    assert(model.model_id && model.display_name && model.source_url, `${provider.provider_id} has an incomplete model record`);
    assert(/^https:\/\//.test(model.source_url), `${provider.provider_id}/${model.model_id} needs an HTTPS source`);
  }
}

const serialized = JSON.stringify(registry);
assert(!Object.keys(registry).some((key) => forbiddenKeys.test(key)), "top-level private field present");
assert(!serialized.match(/\"(account_id|api_key|workspace_id|quota_remaining|usage_percent)\"/i), "private data field present");

const summary = { schema: registry.schema, provider_count: providers.length, model_record_count: modelCount, scope: registry.coverage_rule };
if (process.argv.includes("--live")) {
  const urls = [...new Set(providers.map((provider) => provider.official_catalog_url))];
  const liveSources = [];
  for (const url of urls) {
    const retrievedAt = new Date().toISOString();
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), redirect: "follow" });
      const reader = response.body?.getReader();
      let bytes = 0;
      const hash = createHash("sha256");
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > maxResponseBytes) throw new Error(`response exceeded ${maxResponseBytes} bytes`);
        hash.update(value);
      }
      liveSources.push({ source_url: url, retrieved_at: retrievedAt, http_status: response.status, bytes, sha256: hash.digest("hex"), final_url: response.url, status: response.ok ? "ok" : "error", ...(response.ok ? {} : { error: `HTTP ${response.status}` }) });
    } catch (error) {
      liveSources.push({ source_url: url, retrieved_at: retrievedAt, status: "error", error: error instanceof Error ? error.message : String(error) });
    }
  }
  summary.live_catalog_sources = liveSources;
  summary.live_error_count = liveSources.filter((source) => source.status === "error").length;
  console.log(JSON.stringify(summary));
  if (summary.live_error_count) process.exitCode = 1;
} else {
  console.log(JSON.stringify(summary));
}

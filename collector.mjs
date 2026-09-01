import { createHash } from "node:crypto";

const MAX_RESPONSE_BYTES = 8_000_000;
const REQUEST_TIMEOUT_MS = 10_000;

export const sourceDefinitions = Object.freeze([
  { providerId: "deepseek-v4-pro", sourceId: "deepseek-pricing", sourceType: "pricing", url: "https://api-docs.deepseek.com/quick_start/pricing" },
  { providerId: "deepseek-v4-pro", sourceId: "deepseek-rate-limit", sourceType: "rate_limit", url: "https://api-docs.deepseek.com/quick_start/rate_limit" },
  { providerId: "qwen-3-7-plus", sourceId: "alibaba-quota-management", sourceType: "capacity", url: "https://docs.modelstudio.console.alibabacloud.com/en/model-studio/quota-management" },
  { providerId: "qwen-3-7-plus", sourceId: "alibaba-list-quotas", sourceType: "rate_limit", url: "https://docs.modelstudio.console.alibabacloud.com/en/model-studio/list-quotas" },
  { providerId: "glm-5", sourceId: "zhipu-rate-limit", sourceType: "rate_limit", url: "https://docs.bigmodel.cn/cn/api/rate-limit" },
  { providerId: "baidu-ernie-5", sourceId: "baidu-rate-limit-headers", sourceType: "quota", url: "https://intl.cloud.baidu.com/en/doc/qianfan/s/3m7of64lb-intl-en" },
  { providerId: "stepfun-step-35", sourceId: "stepfun-pricing-limits", sourceType: "rate_limit", url: "https://platform.stepfun.com/docs/zh/guides/pricing/details" }
]);

export const accountCollectors = Object.freeze([
  { providerId: "deepseek-v4-pro", mode: "manual_export", status: "not_configured", detail: "DeepSeek usage is currently exposed through the account usage export rather than a documented quota endpoint." },
  { providerId: "qwen-3-7-plus", mode: "api", env: ["DASHSCOPE_API_KEY", "DASHSCOPE_WORKSPACE_ID"], status: "ready_when_configured", detail: "Read-only model limit query at GET /api/v1/models/limits." },
  { providerId: "glm-5", mode: "console", status: "not_configured", detail: "Account/model limits are exposed in the provider console." },
  { providerId: "baidu-ernie-5", mode: "request_scoped_headers", status: "not_configured", detail: "Quota values arrive on inference response headers and must be captured by a calling workload." },
  { providerId: "stepfun-step-35", mode: "account_api", env: ["STEPFUN_API_KEY"], status: "not_configured", detail: "Account endpoint is reserved for an explicitly configured credentialed run." }
]);

function now() {
  return new Date().toISOString();
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function readBoundedBody(response) {
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array(await response.arrayBuffer());
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_RESPONSE_BYTES) throw new Error(`response exceeded ${MAX_RESPONSE_BYTES} bytes`);
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

export async function collectSource(source, fetchImpl = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const retrievedAt = now();
  try {
    const response = await fetchImpl(source.url, { signal: controller.signal, headers: { accept: "text/html,application/xhtml+xml" } });
    const body = await readBoundedBody(response);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { event_type: "SOURCE_FETCH", provider_id: source.providerId, source_id: source.sourceId, source_type: source.sourceType, source_url: source.url, retrieved_at: retrievedAt, status: "ok", http_status: response.status, bytes: body.byteLength, sha256: sha256(body), official: true, confidence: "official source retrieved" };
  } catch (error) {
    return { event_type: "SOURCE_FETCH", provider_id: source.providerId, source_id: source.sourceId, source_type: source.sourceType, source_url: source.url, retrieved_at: retrievedAt, status: "error", error: error instanceof Error ? error.message : String(error), official: true, confidence: "source retrieval failed" };
  } finally {
    clearTimeout(timeout);
  }
}

export function accountReadiness(env = process.env) {
  return accountCollectors.map((collector) => {
    const missing = (collector.env || []).filter((name) => !env[name]);
    const status = collector.env ? (missing.length ? "not_configured" : "configured") : collector.status;
    return { ...collector, status, missing_env: missing };
  });
}

export async function collectDocumentation({ fetchImpl = fetch } = {}) {
  const events = [];
  for (const source of sourceDefinitions) events.push(await collectSource(source, fetchImpl));
  return { schema: "token-weather.collector.v1", collected_at: now(), events, account_collectors: accountReadiness() };
}

function printCheck() {
  console.log(JSON.stringify({ schema: "token-weather.collector.v1", documentation_sources: sourceDefinitions.length, providers: new Set(sourceDefinitions.map((source) => source.providerId)).size, account_collectors: accountCollectors.length, max_response_bytes: MAX_RESPONSE_BYTES, timeout_ms: REQUEST_TIMEOUT_MS, account_collection: "disabled unless credentials are explicitly configured" }, null, 2));
}

if (process.argv.includes("--check")) printCheck();
if (process.argv.includes("--json")) {
  const report = await collectDocumentation();
  console.log(JSON.stringify(report, null, 2));
  if (report.events.some((event) => event.status === "error")) process.exitCode = 1;
}

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
  { providerId: "stepfun-step-35", sourceId: "stepfun-pricing-limits", sourceType: "rate_limit", url: "https://platform.stepfun.com/docs/zh/guides/pricing/details" },
  { providerId: "openai-gpt-5", sourceId: "openai-rate-limits", sourceType: "rate_limit", url: "https://platform.openai.com/docs/guides/rate-limits" },
  { providerId: "gemini-2-5-pro", sourceId: "gemini-rate-limits", sourceType: "rate_limit", url: "https://ai.google.dev/gemini-api/docs/rate-limits" },
  { providerId: "anthropic-claude-opus", sourceId: "anthropic-rate-limits", sourceType: "rate_limit", url: "https://docs.anthropic.com/en/api/rate-limits" },
  { providerId: "xai-grok-46", sourceId: "xai-grok-46", sourceType: "pricing", url: "https://docs.x.ai/developers/grok-4-6" },
  { providerId: "xai-grok-46", sourceId: "xai-rate-limits", sourceType: "rate_limit", url: "https://docs.x.ai/developers/rate-limits" },
  { providerId: "minimax-m27", sourceId: "minimax-token-plan", sourceType: "quota", url: "https://platform.minimax.io/docs/token-plan/intro" },
  { providerId: "minimax-m27", sourceId: "minimax-api-pricing", sourceType: "pricing", url: "https://platform.minimax.io/subscribe/token-plan?tab=api-enterprise" },
  { providerId: "groq-gpt-oss-120b", sourceId: "groq-models", sourceType: "pricing", url: "https://console.groq.com/docs/models" },
  { providerId: "groq-gpt-oss-120b", sourceId: "groq-rate-limits", sourceType: "rate_limit", url: "https://console.groq.com/docs/rate-limits" },
  { providerId: "moonshot-kimi-k26", sourceId: "kimi-k26-pricing", sourceType: "pricing", url: "https://platform.kimi.ai/docs/pricing/chat-k26" },
  { providerId: "moonshot-kimi-k26", sourceId: "kimi-rate-limits", sourceType: "rate_limit", url: "https://platform.kimi.ai/docs/pricing/limits" },
  { providerId: "cerebras-llama-31-8b", sourceId: "cerebras-rate-limits", sourceType: "rate_limit", url: "https://inference-docs.cerebras.ai/support/rate-limits" },
  { providerId: "sambanova-deepseek-v31", sourceId: "sambanova-rate-limits", sourceType: "rate_limit", url: "https://docs.sambanova.ai/docs/en/models/rate-limits" }
]);

export const accountCollectors = Object.freeze([
  { providerId: "deepseek-v4-pro", mode: "manual_export", status: "not_configured", detail: "DeepSeek usage is currently exposed through the account usage export rather than a documented quota endpoint." },
  { providerId: "qwen-3-7-plus", mode: "api", env: ["DASHSCOPE_API_KEY", "DASHSCOPE_WORKSPACE_ID"], status: "ready_when_configured", detail: "Read-only model limit query at GET /api/v1/models/limits." },
  { providerId: "glm-5", mode: "console", status: "not_configured", detail: "Account/model limits are exposed in the provider console." },
  { providerId: "baidu-ernie-5", mode: "request_scoped_headers", status: "not_configured", detail: "Quota values arrive on inference response headers and must be captured by a calling workload." },
  { providerId: "stepfun-step-35", mode: "account_api", env: ["STEPFUN_API_KEY"], status: "not_configured", detail: "Account endpoint is reserved for an explicitly configured credentialed run." },
  { providerId: "xai-grok-46", mode: "console", status: "not_configured", detail: "Account-specific model limits are exposed in the xAI console; public documentation supplies tier examples, not this account's live ceiling." },
  { providerId: "minimax-m27", mode: "console", status: "not_configured", detail: "Token Plan quota depends on the account plan and is exposed in the account surface." },
  { providerId: "groq-gpt-oss-120b", mode: "request_scoped_headers", env: ["GROQ_API_KEY"], status: "not_configured", detail: "Remaining request/token values and reset times arrive in inference response headers." },
  { providerId: "moonshot-kimi-k26", mode: "request_scoped_headers", env: ["MOONSHOT_API_KEY"], status: "not_configured", detail: "The account tier controls concurrency, RPM, TPM, and TPD; live remaining values require an authenticated request." },
  { providerId: "cerebras-llama-31-8b", mode: "request_scoped_headers", env: ["CEREBRAS_API_KEY"], status: "not_configured", detail: "Remaining request/token values and reset times arrive in inference response headers." },
  { providerId: "sambanova-deepseek-v31", mode: "request_scoped_headers", env: ["SAMBANOVA_API_KEY"], status: "not_configured", detail: "Remaining daily request/token values and reset times arrive in inference response headers." }
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

export async function collectQwenAccount({ fetchImpl = fetch, env = process.env } = {}) {
  const apiKey = env.DASHSCOPE_API_KEY;
  const workspaceId = env.DASHSCOPE_WORKSPACE_ID;
  if (!apiKey || !workspaceId) return null;
  const region = env.DASHSCOPE_REGION || "cn-beijing";
  const url = `https://${workspaceId}.${region}.maas.aliyuncs.com/api/v1/models/limits?name=qwen&page_no=1&page_size=100`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const retrievedAt = now();
  try {
    const response = await fetchImpl(url, { signal: controller.signal, headers: { accept: "application/json", authorization: `Bearer ${apiKey}` } });
    const body = await readBoundedBody(response);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = JSON.parse(new TextDecoder().decode(body));
    const quotas = Array.isArray(payload?.output?.quotas) ? payload.output.quotas : [];
    return { event_type: "ACCOUNT_QUOTA", provider_id: "qwen-3-7-plus", source_type: "account_api", source_url: url, retrieved_at: retrievedAt, status: "ok", http_status: response.status, bytes: body.byteLength, sha256: sha256(body), official: true, confidence: "official account API", records: quotas.map((quota) => ({ model: quota.model, workspace_id: quota.workspace_id, model_limit: quota.model_limit, workspace_limit: quota.workspace_limit })) };
  } catch (error) {
    return { event_type: "ACCOUNT_QUOTA", provider_id: "qwen-3-7-plus", source_type: "account_api", source_url: url, retrieved_at: retrievedAt, status: "error", error: error instanceof Error ? error.message : String(error), official: true, confidence: "account retrieval failed" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function collectDocumentation({ fetchImpl = fetch, env = process.env, includeAccounts = false } = {}) {
  const events = [];
  for (const source of sourceDefinitions) events.push(await collectSource(source, fetchImpl));
  const accountEvents = includeAccounts ? (await collectQwenAccount({ fetchImpl, env })) : null;
  return { schema: "token-weather.collector.v1", collected_at: now(), events: accountEvents ? [...events, accountEvents] : events, account_collectors: accountReadiness(env) };
}

function printCheck() {
  console.log(JSON.stringify({ schema: "token-weather.collector.v1", documentation_sources: sourceDefinitions.length, providers: new Set(sourceDefinitions.map((source) => source.providerId)).size, account_collectors: accountCollectors.length, max_response_bytes: MAX_RESPONSE_BYTES, timeout_ms: REQUEST_TIMEOUT_MS, account_collection: "disabled unless credentials are explicitly configured" }, null, 2));
}

if (process.argv.includes("--check")) printCheck();
if (process.argv.includes("--json")) {
  const report = await collectDocumentation({ includeAccounts: process.argv.includes("--account") });
  console.log(JSON.stringify(report, null, 2));
  if (report.events.some((event) => event.status === "error")) process.exitCode = 1;
}

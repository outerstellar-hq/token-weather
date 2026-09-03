import { createHash } from "node:crypto";
import { collectPublicSignals, publicAdapters } from "./public-adapters.mjs";

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

export async function collectDocumentation({ fetchImpl = fetch, includePublicSignals = false } = {}) {
  const events = [];
  for (const source of sourceDefinitions) events.push(await collectSource(source, fetchImpl));
  const publicSignals = includePublicSignals ? await collectPublicSignals({ fetchImpl }) : null;
  return { schema: "token-weather.collector.v1", collected_at: now(), events: publicSignals ? [...events, ...publicSignals.events] : events, public_adapters: publicSignals?.public_adapters || publicAdapters.map((adapter) => ({ adapter_id: adapter.adapterId, provider_id: adapter.providerId, kind: adapter.kind, source_url: adapter.url })) };
}

function printCheck() {
  console.log(JSON.stringify({ schema: "token-weather.collector.v1", documentation_sources: sourceDefinitions.length, providers: new Set(sourceDefinitions.map((source) => source.providerId)).size, public_adapters: publicAdapters.length, max_response_bytes: MAX_RESPONSE_BYTES, timeout_ms: REQUEST_TIMEOUT_MS, scope: "global public sources only" }, null, 2));
}

if (process.argv.includes("--check")) printCheck();
if (process.argv.includes("--telemetry")) {
  const report = await collectPublicSignals();
  console.log(JSON.stringify(report, null, 2));
  if (report.events.some((event) => event.status === "error")) process.exitCode = 1;
}
if (process.argv.includes("--json")) {
  const report = await collectDocumentation({ includePublicSignals: process.argv.includes("--telemetry") });
  console.log(JSON.stringify(report, null, 2));
  if (report.events.some((event) => event.status === "error")) process.exitCode = 1;
}

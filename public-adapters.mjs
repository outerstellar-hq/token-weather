import { createHash } from "node:crypto";

const MAX_RESPONSE_BYTES = 8_000_000;
const REQUEST_TIMEOUT_MS = 10_000;

export const publicAdapters = Object.freeze([
  { adapterId: "openai-status", providerId: "openai-gpt-5", kind: "status_api", url: "https://status.openai.com/api/v2/summary.json" },
  { adapterId: "anthropic-status", providerId: "anthropic-claude-opus", kind: "status_api", url: "https://status.claude.com/api/v2/summary.json" },
  { adapterId: "groq-status", providerId: "groq-gpt-oss-120b", kind: "public_website", url: "https://status.groq.com/" },
  { adapterId: "cerebras-status", providerId: "cerebras-llama-31-8b", kind: "status_api", url: "https://status.cerebras.ai/api/v2/summary.json" },
  { adapterId: "sambanova-status", providerId: "sambanova-deepseek-v31", kind: "status_api", url: "https://status.sambanova.ai/api/v2/summary.json" },
  { adapterId: "minimax-status", providerId: "minimax-m27", kind: "status_api", url: "https://status.minimax.io/api/v2/summary.json" },
  { adapterId: "openai-news-feed", providerId: "openai-gpt-5", kind: "announcement_feed", url: "https://openai.com/news/rss.xml" },
  { adapterId: "google-ai-news-feed", providerId: "gemini-2-5-pro", kind: "announcement_feed", url: "https://blog.google/technology/ai/rss/" }
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
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function textContent(body) {
  return new TextDecoder().decode(body).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function titleFrom(body) {
  return new TextDecoder().decode(body).match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || null;
}

function feedItems(body) {
  const text = new TextDecoder().decode(body);
  return [...text.matchAll(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi)].slice(0, 20).map((match) => {
    const item = match[0];
    const value = (name) => item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || null;
    return { title: value("title"), published_at: value("pubDate") || value("published") || value("updated"), link: value("link") };
  });
}

function statusRecord(payload) {
  const components = Array.isArray(payload?.components) ? payload.components.map((component) => ({ name: component.name, status: component.status })) : [];
  return { indicator: payload?.status?.indicator || null, description: payload?.status?.description || null, components, unresolved_incidents: Array.isArray(payload?.incidents) ? payload.incidents.length : null, scheduled_maintenances: Array.isArray(payload?.scheduled_maintenances) ? payload.scheduled_maintenances.length : null, page_updated_at: payload?.page?.updated_at || null };
}

export async function collectPublicSource(adapter, fetchImpl = fetch) {
  const retrievedAt = now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(adapter.url, { signal: controller.signal, headers: { accept: "application/json,application/rss+xml,application/atom+xml,application/xml,text/xml,text/html" } });
    const body = await readBoundedBody(response);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const digest = sha256(body);
    const contentType = response.headers.get("content-type") || "";
    if (adapter.kind === "status_api" || contentType.includes("json")) {
      const payload = JSON.parse(new TextDecoder().decode(body));
      return { event_type: "PUBLIC_STATUS", adapter_id: adapter.adapterId, provider_id: adapter.providerId, signal_type: "public_service_status", source_url: adapter.url, retrieved_at: retrievedAt, status: "ok", http_status: response.status, bytes: body.byteLength, sha256: digest, official: true, confidence: "official public status API", signals: statusRecord(payload) };
    }
    if (adapter.kind === "announcement_feed" || /<rss|<feed|<channel/i.test(new TextDecoder().decode(body))) {
      return { event_type: "PUBLIC_ANNOUNCEMENTS", adapter_id: adapter.adapterId, provider_id: adapter.providerId, signal_type: "public_company_communications", source_url: adapter.url, retrieved_at: retrievedAt, status: "ok", http_status: response.status, bytes: body.byteLength, sha256: digest, official: true, confidence: "official public announcement feed", entries: feedItems(body) };
    }
    return { event_type: "PUBLIC_SOURCE", adapter_id: adapter.adapterId, provider_id: adapter.providerId, signal_type: "public_website", source_url: adapter.url, retrieved_at: retrievedAt, status: "ok", http_status: response.status, bytes: body.byteLength, sha256: digest, official: true, confidence: "official public website retrieved", title: titleFrom(body), text_bytes: textContent(body).length };
  } catch (error) {
    return { event_type: "PUBLIC_SOURCE", adapter_id: adapter.adapterId, provider_id: adapter.providerId, signal_type: adapter.kind, source_url: adapter.url, retrieved_at: retrievedAt, status: "error", error: error instanceof Error ? error.message : String(error), official: true, confidence: "public source retrieval failed" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function collectPublicSignals({ fetchImpl = fetch } = {}) {
  const events = [];
  for (const adapter of publicAdapters) events.push(await collectPublicSource(adapter, fetchImpl));
  return { schema: "token-weather.public-telemetry.v1", collected_at: now(), events, public_adapters: publicAdapters.map((adapter) => ({ adapter_id: adapter.adapterId, provider_id: adapter.providerId, kind: adapter.kind, source_url: adapter.url })) };
}

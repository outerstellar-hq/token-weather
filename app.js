let providers = Object.freeze([
  {
    id: "deepseek-v4-pro", name: "DeepSeek", model: "V4 Pro", region: "asia", code: "DS", state: "healthy", condition: "Off peak",
    pricing: { input: 0.66, output: 1.98, multiplier: 0.5, currency: "USD / 1M tokens" },
    quota: { remaining: 82, window: "rolling account quota", reset: "—" },
    capacity: { guaranteedTpm: 500000, observedTpm: 1100000, concurrency: 500 },
    rateLimits: { rpm: 4000, tpm: 500000, concurrency: 500 },
    latencyMs: 820, stability: "Healthy", nextWindow: "Peak starts 06:00 UTC",
    note: "Off-peak pricing is active. Input and output rates are 0.5× the published peak rate.",
    source: { label: "DeepSeek pricing & limits", url: "https://api-docs.deepseek.com/quick_start/pricing", type: "official documentation", official: true, confidence: "Official", retrievedAt: "Demo snapshot" }
  },
  {
    id: "qwen-3-7-plus", name: "Alibaba / Qwen", model: "3.7 Plus", region: "asia", code: "QW", state: "healthy", condition: "Spare capacity",
    pricing: { input: 0.50, output: 2.00, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: 76, window: "workspace quota", reset: "—" },
    capacity: { guaranteedTpm: 1000000, observedTpm: 1760000, concurrency: 1000 },
    rateLimits: { rpm: 6000, tpm: 1000000, concurrency: 1000 },
    latencyMs: 640, stability: "Healthy", nextWindow: "Spare capacity observed now",
    note: "Observed throughput is above the guaranteed baseline. This is a measurement, not a new quota.",
    source: { label: "Alibaba quota API", url: "https://docs.modelstudio.console.alibabacloud.com/en/model-studio/quota-management", type: "official API + local observation", official: true, confidence: "Official + observed", retrievedAt: "Demo snapshot" }
  },
  {
    id: "glm-5", name: "Zhipu / GLM", model: "GLM-5", region: "asia", code: "GL", state: "watch", condition: "Peak window",
    pricing: { input: 1.00, output: 3.20, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: 64, window: "account tier", reset: "—" },
    capacity: { guaranteedTpm: 150000, observedTpm: 142000, concurrency: 80 },
    rateLimits: { rpm: 1800, tpm: 150000, concurrency: 80 },
    latencyMs: 1200, stability: "Watch", nextWindow: "Off peak starts 18:00 local",
    note: "Peak-time throttling is documented between 15:00 and 18:00 local time.",
    source: { label: "Zhipu rate limits", url: "https://docs.bigmodel.cn/cn/api/rate-limit", type: "official documentation", official: true, confidence: "Official", retrievedAt: "Demo snapshot" }
  },
  {
    id: "baidu-ernie-5", name: "Baidu Qianfan", model: "ERNIE 5.0", region: "asia", code: "BQ", state: "healthy", condition: "Healthy",
    pricing: { input: 1.20, output: 4.80, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: 71, window: "response-header quota", reset: "—" },
    capacity: { guaranteedTpm: 300000, observedTpm: 298000, concurrency: 120 },
    rateLimits: { rpm: 2400, tpm: 300000, concurrency: 120 },
    latencyMs: 710, stability: "Healthy", nextWindow: "No scheduled change",
    note: "Remaining request and token limits are read from response headers when connected.",
    source: { label: "Baidu API headers", url: "https://intl.cloud.baidu.com/en/doc/qianfan/s/3m7of64lb-intl-en", type: "official API telemetry", official: true, confidence: "Official + headers", retrievedAt: "Demo snapshot" }
  },
  {
    id: "stepfun-step-35", name: "StepFun", model: "Step-3.5", region: "asia", code: "SF", state: "watch", condition: "Rate watch",
    pricing: { input: 0.70, output: 2.10, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: 58, window: "account tier", reset: "—" },
    capacity: { guaranteedTpm: 200000, observedTpm: 188000, concurrency: 100 },
    rateLimits: { rpm: 1800, tpm: 200000, concurrency: 100 },
    latencyMs: 940, stability: "Watch", nextWindow: "Capacity adjustment possible",
    note: "StepFun may temporarily adjust rate limits when overall capacity is reached.",
    source: { label: "StepFun tier limits", url: "https://platform.stepfun.com/docs/zh/guides/pricing/details", type: "official documentation", official: true, confidence: "Official", retrievedAt: "Demo snapshot" }
  },
  {
    id: "openai-gpt-5", name: "OpenAI", model: "GPT-5", region: "west", code: "OA", state: "healthy", condition: "Healthy",
    pricing: { input: 1.25, output: 10.00, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: 88, window: "tier 4 account limit", reset: "—" },
    capacity: { guaranteedTpm: 2000000, observedTpm: null, concurrency: 500 },
    rateLimits: { rpm: 5000, tpm: 2000000, concurrency: 500 },
    latencyMs: 780, stability: "Healthy", nextWindow: "No scheduled change",
    note: "Account tier and public status are healthy in this demo snapshot.",
    source: { label: "OpenAI limits & status", url: "https://platform.openai.com/docs/guides/rate-limits", type: "official dashboard + status", official: true, confidence: "Official", retrievedAt: "Demo snapshot" }
  },
  {
    id: "gemini-2-5-pro", name: "Google Gemini", model: "2.5 Pro", region: "west", code: "GG", state: "healthy", condition: "Healthy",
    pricing: { input: 1.25, output: 10.00, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: 79, window: "project quota", reset: "—" },
    capacity: { guaranteedTpm: 1000000, observedTpm: null, concurrency: 300 },
    rateLimits: { rpm: 3600, tpm: 1000000, concurrency: 300 },
    latencyMs: 690, stability: "Healthy", nextWindow: "Batch window available",
    note: "Project limits vary by tier and workload class. Batch is the lower-cost path for queued work.",
    source: { label: "Google AI Studio", url: "https://ai.google.dev/gemini-api/docs/rate-limits", type: "official documentation + console", official: true, confidence: "Official", retrievedAt: "Demo snapshot" }
  },
  {
    id: "anthropic-claude-opus", name: "Anthropic", model: "Claude Opus", region: "west", code: "AN", state: "healthy", condition: "Healthy",
    pricing: { input: 15.00, output: 75.00, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: 68, window: "tier 2 account limit", reset: "—" },
    capacity: { guaranteedTpm: 400000, observedTpm: null, concurrency: 150 },
    rateLimits: { rpm: 1800, tpm: 400000, concurrency: 150 },
    latencyMs: 1100, stability: "Healthy", nextWindow: "No scheduled change",
    note: "Spend tier and account limits are represented separately from public service status.",
    source: { label: "Anthropic rate limits", url: "https://docs.anthropic.com/en/api/rate-limits", type: "official documentation", official: true, confidence: "Official", retrievedAt: "Demo snapshot" }
  },
  {
    id: "xai-grok-46", name: "xAI", model: "Grok 4.6", region: "west", code: "XI", state: "healthy", condition: "Healthy",
    pricing: { input: 2.00, output: 6.00, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: null, window: "team tier", reset: "Console" },
    capacity: { guaranteedTpm: 10000000, observedTpm: null, concurrency: null },
    rateLimits: { rps: 37, tpm: 10000000, concurrency: null },
    latencyMs: 860, stability: "Healthy", nextWindow: "Team tier limits apply",
    note: "Grok 4.6 is priced at $2 input and $6 output per million tokens. Tier 0 currently documents 37 RPS and 10M TPM; account-specific limits live in the xAI console.",
    source: { label: "xAI Grok 4.6 & limits", url: "https://docs.x.ai/developers/grok-4-6", type: "official documentation", official: true, confidence: "Official", retrievedAt: "Demo snapshot" }
  },
  {
    id: "minimax-m27", name: "MiniMax", model: "M2.7", region: "asia", code: "MM", state: "healthy", condition: "Rolling quota",
    pricing: { input: 0.30, output: 1.20, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: null, window: "5-hour rolling window", reset: "Account" },
    capacity: { guaranteedTpm: null, observedTpm: null, concurrency: null },
    rateLimits: { rpm: null, tpm: null, concurrency: null, quota: "requests / 5 hours" },
    latencyMs: null, stability: "Healthy", nextWindow: "Quota replenishes continuously",
    note: "MiniMax measures M2.7 usage by requests in a 5-hour rolling window. The account plan determines the request allowance; other modalities use daily quotas.",
    source: { label: "MiniMax Token Plan", url: "https://platform.minimax.io/docs/token-plan/intro", type: "official plan documentation", official: true, confidence: "Official", retrievedAt: "Demo snapshot" }
  },
  {
    id: "groq-gpt-oss-120b", name: "Groq", model: "GPT-OSS 120B", region: "west", code: "GQ", state: "healthy", condition: "Fast lane",
    pricing: { input: 0.15, output: 0.60, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: null, window: "minute + daily limits", reset: "Response header" },
    capacity: { guaranteedTpm: 250000, observedTpm: null, concurrency: null },
    rateLimits: { rpm: 1000, rpd: 1000, tpm: 250000, tpd: 200000, concurrency: null },
    latencyMs: null, stability: "Healthy", nextWindow: "Daily request bucket resets from headers",
    note: "Groq publishes per-minute and per-day request/token limits and returns remaining/reset headers. Flex processing can provide higher limits while capacity is available.",
    source: { label: "Groq models & limits", url: "https://console.groq.com/docs/models", type: "official documentation", official: true, confidence: "Official", retrievedAt: "Demo snapshot" }
  },
  {
    id: "moonshot-kimi-k26", name: "Moonshot / Kimi", model: "Kimi K2.6", region: "asia", code: "MK", state: "healthy", condition: "Tier 0 limits",
    pricing: { input: 0.95, output: 4.00, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: null, window: "account tier", reset: "API response" },
    capacity: { guaranteedTpm: 500000, observedTpm: null, concurrency: 1 },
    rateLimits: { rpm: 3, tpm: 500000, tpd: 1500000, concurrency: 1 },
    latencyMs: null, stability: "Healthy", nextWindow: "Tier follows cumulative recharge",
    note: "Moonshot's Tier 0 documentation specifies concurrency, RPM, TPM, and TPD together. Higher tiers depend on cumulative account recharge, so live limits must be collected per account.",
    source: { label: "Kimi pricing & limits", url: "https://platform.kimi.ai/docs/pricing/limits", type: "official documentation", official: true, confidence: "Official", retrievedAt: "Demo snapshot" }
  },
  {
    id: "cerebras-llama-31-8b", name: "Cerebras", model: "Llama 3.1 8B", region: "west", code: "CB", state: "healthy", condition: "Header telemetry",
    pricing: { input: null, output: null, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: null, window: "minute + hour + daily limits", reset: "Response header" },
    capacity: { guaranteedTpm: 60000, observedTpm: null, concurrency: null },
    rateLimits: { rpm: 30, rph: 900, rpd: 14400, tpm: 60000, tph: 1000000, tpd: 1000000, concurrency: null },
    latencyMs: null, stability: "Healthy", nextWindow: "Paid tier removes hourly/daily caps",
    note: "Cerebras exposes minute, hourly, and daily request/token limits for free access, with remaining and reset values in response headers. Pricing is not seeded until an official model price is available.",
    source: { label: "Cerebras rate limits", url: "https://inference-docs.cerebras.ai/support/rate-limits", type: "official documentation", official: true, confidence: "Official", retrievedAt: "Demo snapshot" }
  },
  {
    id: "sambanova-deepseek-v31", name: "SambaNova", model: "DeepSeek V3.1", region: "west", code: "SN", state: "healthy", condition: "Daily tier",
    pricing: { input: null, output: null, multiplier: 1, currency: "USD / 1M tokens" },
    quota: { remaining: null, window: "minute + daily limits", reset: "Response header" },
    capacity: { guaranteedTpm: null, observedTpm: null, concurrency: null },
    rateLimits: { rpm: 60, rpd: 12000, tpd: 20000000, concurrency: null },
    latencyMs: null, stability: "Healthy", nextWindow: "Daily request bucket resets from headers",
    note: "SambaNova documents per-minute and per-day limits and returns daily remaining/reset headers. Free, developer, preview, and production model limits must remain separate.",
    source: { label: "SambaNova model limits", url: "https://docs.sambanova.ai/docs/en/models/rate-limits", type: "official documentation", official: true, confidence: "Official", retrievedAt: "Demo snapshot" }
  }
]);

const recentChanges = Object.freeze([
  { providerId: "deepseek-v4-pro", type: "PRICE_EVENT", title: "Off-peak multiplier is active", detail: "Input and output pricing are currently 0.5× the published peak rate.", age: "Current window", source: "DeepSeek pricing & limits", confidence: "Official" },
  { providerId: "qwen-3-7-plus", type: "CAPACITY_EVENT", title: "Observed throughput above baseline", detail: "Local measurements reached 1.76M TPM against a 1M guaranteed baseline.", age: "Demo observation", source: "Alibaba quota API", confidence: "Official + observed" },
  { providerId: "glm-5", type: "CAPACITY_EVENT", title: "Peak-time watch is active", detail: "Zhipu documents dynamic throttling during the 15:00–18:00 local window.", age: "Scheduled window", source: "Zhipu rate limits", confidence: "Official" },
  { providerId: "baidu-ernie-5", type: "QUOTA_EVENT", title: "Header telemetry is ready", detail: "Remaining request and token limits can be collected from API response headers.", age: "Integration target", source: "Baidu API headers", confidence: "Official" },
  { providerId: "stepfun-step-35", type: "CAPACITY_EVENT", title: "Temporary limit adjustment documented", detail: "The provider may adjust rate limits when overall capacity reaches its limit.", age: "Standing rule", source: "StepFun tier limits", confidence: "Official" },
  { providerId: "xai-grok-46", type: "CAPACITY_EVENT", title: "Tiered RPS and TPM limits documented", detail: "xAI publishes per-model request-per-second and token-per-minute caps; the account tier determines the live ceiling.", age: "Standing rule", source: "xAI rate limits", confidence: "Official" },
  { providerId: "minimax-m27", type: "QUOTA_EVENT", title: "Five-hour rolling quota documented", detail: "M2.7 usage is measured in a rolling five-hour request window; other modalities use daily quotas.", age: "Standing rule", source: "MiniMax Token Plan", confidence: "Official" },
  { providerId: "groq-gpt-oss-120b", type: "QUOTA_EVENT", title: "Minute and daily limits are visible", detail: "Groq returns remaining request/token values and reset times in response headers.", age: "Integration target", source: "Groq models & limits", confidence: "Official" },
  { providerId: "moonshot-kimi-k26", type: "QUOTA_EVENT", title: "Tier 0 has four limit dimensions", detail: "Kimi documents concurrency, RPM, TPM, and TPD together; higher tiers follow cumulative recharge.", age: "Standing rule", source: "Kimi pricing & limits", confidence: "Official" },
  { providerId: "cerebras-llama-31-8b", type: "QUOTA_EVENT", title: "Hourly and daily header telemetry available", detail: "Cerebras exposes minute, hourly, and daily limits with remaining/reset response headers.", age: "Integration target", source: "Cerebras rate limits", confidence: "Official" },
  { providerId: "sambanova-deepseek-v31", type: "QUOTA_EVENT", title: "Daily tier limits documented", detail: "SambaNova separates per-minute limits from daily request/token limits and exposes daily reset headers.", age: "Integration target", source: "SambaNova model limits", confidence: "Official" }
]);

const stateClass = { healthy: "green", watch: "yellow", disrupted: "red" };
const state = { selectedId: "deepseek-v4-pro", activeView: "all", search: "", sortDescending: true, compareIds: ["deepseek-v4-pro", "qwen-3-7-plus", "gemini-2-5-pro"] };
const $ = (selector) => document.querySelector(selector);

function getProvider(id) {
  const provider = providers.find((item) => item.id === id);
  if (!provider) throw new Error(`Unknown provider: ${id}`);
  return provider;
}

function formatTokens(value) {
  if (value == null) return "—";
  if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 ? 2 : 0)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return `${value}`;
}

function formatPrice(value) {
  if (!Number.isFinite(value)) return "—";
  return `$${value.toFixed(value >= 10 ? 0 : 2)}`;
}

function formatQuota(value) {
  return value == null ? "—" : `${value}%`;
}

function formatLatency(value) {
  if (!Number.isFinite(value)) return "—";
  return value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${value} ms`;
}

const UNKNOWN_LATENCY_MS = 2500;

function hasPricing(provider) {
  return Number.isFinite(provider.pricing.input) && Number.isFinite(provider.pricing.output);
}

function providerWeather(provider) {
  return {
    provider: provider.name,
    model: provider.model,
    provider_id: provider.id,
    region: provider.region,
    state: provider.state,
    condition: provider.condition,
    price: { ...provider.pricing },
    quota: { ...provider.quota },
    capacity: { ...provider.capacity },
    rate_limits: { ...provider.rateLimits },
    latency_ms: provider.latencyMs,
    stability: provider.stability,
    next_window: provider.nextWindow,
    source: { ...provider.source },
    observed_value_is_measurement: provider.capacity.observedTpm !== null
  };
}

function renderProviderRow(provider) {
  const selected = provider.id === state.selectedId ? " selected" : "";
  return `<button class="provider-row${selected}" type="button" data-provider-id="${provider.id}" aria-pressed="${provider.id === state.selectedId}">
    <span class="provider-name"><span class="provider-avatar">${provider.code}</span><span class="provider-title"><strong>${provider.name}</strong><span>${provider.model}</span></span></span>
    <span><span class="metric-label">Condition</span><span class="condition"><i class="status-dot ${stateClass[provider.state]}"></i>${provider.condition}</span></span>
    <span><span class="metric-label">Guaranteed TPM</span><span class="metric-value">${formatTokens(provider.capacity.guaranteedTpm)}</span></span>
    <span><span class="metric-label">Quota left</span><span class="metric-value ${provider.quota.remaining == null ? "" : "good"}">${formatQuota(provider.quota.remaining)}</span></span>
  </button>`;
}

function detailMarkup(provider) {
  const price = `${formatPrice(provider.pricing.input)} / ${formatPrice(provider.pricing.output)}`;
  return `<div class="detail-top"><div><span class="detail-kicker">Selected forecast</span><h3>${provider.name}</h3><span class="detail-model">${provider.model} · ${provider.region === "asia" ? "Asia Pacific" : "Western"}</span></div><span class="detail-condition"><i class="status-dot ${stateClass[provider.state]}"></i> ${provider.condition}</span></div>
    <div class="detail-rule"></div>
    <div class="detail-stats">
      <div class="detail-stat"><label>Current effective cost</label><strong>${price}<span> / 1M in / out</span></strong></div>
      <div class="detail-stat"><label>Quota remaining</label><strong>${formatQuota(provider.quota.remaining)}</strong>${provider.quota.remaining == null ? "" : `<div class="meter"><i style="width: ${provider.quota.remaining}%"></i></div>`}</div>
      <div class="detail-stat"><label>Guaranteed TPM</label><strong>${formatTokens(provider.capacity.guaranteedTpm)}</strong></div>
      <div class="detail-stat"><label>Observed available</label><strong>${formatTokens(provider.capacity.observedTpm)}</strong></div>
      <div class="detail-stat"><label>Typical latency</label><strong>${formatLatency(provider.latencyMs)}</strong></div>
      <div class="detail-stat"><label>Source confidence</label><strong>${provider.source.confidence}</strong></div>
    </div>
    <div class="detail-callout"><strong>Forecast note</strong>${provider.note}</div>
    <div class="source-row"><span>Checked · ${provider.source.retrievedAt}</span><a class="source-link" href="${provider.source.url}" target="_blank" rel="noreferrer" data-source-id="${provider.id}">${provider.source.label} ↗</a></div>
    <div class="detail-actions"><button class="small-action" type="button" data-add-compare="${provider.id}">${state.compareIds.includes(provider.id) ? "In comparison" : "Add to compare"} <span>+</span></button><span class="mono">${provider.rateLimits.rps == null ? `RPM ${formatTokens(provider.rateLimits.rpm)}` : `RPS ${formatTokens(provider.rateLimits.rps)}`} · CONC ${formatTokens(provider.rateLimits.concurrency)}</span></div>`;
}

function visibleProviders() {
  const search = state.search.toLowerCase();
  return providers.filter((provider) => {
    const matchesSearch = `${provider.name} ${provider.model}`.toLowerCase().includes(search);
    return matchesSearch && (state.activeView === "all" || provider.region === state.activeView);
  }).sort((a, b) => {
    if (a.state === b.state) return a.name.localeCompare(b.name);
    const result = a.state === "healthy" ? -1 : 1;
    return state.sortDescending ? result : -result;
  });
}

function renderForecast() {
  const visible = visibleProviders();
  $("#provider-list").innerHTML = visible.length ? visible.map(renderProviderRow).join("") : `<div class="empty-state">No providers match “${state.search}”. Try a model or provider name.</div>`;
  $("#detail-panel").innerHTML = detailMarkup(getProvider(state.selectedId));
  $("#provider-search").value = state.search;
  document.querySelectorAll(".view-button").forEach((button) => button.classList.toggle("active", button.dataset.view === state.activeView));
}

function applySnapshot(snapshot) {
  const events = Array.isArray(snapshot.events) ? snapshot.events : [];
  const accounts = Array.isArray(snapshot.account_collectors) ? snapshot.account_collectors : [];
  const successfulSources = new Map(events.filter((event) => event.event_type === "SOURCE_FETCH" && event.status === "ok").map((event) => [event.provider_id, event]));
  providers = Object.freeze(providers.map((provider) => {
    const event = successfulSources.get(provider.id);
    if (!event) return provider;
    return { ...provider, source: { ...provider.source, retrievedAt: new Date(event.retrieved_at).toISOString().replace("T", " ").slice(0, 16) + " UTC", collectorStatus: event.status, sha256: event.sha256 } };
  }));
  $("#feed-label").textContent = snapshot.mode === "source-connected" ? "Source-connected feed" : snapshot.mode === "degraded" ? "Degraded source feed" : "Seeded feed";
  const configuredAccounts = accounts.filter((collector) => collector.status === "configured").length;
  $("#snapshot-label").textContent = snapshot.generated_at ? `Sources checked · ${new Date(snapshot.generated_at).toISOString().replace("T", " ").slice(0, 16)} UTC · account ${configuredAccounts}/${accounts.length}` : "Seeded snapshot · source collector ready";
  renderForecast();
  renderCompare();
  renderChanges();
}

async function loadSnapshot() {
  try {
    const response = await fetch("/api/snapshot", { cache: "no-store" });
    if (!response.ok) throw new Error(`snapshot returned HTTP ${response.status}`);
    const snapshot = await response.json();
    if (!Array.isArray(snapshot.events)) throw new Error("snapshot events are missing");
    applySnapshot(snapshot);
  } catch {
    // Direct-file use remains useful; the seeded records are the explicit fallback.
  }
}

async function refreshSnapshot() {
  const button = $("#refresh-button");
  button.disabled = true;
  try {
    const response = await fetch("/api/refresh", { method: "POST" });
    const snapshot = await response.json();
    applySnapshot(snapshot);
    showToast(response.ok ? "Source snapshot refreshed." : "Source snapshot is degraded; inspect collector errors.");
  } catch {
    showToast("Source refresh needs the local server: npm run server.");
  } finally {
    button.disabled = false;
  }
}

function compareModels(ids) {
  return ids.map(getProvider).map((provider) => ({
    ...providerWeather(provider),
    effective_cost: { input: provider.pricing.input, output: provider.pricing.output },
    condition_score: provider.state === "healthy" ? 2 : 1
  }));
}

function renderCompare() {
  $("#compare-picker-list").innerHTML = providers.map((provider) => `<button class="compare-choice${state.compareIds.includes(provider.id) ? " selected" : ""}" type="button" data-toggle-compare="${provider.id}" aria-pressed="${state.compareIds.includes(provider.id)}"><span class="choice-check">${state.compareIds.includes(provider.id) ? "✓" : ""}</span><span><strong>${provider.name}</strong><small>${provider.model}</small></span></button>`).join("");
  const selected = compareModels(state.compareIds);
  $("#compare-results").innerHTML = `<div class="compare-header"><span>METRIC</span>${selected.map((provider) => `<strong>${provider.provider}<small>${provider.model}</small></strong>`).join("")}</div>
    ${compareRow("Condition", selected.map((provider) => `<span class="compare-condition"><i class="status-dot ${stateClass[provider.state]}"></i>${provider.condition}</span>`))}
    ${compareRow("Current input / output", selected.map((provider) => `<span class="compare-value">${formatPrice(provider.price.input)} / ${formatPrice(provider.price.output)}</span>`))}
    ${compareRow("Guaranteed TPM", selected.map((provider) => `<span class="compare-value">${formatTokens(provider.capacity.guaranteedTpm)}</span>`))}
    ${compareRow("Observed available", selected.map((provider) => `<span class="compare-value ${provider.capacity.observedTpm > provider.capacity.guaranteedTpm ? "good" : ""}">${formatTokens(provider.capacity.observedTpm)}</span>`))}
    ${compareRow("Latency", selected.map((provider) => `<span class="compare-value">${formatLatency(provider.latency_ms)}</span>`))}
    ${compareRow("Quota remaining", selected.map((provider) => `<span class="compare-value ${provider.quota.remaining == null ? "" : "good"}">${formatQuota(provider.quota.remaining)}</span>`))}`;
}

function compareRow(label, values) {
  return `<div class="compare-row"><span class="compare-label">${label}</span>${values.join("")}</div>`;
}

function findCheapestWindow() {
  return [...providers].filter(hasPricing).sort((a, b) => a.pricing.input - b.pricing.input)[0];
}

function findFastestWindow() {
  return [...providers].filter((provider) => Number.isFinite(provider.latencyMs)).sort((a, b) => a.latencyMs - b.latencyMs)[0];
}

function planWorkload({ tokens = 1000000, shape = "balanced", region = "all" } = {}) {
  const totalTokens = Math.max(1, Number(tokens) || 1000000);
  const outputRatio = shape === "batch" ? 0.25 : shape === "latency" ? 0.15 : 0.2;
  const candidates = providers.filter((provider) => hasPricing(provider) && (region === "all" || provider.region === region));
  const ranked = candidates.map((provider) => {
    const outputTokens = totalTokens * outputRatio;
    const inputTokens = totalTokens - outputTokens;
    const estimatedCost = (inputTokens / 1000000) * provider.pricing.input + (outputTokens / 1000000) * provider.pricing.output;
    const capacityRatio = provider.capacity.observedTpm ? provider.capacity.observedTpm / provider.capacity.guaranteedTpm : 1;
    const penalty = provider.state === "watch" ? 1.18 : 1;
    const latencyMs = Number.isFinite(provider.latencyMs) ? provider.latencyMs : UNKNOWN_LATENCY_MS;
    const score = shape === "latency" ? latencyMs * penalty : shape === "cost" ? estimatedCost * penalty : shape === "batch" ? (estimatedCost / Math.max(capacityRatio, 1)) * penalty : (estimatedCost * 0.7 + latencyMs / 1000 * 0.3) * penalty;
    return { provider, estimatedCost, score, inputTokens, outputTokens };
  }).sort((a, b) => a.score - b.score);
  const best = ranked[0];
  return { ...best, alternatives: ranked.slice(1, 3), shape, totalTokens };
}

function publicWorkloadPlan(plan) {
  return {
    provider: providerWeather(plan.provider),
    estimated_cost: plan.estimatedCost,
    input_tokens: plan.inputTokens,
    output_tokens: plan.outputTokens,
    shape: plan.shape,
    total_tokens: plan.totalTokens,
    alternatives: plan.alternatives.map((item) => ({ provider: providerWeather(item.provider), estimated_cost: item.estimatedCost }))
  };
}

function renderPlanner(result = planWorkload()) {
  const provider = result.provider;
  const shapeLabel = { balanced: "balanced", latency: "latency-sensitive", batch: "batch / queued", cost: "cost-first" }[result.shape];
  $("#planner-result").innerHTML = `<div class="recommendation-top"><span class="detail-kicker">Recommended window</span><span class="recommendation-badge">${provider.condition}</span></div><h3>${provider.name} <span>${provider.model}</span></h3><p class="recommendation-copy">For a ${result.totalTokens.toLocaleString()} token ${shapeLabel} workload, ${provider.name} is the strongest current fit.</p><div class="recommendation-metrics"><div><span>Estimated cost</span><strong>${formatPrice(result.estimatedCost)}</strong></div><div><span>Latency</span><strong>${formatLatency(provider.latencyMs)}</strong></div><div><span>Quota left</span><strong>${formatQuota(provider.quota.remaining)}</strong></div></div><div class="recommendation-explain"><strong>Why this one</strong>${provider.note} The score keeps the provider’s guaranteed capacity and current condition visible.</div><div class="alternatives"><span class="field-label">NEXT BEST</span>${result.alternatives.map((item) => `<button type="button" data-provider-id="${item.provider.id}">${item.provider.name}<span>${formatPrice(item.estimatedCost)} · ${formatLatency(item.provider.latencyMs)}</span></button>`).join("")}</div>`;
}

function renderChanges() {
  $("#changes-list").innerHTML = recentChanges.map((change) => { const provider = getProvider(change.providerId); return `<article class="change-row"><div class="change-marker ${stateClass[provider.state]}"></div><div class="change-main"><div class="change-meta"><span>${change.type.replace("_", " ")}</span><span>${change.age}</span></div><h3>${change.title}</h3><p>${change.detail}</p></div><div class="change-source"><strong>${provider.name}</strong><span>${change.confidence}</span><a class="source-link" href="${provider.source.url}" target="_blank" rel="noreferrer" data-source-id="${provider.id}">${change.source} ↗</a></div></article>`; }).join("");
}

function getSource(id) {
  return { provider_id: id, ...getProvider(id).source };
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function createAgentApi() {
  return Object.freeze({
    get_provider_weather: ({ region = "all" } = {}) => providers.filter((provider) => region === "all" || provider.region === region).map(providerWeather),
    get_model_weather: (model) => providerWeather(providers.find((provider) => `${provider.name} ${provider.model}`.toLowerCase() === String(model).toLowerCase() || provider.id === model) || (() => { throw new Error(`Unknown model: ${model}`); })()),
    get_current_price: (id) => ({ provider_id: id, ...getProvider(id).pricing }),
    get_current_quota: (id) => ({ provider_id: id, ...getProvider(id).quota }),
    get_capacity: (id) => ({ provider_id: id, ...getProvider(id).capacity }),
    get_rate_limits: (id) => ({ provider_id: id, ...getProvider(id).rateLimits }),
    compare_models: (ids) => compareModels(ids),
    find_cheapest_window: () => providerWeather(findCheapestWindow()),
    find_fastest_window: () => providerWeather(findFastestWindow()),
    plan_workload: (args) => publicWorkloadPlan(planWorkload(args)),
    explain_recommendation: (id) => getProvider(id).note,
    get_source: getSource,
    get_recent_changes: () => recentChanges.map((change) => ({ ...change }))
  });
}

const agentApi = createAgentApi();
window.tokenWeather = agentApi;

async function registerWebMcpTools() {
  if (typeof document.modelContext?.registerTool !== "function") return;

  const tools = [
    {
      name: "get_provider_weather",
      description: "Read Token Weather conditions for all providers in a region.",
      inputSchema: {
        type: "object",
        properties: { region: { type: "string", enum: ["all", "asia", "west"], description: "Provider region to inspect." } },
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: async ({ region = "all" } = {}) => ({ providers: agentApi.get_provider_weather({ region }) })
    },
    {
      name: "get_model_weather",
      description: "Read the current price, quota, capacity, latency, limits, and source for one named model.",
      inputSchema: {
        type: "object",
        properties: { model: { type: "string", description: "Provider/model ID or displayed provider and model name." } },
        required: ["model"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: async ({ model }) => agentApi.get_model_weather(model)
    },
    {
      name: "compare_models",
      description: "Compare up to three models across condition, price, capacity, latency, and quota.",
      inputSchema: {
        type: "object",
        properties: { ids: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 3, description: "Model IDs to compare." } },
        required: ["ids"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: async ({ ids }) => ({ models: agentApi.compare_models(ids) })
    },
    {
      name: "plan_workload",
      description: "Recommend a provider for a token workload and return the estimated cost plus alternatives.",
      inputSchema: {
        type: "object",
        properties: {
          tokens: { type: "number", minimum: 1, description: "Total input and output tokens." },
          shape: { type: "string", enum: ["balanced", "latency", "batch", "cost"], description: "Workload priority." },
          region: { type: "string", enum: ["all", "asia", "west"], description: "Allowed provider region." }
        },
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: async (args = {}) => agentApi.plan_workload(args)
    },
    {
      name: "get_recent_changes",
      description: "Read the recent provenance-led changes recorded by Token Weather.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async () => ({ changes: agentApi.get_recent_changes() })
    },
    {
      name: "focus_provider",
      description: "Select a provider in the visible forecast so the person and agent can inspect the same detail panel.",
      inputSchema: {
        type: "object",
        properties: { provider_id: { type: "string", description: "Provider ID to show in the forecast detail panel." } },
        required: ["provider_id"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
      execute: async ({ provider_id: providerId }) => {
        const provider = getProvider(providerId);
        state.selectedId = provider.id;
        renderForecast();
        return { selected: providerWeather(provider), human_view_updated: true };
      }
    }
  ];

  for (const tool of tools) await document.modelContext.registerTool(tool);
  document.documentElement.dataset.webmcp = "ready";
}

registerWebMcpTools().catch((error) => {
  document.documentElement.dataset.webmcp = "error";
  console.error("Token Weather WebMCP registration failed", error);
});

$("#provider-search").addEventListener("input", (event) => { state.search = event.target.value; renderForecast(); });
document.querySelectorAll(".view-button").forEach((button) => button.addEventListener("click", () => { state.activeView = button.dataset.view; renderForecast(); }));
$("#sort-button").addEventListener("click", () => { state.sortDescending = !state.sortDescending; $("#sort-button").textContent = `CONDITION ${state.sortDescending ? "↓" : "↑"}`; renderForecast(); });
$("#provider-list").addEventListener("click", (event) => { const row = event.target.closest("[data-provider-id]"); if (row) { state.selectedId = row.dataset.providerId; renderForecast(); } });
$("#compare-picker-list").addEventListener("click", (event) => { const button = event.target.closest("[data-toggle-compare]"); if (!button) return; const id = button.dataset.toggleCompare; if (state.compareIds.includes(id)) { if (state.compareIds.length === 1) return showToast("Keep one model selected for comparison."); state.compareIds = state.compareIds.filter((item) => item !== id); } else if (state.compareIds.length < 3) { state.compareIds = [...state.compareIds, id]; } else return showToast("Compare up to three models at a time."); renderCompare(); renderForecast(); });
document.addEventListener("click", (event) => { const source = event.target.closest("[data-source-id]"); if (source) { const item = getSource(source.dataset.sourceId); showToast(`${item.label} · ${item.confidence} · ${item.retrievedAt}`); } const add = event.target.closest("[data-add-compare]"); if (add) { const id = add.dataset.addCompare; if (!state.compareIds.includes(id) && state.compareIds.length >= 3) return showToast("Compare up to three models at a time."); if (!state.compareIds.includes(id)) state.compareIds = [...state.compareIds, id]; renderCompare(); renderForecast(); showToast(`${getProvider(id).name} added to comparison.`); } const providerLink = event.target.closest("#planner-result [data-provider-id]"); if (providerLink) { state.selectedId = providerLink.dataset.providerId; renderForecast(); showToast(`${getProvider(state.selectedId).name} selected in the forecast.`); } });
$("#planner-form").addEventListener("submit", (event) => { event.preventDefault(); renderPlanner(planWorkload({ tokens: $("#planner-tokens").value, shape: $("#planner-shape").value, region: $("#planner-region").value })); showToast("Workload plan recalculated from the seeded snapshot."); });
$("#refresh-button").addEventListener("click", refreshSnapshot);
$("#hero-sources-button").addEventListener("click", () => showToast("Every forecast keeps its source type, confidence, and measurement boundary attached."));
$("#sources-button").addEventListener("click", () => showToast("Every forecast keeps its source type, confidence, and measurement boundary attached."));
$("#principle-button").addEventListener("click", () => showToast("Guaranteed capacity is the promise. Observed capacity is the possibility."));
document.querySelectorAll("[data-scroll-target]").forEach((button) => button.addEventListener("click", () => { document.getElementById(button.dataset.scrollTarget).scrollIntoView({ behavior: "smooth", block: "start" }); document.querySelectorAll(".surface-link").forEach((item) => item.classList.toggle("active", item === button)); }));

renderForecast();
renderCompare();
renderPlanner();
renderChanges();
loadSnapshot();

const providerCatalog = Object.freeze([
  { id: "deepseek-v4-pro", name: "DeepSeek", model: "V4 Pro", region: "asia", code: "DS", source: { label: "DeepSeek pricing", url: "https://api-docs.deepseek.com/quick_start/pricing", type: "official documentation", official: true } },
  { id: "qwen-3-7-plus", name: "Alibaba / Qwen", model: "3.7 Plus", region: "asia", code: "QW", source: { label: "Alibaba quota management", url: "https://docs.modelstudio.console.alibabacloud.com/en/model-studio/quota-management", type: "official documentation", official: true } },
  { id: "glm-5", name: "Zhipu / GLM", model: "GLM-5", region: "asia", code: "GL", source: { label: "Zhipu rate limits", url: "https://docs.bigmodel.cn/cn/api/rate-limit", type: "official documentation", official: true } },
  { id: "zai", name: "Z.ai", model: "GLM-5", region: "asia", code: "ZA", source: { label: "Z.ai usage policy", url: "https://docs.z.ai/devpack/tool/others", type: "official documentation", official: true } },
  { id: "baidu-ernie-5", name: "Baidu Qianfan", model: "ERNIE 5.0", region: "asia", code: "BQ", source: { label: "Baidu Qianfan limits", url: "https://intl.cloud.baidu.com/en/doc/qianfan/s/3m7of64lb-intl-en", type: "official documentation", official: true } },
  { id: "stepfun-step-35", name: "StepFun", model: "Step-3.5", region: "asia", code: "SF", source: { label: "StepFun pricing and limits", url: "https://platform.stepfun.com/docs/zh/guides/pricing/details", type: "official documentation", official: true } },
  { id: "openai-gpt-5", name: "OpenAI", model: "GPT-5", region: "west", code: "OA", source: { label: "OpenAI rate limits", url: "https://platform.openai.com/docs/guides/rate-limits", type: "official documentation", official: true } },
  { id: "gemini-2-5-pro", name: "Google Gemini", model: "2.5 Pro", region: "west", code: "GG", source: { label: "Google Gemini rate limits", url: "https://ai.google.dev/gemini-api/docs/rate-limits", type: "official documentation", official: true } },
  { id: "anthropic-claude-opus", name: "Anthropic", model: "Claude Opus", region: "west", code: "AN", source: { label: "Anthropic rate limits", url: "https://docs.anthropic.com/en/api/rate-limits", type: "official documentation", official: true } },
  { id: "xai-grok-46", name: "xAI", model: "Grok 4.6", region: "west", code: "XI", source: { label: "xAI rate limits", url: "https://docs.x.ai/developers/rate-limits", type: "official documentation", official: true } },
  { id: "minimax-m27", name: "MiniMax", model: "M2.7", region: "asia", code: "MM", source: { label: "MiniMax Token Plan", url: "https://platform.minimax.io/docs/token-plan/intro", type: "official documentation", official: true } },
  { id: "groq-gpt-oss-120b", name: "Groq", model: "GPT-OSS 120B", region: "west", code: "GQ", source: { label: "Groq rate limits", url: "https://console.groq.com/docs/rate-limits", type: "official documentation", official: true } },
  { id: "moonshot-kimi-k26", name: "Moonshot / Kimi", model: "Kimi K2.6", region: "asia", code: "MK", source: { label: "Kimi rate limits", url: "https://platform.kimi.ai/docs/pricing/limits", type: "official documentation", official: true } },
  { id: "cerebras-llama-31-8b", name: "Cerebras", model: "Llama 3.1 8B", region: "west", code: "CB", source: { label: "Cerebras rate limits", url: "https://inference-docs.cerebras.ai/support/rate-limits", type: "official documentation", official: true } },
  { id: "sambanova-deepseek-v31", name: "SambaNova", model: "DeepSeek V3.1", region: "west", code: "SN", source: { label: "SambaNova rate limits", url: "https://docs.sambanova.ai/docs/en/models/rate-limits", type: "official documentation", official: true } }
]);

function emptyTelemetryProvider(catalog) {
  return {
    ...catalog,
    state: "unknown",
    condition: "No live data",
    pricing: { input: null, output: null, multiplier: null, currency: null },
    quota: { remaining: null, window: null, reset: null },
    capacity: { guaranteedTpm: null, observedTpm: null, concurrency: null },
    rateLimits: {},
    latencyMs: null,
    stability: "Not collected",
    nextWindow: null,
    note: "No live public-source or measurement telemetry has been collected for this provider.",
    source: { ...catalog.source, confidence: "Telemetry not collected", retrievedAt: "Not checked" }
  };
}

let providers = Object.freeze(providerCatalog.map(emptyTelemetryProvider));
let providerSchedules = Object.freeze([]);
let recentChanges = Object.freeze([]);

const stateClass = { healthy: "green", watch: "yellow", disrupted: "red", unknown: "gray" };
const state = { selectedId: "deepseek-v4-pro", activeView: "all", hasDataOnly: true, search: "", sortDescending: true, compareIds: ["deepseek-v4-pro", "qwen-3-7-plus", "gemini-2-5-pro"] };
const $ = (selector) => document.querySelector(selector);

function getProvider(id) {
  const provider = providers.find((item) => item.id === id);
  if (!provider) throw new Error(`Unknown provider: ${id}`);
  return provider;
}

function statusDot(providerState) {
  const className = stateClass[providerState] || stateClass.unknown;
  const neutralStyle = providerState === "unknown" ? ' style="background: var(--muted);"' : "";
  return `<i class="status-dot ${className}"${neutralStyle}></i>`;
}

function formatTokens(value) {
  if (value == null) return "Not collected";
  if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 ? 2 : 0)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return `${value}`;
}

function formatPrice(value) {
  if (!Number.isFinite(value)) return "Not collected";
  return `$${value.toFixed(value >= 10 ? 0 : 2)}`;
}

function formatQuota(value) {
  return value == null ? "Not collected" : `${value}%`;
}

function formatLatency(value) {
  if (!Number.isFinite(value)) return "Not collected";
  return value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${value} ms`;
}

function hasPricing(provider) {
  return Number.isFinite(provider.pricing.input) && Number.isFinite(provider.pricing.output);
}

function hasUsableData(provider) {
  return provider.state !== "unknown"
    || hasPricing(provider)
    || provider.quota.remaining != null
    || provider.capacity.guaranteedTpm != null
    || provider.capacity.observedTpm != null
    || Number.isFinite(provider.latencyMs);
}

function providerWeather(provider) {
  const schedule = providerSchedules.find((item) => item.provider_id === provider.id) || null;
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
    published_time_windows: schedule,
    source: { ...provider.source },
    observed_value_is_measurement: provider.capacity.observedTpm !== null
  };
}

function getProviderSchedule(providerId) {
  return providerSchedules.find((item) => item.provider_id === providerId) || null;
}

function scheduleSummary(providerId) {
  const schedule = getProviderSchedule(providerId);
  if (!schedule) return { headline: "Not collected", lines: ["The public timing registry has not been loaded."] };
  const lines = [
    ...(schedule.windows || []).map((window) => `${window.kind.replaceAll("_", " ")}: ${window.days.join(", ")} ${window.start}–${window.end} ${window.timezone} · ${window.effect}`),
    ...(schedule.reset_rules || []).map((reset) => `${reset.kind.replaceAll("_", " ")} reset: ${reset.duration || reset.at || reset.time || (reset.durations || []).join(" / ") || "published rule"}${reset.timezone ? ` (${reset.timezone})` : ""}`),
    ...(schedule.published_conditions || [])
  ];
  const headline = schedule.public_schedule_status === "no_published_schedule"
    ? "No public clock schedule"
    : schedule.windows?.length
      ? `${schedule.windows.length} published timing rule${schedule.windows.length === 1 ? "" : "s"}`
      : "Published reset rule";
  return { headline, lines: lines.length ? lines : ["No timing rule was published in the checked source."] };
}

function renderProviderRow(provider) {
  const selected = provider.id === state.selectedId ? " selected" : "";
  return `<button class="provider-row${selected}" type="button" data-provider-id="${provider.id}" aria-pressed="${provider.id === state.selectedId}">
    <span class="provider-name"><span class="provider-avatar">${provider.code}</span><span class="provider-title"><strong>${provider.name}</strong><span>${provider.model}</span></span></span>
    <span><span class="metric-label">Condition</span><span class="condition">${statusDot(provider.state)}${provider.condition}</span></span>
    <span><span class="metric-label">Guaranteed TPM</span><span class="metric-value">${formatTokens(provider.capacity.guaranteedTpm)}</span></span>
    <span><span class="metric-label">Quota left</span><span class="metric-value ${provider.quota.remaining == null ? "" : "good"}">${formatQuota(provider.quota.remaining)}</span></span>
  </button>`;
}

function detailMarkup(provider) {
  const price = hasPricing(provider) ? `${formatPrice(provider.pricing.input)} / ${formatPrice(provider.pricing.output)}` : "Not collected";
  const schedule = scheduleSummary(provider.id);
  return `<div class="detail-top"><div><span class="detail-kicker">Selected provider</span><h3>${provider.name}</h3><span class="detail-model">${provider.model} · ${provider.region === "asia" ? "Asia Pacific" : "Western"}</span></div><span class="detail-condition">${statusDot(provider.state)} ${provider.condition}</span></div>
    <div class="detail-rule"></div>
    <div class="detail-stats">
      <div class="detail-stat"><label>Current effective cost</label><strong>${price}<span> / 1M in / out</span></strong></div>
      <div class="detail-stat"><label>Quota remaining</label><strong>${formatQuota(provider.quota.remaining)}</strong>${provider.quota.remaining == null ? "" : `<div class="meter"><i style="width: ${provider.quota.remaining}%"></i></div>`}</div>
      <div class="detail-stat"><label>Guaranteed TPM</label><strong>${formatTokens(provider.capacity.guaranteedTpm)}</strong></div>
      <div class="detail-stat"><label>Observed available</label><strong>${formatTokens(provider.capacity.observedTpm)}</strong></div>
      <div class="detail-stat"><label>Typical latency</label><strong>${formatLatency(provider.latencyMs)}</strong></div>
      <div class="detail-stat"><label>Telemetry status</label><strong>${provider.source.confidence}</strong></div>
    </div>
    <div class="detail-schedule"><span class="detail-kicker">Published timing</span><strong>${schedule.headline}</strong>${schedule.lines.map((line) => `<p>${line}</p>`).join("")}<a class="source-link" href="${getProviderSchedule(provider.id)?.source.url || provider.source.url}" target="_blank" rel="noreferrer">Timing source ↗</a></div>
    <div class="detail-callout"><strong>Forecast note</strong>${provider.note}</div>
    <div class="source-row"><span>Checked · ${provider.source.retrievedAt}</span><a class="source-link" href="${provider.source.url}" target="_blank" rel="noreferrer" data-source-id="${provider.id}">${provider.source.label} ↗</a></div>
    <div class="detail-actions"><button class="small-action" type="button" data-add-compare="${provider.id}">${state.compareIds.includes(provider.id) ? "In comparison" : "Add to compare"} <span>+</span></button><span class="mono">${provider.rateLimits.rps == null ? `RPM ${formatTokens(provider.rateLimits.rpm)}` : `RPS ${formatTokens(provider.rateLimits.rps)}`} · CONC ${formatTokens(provider.rateLimits.concurrency)}</span></div>`;
}

async function loadProviderSchedules() {
  try {
    const response = await fetch("/docs/provider-time-windows.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`time-window registry returned HTTP ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.records)) throw new Error("time-window registry records are missing");
    providerSchedules = Object.freeze(payload.records);
    renderForecast();
  } catch {
    console.error("Token Weather public time-window registry could not be loaded");
  }
}

function visibleProviders() {
  const search = state.search.toLowerCase();
  return providers.filter((provider) => {
    const matchesSearch = `${provider.name} ${provider.model}`.toLowerCase().includes(search);
    const matchesData = !state.hasDataOnly || hasUsableData(provider);
    return matchesSearch && matchesData && (state.activeView === "all" || provider.region === state.activeView);
  }).sort((a, b) => {
    if (a.state === b.state) return a.name.localeCompare(b.name);
    const result = a.state === "healthy" ? -1 : 1;
    return state.sortDescending ? result : -result;
  });
}

function renderForecast() {
  const visible = visibleProviders();
  if (state.hasDataOnly && visible.length && !visible.some((provider) => provider.id === state.selectedId)) state.selectedId = visible[0].id;
  const emptyMessage = state.hasDataOnly ? "No providers with collected data match this view." : `No providers match “${state.search}”. Try a model or provider name.`;
  $("#provider-list").innerHTML = visible.length ? visible.map(renderProviderRow).join("") : `<div class="empty-state">${emptyMessage}</div>`;
  $("#detail-panel").innerHTML = detailMarkup(getProvider(state.selectedId));
  $("#provider-search").value = state.search;
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === state.activeView));
  const dataFilterButton = $("#data-filter-button");
  dataFilterButton.classList.toggle("active", state.hasDataOnly);
  dataFilterButton.setAttribute("aria-pressed", String(state.hasDataOnly));
  dataFilterButton.textContent = state.hasDataOnly ? "With data only · on" : "With data only";
}

function publicStatusState(indicator) {
  return { none: "healthy", minor: "watch", major: "disrupted", critical: "disrupted" }[indicator] || "unknown";
}

function publicSignalAge(timestamp) {
  const elapsed = Math.max(0, Date.now() - new Date(timestamp).getTime());
  const hours = Math.floor(elapsed / 3_600_000);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

function collectedSource(catalogSource, event, label) {
  return {
    ...catalogSource,
    label,
    url: event.source_url || catalogSource.url,
    type: event.signal_type || catalogSource.type,
    official: event.official ?? catalogSource.official,
    confidence: event.confidence,
    retrievedAt: event.retrieved_at ? new Date(event.retrieved_at).toISOString().replace("T", " ").slice(0, 16) + " UTC" : "Not checked",
    httpStatus: event.http_status ?? null,
    sha256: event.sha256 || null
  };
}

function applySnapshot(snapshot) {
  const events = Array.isArray(snapshot.events) ? snapshot.events : [];
  const successfulSources = new Map(events.filter((event) => event.event_type === "SOURCE_FETCH" && event.status === "ok").map((event) => [event.provider_id, event]));
  const publicSignals = events.filter((event) => event.event_type !== "SOURCE_FETCH" && event.status === "ok");
  const publicStatuses = new Map(events.filter((event) => event.event_type === "PUBLIC_STATUS" && event.status === "ok").map((event) => [event.provider_id, event]));
  recentChanges = Object.freeze(events.filter((event) => event.event_type === "PUBLIC_ANNOUNCEMENTS" && event.status === "ok").flatMap((event) => (event.entries || []).map((entry) => ({ providerId: event.provider_id, type: "PUBLIC_ANNOUNCEMENT", age: publicSignalAge(entry.published_at || event.retrieved_at), title: entry.title || "Public provider update", detail: "Published on the provider’s official public communication feed.", source: "Official announcement", sourceUrl: entry.link || event.source_url, confidence: event.confidence }))));
  providers = Object.freeze(providers.map((provider) => {
    const event = successfulSources.get(provider.id);
    const statusEvent = publicStatuses.get(provider.id);
    const publicEvent = statusEvent || publicSignals.find((item) => item.provider_id === provider.id);
    const condition = statusEvent?.signals?.description || provider.condition;
    const source = publicEvent
      ? collectedSource(provider.source, publicEvent, publicEvent.event_type === "PUBLIC_STATUS" ? "Official public status" : "Official public communication")
      : event
        ? collectedSource(provider.source, event, provider.source.label)
        : provider.source;
    return { ...provider, state: statusEvent ? publicStatusState(statusEvent.signals?.indicator) : provider.state, condition, note: statusEvent ? `Official public status: ${condition}. ` : provider.note, source };
  }));
  $("#feed-label").textContent = publicSignals.length ? "Public signals connected" : snapshot.mode === "degraded" ? "Public source feed degraded" : "Public sources connected · no forecast metrics";
  $("#snapshot-label").textContent = snapshot.generated_at ? `Public sources checked · ${new Date(snapshot.generated_at).toISOString().replace("T", " ").slice(0, 16)} UTC · ${publicSignals.length} signals` : "No public forecast signals collected";
  $("#overall-condition").textContent = publicSignals.length ? "PUBLIC SIGNALS AVAILABLE" : "NO PUBLIC METRICS";
  $("#overall-detail").textContent = `${publicSignals.length} public signals · ${successfulSources.size} documentation sources checked`;
  $("#signal-value-source").textContent = `${successfulSources.size} documentation sources checked`;
  $("#signal-value-window").textContent = publicSignals.length ? `${publicSignals.length} public signals` : "No public forecast windows collected";
  $("#signal-value-headroom").textContent = "Global public view · no personalization";
  $("#coverage-label").textContent = `${successfulSources.size}/${providerCatalog.length} DOCS SOURCES`;
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
    console.error("Token Weather live snapshot could not be loaded");
    $("#feed-label").textContent = "Public sources unavailable";
    $("#snapshot-label").textContent = "No public forecast signals collected";
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
    condition_score: provider.state === "unknown" ? null : provider.state === "healthy" ? 2 : 1
  }));
}

function renderCompare() {
  $("#compare-picker-list").innerHTML = providers.map((provider) => `<button class="compare-choice${state.compareIds.includes(provider.id) ? " selected" : ""}" type="button" data-toggle-compare="${provider.id}" aria-pressed="${state.compareIds.includes(provider.id)}"><span class="choice-check">${state.compareIds.includes(provider.id) ? "✓" : ""}</span><span><strong>${provider.name}</strong><small>${provider.model}</small></span></button>`).join("");
  const selected = compareModels(state.compareIds);
  $("#compare-results").innerHTML = `<div class="compare-header"><span>METRIC</span>${selected.map((provider) => `<strong>${provider.provider}<small>${provider.model}</small></strong>`).join("")}</div>
    ${compareRow("Condition", selected.map((provider) => `<span class="compare-condition">${statusDot(provider.state)}${provider.condition}</span>`))}
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
  return [...providers].filter(hasPricing).sort((a, b) => a.pricing.input - b.pricing.input)[0] || null;
}

function findFastestWindow() {
  return [...providers].filter((provider) => Number.isFinite(provider.latencyMs)).sort((a, b) => a.latencyMs - b.latencyMs)[0] || null;
}

function planWorkload({ tokens, shape = "balanced", region = "all" } = {}) {
  const totalTokens = Number(tokens);
  if (!Number.isFinite(totalTokens) || totalTokens < 1) return { status: "unavailable", reason: "Enter a positive token count and connect live pricing data." };
  const outputRatio = shape === "batch" ? 0.25 : shape === "latency" ? 0.15 : 0.2;
  const candidates = providers.filter((provider) => hasPricing(provider) && (region === "all" || provider.region === region));
  const ranked = candidates.map((provider) => {
    const outputTokens = totalTokens * outputRatio;
    const inputTokens = totalTokens - outputTokens;
    const estimatedCost = (inputTokens / 1000000) * provider.pricing.input + (outputTokens / 1000000) * provider.pricing.output;
    const capacityRatio = provider.capacity.observedTpm / provider.capacity.guaranteedTpm;
    const penalty = provider.state === "watch" ? 1.18 : 1;
    const latencyMs = provider.latencyMs;
    const score = shape === "latency" ? latencyMs * penalty : shape === "cost" ? estimatedCost * penalty : shape === "batch" ? (estimatedCost / Math.max(capacityRatio, 1)) * penalty : (estimatedCost * 0.7 + latencyMs / 1000 * 0.3) * penalty;
    return { provider, estimatedCost, score, inputTokens, outputTokens };
  }).sort((a, b) => a.score - b.score);
  if (!ranked.length) return { status: "unavailable", reason: "No live pricing data has been collected for the selected region." };
  const best = ranked[0];
  return { ...best, alternatives: ranked.slice(1, 3), shape, totalTokens };
}

function publicWorkloadPlan(plan) {
  if (plan.status === "unavailable") return { status: "unavailable", reason: plan.reason };
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
  if (result.status === "unavailable") {
    $("#planner-result").innerHTML = `<div class="empty-state"><strong>Live pricing required.</strong><span>${result.reason}</span></div>`;
    return;
  }
  const provider = result.provider;
  const shapeLabel = { balanced: "balanced", latency: "latency-sensitive", batch: "batch / queued", cost: "cost-first" }[result.shape];
  $("#planner-result").innerHTML = `<div class="recommendation-top"><span class="detail-kicker">Recommended window</span><span class="recommendation-badge">${provider.condition}</span></div><h3>${provider.name} <span>${provider.model}</span></h3><p class="recommendation-copy">For a ${result.totalTokens.toLocaleString()} token ${shapeLabel} workload, ${provider.name} is the strongest current fit.</p><div class="recommendation-metrics"><div><span>Estimated cost</span><strong>${formatPrice(result.estimatedCost)}</strong></div><div><span>Latency</span><strong>${formatLatency(provider.latencyMs)}</strong></div><div><span>Quota left</span><strong>${formatQuota(provider.quota.remaining)}</strong></div></div><div class="recommendation-explain"><strong>Why this one</strong>${provider.note} The score keeps the provider’s guaranteed capacity and current condition visible.</div><div class="alternatives"><span class="field-label">NEXT BEST</span>${result.alternatives.map((item) => `<button type="button" data-provider-id="${item.provider.id}">${item.provider.name}<span>${formatPrice(item.estimatedCost)} · ${formatLatency(item.provider.latencyMs)}</span></button>`).join("")}</div>`;
}

function renderChanges() {
  $("#changes-list").innerHTML = recentChanges.length ? recentChanges.map((change) => { const provider = getProvider(change.providerId); return `<article class="change-row"><div class="change-marker ${stateClass[provider.state]}"></div><div class="change-main"><div class="change-meta"><span>${change.type.replace("_", " ")}</span><span>${change.age}</span></div><h3>${change.title}</h3><p>${change.detail}</p></div><div class="change-source"><strong>${provider.name}</strong><span>${change.confidence}</span><a class="source-link" href="${change.sourceUrl}" target="_blank" rel="noreferrer" data-source-id="${provider.id}">${change.source} ↗</a></div></article>`; }).join("") : `<div class="empty-state"><strong>No public changes collected.</strong><span>Changes appear only after an official provider source reports them.</span></div>`;
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
    get_published_time_windows: (id) => getProviderSchedule(id) || { status: "unavailable", reason: "No public timing registry record has been collected." },
    compare_models: (ids) => compareModels(ids),
    find_cheapest_window: () => {
      const provider = findCheapestWindow();
      return provider ? providerWeather(provider) : { status: "unavailable", reason: "No live pricing data has been collected." };
    },
    find_fastest_window: () => {
      const provider = findFastestWindow();
      return provider ? providerWeather(provider) : { status: "unavailable", reason: "No live latency data has been collected." };
    },
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
      name: "get_published_time_windows",
      description: "Read provider-published clock windows and reset rules without accessing account data.",
      inputSchema: {
        type: "object",
        properties: { provider_id: { type: "string", description: "Provider ID to inspect." } },
        required: ["provider_id"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: async ({ provider_id: providerId }) => agentApi.get_published_time_windows(providerId)
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
document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { state.activeView = button.dataset.view; renderForecast(); }));
$("#data-filter-button").addEventListener("click", () => { state.hasDataOnly = !state.hasDataOnly; renderForecast(); });
$("#sort-button").addEventListener("click", () => { state.sortDescending = !state.sortDescending; $("#sort-button").textContent = `CONDITION ${state.sortDescending ? "↓" : "↑"}`; renderForecast(); });
$("#provider-list").addEventListener("click", (event) => { const row = event.target.closest("[data-provider-id]"); if (row) { state.selectedId = row.dataset.providerId; renderForecast(); } });
$("#compare-picker-list").addEventListener("click", (event) => { const button = event.target.closest("[data-toggle-compare]"); if (!button) return; const id = button.dataset.toggleCompare; if (state.compareIds.includes(id)) { if (state.compareIds.length === 1) return showToast("Keep one model selected for comparison."); state.compareIds = state.compareIds.filter((item) => item !== id); } else if (state.compareIds.length < 3) { state.compareIds = [...state.compareIds, id]; } else return showToast("Compare up to three models at a time."); renderCompare(); renderForecast(); });
document.addEventListener("click", (event) => { const source = event.target.closest("[data-source-id]"); if (source) { const item = getSource(source.dataset.sourceId); showToast(`${item.label} · ${item.confidence} · ${item.retrievedAt}`); } const add = event.target.closest("[data-add-compare]"); if (add) { const id = add.dataset.addCompare; if (!state.compareIds.includes(id) && state.compareIds.length >= 3) return showToast("Compare up to three models at a time."); if (!state.compareIds.includes(id)) state.compareIds = [...state.compareIds, id]; renderCompare(); renderForecast(); showToast(`${getProvider(id).name} added to comparison.`); } const providerLink = event.target.closest("#planner-result [data-provider-id]"); if (providerLink) { state.selectedId = providerLink.dataset.providerId; renderForecast(); showToast(`${getProvider(state.selectedId).name} selected in the forecast.`); } });
$("#planner-form").addEventListener("submit", (event) => { event.preventDefault(); renderPlanner(planWorkload({ tokens: $("#planner-tokens").value, shape: $("#planner-shape").value, region: $("#planner-region").value })); showToast("Workload plan requires live provider pricing."); });
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
loadProviderSchedules();

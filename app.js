import { defaultActiveProviderId, hasActiveForecastSignal } from "./selection.mjs";
import { createWebMcpTools, registerWebMcpTools as registerWebMcpToolSet } from "./webmcp.mjs";

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
  { id: "sambanova-deepseek-v31", name: "SambaNova", model: "DeepSeek V3.1", region: "west", code: "SN", source: { label: "SambaNova rate limits", url: "https://docs.sambanova.ai/docs/en/models/rate-limits", type: "official documentation", official: true } },
  { id: "xiaomi-mimo-v25", name: "Xiaomi MiMo", model: "MiMo V2.5", region: "asia", code: "XM", source: { label: "Xiaomi MiMo Token Plan", url: "https://platform.xiaomimimo.com/token-plan", type: "official documentation", official: true } }
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
const state = { selectedId: null, activeView: "all", search: "", sortDescending: true, compareIds: ["deepseek-v4-pro", "qwen-3-7-plus", "gemini-2-5-pro"] };
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
    observed_value_is_measurement: provider.capacity.observedTpm !== null,
    public_evidence: provider.publicEvidence || { documents: 0, status: null, statements: 0, latestStatement: null }
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

function escapeMarkup(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

const timetableState = { timezone: "utc", format: "24h" };

function parseClockMinutes(value) {
  if (value === "24:00") return 1440;
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function timezoneOffsetMinutes(timezone, date = new Date()) {
  if (!timezone || timezone === "not specified by source") return null;
  const fixedOffset = /^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(timezone);
  if (fixedOffset) return (fixedOffset[1] === "+" ? 1 : -1) * (Number(fixedOffset[2]) * 60 + Number(fixedOffset[3] || 0));
  if (timezone === "UTC") return 0;
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date);
    const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
    return (Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second) - date.getTime()) / 60000;
  } catch {
    return null;
  }
}

function sourceWindowMinutes(window) {
  const start = parseClockMinutes(window.start);
  const end = parseClockMinutes(window.end);
  const offset = timezoneOffsetMinutes(window.display_timezone || window.timezone);
  if (start == null || end == null || offset == null) return null;
  return { start: (start - offset + 1440) % 1440, end: (end - offset + 1440) % 1440 };
}

function windowCoversHour(window, hour) {
  const minutes = sourceWindowMinutes(window);
  if (!minutes) return false;
  const segmentStart = hour * 60;
  const segmentEnd = (hour + 1) * 60;
  if (minutes.start === minutes.end) return true;
  if (minutes.start < minutes.end) return segmentStart < minutes.end && segmentEnd > minutes.start;
  return segmentStart < minutes.end || segmentEnd > minutes.start;
}

function timetableWindowClass(window) {
  if (window.kind === "off_peak") return "off-peak";
  if (window.kind === "high_load") return "high-load";
  return "peak";
}

function timetableWindowTip(provider, window) {
  return `${provider.name}\n${window.days.join(", ")} · ${window.start}–${window.end} ${window.timezone}\n${window.effect}`;
}

function formatTimetableHour(hour) {
  const offset = timetableState.timezone === "local" ? -new Date().getTimezoneOffset() : 0;
  const displayedHour = ((hour * 60 + offset) / 60 % 24 + 24) % 24;
  if (timetableState.format === "12h") {
    const normalized = Math.floor(displayedHour);
    return `${normalized % 12 || 12}${normalized < 12 ? " AM" : " PM"}`;
  }
  return `${String(Math.floor(displayedHour)).padStart(2, "0")}h`;
}

function timetableSchedules() {
  return providerSchedules.filter((schedule) => schedule.windows?.some((window) => sourceWindowMinutes(window)));
}

function renderTimetable() {
  const schedules = timetableSchedules();
  const axisHours = [0, 3, 6, 9, 12, 15, 18, 21];
  const rows = schedules.map((schedule) => {
    const provider = providers.find((item) => item.id === schedule.provider_id);
    const windows = schedule.windows.filter((window) => sourceWindowMinutes(window));
    const sourceUrl = escapeMarkup(schedule.source.url);
    const sourceTitle = escapeMarkup(schedule.source.title || "Direct public source");
    return `<div class="timetable-row"><div class="timetable-provider"><strong>${escapeMarkup(provider.name)}</strong><span>${escapeMarkup(provider.model)}</span></div><div class="timetable-track">${Array.from({ length: 24 }, (_, hour) => { const window = windows.find((item) => windowCoversHour(item, hour)); return `<span class="timetable-segment${window ? ` ${timetableWindowClass(window)}` : ""}"${window ? ` tabindex="0" title="${escapeMarkup(timetableWindowTip(provider, window))}" aria-label="${escapeMarkup(timetableWindowTip(provider, window))}"` : ""}></span>`; }).join("")}</div><a class="source-link timetable-source" href="${sourceUrl}" title="${sourceTitle}" aria-label="Direct source: ${sourceTitle}" target="_blank" rel="noreferrer">Direct source ↗</a></div>`;
  }).join("");
  const details = schedules.flatMap((schedule) => {
    const provider = providers.find((item) => item.id === schedule.provider_id);
    const sourceUrl = escapeMarkup(schedule.source.url);
    const sourceTitle = escapeMarkup(schedule.source.title || "Direct public source");
    return schedule.windows.filter((window) => sourceWindowMinutes(window)).map((window) => `<li class="timetable-detail-line"><strong>${escapeMarkup(provider.name)}</strong><span class="timetable-detail-window">${escapeMarkup(`${window.days.join(", ")} · ${window.start}–${window.end} ${window.timezone}`)}</span><span class="timetable-detail-effect">${escapeMarkup(window.effect)} <a class="source-link timetable-detail-source" href="${sourceUrl}" title="${sourceTitle}" aria-label="Direct source for ${escapeMarkup(provider.name)}: ${sourceTitle}" target="_blank" rel="noreferrer">Direct source ↗</a></span></li>`);
  }).join("");
  $("#timetable-list").innerHTML = schedules.length
    ? `<div class="timetable-legend"><span><i class="timetable-swatch peak"></i>Published window</span><span><i class="timetable-swatch off-peak"></i>Off-peak rule</span><span class="timetable-legend-note">Blank hours have no published window</span></div><div class="timetable-chart" id="timetable-chart"><div class="timetable-axis"><span></span><div class="timetable-axis-track">${axisHours.map((hour) => `<span data-timetable-axis-hour="${hour}">${formatTimetableHour(hour)}</span>`).join("")}</div><span></span></div>${rows}<div class="timetable-now-line" id="timetable-now-line" aria-hidden="true"><span id="timetable-now-label"></span></div></div><section class="timetable-details" aria-labelledby="timetable-details-heading"><h3 id="timetable-details-heading">Published window details</h3><ul class="timetable-detail-list">${details}</ul></section><p class="timetable-note">The vertical line marks the current time. Every colored segment is a provider-published window; no normal baseline is inferred.</p>`
    : `<div class="empty-state">No published clock windows have been collected.</div>`;
  updateTimetableClock();
}

function updateTimetableClock() {
  const now = new Date();
  const clock = $("#timetable-clock");
  const timeZone = timetableState.timezone === "local" ? undefined : "UTC";
  const currentTime = now.toLocaleTimeString([], { timeZone, hour: "2-digit", minute: "2-digit", hour12: timetableState.format === "12h" });
  if (clock) clock.textContent = `${currentTime} ${timetableState.timezone === "local" ? "local" : "UTC"}`;
  document.querySelectorAll("[data-timetable-axis-hour]").forEach((label) => { label.textContent = formatTimetableHour(Number(label.dataset.timetableAxisHour)); });
  const chart = $("#timetable-chart");
  const line = $("#timetable-now-line");
  const track = chart?.querySelector(".timetable-track");
  if (!chart || !line || !track) return;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60;
  line.style.left = `${track.getBoundingClientRect().left - chart.getBoundingClientRect().left + (utcMinutes / 1440) * track.offsetWidth}px`;
  const nowLabel = now.toLocaleTimeString([], { timeZone, hour: "2-digit", minute: "2-digit", hour12: timetableState.format === "12h" });
  $("#timetable-now-label").textContent = `${nowLabel} ${timetableState.timezone === "local" ? "local" : "UTC"}`;
}

function setTimetableDisplay(key, value) {
  timetableState[key] = value;
  document.querySelectorAll(`[data-timetable-${key}]`).forEach((button) => {
    const active = button.dataset[`timetable${key[0].toUpperCase()}${key.slice(1)}`] === value;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  updateTimetableClock();
}

function renderProviderRow(provider) {
  const selected = provider.id === state.selectedId ? " selected" : "";
  const evidence = provider.publicEvidence || { documents: 0, statements: 0 };
  const schedule = getProviderSchedule(provider.id);
  const forecastCondition = provider.state === "unknown" && schedule?.public_schedule_status?.startsWith("published_")
    ? scheduleSummary(provider.id).headline
    : provider.condition;
  return `<button class="provider-row${selected}" type="button" data-provider-id="${provider.id}" aria-pressed="${provider.id === state.selectedId}">
    <span class="provider-name"><span class="provider-avatar">${provider.code}</span><span class="provider-title"><strong>${provider.name}</strong><span>${provider.model}</span></span></span>
    <span><span class="metric-label">Forecast</span><span class="condition">${statusDot(provider.state)}${forecastCondition}</span></span>
    <span><span class="metric-label">Public evidence</span><span class="metric-value">${evidence.status ? "Status connected" : evidence.documents ? `${evidence.documents} docs checked` : "Not collected"}</span></span>
    <span><span class="metric-label">Statements</span><span class="metric-value">${evidence.statements || "None collected"}</span></span>
  </button>`;
}

function detailMarkup(provider) {
  const price = hasPricing(provider) ? `${formatPrice(provider.pricing.input)} / ${formatPrice(provider.pricing.output)}` : "Not collected";
  const schedule = scheduleSummary(provider.id);
  const scheduleSource = getProviderSchedule(provider.id)?.source || provider.source;
  const scheduleSourceUrl = escapeMarkup(scheduleSource.url);
  const scheduleSourceTitle = escapeMarkup(scheduleSource.title || scheduleSource.label || "Direct public source");
  const evidence = provider.publicEvidence || { documents: 0, status: null, statements: 0, latestStatement: null };
  const publicStatus = evidence.status ? provider.condition : "No public status feed";
  const latestStatement = evidence.latestStatement?.title ? `<p>Latest statement: ${evidence.latestStatement.title}</p>` : "";
  return `<div class="detail-top"><div><span class="detail-kicker">Selected provider</span><h3>${provider.name}</h3><span class="detail-model">${provider.model} · ${provider.region === "asia" ? "Asia Pacific" : "Western"}</span></div><span class="detail-condition">${statusDot(provider.state)} ${provider.condition}</span></div>
    <div class="detail-rule"></div>
    <div class="detail-stats">
      <div class="detail-stat"><label>Public status</label><strong>${publicStatus}</strong></div>
      <div class="detail-stat"><label>Official documents</label><strong>${evidence.documents} checked</strong></div>
      <div class="detail-stat"><label>Public statements</label><strong>${evidence.statements || "None collected"}</strong></div>
      <div class="detail-stat"><label>Current effective cost</label><strong>${price}<span> / 1M in / out</span></strong></div>
      <div class="detail-stat"><label>Public measurement</label><strong>${Number.isFinite(provider.latencyMs) ? formatLatency(provider.latencyMs) : "Not collected"}</strong></div>
      <div class="detail-stat"><label>Evidence status</label><strong>${provider.source.confidence}</strong></div>
    </div>
    <div class="detail-evidence"><span class="detail-kicker">Public evidence</span><strong>${publicStatus} · ${evidence.documents} document${evidence.documents === 1 ? "" : "s"} checked · ${evidence.statements || "No"} statement${evidence.statements === 1 ? "" : "s"}</strong>${latestStatement}<p>Public records only. This is not a person’s remaining quota.</p></div>
    <div class="detail-schedule"><span class="detail-kicker">Published timing</span><strong>${schedule.headline}</strong>${schedule.lines.map((line) => `<p>${line} <a class="source-link detail-line-source" href="${scheduleSourceUrl}" title="${scheduleSourceTitle}" aria-label="Direct source: ${scheduleSourceTitle}" target="_blank" rel="noreferrer">Direct source ↗</a></p>`).join("")}<a class="source-link" href="${scheduleSourceUrl}" target="_blank" rel="noreferrer">Timing source ↗</a></div>
    <div class="detail-callout"><strong>Forecast note</strong>${provider.note}</div>
    <div class="source-row"><span>Checked · ${provider.source.retrievedAt}</span><a class="source-link" href="${provider.source.url}" target="_blank" rel="noreferrer" data-source-id="${provider.id}">${provider.source.label} ↗</a></div>
    <div class="detail-actions"><button class="small-action" type="button" data-add-compare="${provider.id}">${state.compareIds.includes(provider.id) ? "In comparison" : "Add to compare"} <span>+</span></button><span class="mono">${provider.rateLimits.rps == null ? `RPM ${formatTokens(provider.rateLimits.rpm)}` : `RPS ${formatTokens(provider.rateLimits.rps)}`} · CONC ${formatTokens(provider.rateLimits.concurrency)}</span></div>`;
}

function emptyDetailMarkup() {
  return `<div class="detail-empty"><span class="detail-kicker">Selected provider</span><h3>No active public quota</h3><p>The default view selects a provider only after a public quota or rate-limit signal has been collected. Documentation and status records remain available without being presented as active quota.</p></div>`;
}

async function loadProviderSchedules() {
  try {
    const response = await fetch("/docs/provider-time-windows.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`time-window registry returned HTTP ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.records)) throw new Error("time-window registry records are missing");
    providerSchedules = Object.freeze(payload.records);
    renderForecast();
    renderTimetable();
  } catch {
    console.error("Token Weather public time-window registry could not be loaded");
  }
}

function visibleProviders() {
  const search = state.search.toLowerCase();
  return providers.filter((provider) => {
    const matchesSearch = `${provider.name} ${provider.model}`.toLowerCase().includes(search);
    return matchesSearch && hasActiveForecastSignal(provider, getProviderSchedule(provider.id)) && (state.activeView === "all" || provider.region === state.activeView);
  }).sort((a, b) => {
    if (a.state === b.state) return a.name.localeCompare(b.name);
    const result = a.state === "healthy" ? -1 : 1;
    return state.sortDescending ? result : -result;
  });
}

function renderForecast() {
  const visible = visibleProviders();
  if (state.selectedId == null || (visible.length && !visible.some((provider) => provider.id === state.selectedId))) state.selectedId = defaultActiveProviderId(visible) || visible[0]?.id || null;
  const emptyMessage = `No active forecast signals match${state.search ? ` “${state.search}”` : " this view"}.`;
  $("#provider-list").innerHTML = visible.length ? visible.map(renderProviderRow).join("") : `<div class="empty-state">${emptyMessage}</div>`;
  $("#detail-panel").innerHTML = state.selectedId ? detailMarkup(getProvider(state.selectedId)) : emptyDetailMarkup();
  $("#provider-search").value = state.search;
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === state.activeView));
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
  const evidenceByProvider = new Map(providerCatalog.map((provider) => [provider.id, { documents: 0, status: null, statements: 0, latestStatement: null }]));
  for (const event of events) {
    if (event.status !== "ok") continue;
    const evidence = evidenceByProvider.get(event.provider_id);
    if (!evidence) continue;
    if (event.event_type === "SOURCE_FETCH") evidence.documents += 1;
    if (event.event_type === "PUBLIC_STATUS") evidence.status = event;
    if (event.event_type === "PUBLIC_ANNOUNCEMENTS") {
      evidence.statements += (event.entries || []).length;
      evidence.latestStatement = (event.entries || [])[0] || null;
    }
  }
  recentChanges = Object.freeze(events.filter((event) => event.event_type === "PUBLIC_ANNOUNCEMENTS" && event.status === "ok").flatMap((event) => (event.entries || []).map((entry) => ({ providerId: event.provider_id, type: "Official statement", age: publicSignalAge(entry.published_at || event.retrieved_at), title: entry.title || "Public provider statement", detail: "Published on the provider’s official blog or announcement feed.", source: "Official blog/feed", sourceUrl: entry.link || event.source_url, confidence: event.confidence }))));
  providers = Object.freeze(providers.map((provider) => {
    const event = successfulSources.get(provider.id);
    const statusEvent = publicStatuses.get(provider.id);
    const publicEvent = statusEvent || publicSignals.find((item) => item.provider_id === provider.id);
    const publicEvidence = evidenceByProvider.get(provider.id);
    const condition = (statusEvent?.signals?.description || publicEvidence.statements) ? (statusEvent?.signals?.description || "Public statement available") : event ? "Official source checked" : provider.condition;
    const source = publicEvent
      ? collectedSource(provider.source, publicEvent, publicEvent.event_type === "PUBLIC_STATUS" ? "Official public status" : "Official public communication")
      : event
        ? collectedSource(provider.source, event, provider.source.label)
        : provider.source;
    return { ...provider, publicEvidence, state: statusEvent ? publicStatusState(statusEvent.signals?.indicator) : provider.state, condition, note: statusEvent ? `Official public status: ${condition}. ` : publicEvidence.statements ? "Official public statement collected. " : provider.note, source };
  }));
  $("#feed-label").textContent = publicSignals.length ? "Public signals connected" : snapshot.mode === "degraded" ? "Public source feed degraded" : "Public sources connected · no forecast metrics";
  $("#overall-condition").textContent = publicSignals.length ? "PUBLIC SIGNALS AVAILABLE" : "NO PUBLIC METRICS";
  $("#overall-detail").textContent = `${publicSignals.length} public signals · ${successfulSources.size} documentation sources checked`;
  $("#coverage-label").textContent = `${successfulSources.size}/${providerCatalog.length} DOCS SOURCES`;
  renderForecast();
  renderCompare();
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

function setWebMcpPanel(message, tools = null) {
  const status = $("#webmcp-status");
  const list = $("#webmcp-tools");
  if (status) status.textContent = message;
  if (list && tools) list.innerHTML = tools.length ? tools.map((tool) => `<span class="webmcp-tool">${escapeMarkup(tool.name)}</span>`).join("") : "No tools are available to this page.";
}

async function getWebMcpTools() {
  if (typeof document.modelContext?.getTools !== "function") {
    setWebMcpPanel("WebMCP-aware browser not detected");
    throw new Error("This browser does not expose document.modelContext.getTools().");
  }
  const tools = await document.modelContext.getTools();
  setWebMcpPanel(`${tools.length} WebMCP tool${tools.length === 1 ? "" : "s"} available`, tools);
  return tools;
}

async function checkWebMcpTools() {
  try {
    await getWebMcpTools();
  } catch (error) {
    $("#webmcp-tools").textContent = error.message;
  }
}

async function runWebMcpExample() {
  try {
    const tools = await getWebMcpTools();
    if (typeof document.modelContext?.executeTool !== "function") throw new Error("This browser does not expose document.modelContext.executeTool().");
    const tool = tools.find(({ name }) => name === "get_published_time_windows");
    if (!tool) throw new Error("The sample tool is not available to this page.");
    const result = await document.modelContext.executeTool(tool, JSON.stringify({ provider_id: "minimax-m27" }));
    $("#webmcp-output").textContent = JSON.stringify(result, null, 2);
    showToast("WebMCP sample call completed.");
  } catch (error) {
    $("#webmcp-output").textContent = error.message;
  }
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
  const registered = await registerWebMcpToolSet({
    modelContext: document.modelContext,
    tools: createWebMcpTools({
      agentApi,
      getProvider,
      providerWeather,
      onFocusProvider: (provider) => {
        state.selectedId = provider.id;
        renderForecast();
      }
    })
  });
  if (registered) document.documentElement.dataset.webmcp = "ready";
}

registerWebMcpTools().catch((error) => {
  document.documentElement.dataset.webmcp = "error";
  console.error("Token Weather WebMCP registration failed", error);
});

$("#provider-search").addEventListener("input", (event) => { state.search = event.target.value; renderForecast(); });
document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { state.activeView = button.dataset.view; renderForecast(); }));
$("#sort-button").addEventListener("click", () => { state.sortDescending = !state.sortDescending; $("#sort-button").textContent = `CONDITION ${state.sortDescending ? "↓" : "↑"}`; renderForecast(); });
$("#provider-list").addEventListener("click", (event) => { const row = event.target.closest("[data-provider-id]"); if (row) { state.selectedId = row.dataset.providerId; renderForecast(); } });
$("#compare-picker-list").addEventListener("click", (event) => { const button = event.target.closest("[data-toggle-compare]"); if (!button) return; const id = button.dataset.toggleCompare; if (state.compareIds.includes(id)) { if (state.compareIds.length === 1) return showToast("Keep one model selected for comparison."); state.compareIds = state.compareIds.filter((item) => item !== id); } else if (state.compareIds.length < 3) { state.compareIds = [...state.compareIds, id]; } else return showToast("Compare up to three models at a time."); renderCompare(); renderForecast(); });
  document.addEventListener("click", (event) => { const source = event.target.closest("[data-source-id]"); if (source) { const item = getSource(source.dataset.sourceId); showToast(`${item.label} · ${item.confidence} · ${item.retrievedAt}`); } const add = event.target.closest("[data-add-compare]"); if (add) { const id = add.dataset.addCompare; if (!state.compareIds.includes(id) && state.compareIds.length >= 3) return showToast("Compare up to three models at a time."); if (!state.compareIds.includes(id)) state.compareIds = [...state.compareIds, id]; renderCompare(); renderForecast(); showToast(`${getProvider(id).name} added to comparison.`); } });
$("#refresh-button").addEventListener("click", refreshSnapshot);
document.querySelectorAll("[data-scroll-target]").forEach((button) => button.addEventListener("click", () => { document.getElementById(button.dataset.scrollTarget).scrollIntoView({ behavior: "smooth", block: "start" }); document.querySelectorAll(".surface-link").forEach((item) => item.classList.toggle("active", item === button)); }));
document.querySelectorAll("[data-timetable-timezone]").forEach((button) => button.addEventListener("click", () => setTimetableDisplay("timezone", button.dataset.timetableTimezone)));
document.querySelectorAll("[data-timetable-format]").forEach((button) => button.addEventListener("click", () => setTimetableDisplay("format", button.dataset.timetableFormat)));
$("#webmcp-check").addEventListener("click", checkWebMcpTools);
$("#webmcp-run").addEventListener("click", runWebMcpExample);

renderForecast();
renderCompare();
renderTimetable();
window.setInterval(updateTimetableClock, 1000);
loadSnapshot();
loadProviderSchedules();

const providers = [
  { name: "DeepSeek", model: "V4 Pro", region: "asia", code: "DS", state: "healthy", condition: "Off peak", price: "$0.66 / $1.98", input: "500K", quota: "82%", latency: "820 ms", tpm: "500K", observed: "1.1M", confidence: "Official", note: "Off-peak pricing is active. Input and output rates are 0.5× the published peak rate.", source: "DeepSeek pricing & limits" },
  { name: "Alibaba / Qwen", model: "3.7 Plus", region: "asia", code: "QW", state: "healthy", condition: "Spare capacity", price: "$0.50 / $2.00", input: "1M", quota: "76%", latency: "640 ms", tpm: "1M", observed: "1.76M", confidence: "Official + observed", note: "Observed throughput is above the guaranteed baseline. This is a measurement, not a new quota.", source: "Alibaba quota API" },
  { name: "Zhipu / GLM", model: "GLM-5", region: "asia", code: "GL", state: "watch", condition: "Peak window", price: "$1.00 / $3.20", input: "150K", quota: "64%", latency: "1.2 s", tpm: "150K", observed: "142K", confidence: "Official", note: "Peak-time throttling is documented between 15:00 and 18:00 local time.", source: "Zhipu rate limits" },
  { name: "Baidu Qianfan", model: "ERNIE 5.0", region: "asia", code: "BQ", state: "healthy", condition: "Healthy", price: "$1.20 / $4.80", input: "300K", quota: "71%", latency: "710 ms", tpm: "300K", observed: "298K", confidence: "Official + headers", note: "Remaining request and token limits are read from response headers when connected.", source: "Baidu API headers" },
  { name: "StepFun", model: "Step-3.5", region: "asia", code: "SF", state: "watch", condition: "Rate watch", price: "$0.70 / $2.10", input: "200K", quota: "58%", latency: "940 ms", tpm: "200K", observed: "188K", confidence: "Official", note: "StepFun may temporarily adjust rate limits when overall capacity is reached.", source: "StepFun tier limits" },
  { name: "OpenAI", model: "GPT-5", region: "west", code: "OA", state: "healthy", condition: "Healthy", price: "$1.25 / $10.00", input: "Tier 4", quota: "88%", latency: "780 ms", tpm: "2M", observed: "—", confidence: "Official", note: "Account tier and public status are healthy in this demo snapshot.", source: "OpenAI limits & status" },
  { name: "Google Gemini", model: "2.5 Pro", region: "west", code: "GG", state: "healthy", condition: "Healthy", price: "$1.25 / $10.00", input: "Project", quota: "79%", latency: "690 ms", tpm: "1M", observed: "—", confidence: "Official", note: "Project limits vary by tier and workload class. Batch is the lower-cost path for queued work.", source: "Google AI Studio" },
  { name: "Anthropic", model: "Claude Opus", region: "west", code: "AN", state: "healthy", condition: "Healthy", price: "$15 / $75", input: "Tier 2", quota: "68%", latency: "1.1 s", tpm: "400K", observed: "—", confidence: "Official", note: "Spend tier and account limits are represented separately from public service status.", source: "Anthropic rate limits" }
];

const stateClass = { healthy: "green", watch: "yellow", disrupted: "red" };
let selectedName = "DeepSeek";
let sortDescending = true;

function providerRow(provider) {
  const selected = provider.name === selectedName ? " selected" : "";
  return `<button class="provider-row${selected}" type="button" data-provider="${provider.name}">
    <span class="provider-name"><span class="provider-avatar">${provider.code}</span><span class="provider-title"><strong>${provider.name}</strong><span>${provider.model}</span></span></span>
    <span><span class="metric-label">Condition</span><span class="condition"><i class="status-dot ${stateClass[provider.state]}"></i>${provider.condition}</span></span>
    <span><span class="metric-label">Guaranteed TPM</span><span class="metric-value">${provider.tpm}</span></span>
    <span><span class="metric-label">Quota left</span><span class="metric-value good">${provider.quota}</span></span>
  </button>`;
}

function detailMarkup(provider) {
  return `<div class="detail-top"><div><span class="detail-kicker">Selected forecast</span><h3>${provider.name}</h3><span class="detail-model">${provider.model} · ${provider.region === "asia" ? "Asia Pacific" : "Western"}</span></div><span class="detail-condition"><i class="status-dot ${stateClass[provider.state]}"></i> ${provider.condition}</span></div>
    <div class="detail-rule"></div>
    <div class="detail-stats">
      <div class="detail-stat"><label>Current effective cost</label><strong>${provider.price.split(" /")[0]}<span> / ${provider.price.split(" /")[1]} output</span></strong></div>
      <div class="detail-stat"><label>Quota remaining</label><strong>${provider.quota}</strong><div class="meter"><i style="width: ${provider.quota}"></i></div></div>
      <div class="detail-stat"><label>Guaranteed TPM</label><strong>${provider.tpm}</strong></div>
      <div class="detail-stat"><label>Observed available</label><strong>${provider.observed}</strong></div>
      <div class="detail-stat"><label>Typical latency</label><strong>${provider.latency}</strong></div>
      <div class="detail-stat"><label>Source confidence</label><strong>${provider.confidence}</strong></div>
    </div>
    <div class="detail-callout"><strong>Forecast note</strong>${provider.note}</div>
    <div class="source-row"><span>Last checked · 2 min ago</span><a class="source-link" href="#sources" data-source="${provider.source}">${provider.source} ↗</a></div>`;
}

function renderList() {
  const search = document.querySelector("#provider-search").value.trim().toLowerCase();
  const activeView = document.querySelector(".view-button.active").dataset.view;
  const visible = providers.filter((provider) => {
    const matchesSearch = `${provider.name} ${provider.model}`.toLowerCase().includes(search);
    return matchesSearch && (activeView === "all" || provider.region === activeView);
  });
  const ordered = [...visible].sort((a, b) => (a.state === b.state ? 0 : a.state === "healthy" ? (sortDescending ? -1 : 1) : (sortDescending ? 1 : -1)));
  document.querySelector("#provider-list").innerHTML = ordered.length ? ordered.map(providerRow).join("") : `<div class="empty-state">No providers match “${search}”. Try a model or provider name.</div>`;
  document.querySelector("#detail-panel").innerHTML = detailMarkup(providers.find((provider) => provider.name === selectedName) || providers[0]);
  document.querySelectorAll("[data-provider]").forEach((row) => row.addEventListener("click", () => { selectedName = row.dataset.provider; renderList(); }));
  document.querySelectorAll("[data-source]").forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); showToast(`${link.dataset.source} is the next collection target.`); }));
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 3000);
}

document.querySelector("#provider-search").addEventListener("input", renderList);
document.querySelectorAll(".view-button").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll(".view-button").forEach((item) => item.classList.remove("active")); button.classList.add("active"); renderList(); }));
document.querySelector("#sort-button").addEventListener("click", () => { sortDescending = !sortDescending; document.querySelector("#sort-button").textContent = `CONDITION ${sortDescending ? "↓" : "↑"}`; renderList(); });
document.querySelector("#refresh-button").addEventListener("click", () => showToast("Demo snapshot refreshed · live collectors are next."));
document.querySelector("#sources-button").addEventListener("click", () => showToast("Every forecast keeps its source and confidence level attached."));
document.querySelector("#principle-button").addEventListener("click", () => showToast("Guaranteed capacity is the promise. Observed capacity is the possibility."));
renderList();

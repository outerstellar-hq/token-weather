# Token Weather

Token Weather is a global, public-source forecast surface for AI provider price, published limits, capacity signals, latency, incidents, and stability.

The authoritative provider and inference-surface list, including time-window candidates, lives in [docs/provider-forecasting-scope.md](docs/provider-forecasting-scope.md).

The MVP includes four user-facing slices:

- Catalog: fourteen first-priority providers with region filtering, search, selected-model detail, and source provenance.
- Compare: select up to three models and see only metrics supplied by real telemetry.
- Plan work: rank a workload only when live pricing and capacity data is available.
- Changes: show only provider change events actually collected from live sources.

The product is generic for every visitor. It has no login, profile, API-key input, workspace context, personal quota, account balance, personalized recommendation, or account-specific telemetry. Provider names and source links are a static tracking catalog; every price, published limit, capacity, latency, stability, and change value starts as unavailable and is populated only by a successful public-source collector. A public documentation retrieval proves that a source was checked, but it is never presented as a user’s current quota or account state.

No seeded metric values are permitted. A displayed fact must carry the exact public source URL, retrieval timestamp, HTTP status, official-source flag, confidence, and SHA-256 response hash. If any of that evidence is missing, the UI and agent API return `Not collected` or `unavailable`.

The browser also exposes the MVP agent contract as `window.tokenWeather` with:

`get_provider_weather`, `get_model_weather`, `get_current_price`, `get_current_quota`, `get_capacity`, `get_rate_limits`, `compare_models`, `find_cheapest_window`, `find_fastest_window`, `plan_workload`, `explain_recommendation`, `get_source`, and `get_recent_changes`.

When the browser exposes `document.modelContext.registerTool`, the page also registers six top-level WebMCP site tools: `get_provider_weather`, `get_model_weather`, `compare_models`, `plan_workload`, `get_recent_changes`, and `focus_provider`. The tools reuse the same normalized forecast logic as the human UI; `focus_provider` updates the visible detail panel so the person and agent can inspect the same model together. Browsers without WebMCP keep the full human interface.

## Collector slice

`collector.mjs` retrieves twenty verified official provider pages for the fourteen MVP providers and emits `SOURCE_FETCH` provenance records. The public adapter layer is responsible for official pricing and limit pages, public status APIs, provider announcements, and public company communications. It must never read a visitor’s credentials or workload headers. Responses are capped at 8 MB and requests time out after 10 seconds.

Run the offline collector contract check with:

```powershell
npm run check:collector
npm test
```

Run the live documentation collection explicitly with:

```powershell
npm run collect
```

The live command performs read-only public-source requests and exits non-zero if any source cannot be retrieved. It does not create inference requests, access private consoles, or collect account-specific values.

Run the global public-source collection manually with:

```powershell
$env:AGENT_OWNER = "operator"
$env:AGENT_TASK = "token-weather-public-sources"
npm run telemetry
```

## Run locally

Run the local snapshot server at the canonical origin `http://127.0.0.1:4173`:

```powershell
npm run server
```

The server serves the dashboard, exposes `GET /api/snapshot`, exposes `GET /api/health`, and handles an explicit `POST /api/refresh`. Successful refreshes persist the latest normalized public-source events to the ignored local file `data/snapshot.json`; no endpoint accepts or returns personal account data.

## WebMCP challenge checklist

See [docs/submission-checklist.md](docs/submission-checklist.md) for the current challenge requirements, the local readiness status, and the remaining public deployment/submission steps.

## Check

```powershell
npm run check
```

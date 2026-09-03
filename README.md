# Token Weather

Token Weather is a responsive forecast surface for AI provider price, capacity, quota, latency, and stability.

The authoritative provider and inference-surface list, including time-window candidates, lives in [docs/provider-forecasting-scope.md](docs/provider-forecasting-scope.md).

The MVP includes four user-facing slices:

- Catalog: fourteen first-priority providers with region filtering, search, selected-model detail, and source provenance.
- Compare: select up to three models and see only metrics supplied by real telemetry.
- Plan work: rank a workload only when live pricing and capacity data is available.
- Changes: show only provider change events actually collected from live sources.

The browser surface is live-data-only. Provider names and source links are a static tracking catalog; every price, quota, capacity, latency, stability, and change value starts as unavailable and is populated only by a successful provider telemetry collector. Public documentation retrieval proves that a source was checked, but it is never presented as current account telemetry.

The browser also exposes the MVP agent contract as `window.tokenWeather` with:

`get_provider_weather`, `get_model_weather`, `get_current_price`, `get_current_quota`, `get_capacity`, `get_rate_limits`, `compare_models`, `find_cheapest_window`, `find_fastest_window`, `plan_workload`, `explain_recommendation`, `get_source`, and `get_recent_changes`.

When the browser exposes `document.modelContext.registerTool`, the page also registers six top-level WebMCP site tools: `get_provider_weather`, `get_model_weather`, `compare_models`, `plan_workload`, `get_recent_changes`, and `focus_provider`. The tools reuse the same normalized forecast logic as the human UI; `focus_provider` updates the visible detail panel so the person and agent can inspect the same model together. Browsers without WebMCP keep the full human interface.

## Collector slice

`collector.mjs` is the bounded source collector. It retrieves twenty verified official documentation pages for the fourteen MVP providers, including time-window quota sources for MiniMax, Groq, Moonshot/Kimi, Cerebras, and SambaNova, then emits `SOURCE_FETCH` records containing the URL, timestamp, HTTP status, byte count, SHA-256, and confidence. Responses are capped at 8 MB and requests time out after 10 seconds.

Run the offline collector contract check with:

```powershell
npm run check:collector
npm test
```

Run the live documentation collection explicitly with:

```powershell
npm run collect
```

The live command performs read-only documentation requests and exits non-zero if any source cannot be retrieved. Account collectors remain disabled unless their documented credential requirements are explicitly configured; no provider inference or paid inference probe is performed automatically.

## Run locally

Run the local snapshot server at the canonical origin `http://127.0.0.1:4173`:

```powershell
npm run server
```

The server serves the dashboard, exposes `GET /api/snapshot`, exposes `GET /api/health`, and handles an explicit `POST /api/refresh`. Successful refreshes persist the latest normalized collector events to the ignored local file `data/snapshot.json`; the UI shows unavailable telemetry when a provider account or request-scoped collector is not configured. Grok account limits remain console-only until an explicitly supported account integration is added.

## WebMCP challenge checklist

See [docs/submission-checklist.md](docs/submission-checklist.md) for the current challenge requirements, the local readiness status, and the remaining public deployment/submission steps.

## Check

```powershell
npm run check
```

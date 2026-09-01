# Token Weather

Token Weather is a responsive forecast surface for AI provider price, capacity, quota, latency, and stability.

The MVP includes four user-facing slices:

- Forecast: eight first-priority providers with region filtering, search, selected-model detail, guaranteed versus observed capacity, and source confidence.
- Compare: select up to three models and compare condition, price, guaranteed TPM, observed availability, latency, and quota.
- Plan work: rank a workload by token volume, workload shape, and region, with an estimated cost and alternatives.
- Changes: a provenance-led recent-change stream covering price, capacity, and quota events.

The browser surface still uses a seeded feed so the interface remains useful without credentials. The provider records use one normalized shape and preserve the boundary between official guarantees and observed measurements. Public-source collection is now implemented; credentialed account telemetry, persistent ingestion, and wiring fresh collector output into the UI are the next integration boundary.

The browser also exposes the MVP agent contract as `window.tokenWeather` with:

`get_provider_weather`, `get_model_weather`, `get_current_price`, `get_current_quota`, `get_capacity`, `get_rate_limits`, `compare_models`, `find_cheapest_window`, `find_fastest_window`, `plan_workload`, `explain_recommendation`, `get_source`, and `get_recent_changes`.

## Collector slice

`collector.mjs` is the first bounded source collector. It retrieves the seven verified official documentation pages for DeepSeek, Alibaba/Qwen, Zhipu/GLM, Baidu Qianfan, and StepFun, then emits `SOURCE_FETCH` records containing the URL, timestamp, HTTP status, byte count, SHA-256, and confidence. Responses are capped at 2 MB and requests time out after 10 seconds.

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

Open `index.html` directly, or serve this folder at the canonical local origin `http://127.0.0.1:4173`:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

## Check

```powershell
npm run check
```

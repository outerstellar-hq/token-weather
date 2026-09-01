# Token Weather

Token Weather is a responsive forecast surface for AI provider price, capacity, quota, latency, and stability.

The MVP includes four user-facing slices:

- Forecast: eight first-priority providers with region filtering, search, selected-model detail, guaranteed versus observed capacity, and source confidence.
- Compare: select up to three models and compare condition, price, guaranteed TPM, observed availability, latency, and quota.
- Plan work: rank a workload by token volume, workload shape, and region, with an estimated cost and alternatives.
- Changes: a provenance-led recent-change stream covering price, capacity, and quota events.

This is intentionally a frontend-only seeded feed. The provider records use one normalized shape and preserve the boundary between official guarantees and observed measurements. Live account collectors, provider API credentials, and source URLs are the next integration boundary; the UI does not imply they already exist.

The browser also exposes the MVP agent contract as `window.tokenWeather` with:

`get_provider_weather`, `get_model_weather`, `get_current_price`, `get_current_quota`, `get_capacity`, `get_rate_limits`, `compare_models`, `find_cheapest_window`, `find_fastest_window`, `plan_workload`, `explain_recommendation`, `get_source`, and `get_recent_changes`.

## Run locally

Open `index.html` directly, or serve this folder at the canonical local origin `http://127.0.0.1:4173`:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

## Check

```powershell
npm run check
```

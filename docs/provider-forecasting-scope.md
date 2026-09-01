# Token Weather provider forecasting scope

This is the authoritative list of AI providers Token Weather is intended to forecast. “Forecast” means tracking the conditions that affect model selection: effective price, guaranteed limits, account quota, available capacity, latency, stability, incidents, maintenance, model changes, and promotions.

This is a curated product scope, not a claim to cover every AI provider. Each provider is kept separate from its models, regions, account tiers, and execution classes so those dimensions can expand without changing the provider identity.

## Current provider set

These providers are in the current browser forecast, comparison, workload planner, agent API, and official-source collector.

| Priority | Provider | Current model surface | Forecasting value | Account-specific signal | Status |
| ---: | --- | --- | --- | --- | --- |
| 1 | DeepSeek | V4 Pro | Peak/off-peak price, concurrency, rate limits, observed throughput | Usage export/manual handoff | Implemented |
| 2 | Alibaba Qwen / Bailian | Qwen 3.7 Plus | Guaranteed versus spare capacity, dynamic TPM, workspace/model quotas | Read-only model-limits API | Implemented |
| 3 | Zhipu / GLM | GLM-5 | Peak/off-peak throttling, tier concurrency, local-time windows | Console/tier handoff | Implemented |
| 4 | Baidu Qianfan | ERNIE 5.0 | Response-header rate-limit and remaining-quota telemetry | Request-scoped headers | Implemented |
| 5 | StepFun | Step-3.5 | Tiered concurrency/RPM/TPM and temporary capacity adjustments | Account endpoint when explicitly configured | Implemented |
| 6 | OpenAI | GPT-5 | Tier limits, pricing, service status, incidents, and maintenance | Dashboard/account limits | Implemented |
| 7 | Google Gemini | Gemini 2.5 Pro | RPM, TPM, RPD, project quota, spend tiers, and workload classes | AI Studio/project limits | Implemented |
| 8 | Anthropic | Claude Opus | Account tiers, rate limits, service stability, and capacity changes | Account tier/API limits | Implemented |
| 9 | xAI / Grok | Grok 4.6 | Spend tiers, RPS/TPM, model pricing, and capacity by tier | Console-specific limits | Implemented |

The current implementation uses seeded model metrics as a usable fallback and overlays fresh official-source provenance when the local collector is refreshed. A seeded value is not treated as account telemetry or as a live observation unless its record says so.

## Expansion provider set

These providers are part of the intended forecasting coverage but are not yet in the browser registry or collector.

| Expansion order | Provider | Expected forecasting value | First collection strategy |
| ---: | --- | --- | --- |
| 10 | MiniMax | Rolling usage windows, request quotas, reset semantics, plan-dependent limits | Official plan documentation, account usage, and reset-time capture |
| 11 | ByteDance Doubao / Ark | Model catalog, pricing, announcements, retirements, and regional availability | Ark documentation and announcements, then authenticated account telemetry |
| 12 | Tencent Hunyuan | Token pricing, model availability, and TokenHub migration changes | Official pricing, model, and platform documentation |
| 13 | Mistral | Requests per second, tokens per minute/month, spend tiers, and admin limits | Official pricing/limits pages plus admin-supplied limits |
| 14 | Cohere | Endpoint limits, trial versus production keys, incidents, and maintenance | Official limits documentation and status history |

## Forecasting signals we collect

Every provider adapter should contribute only the signals it can support, while preserving the source and confidence boundary:

- `PRICE_EVENT` — input/output price, cache price, batch price, promotion, or peak/off-peak multiplier.
- `QUOTA_EVENT` — account, workspace, project, plan, key, or rolling-window usage and reset state.
- `CAPACITY_EVENT` — guaranteed TPM/RPM/RPS/concurrency versus separately observed throughput.
- `INCIDENT_EVENT` — degraded service, outage, or provider status change.
- `MAINTENANCE_EVENT` — scheduled maintenance or planned availability change.
- `MODEL_EVENT` — launch, alias change, deprecation, retirement, or regional availability change.
- `PROMOTION_EVENT` — temporary credit, price, or capacity offer.

The normalized record should retain:

```text
provider
model
region
account_tier
metric
value
unit
effective_from
effective_until
source_type
source_url
retrieved_at
official
confidence
observed_value
```

Official guarantees and measurements must remain distinct. For example, a provider can expose a guaranteed `1.0M TPM` while a local probe observes `1.8M TPM`; the forecast must show both instead of replacing the guarantee with the observation.

## Source priority

Collection should prefer these sources in order:

1. Machine-readable account or API data.
2. Official pricing and rate-limit documentation.
3. Official status and announcement pages.
4. Clearly labeled observed behavior such as 429 rate, latency, or throughput.

No provider should be marked as having live account quota until its supported credential, console handoff, or request-scoped telemetry has been explicitly connected and its provenance is recorded.

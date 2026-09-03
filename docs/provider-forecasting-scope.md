# Token Weather provider forecasting scope

This is the authoritative list of AI providers and inference surfaces Token Weather is intended to forecast. “Forecast” means tracking the conditions that affect model selection: effective price, guaranteed limits, account quota, available capacity, latency, stability, incidents, maintenance, model changes, and promotions.

This is a curated product scope, not a claim to cover every AI provider. Each provider is kept separate from its models, regions, account tiers, and execution classes so those dimensions can expand without changing the provider identity.

## Current provider set

These providers are in the current browser forecast, comparison, workload planner, agent API, and official-source collector.

| Priority | Provider | Current model surface | Forecasting value | Account-specific signal | Status |
| ---: | --- | --- | --- | --- | --- |
| 1 | DeepSeek | V4 Pro | Peak/off-peak price, concurrency, rate limits, observed throughput | Usage export/manual handoff | Catalog + docs only |
| 2 | Alibaba Qwen / Bailian | Qwen 3.7 Plus | Guaranteed versus spare capacity, dynamic TPM, workspace/model quotas | Read-only model-limits API | Catalog + docs only |
| 3 | Zhipu / GLM | GLM-5 | Peak/off-peak throttling, tier concurrency, local-time windows | Console/tier handoff | Catalog + docs only |
| 4 | Baidu Qianfan | ERNIE 5.0 | Response-header rate-limit and remaining-quota telemetry | Request-scoped headers | Catalog + docs only |
| 5 | StepFun | Step-3.5 | Tiered concurrency/RPM/TPM and temporary capacity adjustments | Account endpoint when explicitly configured | Catalog + docs only |
| 6 | OpenAI | GPT-5 | Tier limits, pricing, service status, incidents, and maintenance | Dashboard/account limits | Catalog + docs only |
| 7 | Google Gemini | Gemini 2.5 Pro | RPM, TPM, RPD, project quota, spend tiers, and workload classes | AI Studio/project limits | Catalog + docs only |
| 8 | Anthropic | Claude Opus | Account tiers, rate limits, service stability, and capacity changes | Account tier/API limits | Catalog + docs only |
| 9 | xAI / Grok | Grok 4.6 | Spend tiers, RPS/TPM, model pricing, and capacity by tier | Console-specific limits | Catalog + docs only |
| 10 | MiniMax | M2.7 | Five-hour rolling request quota and daily modality quotas | Token Plan account surface | Catalog + docs only |
| 11 | Groq | GPT-OSS 120B | Per-minute and daily request/token limits, reset headers, and Flex capacity | Request-scoped headers | Catalog + docs only |
| 12 | Moonshot / Kimi | Kimi K2.6 | Tiered concurrency, RPM, TPM, and TPD | Request-scoped headers | Catalog + docs only |
| 13 | Cerebras | Llama 3.1 8B | Minute, hourly, and daily request/token limits with replenishment headers | Request-scoped headers | Catalog + docs only |
| 14 | SambaNova | DeepSeek V3.1 | Per-minute and daily request/token limits with reset headers | Request-scoped headers | Catalog + docs only |

The current implementation is live-data-only. Provider names, model names, and source links are catalog configuration; all metrics and change events are unavailable until a real account, request-header, status, or measurement collector supplies them. Retrieving official documentation records source provenance only and never creates a current price, quota, capacity, latency, or stability value.

## Expansion provider set

These providers are part of the intended forecasting coverage but are not yet in the browser registry or collector.

| Expansion order | Provider | Expected forecasting value | First collection strategy |
| ---: | --- | --- | --- |
| 15 | ByteDance Doubao / Ark | Model catalog, pricing, announcements, retirements, and regional availability | Ark documentation and announcements, then authenticated account telemetry |
| 16 | Tencent Hunyuan | Token pricing, model availability, and TokenHub migration changes | Official pricing, model, and platform documentation |
| 17 | Mistral | Requests per second, tokens per minute/month, spend tiers, and admin limits | Official pricing/limits pages plus admin-supplied limits |
| 18 | Cohere | Endpoint limits, trial versus production keys, incidents, and maintenance | Official limits documentation and status history |

## Additional time-window candidates

The following providers were found in a focused search for quotas that change across multiple time windows. Their documentation is cataloged, but no current value is shown until a real telemetry source is connected.

| Provider | Documented time windows or changing capacity | First collection strategy |
| --- | --- | --- |
| [Cerebras Inference](https://inference-docs.cerebras.ai/support/rate-limits) | Free-tier limits can include TPM/TPH/TPD and RPM/RPH/RPD; response headers expose remaining values and reset times. Paid usage removes hourly and daily restrictions. | Capture official rate-limit headers from an explicitly configured request and store free versus paid tier rules separately. |
| [Groq](https://console.groq.com/docs/rate-limits) | Model limits can include RPM/RPD/TPM/TPD with reset headers; [Flex processing](https://console.groq.com/docs/flex-processing) offers higher limits while capacity is available and can return `capacity_exceeded`. | Collect account headers, service-tier state, and Flex capacity events separately from normal limits. |
| [Moonshot AI / Kimi](https://www.kimi.com/code/docs/en/kimi-code/error-reference.html) | Kimi Code documents 5-hour rolling, weekly, and monthly quota windows; the [direct API](https://platform.kimi.ai/docs/introduction) has account-level rate-limit tiers. | Treat Kimi subscription and Moonshot API as separate surfaces under the same model owner. |
| [SambaNova](https://docs.sambanova.ai/docs/en/models/rate-limits) | Free and developer tiers expose both per-minute and daily request/token limits, including daily remaining/reset headers. | Collect tier tables plus request response headers; keep preview-model limits separate from production limits. |

## Platform surfaces with time-based economics

These are not additional model owners. They are important because a model can have different quota, capacity, or price behavior when accessed through a different inference platform.

| Inference surface | Time-dependent behavior | Scope rule |
| --- | --- | --- |
| [Google Gemini Flex / Vertex AI](https://ai.google.dev/gemini-api/docs/generate-content/flex-inference) | Flex inference uses opportunistic off-peak capacity at 50% of standard pricing and is sheddable during traffic spikes. | Model as an execution class under Google Gemini, not as a new provider. |
| [DigitalOcean AI Platform](https://docs.digitalocean.com/products/ai-platform/details/pricing/) | Kimi K2.5 and MiniMax M2.5 receive a documented 30% discount during 05:00–11:00 UTC daily. | Record `inference_provider=digitalocean` separately from the model owner. |
| [OpenRouter](https://openrouter.ai/docs/guides/features/workspaces/workspace-budgets) | Free-model limits and workspace budgets can reset daily, weekly, or monthly. | Model as a routing provider with its own account budget, not as the owner of the underlying model. |

The remaining expansion order after the current fourteen is ByteDance Doubao/Ark, Tencent Hunyuan, Mistral, and Cohere. Google Flex, DigitalOcean, and OpenRouter should be added as provider-surface adapters when the underlying model integrations are ready.

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

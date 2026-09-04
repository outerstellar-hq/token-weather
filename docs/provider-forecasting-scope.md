# Token Weather provider forecasting scope

This is the authoritative list of AI providers and inference surfaces Token Weather is intended to forecast globally. “Forecast” means tracking public conditions that affect model selection: published price, documented limits, public capacity signals, public latency measurements, stability, incidents, maintenance, model changes, and promotions.

This is a curated product scope, not a claim to cover every AI provider. Each provider is kept separate from its models, regions, publicly documented service tiers, and execution classes so those dimensions can expand without changing the provider identity.

The detailed machine-readable registry is [provider-registry.json](provider-registry.json). It separates model owners from inference hosts and routers, records each tracked model’s official source, and marks dynamic catalogs instead of copying their current contents into static data. Public timing rules are maintained separately in [provider-time-windows.json](provider-time-windows.json) and summarized in [provider-time-windows.md](provider-time-windows.md).

## Current provider set

These providers are in the current browser forecast, comparison, workload planner, agent API, and official-source collector.

| Priority | Provider | Current model surface | Forecasting value | Public signal | Status |
| ---: | --- | --- | --- | --- | --- |
| 1 | DeepSeek | V4 Pro | Public peak/off-peak price, published concurrency, rate limits, incidents, and observed public reachability | Official website and status/announcement pages | Catalog + docs only |
| 2 | Alibaba Qwen / Bailian | Qwen 3.7 Plus | Public guaranteed limits, published capacity tiers, pricing, incidents, and model changes | Official documentation and announcements | Catalog + docs only |
| 3 | Zhipu / GLM | GLM-5 | Public throttling rules, tier examples, local-time windows, pricing, and incidents | Official documentation and status/announcement pages | Catalog + docs only |
| 4 | Baidu Qianfan | ERNIE 5.0 | Public rate-limit rules, published quota windows, pricing, and incidents | Official documentation and announcements | Catalog + docs only |
| 5 | StepFun | Step-3.5 | Public tiered concurrency/RPM/TPM, temporary capacity notices, pricing, and incidents | Official documentation and announcements | Catalog + docs only |
| 6 | OpenAI | GPT-5 | Public tier-limit rules, pricing, service status, incidents, maintenance, and model changes | Official documentation, status, and announcements | Status/feed adapters implemented |
| 7 | Google Gemini | Gemini 2.5 Pro | Public RPM, TPM, RPD, spend tiers, workload classes, pricing, and incidents | Official documentation, status, and announcements | Feed adapter implemented |
| 8 | Anthropic | Claude Opus | Public rate-limit tiers, service stability, capacity changes, pricing, and model changes | Official documentation, status, and announcements | Status adapter implemented |
| 9 | xAI / Grok | Grok 4.6 | Public spend tiers, RPS/TPM, model pricing, capacity notices, and incidents | Official documentation and announcements | Catalog + docs only |
| 10 | MiniMax | M2.7 | Public five-hour rolling rules, daily modality quotas, pricing, and announcements | Official documentation and announcements | Status adapter implemented |
| 11 | Groq | GPT-OSS 120B | Public per-minute/daily limits, reset rules, Flex capacity, pricing, and incidents | Official documentation, status, and announcements | Website adapter implemented |
| 12 | Moonshot / Kimi | Kimi K2.6 | Public tiered concurrency, RPM, TPM, TPD, pricing, and model changes | Official documentation and announcements | Catalog + docs only |
| 13 | Cerebras | Llama 3.1 8B | Public minute/hour/day limits, replenishment rules, pricing, and incidents | Official documentation and announcements | Status adapter implemented |
| 14 | SambaNova | DeepSeek V3.1 | Public per-minute/daily rules, pricing, capacity notices, and incidents | Official documentation and announcements | Status adapter implemented |
| 15 | Z.ai | GLM-5 | Public high-load timing, dynamic concurrency policy, pricing, and incidents | Official documentation and announcements | Catalog + docs only |
| 16 | Xiaomi MiMo | MiMo V2.5 | Public Token Plan credit windows, plan tiers, supported models, pricing, and announcements | Official Token Plan and MiMo documentation | Catalog + docs only |

The product is deliberately generic and non-personalized. It never asks for or stores API keys, account IDs, workspace IDs, balances, personal quotas, private console data, or headers from an individual’s workload. Provider names, model names, and source links are catalog configuration; all metrics and change events are unavailable until a public-source or clearly labeled public measurement collector supplies them. Retrieving official documentation records source provenance only and never creates a current price, quota, capacity, latency, or stability value.

### Evidence and estimate acceptance rule

Exact public facts are preferred, but useful approximate signals may enter a snapshot when they are derived from a public source or Token Weather’s own clearly identified public vantage point. Every estimate must be labeled `is_estimate=true` and retain its source URL, retrieval time, scope, confidence, method, and inputs. Seeded, guessed, copied-forward, hand-entered, or unlabeled values remain forbidden. Estimates must never be shown as a person’s quota, account balance, or a universal provider guarantee; absent evidence remains `Not collected` or `unavailable`.

## Expansion provider set

These providers are part of the intended forecasting coverage but are not yet in the browser registry or collector.

| Expansion order | Provider | Expected forecasting value | First collection strategy |
| ---: | --- | --- | --- |
| 15 | ByteDance Doubao / Ark | Model catalog, pricing, announcements, retirements, and regional availability | Ark public documentation, status, and announcements |
| 16 | Tencent Hunyuan | Token pricing, model availability, and TokenHub migration changes | Official pricing, model, and platform documentation |
| 17 | Mistral | Requests per second, tokens per minute/month, spend tiers, and incidents | Official public pricing, limits, status, and announcements |
| 18 | Cohere | Published endpoint limits, public plan differences, incidents, and maintenance | Official public limits, status, and announcements |

## Additional time-window candidates

The following providers were found in a focused search for public quota rules that change across multiple time windows. Their documentation is cataloged, but no current value is shown until a real public source is collected.

| Provider | Documented time windows or changing capacity | First collection strategy |
| --- | --- | --- |
| [Cerebras Inference](https://inference-docs.cerebras.ai/support/rate-limits) | Public free-tier rules can include TPM/TPH/TPD and RPM/RPH/RPD; paid usage can remove hourly and daily restrictions. | Collect the published free/paid rules and public status separately; never convert them into a person’s remaining quota. |
| [Groq](https://console.groq.com/docs/rate-limits) | Public model rules can include RPM/RPD/TPM/TPD; [Flex processing](https://console.groq.com/docs/flex-processing) offers opportunistic capacity and can report `capacity_exceeded`. | Collect public limit tables, public status, and public Flex announcements as separate signals. |
| [Moonshot AI / Kimi](https://www.kimi.com/code/docs/en/kimi-code/error-reference.html) | Kimi Code publicly documents 5-hour rolling, weekly, and monthly quota windows; the [direct API](https://platform.kimi.ai/docs/introduction) has published rate-limit tiers. | Treat Kimi subscription and Moonshot API as separate public execution surfaces under the same model owner. |
| [Xiaomi MiMo Token Plan](https://platform.xiaomimimo.com/token-plan) | Public plans list 0.8× usage from 00:00–08:00 UTC+8 for the displayed tiers, alongside plan-specific credit amounts. This is plan economics, not a universal service-capacity guarantee. | Collect the public Token Plan page and MiMo documentation; never treat plan credits as a visitor’s remaining quota. |
| [SambaNova](https://docs.sambanova.ai/docs/en/models/rate-limits) | Public free and developer tiers expose per-minute and daily request/token rules. | Collect published tier tables and public status; do not collect individual response headers. |

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
- `QUOTA_EVENT` — publicly documented plan, service-tier, or rolling-window limit and reset rule.
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
service_tier
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
is_estimate
method
scope
observed_value
```

Official guarantees and public measurements must remain distinct. A published limit is not a person’s remaining quota. A measurement from Token Weather’s own public vantage point is not a universal guarantee; the forecast must label both instead of replacing one with the other.

## Source priority

Collection should prefer these public sources in order:

1. Official machine-readable public feeds and status APIs.
2. Official pricing and rate-limit documentation.
3. Official provider websites, release notes, blogs, and public announcements.
4. Official public social posts, only when a stable public source can be retrieved and attributed.
5. Clearly labeled measurements from Token Weather’s own public vantage points, such as reachability, latency, or throughput.

No public source should be presented as a universal account quota. Generic provider limits, public incidents, and public announcements must retain their source URL, retrieval time, scope, and confidence. If a website or social source cannot be retrieved or attributed, the signal remains unavailable.

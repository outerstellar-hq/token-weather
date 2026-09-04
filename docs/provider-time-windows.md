# Public provider time windows

This is the source-backed timing registry for Token Weather. It records only provider-published rules that affect quota accounting, reset timing, throttling, pricing, or publicly reported capacity. It never contains a user’s remaining quota, account state, API-key data, response headers, or private console data.

## Confirmed clock windows

| Provider | Published window | Time zone | Published effect |
| --- | --- | --- | --- |
| DeepSeek | Weekdays 01:00–04:00 and 06:00–10:00 | UTC | Peak pricing; all other hours are off-peak pricing. [Source](https://api-docs.deepseek.com/quick_start/pricing) |
| QwenCloud / Alibaba Model Studio | Daily 22:00–08:00 | Beijing Time (Asia/Shanghai) | Qwen3.7-Plus Token Plan credits are consumed at 0.4×, an effective 2.5× usage multiplier. This is a credit discount, not a universal quota increase. [Source](https://modelstudio.alibabacloud.com/intl/blog/model-studio-token-plan-individual/) |
| Z.ai | Typically 14:00–18:00 | Singapore | High inference load; temporary rate limits may occur. Z.ai says the window may shift. [Source](https://docs.z.ai/devpack/tool/others) |
| Baidu Qianfan Coding Plan | Daily 10:30–12:00 and 14:00–18:00 | China Standard Time | Published peak periods; some Coding Plan model calls consume a higher quota-deduction coefficient. The source calls these times non-fixed and traffic-dependent. [Source](https://cloud.baidu.com/doc/qianfan/s/imlg0beiu) |
| MiniMax Token Plan | Approximately weekdays 15:00–17:30 | Not specified by source | Dynamic peak-hour throttling; the current page gives approximate peak concurrency bands of 3–4 Plus, 4–5 Max, and 6–7 Ultra agents. The window depends on cluster load. [Source](https://platform.minimax.io/subscribe/token-plan?tab=individual__monthly) |
| Xiaomi MiMo Token Plan | Daily 00:00–08:00 | UTC+8 | Public page lists 0.8× usage for the displayed plans; this is plan credit economics, not a universal quota. [Source](https://platform.xiaomimimo.com/token-plan) |

## Published reset windows without clock-based peak schedules

- Claude: rolling five-hour usage window; Anthropic says switching is based on usage rather than time of day. [Source](https://support.anthropic.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan)
- MiniMax Token Plan: included quota uses five-hour rolling and weekly windows; unused included quota does not carry over. [Source](https://platform.minimax.io/subscribe/token-plan?tab=individual__monthly)
- StepFun: five-hour and weekly Step Plan windows; no universal clock schedule. [Source](https://platform.stepfun.com/docs/zh/step-plan/overview)
- Gemini: daily RPD reset at midnight Pacific; shared capacity varies with demand, without a universal peak schedule. [Source](https://ai.google.dev/gemini-api/docs/rate-limits)
- Kimi Code: rolling five-hour, weekly, and monthly quota windows. [Source](https://www.kimi.com/code/docs/en/kimi-code/error-reference.html)
- Cerebras: token-bucket replenishment across minute/hour/day limits. [Source](https://inference-docs.cerebras.ai/support/rate-limits)
- SambaNova: minute and daily request/token limits. [Source](https://docs.sambanova.ai/docs/en/models/rate-limits)
- Cloudflare Workers AI: daily limits reset at 00:00 UTC. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- Hugging Face Hub: request buckets use five-minute windows. [Source](https://huggingface.co/docs/hub/en/rate-limits)
- OpenRouter: public provider performance uses rolling five-minute measurements; workspace budgets have separate UTC calendar resets. [Source](https://openrouter.ai/docs/guides/routing/provider-selection)

## No public clock schedule found

OpenAI, Zhipu, xAI, Groq, Together AI, Amazon Bedrock, Microsoft Foundry, Vertex AI Model Garden, DigitalOcean, Replicate, Fireworks AI, NVIDIA NIM, and IBM watsonx.ai publish limits, adaptive-capacity rules, or reset mechanics, but not a universal clock schedule for when global quota or capacity becomes higher or lower. Their records remain explicitly `no_published_schedule` in [provider-time-windows.json](provider-time-windows.json).

That absence is a result, not a missing invented value. Token Weather should show the documented reset or throttling rule where one exists and otherwise say that no public clock schedule is available.

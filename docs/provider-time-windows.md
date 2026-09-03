# Public provider time windows

This is the source-backed timing registry for Token Weather. It records only provider-published rules that affect quota accounting, reset timing, throttling, pricing, or publicly reported capacity. It never contains a user’s remaining quota, account state, API-key data, response headers, or private console data.

## Confirmed clock windows

| Provider | Published window | Time zone | Published effect |
| --- | --- | --- | --- |
| DeepSeek | Weekdays 01:00–04:00 and 06:00–10:00 | UTC | Peak pricing; all other hours are off-peak pricing. [Source](https://api-docs.deepseek.com/quick_start/pricing) |
| Z.ai | Typically 14:00–18:00 | Singapore | High inference load; temporary rate limits may occur. Z.ai says the window may shift. [Source](https://docs.z.ai/devpack/tool/others) |
| Baidu Qianfan Coding Plan | Daily 10:30–12:00 and 14:00–18:00 | China Standard Time | Published peak periods; some Coding Plan model calls consume a higher quota-deduction coefficient. The source calls these times non-fixed and traffic-dependent. [Source](https://cloud.baidu.com/doc/qianfan/s/imlg0beiu) |
| MiniMax Token Plan | Typically weekdays 15:00–17:30 | Not specified by source | Dynamic peak-hour throttling; the window depends on cluster load. [Source](https://platform.minimax.io/docs/token-plan/faq) |

Alibaba also publishes a 22:00–08:00 UTC+8 night discount for selected models on a personal token-plan page. That is a credit-price promotion, not evidence of more public quota. [Source](https://docs.modelstudio.console.alibabacloud.com/en/model-studio/token-plan-personal-overview)

## Published reset windows without clock-based peak schedules

- Claude: rolling five-hour usage window; Anthropic says switching is based on usage rather than time of day. [Source](https://support.anthropic.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan)
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

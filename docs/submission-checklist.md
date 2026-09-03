# OpenAI WebMCP Challenge submission checklist

Checked against the [official OpenAI challenge page](https://openai.com/webmcp-challenge/) and the [official Devpost rules](https://webmcp.devpost.com/rules) on September 2, 2026.

## Current local readiness

| Requirement | Status | Evidence or remaining action |
| --- | --- | --- |
| WebMCP-powered app | Ready locally | `app.js` registers six top-level tools through `document.modelContext.registerTool(...)`. |
| Human-agent workflow | Ready locally | `focus_provider` updates the visible detail panel; read and planning tools reuse the dashboard’s normalized logic. |
| Source and setup instructions | Ready locally | `README.md`, `package.json`, collector, and local server are included. |
| Open-source license | Ready locally | Root `LICENSE` is MIT and must be visible on the public repository page. |
| Challenge-period work | Ready locally | Git history begins September 1, 2026; the challenge submission period began August 25, 2026. |
| Public code repository | Complete | [outerstellar-hq/token-weather](https://github.com/outerstellar-hq/token-weather) is public and includes the MIT license. |
| Working live URL | Ready | [tokenweather.outerstellar.net](https://tokenweather.outerstellar.net/) is served over HTTPS by Caddy and proxies to the marked Node service. |
| Hosted source snapshot | Ready | The live `/api/snapshot` reports 20 source events with zero errors after a successful refresh on September 3, 2026. |
| Demonstration video | Not yet created | Upload a public YouTube video shorter than three minutes with audio, a clear working demo, and an explanation of WebMCP. |
| Devpost submission | Owner action | Join the challenge, then submit the live URL, public repository URL, description, video, and any requested testing details. |

## Submission narrative

Token Weather is an agent-native capacity forecast for the token economy. A person can browse price, quota, capacity, latency, stability, and source confidence while an agent reads the same normalized forecast, compares models, plans a workload, and focuses the exact provider the person should inspect. The key WebMCP improvement is that the agent no longer has to infer dashboard semantics from pixels or click paths; it can request a bounded forecast operation and return the result with its source and measurement boundary attached.

Recommended demo sequence:

1. Show the forecast and select a provider manually.
2. Ask the agent to compare DeepSeek, Groq, and Kimi for a one-million-token workload.
3. Ask it to plan the workload for cost first in the Western region.
4. Ask it to focus the recommended provider and show the detail panel changing for the person.
5. Open the source link and show that the recommendation retains provenance and distinguishes seeded values from account telemetry.

## Final owner actions

1. Register at [webmcp.devpost.com](https://webmcp.devpost.com/) with a Devpost account before the submission deadline: September 3, 2026 at 1:00 p.m. PDT (11:00 p.m. Bucharest time).
2. Record and upload the under-three-minute YouTube demo.
3. Paste the public repository, live URL, video URL, description, and testing instructions into the Devpost submission form.

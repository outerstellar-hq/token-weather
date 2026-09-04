# OpenAI WebMCP Challenge submission checklist

Checked against the [official OpenAI challenge page](https://openai.com/webmcp-challenge/) and the [official Devpost rules](https://webmcp.devpost.com/rules) on September 4, 2026.

## Current local readiness

| Requirement | Status | Evidence or remaining action |
| --- | --- | --- |
| WebMCP-powered app | Ready locally | `app.js` registers six read-only tools through `document.modelContext.registerTool({ name, description, inputSchema, execute })`. |
| Human-agent workflow | Ready locally | Read and planning tools reuse the timetable’s normalized public-source logic. |
| Source and setup instructions | Ready locally | `README.md`, `package.json`, collector, and local server are included. |
| Open-source license | Ready locally | Root `LICENSE` is MIT and must be visible on the public repository page. |
| Challenge-period work | Ready locally | Git history begins September 1, 2026; the challenge submission period began August 25, 2026. |
| Public code repository | Complete | [outerstellar-hq/token-weather](https://github.com/outerstellar-hq/token-weather) is public and includes the MIT license. |
| Working live URL | Ready | [tokenweather.outerstellar.net](https://tokenweather.outerstellar.net/) is served over HTTPS by Caddy and proxies to the marked Node service. |
| Hosted source snapshot | Ready | The live `/api/snapshot` reports the public documentation, status, and announcement collection; it contains no account or visitor-specific data. |
| Demonstration video | Not yet created | Upload a public YouTube video shorter than three minutes with audio, a clear working demo, and an explanation of WebMCP. |
| Devpost submission | Owner action | Join the challenge, then submit the live URL, public repository URL, description, video, and any requested testing details. |

## Submission narrative

Token Weather is an agent-native global forecast for the token economy. Every person and agent sees the same provider catalog, public source provenance, public status, and official announcement signals. No personalized or account-specific data is collected.

Recommended demo sequence:

1. Show the provider catalog and select a provider manually.
2. Ask the agent to compare providers and show that unavailable telemetry stays unavailable.
3. Refresh the documentation sources and inspect their timestamps and hashes.
4. Ask it to focus a provider and show the detail panel changing for the person.
5. Explain that every signal is public, attributed, timestamped, and kept separate from universal guarantees or personal account state.

## Final owner actions

1. Register at [webmcp.devpost.com](https://webmcp.devpost.com/) with a Devpost account and follow the current submission deadline shown by Devpost. The page currently shows the extension as September 4, 2026 at 1:00 a.m. PDT (8:00 a.m. UTC / 11:00 a.m. Bucharest time).
2. Record and upload the under-three-minute YouTube demo.
3. Paste the public repository, live URL, video URL, description, and testing instructions into the Devpost submission form.

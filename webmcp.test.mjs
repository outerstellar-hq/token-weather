import assert from "node:assert/strict";
import test from "node:test";
import { createWebMcpTools, registerWebMcpTools, webMcpToolNames } from "./webmcp.mjs";

function fixture() {
  const focused = [];
  const providers = { "groq-gpt-oss-120b": { id: "groq-gpt-oss-120b", name: "Groq" } };
  const agentApi = {
    get_provider_weather: ({ region }) => [{ region }],
    get_model_weather: (model) => ({ model }),
    compare_models: (ids) => ids,
    plan_workload: (args) => args,
    get_recent_changes: () => [],
    get_published_time_windows: (id) => ({ provider_id: id })
  };
  const tools = createWebMcpTools({
    agentApi,
    getProvider: (id) => providers[id] || (() => { throw new Error(`Unknown provider: ${id}`); })(),
    providerWeather: (provider) => ({ provider_id: provider.id }),
    onFocusProvider: (provider) => focused.push(provider.id)
  });
  return { focused, tools };
}

test("registers the complete WebMCP tool contract", async () => {
  const { tools } = fixture();
  const registered = [];
  const modelContext = { registerTool: async (tool) => registered.push(tool) };

  assert.deepEqual(tools.map(({ name }) => name), webMcpToolNames);
  assert.equal(await registerWebMcpTools({ modelContext, tools }), true);
  assert.deepEqual(registered.map(({ name }) => name), webMcpToolNames);
  for (const tool of registered) {
    assert.deepEqual(Object.keys(tool).sort(), ["description", "execute", "inputSchema", "name"]);
    assert.equal(typeof tool.execute, "function");
    assert.equal(tool.inputSchema.type, "object");
  }
});

test("registered tools execute the same public API as the human UI", async () => {
  const { focused, tools } = fixture();
  const byName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));

  assert.deepEqual(await byName.get_provider_weather.execute({ region: "asia" }), { providers: [{ region: "asia" }] });
  assert.deepEqual(await byName.get_published_time_windows.execute({ provider_id: "groq-gpt-oss-120b" }), { provider_id: "groq-gpt-oss-120b" });
  assert.deepEqual(await byName.focus_provider.execute({ provider_id: "groq-gpt-oss-120b" }), { selected: { provider_id: "groq-gpt-oss-120b" }, human_view_updated: true });
  assert.deepEqual(focused, ["groq-gpt-oss-120b"]);
});

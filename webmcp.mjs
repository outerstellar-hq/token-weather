export const webMcpToolNames = Object.freeze([
  "get_provider_weather",
  "get_model_weather",
  "compare_models",
  "plan_workload",
  "get_recent_changes",
  "get_published_time_windows",
]);

export function createWebMcpTools({ agentApi }) {
  return [
    {
      name: "get_provider_weather",
      description: "Read Token Weather conditions for all providers in a region.",
      inputSchema: {
        type: "object",
        properties: { region: { type: "string", enum: ["all", "asia", "west"], description: "Provider region to inspect." } },
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: async ({ region = "all" } = {}) => ({ providers: agentApi.get_provider_weather({ region }) })
    },
    {
      name: "get_model_weather",
      description: "Read the current price, quota, capacity, latency, limits, and source for one named model.",
      inputSchema: {
        type: "object",
        properties: { model: { type: "string", description: "Provider/model ID or displayed provider and model name." } },
        required: ["model"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: async ({ model }) => agentApi.get_model_weather(model)
    },
    {
      name: "compare_models",
      description: "Compare up to three models across condition, price, capacity, latency, and quota.",
      inputSchema: {
        type: "object",
        properties: { ids: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 3, description: "Model IDs to compare." } },
        required: ["ids"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: async ({ ids }) => ({ models: agentApi.compare_models(ids) })
    },
    {
      name: "plan_workload",
      description: "Recommend a provider for a token workload and return the estimated cost plus alternatives.",
      inputSchema: {
        type: "object",
        properties: {
          tokens: { type: "number", minimum: 1, description: "Total input and output tokens." },
          shape: { type: "string", enum: ["balanced", "latency", "batch", "cost"], description: "Workload priority." },
          region: { type: "string", enum: ["all", "asia", "west"], description: "Allowed provider region." }
        },
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: async (args = {}) => agentApi.plan_workload(args)
    },
    {
      name: "get_recent_changes",
      description: "Read public statements collected from official provider blogs and public feeds.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async () => ({ changes: agentApi.get_recent_changes() })
    },
    {
      name: "get_published_time_windows",
      description: "Read provider-published clock windows and reset rules without accessing account data.",
      inputSchema: {
        type: "object",
        properties: { provider_id: { type: "string", description: "Provider ID to inspect." } },
        required: ["provider_id"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: true },
      execute: async ({ provider_id: providerId }) => agentApi.get_published_time_windows(providerId)
    },
  ];
}

export async function registerWebMcpTools({ modelContext, tools }) {
  if (typeof modelContext?.registerTool !== "function") return false;

  for (const { name, description, inputSchema, execute } of tools) {
    await modelContext.registerTool({ name, description, inputSchema, execute });
  }
  return true;
}

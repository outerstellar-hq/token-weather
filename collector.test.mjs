import assert from "node:assert/strict";
import test from "node:test";
import { accountReadiness, collectQwenAccount, collectSource, sourceDefinitions } from "./collector.mjs";

test("collectSource records official retrieval provenance", async () => {
  const source = sourceDefinitions[0];
  const result = await collectSource(source, async () => new Response("official source", { status: 200 }));
  assert.equal(result.status, "ok");
  assert.equal(result.http_status, 200);
  assert.equal(result.official, true);
  assert.equal(result.bytes, 15);
  assert.match(result.sha256, /^[a-f0-9]{64}$/);
});

test("collectSource fails closed when a source is too large", async () => {
  const source = sourceDefinitions[0];
  const result = await collectSource(source, async () => new Response("x".repeat(8_000_001), { status: 200 }));
  assert.equal(result.status, "error");
  assert.match(result.error, /exceeded/);
  assert.equal(result.confidence, "source retrieval failed");
});

test("account readiness distinguishes credentials from manual sources", () => {
  const unconfigured = accountReadiness({});
  assert.equal(unconfigured.find((item) => item.providerId === "qwen-3-7-plus").status, "not_configured");
  assert.equal(unconfigured.find((item) => item.providerId === "glm-5").status, "not_configured");

  const configured = accountReadiness({ DASHSCOPE_API_KEY: "test-key", DASHSCOPE_WORKSPACE_ID: "test-workspace", STEPFUN_API_KEY: "test-key" });
  assert.equal(configured.find((item) => item.providerId === "qwen-3-7-plus").status, "configured");
  assert.equal(configured.find((item) => item.providerId === "stepfun-step-35").status, "configured");
});

test("Qwen account collector normalizes read-only quota response", async () => {
  const result = await collectQwenAccount({
    env: { DASHSCOPE_API_KEY: "test-key", DASHSCOPE_WORKSPACE_ID: "workspace", DASHSCOPE_REGION: "cn-beijing" },
    fetchImpl: async (url, options) => {
      assert.match(url, /workspace\.cn-beijing\.maas\.aliyuncs\.com\/api\/v1\/models\/limits/);
      assert.equal(options.headers.authorization, "Bearer test-key");
      return new Response(JSON.stringify({ output: { quotas: [{ model: "qwen3-max", workspace_id: "workspace", model_limit: { usage_limit: 500000 } }] } }), { status: 200 });
    }
  });
  assert.equal(result.status, "ok");
  assert.equal(result.records[0].model, "qwen3-max");
  assert.equal(result.records[0].model_limit.usage_limit, 500000);
});

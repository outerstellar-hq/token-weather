import assert from "node:assert/strict";
import test from "node:test";
import { collectDocumentation, collectSource, sourceDefinitions } from "./collector.mjs";
import { collectPublicSignals, collectPublicSource, publicAdapters } from "./public-adapters.mjs";
import { isPublicSnapshot } from "./snapshot-store.mjs";

test("collectSource records official documentation provenance", async () => {
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

test("public status adapter extracts only public status signals", async () => {
  const adapter = publicAdapters.find((item) => item.adapterId === "openai-status");
  const result = await collectPublicSource(adapter, async () => new Response(JSON.stringify({ page: { updated_at: "2026-09-03T00:00:00Z" }, status: { indicator: "none", description: "All Systems Operational" }, components: [{ name: "API", status: "operational" }], incidents: [], scheduled_maintenances: [] }), { status: 200, headers: { "content-type": "application/json" } }));
  assert.equal(result.event_type, "PUBLIC_STATUS");
  assert.equal(result.signals.indicator, "none");
  assert.equal(result.signals.components[0].status, "operational");
  assert.equal(result.signals.unresolved_incidents, 0);
});

test("public announcement adapter extracts attributed feed entries", async () => {
  const adapter = publicAdapters.find((item) => item.adapterId === "openai-news-feed");
  const result = await collectPublicSource(adapter, async () => new Response("<rss><channel><item><title><![CDATA[Public update]]></title><pubDate>Thu, 03 Sep 2026 00:00:00 GMT</pubDate><link>https://openai.com/news/example</link></item></channel></rss>", { status: 200, headers: { "content-type": "application/rss+xml" } }));
  assert.equal(result.event_type, "PUBLIC_ANNOUNCEMENTS");
  assert.equal(result.entries[0].title, "Public update");
  assert.equal(result.entries[0].link, "https://openai.com/news/example");
});

test("public collection has no credential inputs", async () => {
  const report = await collectPublicSignals({ fetchImpl: async () => new Response(JSON.stringify({ status: { indicator: "none", description: "All Systems Operational" }, components: [], incidents: [], scheduled_maintenances: [] }), { status: 200, headers: { "content-type": "application/json" } }) });
  assert.equal(report.events.length, publicAdapters.length);
  assert.equal(report.events.every((event) => !("account_id" in event) && !("api_key" in event)), true);
});

test("documentation report can include public signals without account state", async () => {
  const report = await collectDocumentation({ includePublicSignals: true, fetchImpl: async () => new Response("<html><title>Official page</title></html>", { status: 200, headers: { "content-type": "text/html" } }) });
  assert.equal(report.events.length, sourceDefinitions.length + publicAdapters.length);
  assert.equal("account_collectors" in report, false);
});

test("snapshot validation rejects legacy private state", () => {
  const publicSnapshot = { schema: "token-weather.snapshot.v1", events: [{ event_type: "PUBLIC_STATUS" }] };
  assert.equal(isPublicSnapshot(publicSnapshot), true);
  assert.equal(isPublicSnapshot({ ...publicSnapshot, account_collectors: {} }), false);
  assert.equal(isPublicSnapshot({ ...publicSnapshot, events: [{ event_type: "ACCOUNT_QUOTA", account_id: "private" }] }), false);
});

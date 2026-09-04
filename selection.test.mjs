import assert from "node:assert/strict";
import test from "node:test";
import { defaultActiveProviderId, hasActiveForecastSignal, hasActivePublicQuota } from "./selection.mjs";

test("only public quota and rate-limit signals count as active quota", () => {
  assert.equal(hasActivePublicQuota({ publicEvidence: { documents: 2 }, state: "healthy" }), false);
  assert.equal(hasActivePublicQuota({ rateLimits: { tpm: 100000 }, state: "unknown" }), true);
  assert.equal(hasActivePublicQuota({ capacity: { guaranteedTpm: 100000 }, state: "unknown" }), true);
  assert.equal(hasActivePublicQuota({ quota: { remaining: 88 }, state: "healthy" }), false);
});

test("forecast rows require an active quota signal or a non-normal status", () => {
  assert.equal(hasActiveForecastSignal({ publicEvidence: { documents: 3 }, state: "healthy" }), false);
  assert.equal(hasActiveForecastSignal({ publicEvidence: { status: true }, state: "healthy" }), false);
  assert.equal(hasActiveForecastSignal({ publicEvidence: { status: true }, state: "watch" }), true);
  assert.equal(hasActiveForecastSignal({ state: "disrupted" }), true);
  assert.equal(hasActiveForecastSignal({ rateLimits: { tpm: 100000 }, state: "healthy" }), true);
});

test("default selection is empty when no active public quota exists", () => {
  assert.equal(defaultActiveProviderId([{ id: "docs-only", publicEvidence: { documents: 1 } }]), null);
  assert.equal(defaultActiveProviderId([{ id: "docs-only" }, { id: "active", rateLimits: { rpm: 60 } }]), "active");
});

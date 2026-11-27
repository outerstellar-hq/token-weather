import { test } from "node:test";
import assert from "node:assert/strict";
import { readVersion } from "./version.mjs";

test("version is the git tag that describes the checkout", () => {
  assert.equal(readVersion(".", () => "v1.0.0\n"), "v1.0.0");
});

test("version falls back to unknown when git is missing or fails", () => {
  assert.equal(readVersion(".", () => { throw new Error("git not found"); }), "unknown");
  assert.equal(readVersion(".", () => ""), "unknown");
});

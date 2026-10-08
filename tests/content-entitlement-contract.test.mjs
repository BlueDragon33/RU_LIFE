import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("entitlement is a versioned pure evaluator with fail-closed gated access", async () => {
  const code=await readFile(new URL("../lib/content-intelligence/entitlement.ts",import.meta.url),"utf8");
  for(const text of ["EntitlementGrantV1","EntitlementResourceV1","evaluateEntitlement","resourceId","expiresAt","revoked"]) assert.ok(code.includes(text),text);
  assert.doesNotMatch(code,/fetch\(|localStorage|sessionStorage|document\.cookie|stripe|paypal|\bprocess\.env\b/i);
  assert.match(code,/access === "open"/);
  assert.match(code,/return \{ allowed: false/);
});

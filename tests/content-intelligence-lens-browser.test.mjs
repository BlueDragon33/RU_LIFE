import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("browser verification exercises accommodation lenses and manual override", async () => {
  const script = await readFile(new URL("../scripts/verify-content-intelligence-browser.mjs", import.meta.url), "utf8");

  assert.match(script, /knowledge-context-lens/);
  assert.match(script, /selectOption\("dormitory"\)/);
  assert.match(script, /selectOption\("rental"\)/);
  assert.match(script, /selectOption\("temporary"\)/);
  assert.match(script, /Ký túc xá \/ cơ sở do trường bố trí/);
  assert.match(script, /Thuê nhà\/căn hộ/);
  assert.match(script, /Khách sạn \/ cơ sở lưu trú/);
  assert.match(script, /manual override/i);
  assert.match(script, /knowledge-risk-panel/);
  assert.match(script, /390/);
});

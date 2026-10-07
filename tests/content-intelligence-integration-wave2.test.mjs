import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function json(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

const topics = ["daily-russian","school-russian","culture-etiquette","personal-notes"];

test("all integration topics have stable-guidance Knowledge Units", async () => {
  for (const topic of topics) {
    const unit = await json(`../content/knowledge/integration/${topic}.json`);
    assert.equal(unit.id, `ru-life:integration:${topic}`);
    assert.equal(unit.schemaVersion, 1);
    assert.equal(unit.provenance.freshness, "stable-guidance");
    assert.ok(unit.memory.mustRemember.length >= 1 && unit.memory.mustRemember.length <= 3);
    assert.ok(unit.journey.map.nodes.length >= 2);
  }
});

test("culture and personal experience stay explicitly non-authoritative", async () => {
  const culture = await json("../content/knowledge/integration/culture-etiquette.json");
  assert.match(JSON.stringify(culture.risk), /không.*quy tắc|không.*đại diện|cá nhân|bối cảnh/i);
  assert.equal(culture.provenance.sourceIds.length, 0);

  const notes = await json("../content/knowledge/integration/personal-notes.json");
  assert.match(JSON.stringify(notes.risk), /mật khẩu|OTP|khôi phục|thẻ thanh toán/i);
  assert.match(JSON.stringify(notes.semantics.scope), /không.*bí mật|không.*nhạy cảm|cục bộ/i);
  assert.doesNotMatch(JSON.stringify(notes.semantics.actions), /lưu mật khẩu|lưu OTP|chép toàn bộ số hộ chiếu/i);
});

test("integration registry lists all four stable topic keys", async () => {
  const registry = await readFile(new URL("../lib/content-intelligence/registry.ts", import.meta.url), "utf8");
  for (const topic of topics) assert.match(registry, new RegExp(`integration:${topic}`));
});

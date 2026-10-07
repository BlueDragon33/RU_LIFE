import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("all prepare topics are registered without changing stable routes", async () => {
  const registry = await source("../lib/content-intelligence/registry.ts");
  for (const key of [
    "prepare:documents",
    "prepare:luggage",
    "prepare:money-connectivity",
    "prepare:arrival-plan",
  ]) assert.ok(registry.includes(key), key + " must be registered");
});

test("prepare Knowledge Units separate stable workflow from volatile provider facts", async () => {
  const documents = JSON.parse(await source("../content/knowledge/prepare/documents.json"));
  const luggage = JSON.parse(await source("../content/knowledge/prepare/luggage.json"));
  const money = JSON.parse(await source("../content/knowledge/prepare/money-connectivity.json"));
  const arrival = JSON.parse(await source("../content/knowledge/prepare/arrival-plan.json"));

  assert.ok(documents.provenance.sourceIds.length >= 2);
  assert.match(JSON.stringify(documents.risk), /e-visa|visa/i);
  assert.match(JSON.stringify(documents.risk), /trường|cơ sở đào tạo/i);

  assert.equal(luggage.provenance.freshness, "stable-guidance");
  assert.match(JSON.stringify(luggage.semantics), /hãng|vé|chuyến/i);
  assert.doesNotMatch(JSON.stringify(luggage), /\b(?:20|23|30|32)\s*kg\b/i);

  assert.equal(money.provenance.freshness, "review-soon");
  assert.match(JSON.stringify(money.risk), /ngân hàng|đơn vị phát hành|nhà mạng|provider|thời điểm/i);
  assert.doesNotMatch(JSON.stringify(money), /tỷ giá cố định|giá cố định/i);

  assert.ok(arrival.provenance.sourceIds.length >= 1);
  assert.match(JSON.stringify(arrival.semantics.actions), /giấy tờ nhập cảnh|đầu mối|trường|ký túc xá/i);

  for (const unit of [documents,luggage,money,arrival]) {
    assert.equal(unit.schemaVersion, 1);
    assert.ok(unit.journey.map.nodes.length > 0);
    assert.ok(unit.memory.mustRemember.length <= 3);
  }
});

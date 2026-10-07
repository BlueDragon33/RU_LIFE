import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("remaining daily-life topics resolve as Knowledge Units", async () => {
  const registry = await source("../lib/content-intelligence/registry.ts");
  for (const key of [
    "daily-life:housing",
    "daily-life:transport",
    "daily-life:shopping-services",
    "daily-life:safety",
  ]) assert.ok(registry.includes(key), key + " must be registered");
});

test("daily-life migration keeps housing, transport and shopping semantics honest", async () => {
  const housing = JSON.parse(await source("../content/knowledge/daily-life/housing.json"));
  const transport = JSON.parse(await source("../content/knowledge/daily-life/transport.json"));
  const shopping = JSON.parse(await source("../content/knowledge/daily-life/shopping-services.json"));

  assert.match(JSON.stringify(housing), /nhận phòng/i);
  assert.match(JSON.stringify(housing), /cư trú|nơi lưu trú|migration/i);
  assert.ok(housing.relations.some((item) => item.targetId === "ru-life:study-procedures:migration-registration"));

  assert.match(JSON.stringify(transport), /offline|mất mạng|dự phòng/i);
  assert.doesNotMatch(JSON.stringify(transport), /Yandex|2GIS|Google Maps|Uber/i);

  assert.match(JSON.stringify(shopping), /giá.*thời điểm|thời điểm.*giá|khuyến mại.*thời điểm/i);
  assert.doesNotMatch(JSON.stringify(shopping), /mở cửa 24\/7|giá cố định/i);

  for (const unit of [housing, transport, shopping]) {
    assert.equal(unit.schemaVersion, 1);
    assert.ok(unit.journey.map.nodes.length > 0);
    assert.ok(unit.memory.mustRemember.length <= 3);
  }
});

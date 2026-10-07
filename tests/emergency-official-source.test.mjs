import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function json(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

test("emergency 103 claims are backed by a current official MChS source", async () => {
  const unit = await json("../content/knowledge/health/emergency.json");
  const sources = await json("../content/sources/health/emergency.sources.json");
  const mchsId = "source:ru:health:emergency:mchs-ambulance";
  const source = sources.find((item) => item.id === mchsId);

  assert.ok(source, "MChS ambulance source is required");
  assert.equal(source.authority, "official-government");
  assert.match(source.url, /^https:\/\/mchs\.gov\.ru\//);

  const claims = [
    unit.semantics.mainIdea,
    unit.semantics.actions.find((item) => item.id === "emergency:action:call"),
    unit.memory.mustRemember.find((item) => item.id === "emergency:remember:103"),
    unit.journey.nextAction,
  ];
  for (const claim of claims) {
    assert.ok(claim?.sourceIds.includes(mchsId), `${claim?.id || "claim"} must cite MChS for 103`);
  }
});

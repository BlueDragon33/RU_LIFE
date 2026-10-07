import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

async function filesIn(path) {
  return readdir(new URL(path, import.meta.url));
}

test("vertical slice keeps canonical knowledge evidence-complete and reference-safe", async () => {
  const unit = JSON.parse(await source("../content/knowledge/study-procedures/migration-registration.json"));
  const sources = JSON.parse(await source("../content/sources/study-procedures/migration-registration.sources.json"));
  const sourceIds = new Set(sources.map((entry) => entry.id));

  assert.equal(unit.id, "ru-life:study-procedures:migration-registration");
  assert.equal(unit.schemaVersion, 1);

  for (const id of unit.provenance.sourceIds) assert.ok(sourceIds.has(id), `missing provenance source ${id}`);
  for (const item of [...unit.risk.doNot, ...unit.risk.critical]) {
    assert.ok(item.sourceIds.length > 0, `${item.id} must retain evidence`);
    for (const id of item.sourceIds) assert.ok(sourceIds.has(id), `${item.id} references missing source ${id}`);
  }

  const nodeIds = new Set(unit.journey.map.nodes.map((node) => node.id));
  for (const edge of unit.journey.map.edges) {
    assert.ok(nodeIds.has(edge.from), `missing map node ${edge.from}`);
    assert.ok(nodeIds.has(edge.to), `missing map node ${edge.to}`);
  }
});

test("content intelligence production files stay provider-free and secret-free", async () => {
  const secretPattern = /privateKey|session[_-]?token|service[_-]?secret|cloudflare[_-]?api|managed_app_devices|control_devices/i;
  const providerPattern = /from\s+["'](?:@?stripe|openai|@anthropic|firebase|supabase|neo4j|@aws-sdk)|fetch\s*\(/i;

  const knowledge = await source("../content/knowledge/study-procedures/migration-registration.json");
  assert.doesNotMatch(knowledge, secretPattern);

  for (const name of await filesIn("../lib/content-intelligence/")) {
    if (!name.endsWith(".ts")) continue;
    const body = await source(`../lib/content-intelligence/${name}`);
    assert.doesNotMatch(body, providerPattern, `${name} must remain provider/local-first`);
  }
  for (const name of await filesIn("../components/knowledge/")) {
    if (!name.endsWith(".tsx")) continue;
    const body = await source(`../components/knowledge/${name}`);
    assert.doesNotMatch(body, providerPattern, `${name} must remain provider/local-first`);
  }
});

test("one canonical unit drives three reading modes while legacy routes and personal tools remain intact", async () => {
  const experience = await source("../components/knowledge/knowledge-experience.tsx");
  const route = await source("../app/app/[module]/[topic]/page.tsx");
  const resolver = await source("../lib/content-resolver.ts");
  const catalog = await source("../lib/content-catalog.ts");

  for (const label of ["Tôi cần làm gì?", "Tôi muốn hiểu", "Cho tôi xem toàn bộ"]) {
    assert.match(experience, new RegExp(label.replace(/[?]/g, "\\?")));
  }
  assert.match(route, /KnowledgeExperience/);
  assert.match(route, /TopicProgress/);
  assert.match(route, /TopicTools/);
  assert.match(route, /TopicDeadlines/);
  assert.match(route, /moduleSlug=\{moduleData\.slug\}/);
  assert.match(route, /topicSlug=\{topic\.slug\}/);
  assert.match(resolver, /getResolvedTopicContent/);
  assert.match(resolver, /getResolvedKnowledgeUnit/);

  const moduleSlugs = [...catalog.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(moduleSlugs.length, 25, "5 modules + 20 topics must remain in the catalog");
});

test("architecture documentation records Wave 1 coexistence and boundaries", async () => {
  const architecture = await source("../CONTENT_ARCHITECTURE.md");
  assert.match(architecture, /Content Intelligence Wave 1/i);
  assert.match(architecture, /Knowledge Unit v1/i);
  assert.match(architecture, /migration-registration/);
  assert.match(architecture, /legacy/i);
  assert.match(architecture, /action.*learn.*full|Tôi cần làm gì.*Tôi muốn hiểu.*Cho tôi xem toàn bộ/is);
  assert.match(architecture, /map.*outline|sơ đồ.*outline/i);
  assert.match(architecture, /local-first/i);
  assert.match(architecture, /personal.*state|dữ liệu cá nhân/i);
});

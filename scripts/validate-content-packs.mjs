import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const defaultPackFile = fileURLToPath(new URL("../content/packs/v1.json", import.meta.url));
const defaultKnowledgeRoot = fileURLToPath(new URL("../content/knowledge/", import.meta.url));
const allowedKeys = new Set([
  "schemaVersion", "version", "id", "slug", "title", "subtitle",
  "description", "focus", "access", "featuredUnitId", "unitIds",
]);

function fail(message) {
  throw new Error(message);
}

function validText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function validate(packFile, knowledgeRoot) {
  const raw = JSON.parse(await readFile(packFile, "utf8"));
  if (!Array.isArray(raw) || raw.length === 0) fail("Expected a non-empty ContentPackV1 array");
  const ids = new Set();
  const slugs = new Set();
  let membershipCount = 0;

  for (const [index, pack] of raw.entries()) {
    if (!pack || typeof pack !== "object" || Array.isArray(pack)) fail(`Pack ${index}: must be an object`);
    for (const key of Object.keys(pack)) {
      if (!allowedKeys.has(key)) fail(`Pack ${index}: unapproved field "${key}"`);
    }
    if (pack.schemaVersion !== 1 || pack.version !== 1) fail(`Pack ${index}: unsupported schema/version`);
    if (!validText(pack.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pack.slug)) {
      fail(`Pack ${index}: invalid slug`);
    }
    if (pack.id !== `ru-life:pack:${pack.slug}`) fail(`Pack ${index}: incorrect stable ID`);
    if (ids.has(pack.id) || slugs.has(pack.slug)) fail(`Pack ${index}: duplicate pack ID/slug`);
    ids.add(pack.id);
    slugs.add(pack.slug);
    if (pack.access !== "open") fail(`Pack ${pack.slug}: must have open access`);
    for (const field of ["title", "subtitle", "description", "focus"]) {
      if (!validText(pack[field])) fail(`Pack ${pack.slug}: missing ${field}`);
    }
    if (!Array.isArray(pack.unitIds) || pack.unitIds.length < 3) {
      fail(`Pack ${pack.slug}: must list at least three Knowledge Units`);
    }
    if (new Set(pack.unitIds).size !== pack.unitIds.length) fail(`Pack ${pack.slug}: duplicate Knowledge Unit`);
    if (!pack.unitIds.includes(pack.featuredUnitId)) fail(`Pack ${pack.slug}: featuredUnitId not in pack`);

    for (const id of pack.unitIds) {
      const match = /^ru-life:([a-z][a-z0-9-]*):([a-z][a-z0-9-]*)$/.exec(id);
      if (!match) fail(`Pack ${pack.slug}: invalid Knowledge Unit reference ${id}`);
      const unitFile = join(knowledgeRoot, match[1], `${match[2]}.json`);
      let unit;
      try {
        unit = JSON.parse(await readFile(unitFile, "utf8"));
      } catch {
        fail(`Pack ${pack.slug}: unresolved Knowledge Unit ${id}`);
      }
      if (unit?.id !== id || unit?.schemaVersion !== 1 ||
          unit?.moduleSlug !== match[1] || unit?.topicSlug !== match[2]) {
        fail(`Pack ${pack.slug}: mismatched canonical Knowledge Unit ${id}`);
      }
      membershipCount++;
    }
  }
  return { packCount: raw.length, membershipCount };
}

try {
  const packFile = resolve(process.argv[2] || defaultPackFile);
  const knowledgeRoot = resolve(process.argv[3] || defaultKnowledgeRoot);
  const result = await validate(packFile, knowledgeRoot);
  console.log(`Content Packs PASS: ${result.packCount} packs, ${result.membershipCount} topic references`);
} catch (error) {
  console.error(`Content Packs FAIL: ${error.message}`);
  process.exitCode = 1;
}

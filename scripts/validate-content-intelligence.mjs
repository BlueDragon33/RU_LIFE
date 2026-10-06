import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function fail(message) {
  throw new Error(`[content-intelligence] ${message}`);
}

function isDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}

async function collectJsonFiles(inputPath) {
  const info = await stat(inputPath);
  if (info.isFile()) return [inputPath];
  if (!info.isDirectory()) return [];
  const entries = await readdir(inputPath, { withFileTypes: true });
  const nested = [];
  for (const entry of entries) {
    const child = path.join(inputPath, entry.name);
    if (entry.isDirectory()) nested.push(...await collectJsonFiles(child));
    else if (entry.isFile() && entry.name.endsWith(".json")) nested.push(child);
  }
  return nested;
}

async function readRecords(inputPath) {
  const files = await collectJsonFiles(inputPath);
  const records = [];
  for (const file of files) {
    const value = JSON.parse(await readFile(file, "utf8"));
    if (Array.isArray(value)) records.push(...value);
    else records.push(value);
  }
  return records;
}

function collectSourceIds(value, out = []) {
  if (!value || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    for (const item of value) collectSourceIds(item, out);
    return out;
  }
  if (Array.isArray(value.sourceIds)) out.push(...value.sourceIds);
  for (const child of Object.values(value)) collectSourceIds(child, out);
  return out;
}

function collectEvidenceIds(unit) {
  const ids = new Set();
  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (typeof value.id === "string") ids.add(value.id);
    for (const child of Object.values(value)) walk(child);
  }
  walk(unit.semantics);
  walk(unit.memory);
  walk(unit.journey);
  walk(unit.risk);
  return ids;
}

function validateSources(sources) {
  const ids = new Set();
  for (const source of sources) {
    if (!source || typeof source !== "object") fail("source record must be an object");
    if (source.schemaVersion !== 1) fail(`source ${source.id ?? "<unknown>"} must use schemaVersion 1`);
    if (typeof source.id !== "string" || !source.id) fail("source is missing id");
    if (ids.has(source.id)) fail(`duplicate source id: ${source.id}`);
    ids.add(source.id);
    if (!isDateOnly(source.checkedAt)) fail(`source ${source.id} has invalid checkedAt`);
  }
  return ids;
}

function validateUnit(unit, knownSources, unitIds) {
  if (!unit || typeof unit !== "object") fail("knowledge unit must be an object");
  if (unit.schemaVersion !== 1) fail(`knowledge unit ${unit.id ?? "<unknown>"} must use schemaVersion 1`);
  if (typeof unit.id !== "string" || !unit.id) fail("knowledge unit is missing id");
  if (unitIds.has(unit.id)) fail(`duplicate knowledge unit id: ${unit.id}`);
  unitIds.add(unit.id);

  if (!isDateOnly(unit.provenance?.verifiedAt)) fail(`knowledge unit ${unit.id} has invalid verifiedAt`);

  const remember = unit.memory?.mustRemember;
  if (!Array.isArray(remember)) fail(`knowledge unit ${unit.id} must define memory.mustRemember`);
  if (remember.length > 3) fail(`knowledge unit ${unit.id} has more than 3 mustRemember items`);

  const allSourceIds = collectSourceIds(unit);
  for (const sourceId of allSourceIds) {
    if (!knownSources.has(sourceId)) fail(`knowledge unit ${unit.id} references unknown source ${sourceId}`);
  }

  for (const [bucketName, items] of [
    ["doNot", unit.risk?.doNot],
    ["critical", unit.risk?.critical],
  ]) {
    if (!Array.isArray(items)) fail(`knowledge unit ${unit.id} must define risk.${bucketName}`);
    for (const item of items) {
      if (!Array.isArray(item?.sourceIds) || item.sourceIds.length === 0) {
        fail(`high-risk item ${item?.id ?? "<unknown>"} in risk.${bucketName} must include sourceIds`);
      }
    }
  }

  const map = unit.journey?.map;
  if (!map || !Array.isArray(map.nodes) || !Array.isArray(map.edges)) {
    fail(`knowledge unit ${unit.id} must define journey.map nodes and edges`);
  }

  const nodeIds = new Set();
  for (const node of map.nodes) {
    if (nodeIds.has(node.id)) fail(`duplicate map node id ${node.id} in ${unit.id}`);
    nodeIds.add(node.id);
  }
  for (const edge of map.edges) {
    if (!nodeIds.has(edge.from)) fail(`map edge in ${unit.id} references missing node ${edge.from}`);
    if (!nodeIds.has(edge.to)) fail(`map edge in ${unit.id} references missing node ${edge.to}`);
  }

  const evidenceIds = collectEvidenceIds(unit);
  for (const decision of unit.journey?.decisions ?? []) {
    for (const option of decision.options ?? []) {
      for (const actionId of option.actionIds ?? []) {
        if (!evidenceIds.has(actionId)) fail(`decision option ${option.id} references missing action ${actionId}`);
      }
      for (const warningId of option.warningIds ?? []) {
        if (!evidenceIds.has(warningId)) fail(`decision option ${option.id} references missing warning ${warningId}`);
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const sourceInput = args[0] ?? "content/sources";
  const unitInput = args[1] ?? "content/knowledge";

  let sources = [];
  let units = [];
  try {
    sources = await readRecords(sourceInput);
    units = await readRecords(unitInput);
  } catch (error) {
    if (args.length === 0 && error?.code === "ENOENT") {
      console.log("[content-intelligence] no canonical content files yet; nothing to validate");
      return;
    }
    throw error;
  }

  const knownSources = validateSources(sources);
  const unitIds = new Set();
  for (const unit of units) validateUnit(unit, knownSources, unitIds);

  console.log(`[content-intelligence] PASS: ${sources.length} sources, ${units.length} knowledge units`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

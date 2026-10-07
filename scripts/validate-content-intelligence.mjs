import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function fail(message) {
  throw new Error(message);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function collectJsonFiles(root) {
  if (!existsSync(root)) return [];
  const info = await stat(root);
  if (info.isFile()) return root.endsWith(".json") ? [root] : [];
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = resolve(root, entry.name);
    return entry.isDirectory() ? collectJsonFiles(path) : path.endsWith(".json") ? [path] : [];
  }));
  return nested.flat();
}

function validateDate(label, value) {
  if (value === undefined) return;
  if (typeof value !== "string" || !DATE_ONLY.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    fail(`${label} must be YYYY-MM-DD`);
  }
}

function validateSource(source, sourceIds) {
  if (!isObject(source)) fail("source record must be an object");
  if (source.schemaVersion !== 1) fail(`source ${source.id || "<unknown>"} schemaVersion must be 1`);
  if (typeof source.id !== "string" || !source.id) fail("source id is required");
  if (sourceIds.has(source.id)) fail(`duplicate source id: ${source.id}`);
  sourceIds.add(source.id);
  validateDate(`source ${source.id} checkedAt`, source.checkedAt);
  validateDate(`source ${source.id} publishedAt`, source.publishedAt);
  validateDate(`source ${source.id} effectiveAt`, source.effectiveAt);
}

function evidenceItems(unit) {
  const semantics = unit.semantics || {};
  const memory = unit.memory || {};
  const journey = unit.journey || {};
  const risk = unit.risk || {};
  return [
    semantics.mainIdea,
    semantics.purpose,
    ...(semantics.rationale || []),
    ...(semantics.logic || []),
    ...(semantics.preconditions || []),
    ...(semantics.scope || []),
    ...(semantics.actions || []),
    ...(semantics.outcomes || []),
    ...(semantics.exceptions || []),
    ...(memory.mustRemember || []),
    memory.memoryAnchor,
    ...(memory.keyTerms || []),
    ...(memory.contrasts || []),
    ...(memory.myths || []),
    ...(memory.commonMistakes || []),
    ...(memory.examples || []),
    ...(journey.triggers || []),
    journey.nextAction,
    ...(journey.checklist || []),
    ...(journey.timeline || []),
    ...(journey.requiredMaterials || []),
    ...(journey.completionEvidence || []),
    ...(journey.followUps || []),
    ...(risk.doNot || []),
    ...(risk.critical || []),
    ...(risk.cautions || []),
    ...(risk.recommended || []),
    ...(risk.goodToKnow || []),
    ...(risk.consequences || []),
    ...(risk.escalations || []),
    ...(risk.uncertaintyNotes || []),
    ...((unit.language && unit.language.cultureNotes) || []),
  ].filter(Boolean);
}

function validateEvidenceSourceIds(unit, sourceIds) {
  for (const item of evidenceItems(unit)) {
    if (!Array.isArray(item.sourceIds)) fail(`evidence ${item.id || "<unknown>"} sourceIds must be an array`);
    for (const sourceId of item.sourceIds) {
      if (!sourceIds.has(sourceId)) fail(`evidence ${item.id || "<unknown>"} references unknown source: ${sourceId}`);
    }
  }
}

function validateHighRisk(unit, sourceById) {
  if (unit.risk?.severity === "high" || unit.risk?.severity === "critical") {
    const provenanceIds = unit.provenance?.sourceIds || [];
    const authoritative = provenanceIds.some((sourceId) => {
      const authority = sourceById.get(sourceId)?.authority;
      return authority === "official-legal" || authority === "official-government";
    });
    if (!provenanceIds.length || !authoritative) {
      fail(`high-risk unit ${unit.id || "<unknown>"} requires at least one authoritative provenance source`);
    }
  }

  for (const bucketName of ["doNot", "critical"]) {
    const bucket = unit.risk?.[bucketName] || [];
    for (const item of bucket) {
      if (!Array.isArray(item.sourceIds) || item.sourceIds.length === 0) {
        fail(`risk.${bucketName} item ${item.id || "<unknown>"} requires at least one source`);
      }
    }
  }
}

function validateMap(unit) {
  const map = unit.journey?.map || { nodes: [], edges: [] };
  const nodeIds = new Set();
  for (const node of map.nodes || []) {
    if (!node.id) fail("map node id is required");
    if (nodeIds.has(node.id)) fail(`duplicate map node id: ${node.id}`);
    nodeIds.add(node.id);
  }
  for (const edge of map.edges || []) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      fail(`map edge references missing node: ${edge.from} -> ${edge.to}`);
    }
  }
}

function collectActionAndWarningIds(unit) {
  const actionIds = new Set([
    ...(unit.semantics?.actions || []),
    ...(unit.journey?.checklist || []),
    ...(unit.journey?.timeline || []),
    ...(unit.journey?.nextAction ? [unit.journey.nextAction] : []),
  ].map((item) => item.id).filter(Boolean));
  const warningIds = new Set([
    ...(unit.risk?.doNot || []),
    ...(unit.risk?.critical || []),
    ...(unit.risk?.cautions || []),
  ].map((item) => item.id).filter(Boolean));
  return { actionIds, warningIds };
}

function validateDecisions(unit) {
  const { actionIds, warningIds } = collectActionAndWarningIds(unit);
  for (const decision of unit.journey?.decisions || []) {
    for (const option of decision.options || []) {
      for (const actionId of option.actionIds || []) {
        if (!actionIds.has(actionId)) fail(`decision ${decision.id} references missing action: ${actionId}`);
      }
      for (const warningId of option.warningIds || []) {
        if (!warningIds.has(warningId)) fail(`decision ${decision.id} references missing warning: ${warningId}`);
      }
    }
  }
}

function validateUnit(unit, sourceIds, unitIds, sourceById) {
  if (!isObject(unit)) fail("knowledge unit must be an object");
  if (unit.schemaVersion !== 1) fail(`unit ${unit.id || "<unknown>"} schemaVersion must be 1`);
  if (typeof unit.id !== "string" || !unit.id) fail("knowledge unit id is required");
  if (unitIds.has(unit.id)) fail(`duplicate knowledge unit id: ${unit.id}`);
  unitIds.add(unit.id);

  validateDate(`unit ${unit.id} verifiedAt`, unit.provenance?.verifiedAt);

  for (const sourceId of unit.provenance?.sourceIds || []) {
    if (!sourceIds.has(sourceId)) fail(`unit ${unit.id} references unknown source: ${sourceId}`);
  }

  if ((unit.memory?.mustRemember || []).length > 3) {
    fail(`unit ${unit.id} memory.mustRemember must contain at most 3 items`);
  }

  validateEvidenceSourceIds(unit, sourceIds);
  validateHighRisk(unit, sourceById);
  validateMap(unit);
  validateDecisions(unit);
}

async function loadRecords(paths) {
  const records = [];
  for (const path of paths) {
    const value = await readJson(path);
    if (Array.isArray(value)) records.push(...value);
    else records.push(value);
  }
  return records;
}

async function main() {
  const [sourceArg, unitArg] = process.argv.slice(2);
  const sourcePaths = sourceArg
    ? await collectJsonFiles(resolve(sourceArg))
    : await collectJsonFiles(resolve("content/sources"));
  const unitPaths = unitArg
    ? await collectJsonFiles(resolve(unitArg))
    : await collectJsonFiles(resolve("content/knowledge"));

  const sources = await loadRecords(sourcePaths);
  const units = await loadRecords(unitPaths);
  const sourceIds = new Set();
  const sourceById = new Map();
  const unitIds = new Set();

  for (const source of sources) {
    validateSource(source, sourceIds);
    sourceById.set(source.id, source);
  }
  for (const unit of units) validateUnit(unit, sourceIds, unitIds, sourceById);

  process.stdout.write(`content-intelligence validation PASS: ${sources.length} source(s), ${units.length} unit(s)\n`);
}

main().catch((error) => {
  process.stderr.write(`content-intelligence validation FAIL: ${error.message}\n`);
  process.exitCode = 1;
});

import assert from "node:assert/strict";
import { mkdtemp, readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import test from "node:test";

const files = [
  "wrangler.cloudflare.preview.example.jsonc",
  "scripts/prepare-cloudflare-preview.mjs",
  "scripts/validate-cloudflare-build-artifact.mjs",
  ".github/workflows/deploy-preview.yml",
  "vite.config.ts",
  "lib/control-auth.server.ts",
  "app/api/control/status/route.ts",
];
const root = new URL("../", import.meta.url);
const validator = new URL("../scripts/validate-cloudflare-preview.mjs", import.meta.url);

async function validateFixture(changeWorkflow = (source) => source) {
  const directory = await mkdtemp(join(tmpdir(), "ru-life-preview-gate-"));
  try {
    for (const file of files) {
      const target = join(directory, file);
      await mkdir(dirname(target), { recursive: true });
      let source = await readFile(new URL(file, root), "utf8");
      if (file.endsWith("deploy-preview.yml")) source = changeWorkflow(source);
      await writeFile(target, source);
    }
    return spawnSync(process.execPath, [validator.pathname], { cwd: directory, encoding: "utf8" });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("preview validator accepts the current manual standalone workflow", async () => {
  const result = await validateFixture();
  assert.equal(result.status, 0, result.stderr);
});

test("preview validator rejects a workflow that omits artifact verification", async () => {
  const result = await validateFixture((source) => source.replaceAll("npm run cloudflare:artifact:check", "echo artifact check omitted"));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /artifact:check/);
});

test("preview validator rejects build config selected before materialization", async () => {
  const result = await validateFixture((source) => source.replace("    env:\n", "    env:\n      CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH: wrangler.cloudflare.preview.jsonc\n"));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /job env/);
});

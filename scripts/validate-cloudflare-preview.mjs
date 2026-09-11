import fs from "node:fs";

const requiredFiles = [
  "wrangler.cloudflare.preview.example.jsonc",
  "scripts/prepare-cloudflare-preview.mjs",
  "scripts/validate-cloudflare-build-artifact.mjs",
  ".github/workflows/deploy-preview.yml",
  "lib/control-auth.server.ts",
];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Thiếu RU_LIFE Cloudflare preview scaffold: ${file}`);
}

const template = fs.readFileSync("wrangler.cloudflare.preview.example.jsonc", "utf8");
const prepare = fs.readFileSync("scripts/prepare-cloudflare-preview.mjs", "utf8");
const artifact = fs.readFileSync("scripts/validate-cloudflare-build-artifact.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/deploy-preview.yml", "utf8");
const vite = fs.readFileSync("vite.config.ts", "utf8");
const auth = fs.readFileSync("lib/control-auth.server.ts", "utf8");
const status = fs.readFileSync("app/api/control/status/route.ts", "utf8");

for (const token of [
  '"name": "ru-life-preview"',
  '"binding": "DB"',
  '"database_name": "ru-life-preview-db"',
  '"binding": "ASSETS"',
  '"binding": "IMAGES"',
  '__RU_LIFE_PREVIEW_D1_DATABASE_ID__',
  '__APPLICATION_MANAGEMENT_PREVIEW_ORIGIN__',
]) {
  if (!template.includes(token)) throw new Error(`RU preview template thiếu: ${token}`);
}
if (template.includes('"database_name": "ru-life-local"')) throw new Error("Preview không được dùng D1 local.");
if (template.includes('00000000-0000-0000-0000-000000000001')) throw new Error("Preview template không được chứa local D1 placeholder ID.");
if (!prepare.includes("RU_LIFE_PREVIEW_D1_DATABASE_ID") || !prepare.includes("RU_LIFE_PRODUCTION_D1_DATABASE_ID")) {
  throw new Error("Prepare script thiếu guard preview/production D1.");
}
if (!prepare.includes(".chatgpt.site")) throw new Error("Prepare script phải chặn ChatGPT Sites origin trong preview mới.");
if (!vite.includes("CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH")) throw new Error("Vite chưa hỗ trợ preview config path.");

for (const marker of ["redirect.configPath", "RU_LIFE_PREVIEW_D1_DATABASE_ID", "RU_LIFE_PRODUCTION_D1_DATABASE_ID", "ru-life-preview-db", "RU_LIFE_DEPLOYMENT_CHANNEL"]) {
  if (!artifact.includes(marker)) throw new Error(`Generated artifact validator thiếu guard: ${marker}`);
}

if (!workflow.includes("workflow_dispatch")) throw new Error("RU preview deploy phải manual-only.");
if (/\n\s*push\s*:/.test(workflow)) throw new Error("RU preview chưa được auto-deploy theo push.");
for (const token of ["DEPLOY_PREVIEW", "RU_LIFE_PREVIEW_D1_DATABASE_ID", "RU_LIFE_CONTROL_SERVICE_SECRET", "ru-life-preview-db --remote", "npm run cloudflare:artifact:check", "wrangler deploy"]) {
  if (!workflow.includes(token)) throw new Error(`RU preview workflow thiếu: ${token}`);
}
if (workflow.includes("ru-life-local --remote")) throw new Error("RU preview tuyệt đối không migrate local database qua remote.");
const jobEnvSection = workflow.split("steps:")[0] ?? "";
if (jobEnvSection.includes("CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH")) {
  throw new Error("Không được chọn preview Wrangler config ở job env trước khi file được materialize.");
}
const materializeIndex = workflow.indexOf("Materialize isolated preview config");
const previewBuildIndex = workflow.indexOf("Build with Cloudflare preview bindings");
const scopedConfigIndex = workflow.indexOf("CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH", materializeIndex);
if (materializeIndex < 0 || previewBuildIndex < materializeIndex || scopedConfigIndex < materializeIndex || scopedConfigIndex > previewBuildIndex + 250) {
  throw new Error("Preview Wrangler config chỉ được scope vào build sau bước materialize.");
}
if (workflow.includes("grep -R") && workflow.includes(".wrangler/deploy/config.json")) {
  throw new Error("Workflow không được grep redirect file như generated config; phải dùng artifact validator follow configPath.");
}

for (const forbidden of ["PRIMARY_CONTROL_CENTER_ORIGIN", "LEGACY_CONTROL_CENTER_ORIGIN", "quan-ly-hoc-tap.dinhnam3391.chatgpt.site", "learning-management.boiech-ai.workers.dev"]) {
  if (auth.includes(forbidden)) throw new Error(`Control auth còn fallback legacy: ${forbidden}`);
}
for (const required of ["APPLICATION_MANAGEMENT_ORIGIN", "CONTROL_CENTER_ORIGIN_UNCONFIGURED", "trustedControlOrigin", "normalizedControlOrigin"]) {
  if (!auth.includes(required)) throw new Error(`Control auth thiếu fail-closed origin guard: ${required}`);
}
if (!status.includes("RU_LIFE_BUILD_REVISION") || !status.includes("RU_LIFE_DEPLOYMENT_CHANNEL")) {
  throw new Error("Control status chưa công bố deployment revision/channel.");
}

console.log("RU_LIFE Cloudflare preview scaffold PASS: manual-only, isolated D1, exact control origin, generated artifact verified.");

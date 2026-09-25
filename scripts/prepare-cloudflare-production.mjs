import fs from "node:fs";

const TEMPLATE = "wrangler.cloudflare.production.example.jsonc";
const TARGET = "wrangler.cloudflare.production.jsonc";

function required(name) {
  const value = String(process.env[name] ?? "").trim();
  if (!value) throw new Error(`${name} chưa được cấu hình.`);
  return value;
}
function d1Uuid(name) {
  const value = required(name).toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error(`${name} không đúng định dạng UUID D1.`);
  }
  return value;
}
function httpsOrigin(name) {
  const raw = required(name);
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error(`${name} phải là HTTPS origin thuần.`);
  }
  if (url.hostname.endsWith(".chatgpt.site")) throw new Error(`${name} không được trỏ về ChatGPT Sites.`);
  return url.origin;
}
const revision = String(process.env.GITHUB_SHA ?? process.env.RU_LIFE_BUILD_REVISION ?? "").trim();
if (!/^[A-Za-z0-9._-]{7,80}$/.test(revision)) throw new Error("RU_LIFE_BUILD_REVISION/GITHUB_SHA không hợp lệ.");
const productionId = d1Uuid("RU_LIFE_PRODUCTION_D1_DATABASE_ID");
const previewId = d1Uuid("RU_LIFE_PREVIEW_D1_DATABASE_ID");
if (productionId === previewId) throw new Error("Production không được dùng chung D1 với Preview.");
const managerOrigin = httpsOrigin("APPLICATION_MANAGEMENT_PRODUCTION_ORIGIN");
const rendered = fs.readFileSync(TEMPLATE, "utf8")
  .replace("__RU_LIFE_PRODUCTION_D1_DATABASE_ID__", productionId)
  .replace("__APPLICATION_MANAGEMENT_PRODUCTION_ORIGIN__", managerOrigin)
  .replace("__RU_LIFE_BUILD_REVISION__", revision);
if (/__[A-Z0-9_]+__/.test(rendered)) throw new Error("Production config vẫn còn placeholder.");
fs.writeFileSync(TARGET, rendered, { mode: 0o600 });
console.log(`Prepared ${TARGET} for revision ${revision}.`);

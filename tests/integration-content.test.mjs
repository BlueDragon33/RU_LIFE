import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("integration module has four real structured content entries", async () => {
  const content = await source("../lib/integration-content.ts");
  assert.match(content, /"daily-russian":\s*\{/);
  assert.match(content, /"school-russian":\s*\{/);
  assert.match(content, /"culture-etiquette":\s*\{/);
  assert.match(content, /"personal-notes":\s*\{/);
  assert.match(content, /updatedAt:\s*checkedAt/);
  assert.match(content, /freshness:\s*"stable-guidance"/);
});

test("daily and school Russian content contains reusable situational phrases rather than isolated vocabulary", async () => {
  const content = await source("../lib/integration-content.ts");
  assert.match(content, /Здравствуйте/);
  assert.match(content, /Говорите, пожалуйста, медленнее/);
  assert.match(content, /Можно уточнить требования к заданию/);
  assert.match(content, /Когда нужно сдать работу/);
  assert.match(content, /В какой аудитории будет занятие/);
});

test("culture guidance explicitly avoids stereotyping Russians as a fixed personality type", async () => {
  const content = await source("../lib/integration-content.ts");
  assert.match(content, /không được biến thành các 'luật tính cách người Nga'/i);
  assert.match(content, /không đại diện cho toàn bộ nước Nga/i);
  assert.match(content, /khác biệt ngôn ngữ, khác biệt quy trình và khác biệt ứng xử cá nhân/i);
});

test("personal notes warn against storing credentials and sensitive identifiers", async () => {
  const content = await source("../lib/integration-content.ts");
  assert.match(content, /mật khẩu, mã OTP, mã khôi phục tài khoản/);
  assert.match(content, /thông tin thẻ thanh toán/);
  assert.match(content, /số hộ chiếu\/visa/);
  assert.match(content, /lưu cục bộ trên thiết bị/);
});

test("content resolver exposes integration content", async () => {
  const resolver = await source("../lib/content-resolver.ts");
  assert.match(resolver, /integrationContent/);
  assert.match(resolver, /moduleSlug === "integration"/);
});

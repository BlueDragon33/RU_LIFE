import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("premium interface is loaded only inside the protected RU_LIFE workspace", async () => {
  const root = await source("../app/layout.tsx");
  const layout = await source("../app/app/layout.tsx");
  const css = await source("../app/premium-theme.css");
  assert.doesNotMatch(root, /premium-theme\.css/);
  assert.match(layout, /readDeviceSession\(\)/);
  assert.match(layout, /import "\.\.\/premium-theme\.css"/);
  assert.match(css, /\.workspace-shell/);
  assert.match(css, /\.workspace-side/);
  assert.match(css, /\.workspace-topbar/);
});

test("flagship dashboard keeps the RU_LIFE product structure from the approved concept", async () => {
  const page = await source("../app/app/page.tsx");
  const nav = await source("../components/workspace-navigation.tsx");
  assert.match(page, /Dashboard Hòa nhập Nga/);
  assert.match(page, /Добро пожаловать!/);
  assert.match(page, /KHÁM PHÁ CÁC CHỦ ĐỀ CHÍNH/);
  assert.match(page, /module-icon/);
  assert.match(nav, /Tổng quan/);
  assert.match(nav, /moduleIcon/);
});

test("premium theme preserves desktop tablet and phone layouts", async () => {
  const css = await source("../app/premium-theme.css");
  assert.match(css, /grid-template-columns: 276px minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /\.module-grid \{ grid-template-columns: repeat\(5/);
  assert.match(css, /\.workspace-overview \{ grid-template-columns: repeat\(2/);
});

test("visual redesign does not add management APIs to personal UI", async () => {
  const page = await source("../app/app/page.tsx");
  const css = await source("../app/premium-theme.css");
  assert.doesNotMatch(`${page}\n${css}`, /api\/apps\/hoa-nhap-nga\/control|medical-control|managed_app_devices/);
});

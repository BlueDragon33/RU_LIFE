import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("public RU_LIFE access gate uses the same flagship product language", async () => {
  const rootLayout = await source("../app/layout.tsx");
  const publicPage = await source("../app/page.tsx");
  const publicCss = await source("../app/public-premium.css");
  const gate = await source("../components/device-access-gate.tsx");

  assert.match(rootLayout, /public-premium\.css/);
  assert.match(publicPage, /ДОБРО ПОЖАЛОВАТЬ/);
  assert.match(publicPage, /landing-value-grid/);
  assert.match(publicPage, /không có màn hình đăng nhập trực tiếp/i);
  assert.match(gate, /premium-gate/);
  assert.match(gate, /Quyền thiết bị/);
  assert.match(publicCss, /\.premium-landing/);
  assert.match(publicCss, /\.premium-gate/);
  assert.match(publicCss, /@media \(max-width: 760px\)/);
});

test("module and topic routes keep the premium deep experience inside the protected workspace", async () => {
  const layout = await source("../app/app/layout.tsx");
  const modulePage = await source("../app/app/[module]/page.tsx");
  const topicPage = await source("../app/app/[module]/[topic]/page.tsx");
  const css = await source("../app/premium-deep.css");

  assert.match(layout, /readDeviceSession\(\)/);
  assert.match(layout, /premium-deep\.css/);
  assert.match(modulePage, /module-hero-panel/);
  assert.match(modulePage, /premium-topic-card/);
  assert.match(topicPage, /topic-hero-panel/);
  assert.match(topicPage, /premium-topic-side/);
  assert.match(css, /\.module-hero-panel/);
  assert.match(css, /\.premium-topic-grid/);
  assert.match(css, /@media \(max-width: 620px\)/);
});

test("visual completion does not couple personal content to Application Management data", async () => {
  const modulePage = await source("../app/app/[module]/page.tsx");
  const topicPage = await source("../app/app/[module]/[topic]/page.tsx");
  const publicCss = await source("../app/public-premium.css");
  const deepCss = await source("../app/premium-deep.css");
  assert.doesNotMatch(`${modulePage}\n${topicPage}\n${publicCss}\n${deepCss}`, /managed_app_devices|control_devices|medical-control|api\/apps\/hoa-nhap-nga\/control/);
});

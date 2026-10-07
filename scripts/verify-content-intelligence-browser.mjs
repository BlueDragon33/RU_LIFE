import { chromium } from "playwright";

const baseURL = process.env.RU_LIFE_E2E_BASE_URL || "http://127.0.0.1:3000";
const routes = [
  "/app/prepare/documents",
  "/app/prepare/luggage",
  "/app/prepare/money-connectivity",
  "/app/prepare/arrival-plan",
  "/app/daily-life/housing",
  "/app/daily-life/transport",
  "/app/daily-life/shopping-services",
  "/app/daily-life/safety",
  "/app/study-procedures/enrollment",
  "/app/study-procedures/migration-registration",
  "/app/study-procedures/study-plan",
  "/app/study-procedures/important-contacts",
  "/app/health/insurance",
  "/app/health/care-navigation",
  "/app/health/medicine-reference",
  "/app/health/emergency",
  "/app/integration/daily-russian",
  "/app/integration/school-russian",
  "/app/integration/culture-etiquette",
  "/app/integration/personal-notes",
];
const representativeRoute = "/app/study-procedures/migration-registration";
const url = baseURL + representativeRoute;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function visible(locator, label) {
  await locator.waitFor({ state: "visible", timeout: 15000 });
  assert(await locator.isVisible(), `${label} must be visible`);
}

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  for (const route of routes) {
    const routeResponse = await page.goto(baseURL + route, { waitUntil: "networkidle", timeout: 30000 });
    assert(routeResponse && routeResponse.ok(), `${route} must load successfully: ${routeResponse?.status()}`);
    await visible(page.locator(".knowledge-experience"), `${route} knowledge experience`);
    await visible(page.locator(".topic-progress-panel"), `${route} personal progress sidebar`);

    const actionMode = page.getByRole("button", { name: "Tôi cần làm gì?" });
    const learnMode = page.getByRole("button", { name: "Tôi muốn hiểu" });
    const fullMode = page.getByRole("button", { name: "Cho tôi xem toàn bộ" });
    await visible(actionMode, `${route} action mode`);
    await visible(learnMode, `${route} learn mode`);
    await visible(fullMode, `${route} full mode`);
    assert(await actionMode.getAttribute("aria-pressed") === "true", `${route} action mode must be default`);

    await learnMode.click();
    await visible(page.locator(".knowledge-learning-view"), `${route} learning view`);
    await fullMode.click();
    await visible(page.locator(".knowledge-full-view"), `${route} full view`);
    await actionMode.click();
    await visible(page.locator(".knowledge-action-view"), `${route} action view`);
  }

  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  assert(response && response.ok(), `route must load successfully: ${response?.status()}`);

  await visible(page.locator(".knowledge-experience"), "knowledge experience");
  await visible(page.getByRole("button", { name: "Tôi cần làm gì?" }), "action mode button");
  await visible(page.getByRole("button", { name: "Tôi muốn hiểu" }), "learn mode button");
  await visible(page.getByRole("button", { name: "Cho tôi xem toàn bộ" }), "full mode button");
  assert(await page.getByRole("button", { name: "Tôi cần làm gì?" }).getAttribute("aria-pressed") === "true", "action mode must be default");

  await visible(page.locator(".knowledge-next-action"), "next action");
  await visible(page.locator(".knowledge-risk-panel"), "risk panel");
  await visible(page.locator(".topic-progress-panel"), "personal progress sidebar");

  await page.getByRole("button", { name: "Tôi muốn hiểu" }).click();
  await visible(page.locator(".knowledge-learning-view"), "learning view");
  assert(await page.getByRole("button", { name: "Tôi muốn hiểu" }).getAttribute("aria-pressed") === "true", "learn mode must become active");

  await page.getByRole("button", { name: "Cho tôi xem toàn bộ" }).click();
  await visible(page.locator(".knowledge-full-view"), "full view");
  await visible(page.locator(".knowledge-source-list"), "source list");
  await visible(page.locator(".knowledge-provenance"), "provenance block");
  assert((await page.locator(".knowledge-provenance").innerText()).includes("2026-10-07"), "full view must show verified date");

  await page.getByRole("button", { name: "Tôi cần làm gì?" }).click();
  const mapButtons = page.locator(".knowledge-map-nodes button");
  assert(await mapButtons.count() >= 3, "map must expose at least three interactive nodes");
  const secondMapButton = mapButtons.nth(1);
  await secondMapButton.focus();
  await page.keyboard.press("Enter");
  assert(await secondMapButton.getAttribute("aria-pressed") === "true", "map node must be keyboard selectable");
  await visible(page.locator(".knowledge-map-detail"), "map detail");
  await visible(page.locator(".knowledge-outline"), "outline fallback");

  const decisionButton = page.locator(".knowledge-decision-options button").first();
  await visible(decisionButton, "decision option");
  await decisionButton.focus();
  await page.keyboard.press("Enter");
  assert(await decisionButton.getAttribute("aria-pressed") === "true", "decision option must be keyboard selectable");
  await visible(page.locator(".knowledge-decision-result"), "decision result");

  const viewports = [
    { width: 1440, height: 900, label: "desktop" },
    { width: 900, height: 1000, label: "tablet" },
    { width: 390, height: 844, label: "phone" },
  ];
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    assert(dimensions.scrollWidth <= dimensions.innerWidth + 1, `${viewport.label} must not horizontally overflow: ${dimensions.scrollWidth} > ${dimensions.innerWidth}`);
    await visible(page.locator(".knowledge-mode-selector"), `${viewport.label} mode selector`);
    await visible(page.locator(".knowledge-outline"), `${viewport.label} outline fallback`);
  }

  const emergencyRoute = "/app/health/emergency";
  const emergencyURL = baseURL + emergencyRoute;
  await page.setViewportSize({ width: 1440, height: 900 });
  let emergencyResponse = await page.goto(emergencyURL, { waitUntil: "networkidle", timeout: 30000 });
  assert(emergencyResponse && emergencyResponse.ok(), `emergency route must load successfully: ${emergencyResponse?.status()}`);
  await visible(page.locator(".knowledge-experience"), "emergency knowledge experience");
  await visible(page.locator(".knowledge-risk-group.do-not"), "emergency do-not warning");
  await visible(page.locator(".knowledge-risk-group.critical"), "emergency critical warning");
  assert((await page.locator(".knowledge-next-action").innerText()).includes("112"), "emergency next action must keep 112 prominent");
  assert((await page.locator(".knowledge-next-action").innerText()).includes("103"), "emergency next action must keep 103 prominent");
  await page.getByRole("button", { name: "Tôi muốn hiểu" }).click();
  await visible(page.locator(".knowledge-learning-view"), "emergency learning view");
  await page.getByRole("button", { name: "Cho tôi xem toàn bộ" }).click();
  await visible(page.locator(".knowledge-full-view"), "emergency full view");
  await visible(page.locator(".knowledge-source-list"), "emergency source list");
  await page.getByRole("button", { name: "Tôi cần làm gì?" }).click();
  const emergencyMapButton = page.locator(".knowledge-map-nodes button").nth(1);
  await emergencyMapButton.focus();
  await page.keyboard.press("Enter");
  assert(await emergencyMapButton.getAttribute("aria-pressed") === "true", "emergency map node must be keyboard selectable");
  await visible(page.locator(".knowledge-outline"), "emergency outline fallback");
  await page.setViewportSize({ width: 390, height: 844 });
  emergencyResponse = await page.goto(emergencyURL, { waitUntil: "networkidle", timeout: 30000 });
  assert(emergencyResponse && emergencyResponse.ok(), "emergency phone route must load");
  const emergencyDimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  assert(emergencyDimensions.scrollWidth <= emergencyDimensions.innerWidth + 1, `emergency phone must not horizontally overflow: ${emergencyDimensions.scrollWidth} > ${emergencyDimensions.innerWidth}`);
  await visible(page.locator(".topic-progress-panel"), "emergency personal progress sidebar");

  const sw = await page.request.get(baseURL + "/sw.js");
  assert(sw.ok(), "service worker must return HTTP 200");
  assert((await sw.text()).includes("ru-life-shell-v2"), "service worker must be v2");

  const stylesheetHrefs = await page.locator('link[rel="stylesheet"]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("href")).filter(Boolean)
  );
  assert(stylesheetHrefs.length > 0, "page must have at least one stylesheet");
  for (const href of stylesheetHrefs) {
    const css = await page.request.get(new URL(href, baseURL).toString());
    assert(css.ok(), `stylesheet must return HTTP 200: ${href}`);
    const type = css.headers()["content-type"] || "";
    assert(type.includes("text/css"), `stylesheet must be text/css: ${href} → ${type}`);
  }

  assert(pageErrors.length === 0, `page errors: ${pageErrors.join(" | ")}`);
  const meaningfulConsoleErrors = consoleErrors.filter((line) => !/favicon/i.test(line));
  assert(meaningfulConsoleErrors.length === 0, `console errors: ${meaningfulConsoleErrors.join(" | ")}`);

  console.log(JSON.stringify({
    status: "PASS",
    routesVerified: routes.length,
    representativeRoute,
    emergencyRoute,
    modes: 3,
    mapNodes: await mapButtons.count(),
    viewports: viewports.map((entry) => entry.label),
    stylesheetCount: stylesheetHrefs.length,
    serviceWorker: "ru-life-shell-v2",
  }));
} finally {
  await browser.close();
}

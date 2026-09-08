"use client";

export type ManagedDeviceStatus = "pending" | "approved" | "blocked";

export type ManagedDevice = {
  appId: "hoa-nhap-nga";
  deviceId: string;
  deviceCode: string;
  status: ManagedDeviceStatus;
  label: string | null;
  deviceClass: "computer" | "phone" | "tablet" | "unknown";
  osName: string;
  browserName: string;
  modelHint: string | null;
  screen: string | null;
  createdAt: string;
  approvedAt: string | null;
  blockedAt: string | null;
  lastSeenAt: string;
  approvedBy: string | null;
  active: boolean;
};

type DeviceKeyRecord = { id: "p256"; privateKey: CryptoKey; publicKey: CryptoKey };
type GatewayErrorBody = { error?: string; code?: string; device?: ManagedDevice };
type ClientHintValues = { platform?: string; model?: string; mobile?: boolean; architecture?: string; bitness?: string };
type NavigatorWithUAData = Navigator & {
  userAgentData?: {
    mobile?: boolean;
    platform?: string;
    getHighEntropyValues?: (hints: string[]) => Promise<ClientHintValues>;
  };
};

export class DeviceGatewayError extends Error {
  code: string;
  device?: ManagedDevice;
  constructor(message: string, code = "DEVICE_GATEWAY_ERROR", device?: ManagedDevice) {
    super(message);
    this.code = code;
    this.device = device;
  }
}

const DB_NAME = "ru-life-device-access";
const STORE_NAME = "crypto";
const RECORD_KEY = "p256";
const DEFAULT_APPLICATION_MANAGEMENT = "https://learning-management.boiech-ai.workers.dev";

function applicationManagementBaseUrl() {
  return (process.env.NEXT_PUBLIC_APPLICATION_MANAGEMENT_BASE_URL || DEFAULT_APPLICATION_MANAGEMENT).replace(/\/$/, "");
}

function gatewayUrl() {
  return `${applicationManagementBaseUrl()}/api/apps/hoa-nhap-nga/device`;
}

function base64Url(bytes: ArrayBuffer) {
  const view = new Uint8Array(bytes);
  let binary = "";
  view.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Không thể mở kho khóa thiết bị."));
  });
}

async function readKeyRecord(database: IDBDatabase) {
  return new Promise<DeviceKeyRecord | undefined>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(RECORD_KEY);
    request.onsuccess = () => resolve(request.result as DeviceKeyRecord | undefined);
    request.onerror = () => reject(request.error || new Error("Không thể đọc khóa thiết bị."));
  });
}

async function writeKeyRecord(database: IDBDatabase, record: DeviceKeyRecord) {
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Không thể lưu khóa thiết bị."));
  });
}

export async function getOrCreateDeviceKeyPair() {
  if (!window.isSecureContext || !window.crypto?.subtle || !window.indexedDB) {
    throw new DeviceGatewayError("Thiết bị cần mở Hòa nhập Nga bằng HTTPS để tạo khóa bảo mật.", "SECURE_CONTEXT_REQUIRED");
  }
  const database = await openDatabase();
  try {
    const existing = await readKeyRecord(database);
    if (existing?.privateKey && existing?.publicKey) return existing;
    const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, ["sign", "verify"]);
    const record: DeviceKeyRecord = { id: RECORD_KEY, privateKey: pair.privateKey, publicKey: pair.publicKey };
    await writeKeyRecord(database, record);
    return record;
  } finally {
    database.close();
  }
}

function detectBrowserName(ua: string) {
  if (/Edg\//i.test(ua)) return "Microsoft Edge";
  if (/OPR\//i.test(ua)) return "Opera";
  if (/Chrome\//i.test(ua) || /CriOS\//i.test(ua)) return "Google Chrome";
  if (/Firefox\//i.test(ua) || /FxiOS\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua)) return "Safari";
  return "Unknown";
}

function detectOsName(ua: string, platformHint: string) {
  const platform = platformHint.toLowerCase();
  if (/windows nt/i.test(ua) || platform.includes("windows")) return "Windows";
  if (/cros/i.test(ua) || platform.includes("chrome os")) return "ChromeOS";
  if (/iphone|ipad|ipod/i.test(ua) || platform.includes("ios")) return "iOS/iPadOS";
  if (/android/i.test(ua) || platform.includes("android")) return "Android";
  if (/macintosh|mac os x/i.test(ua) || platform.includes("mac")) return "macOS";
  if (/linux/i.test(ua) || platform.includes("linux")) return "Linux";
  return platformHint || "Unknown";
}

function classifyDevice(input: {
  ua: string; mobileHint: boolean | undefined; platformHint: string; modelHint: string;
  touchPoints: number; coarsePointer: boolean; screenWidth: number; screenHeight: number;
}) {
  const { ua, mobileHint, platformHint, modelHint, touchPoints, coarsePointer, screenWidth, screenHeight } = input;
  const shortestSide = Math.min(screenWidth, screenHeight);
  const platform = platformHint.toLowerCase();
  const model = modelHint.toLowerCase();
  if (/ipad/i.test(ua) || (platform.includes("mac") && touchPoints > 1)) return { deviceClass: "tablet" as const, confidence: 98, source: "ipad-signal" };
  if (/iphone|ipod/i.test(ua)) return { deviceClass: "phone" as const, confidence: 99, source: "iphone-ua" };
  if (/android/i.test(ua)) {
    if (/mobile/i.test(ua) || mobileHint === true) return { deviceClass: "phone" as const, confidence: 96, source: "android-mobile" };
    return { deviceClass: "tablet" as const, confidence: 94, source: "android-tablet" };
  }
  if (model.includes("ipad") || model.includes("tablet")) return { deviceClass: "tablet" as const, confidence: 92, source: "model" };
  if (model.includes("iphone") || mobileHint === true) return { deviceClass: "phone" as const, confidence: 90, source: "client-hints-mobile" };
  if (/windows|macintosh|cros|linux/i.test(ua) || /windows|mac|chrome os|linux/.test(platform)) return { deviceClass: "computer" as const, confidence: 94, source: "desktop-platform" };
  if (coarsePointer && touchPoints > 0) {
    if (shortestSide >= 600) return { deviceClass: "tablet" as const, confidence: 72, source: "touch-screen-size" };
    return { deviceClass: "phone" as const, confidence: 70, source: "touch-screen-size" };
  }
  return { deviceClass: "unknown" as const, confidence: 35, source: "insufficient-signals" };
}

async function browserProfile() {
  const ua = navigator.userAgent;
  const nav = navigator as NavigatorWithUAData;
  let highEntropy: ClientHintValues = {};
  try {
    if (nav.userAgentData?.getHighEntropyValues) {
      highEntropy = await nav.userAgentData.getHighEntropyValues(["platform", "model", "mobile", "architecture", "bitness"]);
    }
  } catch { highEntropy = {}; }

  const platformHint = highEntropy.platform || nav.userAgentData?.platform || navigator.platform || "";
  const mobileHint = typeof highEntropy.mobile === "boolean" ? highEntropy.mobile : nav.userAgentData?.mobile;
  let modelHint = (highEntropy.model || "").trim();
  if (!modelHint) {
    if (/iPhone/i.test(ua)) modelHint = "iPhone";
    else if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) modelHint = "iPad";
    else modelHint = ua.match(/Android[^;]*;\s*([^;)]+?)(?:\s+Build\/|;|\))/i)?.[1]?.trim() || "";
  }

  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const classification = classifyDevice({ ua, mobileHint, platformHint, modelHint, touchPoints: navigator.maxTouchPoints || 0, coarsePointer, screenWidth: window.screen.width, screenHeight: window.screen.height });

  return {
    userAgent: ua.slice(0, 500),
    deviceClass: classification.deviceClass,
    classificationConfidence: classification.confidence,
    classificationSource: classification.source,
    osName: detectOsName(ua, platformHint),
    browserName: detectBrowserName(ua),
    platformHint: platformHint.slice(0, 80),
    modelHint: modelHint.slice(0, 100),
    screen: `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio || 1}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    touchPoints: navigator.maxTouchPoints || 0,
    coarsePointer,
    mobileHint: mobileHint ?? null,
    architecture: (highEntropy.architecture || "").slice(0, 30),
    bitness: (highEntropy.bitness || "").slice(0, 10),
    classifierVersion: 2,
  };
}

async function gatewayPost<T>(payload: Record<string, unknown>) {
  let response: Response;
  try {
    response = await fetch(gatewayUrl(), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), cache: "no-store" });
  } catch {
    throw new DeviceGatewayError("Không thể kết nối Application Management. Kiểm tra mạng rồi thử lại.", "APPLICATION_MANAGEMENT_UNREACHABLE");
  }
  const body = await response.json().catch(() => ({})) as T & GatewayErrorBody;
  if (!response.ok) throw new DeviceGatewayError(body.error || "Application Management từ chối yêu cầu.", body.code || "APPLICATION_MANAGEMENT_REJECTED", body.device);
  return body;
}

export async function registerDevice() {
  const keys = await getOrCreateDeviceKeyPair();
  const publicKey = await crypto.subtle.exportKey("jwk", keys.publicKey);
  const profile = await browserProfile();
  const result = await gatewayPost<{ device: ManagedDevice }>({ action: "register", publicKey, profile });
  return { keys, device: result.device };
}

async function signChallenge(privateKey: CryptoKey, deviceId: string, challenge: string) {
  const message = new TextEncoder().encode(`managed-app:hoa-nhap-nga:${deviceId}:${challenge}`);
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, message);
  return base64Url(signature);
}

export async function authorizeDevice(keys: DeviceKeyRecord, device: ManagedDevice) {
  if (device.status !== "approved") throw new DeviceGatewayError(
    device.status === "blocked" ? "Thiết bị đã bị Application Management khóa." : "Thiết bị đang chờ Application Management cấp quyền.",
    device.status === "blocked" ? "DEVICE_BLOCKED" : "DEVICE_PENDING",
    device,
  );
  const proof = await gatewayPost<{ challenge: string; expiresAt: number; device: ManagedDevice }>({ action: "challenge", deviceId: device.deviceId });
  const signature = await signChallenge(keys.privateKey, device.deviceId, proof.challenge);
  return gatewayPost<{ accessToken: string; expiresAt: number; device: ManagedDevice }>({ action: "authorize", deviceId: device.deviceId, challenge: proof.challenge, signature });
}

export async function establishLocalSession(accessToken: string) {
  const response = await fetch("/api/device/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ accessToken }), cache: "no-store" });
  const body = await response.json().catch(() => ({})) as { ok?: boolean; error?: string };
  if (!response.ok || !body.ok) throw new DeviceGatewayError(body.error || "Không thể tạo phiên Hòa nhập Nga.", "LOCAL_SESSION_FAILED");
}

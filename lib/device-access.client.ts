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

type DeviceKeyRecord = {
  id: "p256";
  privateKey: CryptoKey;
  publicKey: CryptoKey;
};

type GatewayErrorBody = {
  error?: string;
  code?: string;
  device?: ManagedDevice;
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
const DEFAULT_CONTROL_CENTER = "https://quan-ly-hoc-tap.dinhnam3391.chatgpt.site";

function controlCenterBaseUrl() {
  return (process.env.NEXT_PUBLIC_CONTROL_CENTER_BASE_URL || DEFAULT_CONTROL_CENTER).replace(/\/$/, "");
}

function gatewayUrl() {
  return `${controlCenterBaseUrl()}/api/apps/hoa-nhap-nga/device`;
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

    const pair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign", "verify"],
    );
    const record: DeviceKeyRecord = { id: RECORD_KEY, privateKey: pair.privateKey, publicKey: pair.publicKey };
    await writeKeyRecord(database, record);
    return record;
  } finally {
    database.close();
  }
}

function browserProfile() {
  const ua = navigator.userAgent;
  let deviceClass: ManagedDevice["deviceClass"] = "unknown";
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) deviceClass = "tablet";
  else if (/iPhone|Android.*Mobile|Mobile/i.test(ua)) deviceClass = "phone";
  else if (/Windows|Macintosh|CrOS|Linux/i.test(ua)) deviceClass = "computer";

  let modelHint = "";
  if (/iPhone/i.test(ua)) modelHint = "iPhone";
  else if (/iPad/i.test(ua)) modelHint = "iPad";
  else modelHint = ua.match(/Android[^;]*;\s*([^;)]+?)(?:\s+Build\/|;|\))/i)?.[1]?.trim() || "";

  return {
    deviceClass,
    modelHint: modelHint.slice(0, 100),
    screen: `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio || 1}`,
  };
}

async function gatewayPost<T>(payload: Record<string, unknown>) {
  let response: Response;
  try {
    response = await fetch(gatewayUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    throw new DeviceGatewayError("Không thể kết nối Trung tâm quản trị. Kiểm tra mạng rồi thử lại.", "CONTROL_CENTER_UNREACHABLE");
  }

  const body = await response.json().catch(() => ({})) as T & GatewayErrorBody;
  if (!response.ok) throw new DeviceGatewayError(body.error || "Trung tâm quản trị từ chối yêu cầu.", body.code || "CONTROL_CENTER_REJECTED", body.device);
  return body;
}

export async function registerDevice() {
  const keys = await getOrCreateDeviceKeyPair();
  const publicKey = await crypto.subtle.exportKey("jwk", keys.publicKey);
  const result = await gatewayPost<{ device: ManagedDevice }>({ action: "register", publicKey, profile: browserProfile() });
  return { keys, device: result.device };
}

async function signChallenge(privateKey: CryptoKey, deviceId: string, challenge: string) {
  const message = new TextEncoder().encode(`managed-app:hoa-nhap-nga:${deviceId}:${challenge}`);
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, message);
  return base64Url(signature);
}

export async function authorizeDevice(keys: DeviceKeyRecord, device: ManagedDevice) {
  if (device.status !== "approved") throw new DeviceGatewayError(
    device.status === "blocked" ? "Thiết bị đã bị Trung tâm quản trị khóa." : "Thiết bị đang chờ Trung tâm quản trị cấp quyền.",
    device.status === "blocked" ? "DEVICE_BLOCKED" : "DEVICE_PENDING",
    device,
  );

  const proof = await gatewayPost<{ challenge: string; expiresAt: number; device: ManagedDevice }>({ action: "challenge", deviceId: device.deviceId });
  const signature = await signChallenge(keys.privateKey, device.deviceId, proof.challenge);
  return gatewayPost<{ accessToken: string; expiresAt: number; device: ManagedDevice }>({
    action: "authorize",
    deviceId: device.deviceId,
    challenge: proof.challenge,
    signature,
  });
}

export async function establishLocalSession(accessToken: string) {
  const response = await fetch("/api/device/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accessToken }),
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as { ok?: boolean; error?: string };
  if (!response.ok || !body.ok) throw new DeviceGatewayError(body.error || "Không thể tạo phiên Hòa nhập Nga.", "LOCAL_SESSION_FAILED");
}

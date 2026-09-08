export const RU_LIFE_STORAGE_ERROR_EVENT = "ru-life-storage-error";

export type LocalStorageFailureCode = "quota" | "unavailable" | "write-failed";

export type LocalStorageWriteResult =
  | { ok: true }
  | { ok: false; code: LocalStorageFailureCode; message: string };

function isQuotaError(error: unknown) {
  if (!(error instanceof DOMException)) return false;
  return error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED" || error.code === 22 || error.code === 1014;
}

function failureFrom(error: unknown): Exclude<LocalStorageWriteResult, { ok: true }> {
  if (isQuotaError(error)) return { ok: false, code: "quota", message: "Bộ nhớ trình duyệt gần đầy hoặc đã hết chỗ. Hãy xuất backup trước khi xóa dữ liệu cũ." };
  if (typeof window === "undefined") return { ok: false, code: "unavailable", message: "Bộ nhớ cục bộ không khả dụng trong môi trường hiện tại." };
  return { ok: false, code: "write-failed", message: "Không thể ghi dữ liệu cục bộ. Dữ liệu trên màn hình có thể chưa được lưu bền vững." };
}

function emitFailure(result: Exclude<LocalStorageWriteResult, { ok: true }>, key: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(RU_LIFE_STORAGE_ERROR_EVENT, { detail: { ...result, key } }));
}

export function safeSetLocalStorage(storage: Storage, key: string, value: string): LocalStorageWriteResult {
  try {
    storage.setItem(key, value);
    return { ok: true };
  } catch (error) {
    const result = failureFrom(error);
    emitFailure(result, key);
    return result;
  }
}

export function safeRemoveLocalStorage(storage: Storage, key: string): LocalStorageWriteResult {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    const result = failureFrom(error);
    emitFailure(result, key);
    return result;
  }
}

export type BrowserStorageEstimate = {
  usage: number;
  quota: number;
  ratio: number;
};

export async function estimateBrowserStorage(): Promise<BrowserStorageEstimate | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  try {
    const estimate = await navigator.storage.estimate();
    const usage = typeof estimate.usage === "number" ? estimate.usage : 0;
    const quota = typeof estimate.quota === "number" ? estimate.quota : 0;
    if (!quota) return null;
    return { usage, quota, ratio: Math.min(1, Math.max(0, usage / quota)) };
  } catch {
    return null;
  }
}

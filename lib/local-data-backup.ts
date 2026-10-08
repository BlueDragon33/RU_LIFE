import { parseStoredTopicDeadlines, RU_LIFE_DEADLINE_PREFIX } from "./deadline-storage";
import { parseStoredTopicTools, RU_LIFE_TOOLS_PREFIX } from "./personal-tools-storage";
import { parseStoredTopicProgress, RU_LIFE_PROGRESS_PREFIX } from "./progress-storage";
import { safeSetLocalStorage } from "./local-storage-safe";

export const RU_LIFE_BACKUP_SCHEMA = "ru-life-local-backup-v2";
export const RU_LIFE_BACKUP_LEGACY_SCHEMA = "ru-life-local-backup-v1";
export const RU_LIFE_BACKUP_APP = "RU_LIFE";
export const RU_LIFE_BACKUP_MAX_ENTRIES = 200;
export const RU_LIFE_BACKUP_MAX_BYTES = 2_000_000;

export type LocalDataDomain = "progress" | "tools" | "deadlines";

export type LocalBackupEntry = {
  key: string;
  value: string;
};

export type RuLifeLocalBackup = {
  schema: typeof RU_LIFE_BACKUP_SCHEMA;
  app: typeof RU_LIFE_BACKUP_APP;
  exportedAt: string;
  entries: LocalBackupEntry[];
};

export type BackupValidation =
  | { ok: true; backup: RuLifeLocalBackup; domains: Record<LocalDataDomain, number>; migratedFromLegacy: boolean }
  | { ok: false; error: string };

export type ReplacePersonalDataResult =
  | { ok: true; written: number }
  | { ok: false; rolledBack: boolean; error: string };

const prefixes: Record<LocalDataDomain, string> = {
  progress: RU_LIFE_PROGRESS_PREFIX,
  tools: RU_LIFE_TOOLS_PREFIX,
  deadlines: RU_LIFE_DEADLINE_PREFIX,
};

export function localDataDomainForKey(key: string): LocalDataDomain | null {
  for (const [domain, prefix] of Object.entries(prefixes) as Array<[LocalDataDomain, string]>) {
    if (key.startsWith(prefix)) return domain;
  }
  return null;
}

export function isRuLifePersonalKey(key: string) {
  return localDataDomainForKey(key) !== null;
}

function validDateString(value: unknown) {
  return typeof value === "string" && (!value || Number.isFinite(Date.parse(value)));
}

function validateProgressValue(raw: string, legacy = false) {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
    if (!Array.isArray(parsed.checked) || !parsed.checked.every((value) => Number.isInteger(value) && Number(value) >= 0)) return false;
    if (typeof parsed.note !== "string" || parsed.note.length > 100_000) return false;
    if (!legacy && !validDateString(parsed.updatedAt)) return false;
    if (legacy && parsed.updatedAt !== undefined && !validDateString(parsed.updatedAt)) return false;
    return true;
  } catch {
    return false;
  }
}

function validateToolsValue(raw: string, legacy = false) {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
    if (typeof parsed.favorite !== "boolean") return false;
    for (const key of ["reminderAt", "reminderNote"]) if (typeof parsed[key] !== "string") return false;
    for (const key of ["notifiedAt", "updatedAt", "topicTitle"]) {
      if (!legacy && typeof parsed[key] !== "string") return false;
      if (legacy && parsed[key] !== undefined && typeof parsed[key] !== "string") return false;
    }
    if ((parsed.reminderNote as string).length > 10_000 || (typeof parsed.topicTitle === "string" && parsed.topicTitle.length > 500)) return false;
    if (!validDateString(parsed.reminderAt)) return false;
    if (parsed.notifiedAt !== undefined && !validDateString(parsed.notifiedAt)) return false;
    if (parsed.updatedAt !== undefined && !validDateString(parsed.updatedAt)) return false;
    return true;
  } catch {
    return false;
  }
}

function validateDeadlineValue(raw: string, legacy = false) {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !Array.isArray(parsed.items)) return false;
    if (parsed.items.length > 200) return false;
    for (const entry of parsed.items) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
      const item = entry as Record<string, unknown>;
      if (typeof item.id !== "string" || !item.id || item.id.length > 300) return false;
      if (typeof item.title !== "string" || !item.title.trim() || item.title.length > 160) return false;
      if (typeof item.dueAt !== "string" || !Number.isFinite(Date.parse(item.dueAt))) return false;
      if (item.urgency !== "normal" && item.urgency !== "important" && item.urgency !== "critical") return false;
      if (typeof item.completed !== "boolean") return false;
      if (item.checklistIndex !== undefined && item.checklistIndex !== null && (!Number.isInteger(item.checklistIndex) || Number(item.checklistIndex) < 0)) return false;
      if (!legacy && (!validDateString(item.createdAt) || !validDateString(item.updatedAt))) return false;
      if (legacy && item.createdAt !== undefined && !validDateString(item.createdAt)) return false;
      if (legacy && item.updatedAt !== undefined && !validDateString(item.updatedAt)) return false;
    }
    if (!legacy && !validDateString(parsed.updatedAt)) return false;
    if (legacy && parsed.updatedAt !== undefined && !validDateString(parsed.updatedAt)) return false;
    return parseStoredTopicDeadlines(raw).items.length === parsed.items.length;
  } catch {
    return false;
  }
}

export function validateLocalBackupEntry(entry: LocalBackupEntry, legacy = false) {
  const domain = localDataDomainForKey(entry.key);
  if (!domain) return false;
  if (domain === "progress") return validateProgressValue(entry.value, legacy);
  if (domain === "tools") return validateToolsValue(entry.value, legacy);
  return validateDeadlineValue(entry.value, legacy);
}

function normalizeEntry(entry: LocalBackupEntry): LocalBackupEntry {
  const domain = localDataDomainForKey(entry.key);
  if (domain === "progress") {
    const value = parseStoredTopicProgress(entry.value);
    value.checked = [...new Set(value.checked)].sort((a, b) => a - b);
    return { key: entry.key, value: JSON.stringify(value) };
  }
  if (domain === "tools") return { key: entry.key, value: JSON.stringify(parseStoredTopicTools(entry.value)) };
  if (domain === "deadlines") return { key: entry.key, value: JSON.stringify(parseStoredTopicDeadlines(entry.value)) };
  return entry;
}

/**
 * Snapshot the original bytes for transactional rollback. Do not pass this
 * through parseStored* normalization: unknown legacy fields, duplicate
 * indices and original formatting must survive a failed operation.
 */
export function snapshotLocalPersonalEntries(storage: Storage): LocalBackupEntry[] {
  const entries: LocalBackupEntry[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !isRuLifePersonalKey(key)) continue;
    const value = storage.getItem(key);
    if (value === null) throw new Error("Không thể đọc đầy đủ dữ liệu để chuẩn bị rollback.");
    entries.push({ key, value });
  }
  return entries.sort((a, b) => a.key.localeCompare(b.key));
}

export function collectLocalBackup(storage: Storage, exportedAt = new Date().toISOString()): RuLifeLocalBackup {
  const entries: LocalBackupEntry[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !isRuLifePersonalKey(key)) continue;
    const value = storage.getItem(key);
    if (value === null) continue;
    entries.push(normalizeEntry({ key, value }));
  }
  entries.sort((a, b) => a.key.localeCompare(b.key));
  return { schema: RU_LIFE_BACKUP_SCHEMA, app: RU_LIFE_BACKUP_APP, exportedAt, entries };
}

export function validateLocalBackupText(text: string): BackupValidation {
  if (new Blob([text]).size > RU_LIFE_BACKUP_MAX_BYTES) return { ok: false, error: "Tệp backup vượt quá giới hạn 2 MB." };
  try {
    const parsed = JSON.parse(text) as { schema?: unknown; app?: unknown; exportedAt?: unknown; entries?: unknown };
    const legacy = parsed?.schema === RU_LIFE_BACKUP_LEGACY_SCHEMA;
    if (!parsed || typeof parsed !== "object" || (parsed.schema !== RU_LIFE_BACKUP_SCHEMA && !legacy) || parsed.app !== RU_LIFE_BACKUP_APP) {
      return { ok: false, error: "Không đúng định dạng backup RU_LIFE V1.3/V1.4." };
    }
    if (!validDateString(parsed.exportedAt) || !parsed.exportedAt) return { ok: false, error: "Backup thiếu thời điểm xuất hợp lệ." };
    if (!Array.isArray(parsed.entries) || parsed.entries.length > RU_LIFE_BACKUP_MAX_ENTRIES) return { ok: false, error: "Danh sách dữ liệu trong backup không hợp lệ." };

    const seen = new Set<string>();
    const domains: Record<LocalDataDomain, number> = { progress: 0, tools: 0, deadlines: 0 };
    const entries: LocalBackupEntry[] = [];
    for (const candidate of parsed.entries) {
      if (!candidate || typeof candidate !== "object") return { ok: false, error: "Backup chứa mục dữ liệu không hợp lệ." };
      const entry = candidate as Partial<LocalBackupEntry>;
      if (typeof entry.key !== "string" || typeof entry.value !== "string" || seen.has(entry.key)) return { ok: false, error: "Backup chứa khóa trùng hoặc sai kiểu dữ liệu." };
      if (!validateLocalBackupEntry({ key: entry.key, value: entry.value }, legacy)) return { ok: false, error: `Dữ liệu không hợp lệ tại ${entry.key}.` };
      const domain = localDataDomainForKey(entry.key);
      if (!domain) return { ok: false, error: "Backup chứa dữ liệu ngoài miền cá nhân RU_LIFE." };
      seen.add(entry.key);
      domains[domain] += 1;
      entries.push(normalizeEntry({ key: entry.key, value: entry.value }));
    }

    return {
      ok: true,
      backup: { schema: RU_LIFE_BACKUP_SCHEMA, app: RU_LIFE_BACKUP_APP, exportedAt: parsed.exportedAt as string, entries },
      domains,
      migratedFromLegacy: legacy,
    };
  } catch {
    return { ok: false, error: "Không đọc được tệp JSON backup." };
  }
}

export function clearLocalDataDomain(storage: Storage, domain: LocalDataDomain) {
  const prefix = prefixes[domain];
  const snapshot: LocalBackupEntry[] = [];

  // Capture exact raw values *before* the first destructive write.
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key?.startsWith(prefix)) continue;
    const value = storage.getItem(key);
    if (value === null) throw new Error("Không thể đọc đầy đủ dữ liệu trước khi xóa; chưa thay đổi dữ liệu.");
    snapshot.push({ key, value });
  }

  try {
    for (const entry of snapshot) storage.removeItem(entry.key);
  } catch (error) {
    try {
      // Restore even the key whose removal threw: a storage adapter may
      // mutate before raising. Do not normalize any original user bytes.
      for (const entry of snapshot) storage.setItem(entry.key, entry.value);
    } catch {
      throw new Error(
        "Xóa thất bại và rollback không thể phục hồi đầy đủ. Hãy dùng tệp backup trước xóa để khôi phục dữ liệu.",
      );
    }
    throw new Error(
      "Xóa bị gián đoạn; rollback đã phục hồi nguyên trạng dữ liệu. " +
      (error instanceof Error ? error.message : "Lỗi bộ nhớ trình duyệt."),
    );
  }
  return snapshot.length;
}

function clearAllPersonalData(storage: Storage) {
  for (const domain of Object.keys(prefixes) as LocalDataDomain[]) clearLocalDataDomain(storage, domain);
}

export function replaceLocalPersonalData(storage: Storage, backup: RuLifeLocalBackup): ReplacePersonalDataResult {
  const validation = validateLocalBackupText(JSON.stringify(backup));
  if (!validation.ok) return { ok: false, rolledBack: true, error: validation.error };
  let snapshot: LocalBackupEntry[];
  try {
    snapshot = snapshotLocalPersonalEntries(storage);
  } catch {
    return { ok: false, rolledBack: true, error: "Không thể chụp dữ liệu cũ trước khôi phục; chưa thay đổi dữ liệu." };
  }

  try {
    clearAllPersonalData(storage);
    for (const entry of validation.backup.entries) {
      const result = safeSetLocalStorage(storage, entry.key, entry.value);
      if (!result.ok) throw new Error(result.message);
    }
    return { ok: true, written: validation.backup.entries.length };
  } catch (error) {
    try {
      clearAllPersonalData(storage);
      for (const entry of snapshot) storage.setItem(entry.key, entry.value);
      return {
        ok: false,
        rolledBack: true,
        error: error instanceof Error ? error.message : "Không thể hoàn tất khôi phục dữ liệu.",
      };
    } catch {
      return {
        ok: false,
        rolledBack: false,
        error: "Khôi phục thất bại và rollback tự động cũng không thể hoàn tất. Hãy dùng tệp backup trước khôi phục.",
      };
    }
  }
}

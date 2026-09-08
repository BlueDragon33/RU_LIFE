import { parseStoredTopicDeadlines, RU_LIFE_DEADLINE_PREFIX } from "./deadline-storage";
import { parseStoredTopicTools, RU_LIFE_TOOLS_PREFIX } from "./personal-tools-storage";
import { parseStoredTopicProgress, RU_LIFE_PROGRESS_PREFIX } from "./progress-storage";

export const RU_LIFE_BACKUP_SCHEMA = "ru-life-local-backup-v1";
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
  | { ok: true; backup: RuLifeLocalBackup; domains: Record<LocalDataDomain, number> }
  | { ok: false; error: string };

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

function validateProgressValue(raw: string) {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
    if (!Array.isArray(parsed.checked) || !parsed.checked.every((value) => Number.isInteger(value) && Number(value) >= 0)) return false;
    if (typeof parsed.note !== "string" || parsed.note.length > 100_000) return false;
    if (!validDateString(parsed.updatedAt)) return false;
    const normalized = parseStoredTopicProgress(raw);
    return normalized.checked.length === new Set(parsed.checked as number[]).size || normalized.checked.length <= (parsed.checked as number[]).length;
  } catch {
    return false;
  }
}

function validateToolsValue(raw: string) {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
    if (typeof parsed.favorite !== "boolean") return false;
    for (const key of ["reminderAt", "reminderNote", "notifiedAt", "updatedAt", "topicTitle"]) {
      if (typeof parsed[key] !== "string") return false;
    }
    if ((parsed.reminderNote as string).length > 10_000 || (parsed.topicTitle as string).length > 500) return false;
    if (!validDateString(parsed.reminderAt) || !validDateString(parsed.notifiedAt) || !validDateString(parsed.updatedAt)) return false;
    parseStoredTopicTools(raw);
    return true;
  } catch {
    return false;
  }
}

function validateDeadlineValue(raw: string) {
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
      if (!validDateString(item.createdAt) || !validDateString(item.updatedAt)) return false;
    }
    if (!validDateString(parsed.updatedAt)) return false;
    return parseStoredTopicDeadlines(raw).items.length === parsed.items.length;
  } catch {
    return false;
  }
}

export function validateLocalBackupEntry(entry: LocalBackupEntry) {
  const domain = localDataDomainForKey(entry.key);
  if (!domain) return false;
  if (domain === "progress") return validateProgressValue(entry.value);
  if (domain === "tools") return validateToolsValue(entry.value);
  return validateDeadlineValue(entry.value);
}

export function collectLocalBackup(storage: Storage, exportedAt = new Date().toISOString()): RuLifeLocalBackup {
  const entries: LocalBackupEntry[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !isRuLifePersonalKey(key)) continue;
    const value = storage.getItem(key);
    if (value === null) continue;
    entries.push({ key, value });
  }
  entries.sort((a, b) => a.key.localeCompare(b.key));
  return { schema: RU_LIFE_BACKUP_SCHEMA, app: RU_LIFE_BACKUP_APP, exportedAt, entries };
}

export function validateLocalBackupText(text: string): BackupValidation {
  if (new Blob([text]).size > RU_LIFE_BACKUP_MAX_BYTES) return { ok: false, error: "Tệp backup vượt quá giới hạn 2 MB." };
  try {
    const parsed = JSON.parse(text) as Partial<RuLifeLocalBackup>;
    if (!parsed || typeof parsed !== "object" || parsed.schema !== RU_LIFE_BACKUP_SCHEMA || parsed.app !== RU_LIFE_BACKUP_APP) {
      return { ok: false, error: "Không đúng định dạng backup RU_LIFE V1.3." };
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
      if (!validateLocalBackupEntry({ key: entry.key, value: entry.value })) return { ok: false, error: `Dữ liệu không hợp lệ tại ${entry.key}.` };
      const domain = localDataDomainForKey(entry.key);
      if (!domain) return { ok: false, error: "Backup chứa dữ liệu ngoài miền cá nhân RU_LIFE." };
      seen.add(entry.key);
      domains[domain] += 1;
      entries.push({ key: entry.key, value: entry.value });
    }

    return {
      ok: true,
      backup: { schema: RU_LIFE_BACKUP_SCHEMA, app: RU_LIFE_BACKUP_APP, exportedAt: parsed.exportedAt, entries },
      domains,
    };
  } catch {
    return { ok: false, error: "Không đọc được tệp JSON backup." };
  }
}

export function clearLocalDataDomain(storage: Storage, domain: LocalDataDomain) {
  const prefix = prefixes[domain];
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(prefix)) keys.push(key);
  }
  for (const key of keys) storage.removeItem(key);
  return keys.length;
}

export function replaceLocalPersonalData(storage: Storage, backup: RuLifeLocalBackup) {
  for (const domain of Object.keys(prefixes) as LocalDataDomain[]) clearLocalDataDomain(storage, domain);
  for (const entry of backup.entries) storage.setItem(entry.key, entry.value);
}

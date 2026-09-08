import { parseStoredTopicDeadlines, RU_LIFE_DEADLINE_PREFIX } from "./deadline-storage";
import { parseStoredTopicTools, RU_LIFE_TOOLS_PREFIX } from "./personal-tools-storage";
import { parseStoredTopicProgress, RU_LIFE_PROGRESS_PREFIX } from "./progress-storage";
import { collectLocalBackup, localDataDomainForKey, type LocalBackupEntry } from "./local-data-backup";
import { safeSetLocalStorage } from "./local-storage-safe";

export const RU_LIFE_LOCAL_STATE_VERSION_KEY = "ru-life-local-state-version";
export const RU_LIFE_LOCAL_STATE_VERSION = 2;

export type LocalStateMigrationResult = {
  ok: boolean;
  fromVersion: number;
  toVersion: number;
  migratedEntries: number;
  rolledBack: boolean;
  error?: string;
};

function readVersion(storage: Storage) {
  const raw = storage.getItem(RU_LIFE_LOCAL_STATE_VERSION_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeEntry(entry: LocalBackupEntry): LocalBackupEntry {
  const domain = localDataDomainForKey(entry.key);
  if (domain === "progress") {
    const progress = parseStoredTopicProgress(entry.value);
    progress.checked = [...new Set(progress.checked)].sort((a, b) => a - b);
    return { key: entry.key, value: JSON.stringify(progress) };
  }
  if (domain === "tools") return { key: entry.key, value: JSON.stringify(parseStoredTopicTools(entry.value)) };
  if (domain === "deadlines") return { key: entry.key, value: JSON.stringify(parseStoredTopicDeadlines(entry.value)) };
  return entry;
}

function restoreSnapshot(storage: Storage, entries: LocalBackupEntry[]) {
  const personalKeys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && (key.startsWith(RU_LIFE_PROGRESS_PREFIX) || key.startsWith(RU_LIFE_TOOLS_PREFIX) || key.startsWith(RU_LIFE_DEADLINE_PREFIX))) personalKeys.push(key);
  }
  for (const key of personalKeys) storage.removeItem(key);
  for (const entry of entries) storage.setItem(entry.key, entry.value);
}

export function migrateLocalPersonalState(storage: Storage): LocalStateMigrationResult {
  const fromVersion = readVersion(storage);
  if (fromVersion >= RU_LIFE_LOCAL_STATE_VERSION) {
    return { ok: true, fromVersion, toVersion: RU_LIFE_LOCAL_STATE_VERSION, migratedEntries: 0, rolledBack: false };
  }

  const snapshot = collectLocalBackup(storage).entries;
  const normalized = snapshot.map(normalizeEntry);

  try {
    for (const entry of normalized) {
      const result = safeSetLocalStorage(storage, entry.key, entry.value);
      if (!result.ok) throw new Error(result.message);
    }
    const versionResult = safeSetLocalStorage(storage, RU_LIFE_LOCAL_STATE_VERSION_KEY, String(RU_LIFE_LOCAL_STATE_VERSION));
    if (!versionResult.ok) throw new Error(versionResult.message);
    return {
      ok: true,
      fromVersion,
      toVersion: RU_LIFE_LOCAL_STATE_VERSION,
      migratedEntries: normalized.length,
      rolledBack: false,
    };
  } catch (error) {
    try {
      restoreSnapshot(storage, snapshot);
      storage.setItem(RU_LIFE_LOCAL_STATE_VERSION_KEY, String(fromVersion));
      return {
        ok: false,
        fromVersion,
        toVersion: RU_LIFE_LOCAL_STATE_VERSION,
        migratedEntries: 0,
        rolledBack: true,
        error: error instanceof Error ? error.message : "Migration thất bại.",
      };
    } catch {
      return {
        ok: false,
        fromVersion,
        toVersion: RU_LIFE_LOCAL_STATE_VERSION,
        migratedEntries: 0,
        rolledBack: false,
        error: "Migration thất bại và trình duyệt không thể tự phục hồi đầy đủ snapshot cũ.",
      };
    }
  }
}

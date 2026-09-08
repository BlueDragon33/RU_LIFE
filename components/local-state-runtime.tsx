"use client";

import { useEffect, useState } from "react";
import { migrateLocalPersonalState, type LocalStateMigrationResult } from "@/lib/local-state-migration";
import { RU_LIFE_STORAGE_ERROR_EVENT } from "@/lib/local-storage-safe";
import { RU_LIFE_DEADLINE_EVENT } from "@/lib/deadline-storage";
import { RU_LIFE_TOOLS_EVENT } from "@/lib/personal-tools-storage";
import { RU_LIFE_PROGRESS_EVENT } from "@/lib/progress-storage";

type StorageErrorDetail = { message?: string };

function dispatchRefresh() {
  window.dispatchEvent(new CustomEvent(RU_LIFE_PROGRESS_EVENT));
  window.dispatchEvent(new CustomEvent(RU_LIFE_TOOLS_EVENT));
  window.dispatchEvent(new CustomEvent(RU_LIFE_DEADLINE_EVENT));
}

export default function LocalStateRuntime() {
  const [migration, setMigration] = useState<LocalStateMigrationResult | null>(null);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    const onStorageError = (event: Event) => {
      const detail = (event as CustomEvent<StorageErrorDetail>).detail;
      setStorageError(detail?.message || "Không thể ghi dữ liệu cục bộ trên thiết bị này.");
    };
    window.addEventListener(RU_LIFE_STORAGE_ERROR_EVENT, onStorageError);

    const frame = window.requestAnimationFrame(() => {
      const result = migrateLocalPersonalState(localStorage);
      setMigration(result);
      if (result.ok && result.migratedEntries > 0) dispatchRefresh();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(RU_LIFE_STORAGE_ERROR_EVENT, onStorageError);
    };
  }, []);

  const migrationError = migration && !migration.ok
    ? migration.rolledBack
      ? "Nâng cấp dữ liệu cục bộ không hoàn tất; RU_LIFE đã khôi phục trạng thái trước migration."
      : "Nâng cấp dữ liệu cục bộ thất bại và rollback không hoàn tất. Hãy dùng backup gần nhất trước khi tiếp tục chỉnh dữ liệu."
    : "";

  if (!storageError && !migrationError) return null;

  return <div className="local-state-runtime-alert" role="alert">
    <strong>Dữ liệu cục bộ cần chú ý</strong>
    <p>{storageError || migrationError}</p>
    <button type="button" onClick={() => { setStorageError(""); if (migrationError) setMigration(null); }}>Ẩn cảnh báo</button>
  </div>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  clearLocalDataDomain,
  collectLocalBackup,
  localDataDomainForKey,
  replaceLocalPersonalData,
  validateLocalBackupText,
  type LocalDataDomain,
  type RuLifeLocalBackup,
} from "@/lib/local-data-backup";
import { RU_LIFE_DEADLINE_EVENT } from "@/lib/deadline-storage";
import { RU_LIFE_TOOLS_EVENT } from "@/lib/personal-tools-storage";
import { RU_LIFE_PROGRESS_EVENT } from "@/lib/progress-storage";

type DomainCounts = Record<LocalDataDomain, number>;

type PendingImport = {
  backup: RuLifeLocalBackup;
  counts: DomainCounts;
  fileName: string;
};

const emptyCounts: DomainCounts = { progress: 0, tools: 0, deadlines: 0 };

const domainLabel: Record<LocalDataDomain, string> = {
  progress: "Checklist & ghi chú",
  tools: "Yêu thích & nhắc việc",
  deadlines: "Deadline & lịch",
};

function countPersonalKeys() {
  const counts: DomainCounts = { ...emptyCounts };
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    const domain = localDataDomainForKey(key);
    if (domain) counts[domain] += 1;
  }
  return counts;
}

function downloadJson(value: RuLifeLocalBackup, filename: string) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function dispatchPersonalDataEvents() {
  window.dispatchEvent(new CustomEvent(RU_LIFE_PROGRESS_EVENT));
  window.dispatchEvent(new CustomEvent(RU_LIFE_TOOLS_EVENT));
  window.dispatchEvent(new CustomEvent(RU_LIFE_DEADLINE_EVENT));
}

export default function LocalDataManager() {
  const [counts, setCounts] = useState<DomainCounts>({ ...emptyCounts });
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [restoreConfirm, setRestoreConfirm] = useState("");
  const [clearDomain, setClearDomain] = useState<LocalDataDomain>("progress");
  const [clearConfirm, setClearConfirm] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let frame = 0;
    const refresh = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setCounts(countPersonalKeys()));
    };
    refresh();
    window.addEventListener(RU_LIFE_PROGRESS_EVENT, refresh);
    window.addEventListener(RU_LIFE_TOOLS_EVENT, refresh);
    window.addEventListener(RU_LIFE_DEADLINE_EVENT, refresh);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(RU_LIFE_PROGRESS_EVENT, refresh);
      window.removeEventListener(RU_LIFE_TOOLS_EVENT, refresh);
      window.removeEventListener(RU_LIFE_DEADLINE_EVENT, refresh);
    };
  }, []);

  function exportBackup() {
    const backup = collectLocalBackup(localStorage);
    const day = backup.exportedAt.slice(0, 10);
    downloadJson(backup, `ru-life-backup-${day}.json`);
    setImportMessage(`Đã xuất ${backup.entries.length} mục dữ liệu cá nhân. Không bao gồm phiên, khóa thiết bị hoặc dữ liệu quản trị.`);
  }

  async function selectBackup(file: File | null) {
    setPending(null);
    setRestoreConfirm("");
    if (!file) return;
    try {
      const validation = validateLocalBackupText(await file.text());
      if (!validation.ok) {
        setImportMessage(validation.error);
        return;
      }
      setPending({ backup: validation.backup, counts: validation.domains, fileName: file.name });
      setImportMessage("Tệp hợp lệ. Chưa có dữ liệu nào được ghi; kiểm tra thống kê rồi xác nhận khôi phục.");
    } catch {
      setImportMessage("Không đọc được tệp backup đã chọn.");
    }
  }

  function restoreBackup() {
    if (!pending || restoreConfirm.trim().toUpperCase() !== "KHÔI PHỤC") return;
    try {
      const rollback = collectLocalBackup(localStorage);
      const stamp = rollback.exportedAt.replace(/[:.]/g, "-");
      downloadJson(rollback, `ru-life-before-restore-${stamp}.json`);
      replaceLocalPersonalData(localStorage, pending.backup);
      dispatchPersonalDataEvents();
      setCounts(countPersonalKeys());
      setPending(null);
      setRestoreConfirm("");
      if (fileRef.current) fileRef.current.value = "";
      setImportMessage("Khôi phục hoàn tất. RU_LIFE đã tự tải một backup trước khôi phục để có thể quay lại nếu cần.");
    } catch {
      setImportMessage("Không thể ghi đầy đủ backup vào bộ nhớ trình duyệt. Dùng tệp backup trước khôi phục để phục hồi trạng thái cũ.");
    }
  }

  function clearSelectedDomain() {
    if (clearConfirm.trim().toUpperCase() !== "XÓA") return;
    try {
      const rollback = collectLocalBackup(localStorage);
      const stamp = rollback.exportedAt.replace(/[:.]/g, "-");
      downloadJson(rollback, `ru-life-before-clear-${stamp}.json`);
      const removed = clearLocalDataDomain(localStorage, clearDomain);
      dispatchPersonalDataEvents();
      setCounts(countPersonalKeys());
      setClearConfirm("");
      setImportMessage(`Đã xóa ${removed} mục thuộc “${domainLabel[clearDomain]}”. Backup trước xóa đã được tải xuống.`);
    } catch {
      setImportMessage("Không thể xóa miền dữ liệu đã chọn.");
    }
  }

  return <section className="local-data-manager" aria-labelledby="local-data-title">
    <div className="section-heading local-data-heading"><div><span>RU_LIFE V1.3 · BẢO TOÀN DỮ LIỆU</span><h2 id="local-data-title">Backup · khôi phục · xóa an toàn</h2></div><p>Chỉ quản lý ba miền dữ liệu cá nhân của RU_LIFE. Phiên đăng nhập, P-256 device identity và dữ liệu Application-Management không nằm trong backup.</p></div>

    <div className="local-data-counts" aria-label="Số nhóm dữ liệu cục bộ">
      {(Object.keys(domainLabel) as LocalDataDomain[]).map((domain) => <article key={domain}><span>{domainLabel[domain]}</span><strong>{counts[domain]}</strong><p>khóa dữ liệu cục bộ</p></article>)}
    </div>

    <div className="local-data-grid">
      <article className="backup-card">
        <span>XUẤT BACKUP</span><h3>Tạo bản sao trước khi đổi thiết bị</h3><p>Xuất một tệp JSON có version/schema rõ ràng. Có thể lưu vào ổ đĩa cá nhân rồi nhập lại trên thiết bị khác.</p>
        <button type="button" onClick={exportBackup}>Xuất backup RU_LIFE</button>
      </article>

      <article className="backup-card restore-card">
        <span>KHÔI PHỤC CÓ KIỂM TRA</span><h3>Không ghi dữ liệu trước khi file đạt toàn bộ validation</h3><p>Import chỉ chấp nhận prefix cá nhân RU_LIFE và từ chối khóa lạ, schema sai, deadline lỗi hoặc tệp quá giới hạn.</p>
        <label className="backup-file"><span>Chọn tệp `.json`</span><input ref={fileRef} type="file" accept="application/json,.json" onChange={(event) => void selectBackup(event.target.files?.[0] || null)} /></label>
        {pending ? <div className="backup-preview"><strong>{pending.fileName}</strong><p>{pending.counts.progress} tiến độ · {pending.counts.tools} công cụ · {pending.counts.deadlines} nhóm deadline</p><label><span>Nhập <b>KHÔI PHỤC</b> để thay thế ba miền dữ liệu cá nhân hiện tại</span><input value={restoreConfirm} onChange={(event) => setRestoreConfirm(event.target.value)} autoComplete="off" /></label><button type="button" disabled={restoreConfirm.trim().toUpperCase() !== "KHÔI PHỤC"} onClick={restoreBackup}>Khôi phục dữ liệu</button></div> : null}
      </article>

      <article className="backup-card danger-card">
        <span>XÓA THEO MIỀN</span><h3>Không dùng “xóa tất cả localStorage”</h3><p>Chỉ xóa đúng miền đã chọn. RU_LIFE tự xuất backup trước xóa, còn phiên và identity thiết bị không bị chạm tới.</p>
        <label><span>Miền dữ liệu</span><select value={clearDomain} onChange={(event) => setClearDomain(event.target.value as LocalDataDomain)}>{(Object.keys(domainLabel) as LocalDataDomain[]).map((domain) => <option value={domain} key={domain}>{domainLabel[domain]}</option>)}</select></label>
        <label><span>Nhập <b>XÓA</b> để xác nhận</span><input value={clearConfirm} onChange={(event) => setClearConfirm(event.target.value)} autoComplete="off" /></label>
        <button type="button" disabled={clearConfirm.trim().toUpperCase() !== "XÓA"} onClick={clearSelectedDomain}>Xóa miền đã chọn</button>
      </article>
    </div>

    {importMessage ? <p className="local-data-message" role="status">{importMessage}</p> : null}
  </section>;
}

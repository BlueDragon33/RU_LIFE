"use client";

import { useEffect, useMemo, useState } from "react";
import {
  parseStoredTopicProgress,
  progressPercent,
  RU_LIFE_PROGRESS_EVENT,
  topicProgressKey,
  type StoredTopicProgress,
} from "@/lib/progress-storage";

export default function TopicProgress({ moduleSlug, topicSlug, checklist }: { moduleSlug: string; topicSlug: string; checklist: string[] }) {
  const [progress, setProgress] = useState<StoredTopicProgress>({ checked: [], note: "", updatedAt: "" });
  const [loaded, setLoaded] = useState(false);
  const key = useMemo(() => topicProgressKey(moduleSlug, topicSlug), [moduleSlug, topicSlug]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setProgress(parseStoredTopicProgress(localStorage.getItem(key)));
      setLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [key]);

  function persist(nextChecked: number[], nextNote: string) {
    const value: StoredTopicProgress = { checked: nextChecked, note: nextNote, updatedAt: new Date().toISOString() };
    setProgress(value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent(RU_LIFE_PROGRESS_EVENT, { detail: { key } }));
    } catch {
      // The checklist remains usable in memory if localStorage is unavailable.
    }
  }

  const done = progressPercent(progress, checklist.length);

  return <section className="topic-progress-panel" aria-labelledby="topic-progress-title">
    <header><div><span>TIẾN ĐỘ TRÊN THIẾT BỊ NÀY</span><h2 id="topic-progress-title">Checklist cá nhân</h2></div><strong>{loaded ? `${done}%` : "—"}</strong></header>
    <div className="topic-progress-bar" role="progressbar" aria-label="Tiến độ checklist" aria-valuemin={0} aria-valuemax={100} aria-valuenow={done}><i style={{ width: `${done}%` }} /></div>
    <div className="topic-checklist">
      {checklist.map((item, index) => {
        const active = progress.checked.includes(index);
        return <label key={item} className={active ? "done" : ""}>
          <input type="checkbox" checked={active} onChange={() => persist(active ? progress.checked.filter((value) => value !== index) : [...progress.checked, index], progress.note)} />
          <span><b aria-hidden="true">{active ? "✓" : index + 1}</b>{item}</span>
        </label>;
      })}
    </div>
    <label className="topic-note"><span>Ghi chú của tôi</span><textarea value={progress.note} onChange={(event) => persist(progress.checked, event.target.value)} placeholder="Ghi lại thông tin cần nhớ trên thiết bị này…" rows={5} /></label>
    <p className="topic-local-note">Tiến độ và ghi chú chỉ lưu cục bộ trên thiết bị này; không phải dữ liệu quản trị và không thay đổi quyền truy cập.</p>
  </section>;
}

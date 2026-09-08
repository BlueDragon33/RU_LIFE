"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "ru-life-progress:v1:";

type StoredProgress = {
  checked: number[];
  note: string;
  updatedAt: string;
};

function storageKey(moduleSlug: string, topicSlug: string) {
  return `${STORAGE_PREFIX}${moduleSlug}:${topicSlug}`;
}

export default function TopicProgress({ moduleSlug, topicSlug, checklist }: { moduleSlug: string; topicSlug: string; checklist: string[] }) {
  const [checked, setChecked] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const key = useMemo(() => storageKey(moduleSlug, topicSlug), [moduleSlug, topicSlug]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredProgress>;
        if (Array.isArray(parsed.checked)) setChecked(parsed.checked.filter((value) => Number.isInteger(value)) as number[]);
        if (typeof parsed.note === "string") setNote(parsed.note);
      }
    } catch {
      // Local progress is optional; corrupt browser storage must not block content access.
    } finally {
      setLoaded(true);
    }
  }, [key]);

  function persist(nextChecked: number[], nextNote: string) {
    setChecked(nextChecked);
    setNote(nextNote);
    try {
      const value: StoredProgress = { checked: nextChecked, note: nextNote, updatedAt: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The checklist remains usable in memory if localStorage is unavailable.
    }
  }

  const done = checklist.length ? Math.round((checked.filter((index) => index >= 0 && index < checklist.length).length / checklist.length) * 100) : 0;

  return <section className="topic-progress-panel">
    <header><div><span>TIẾN ĐỘ TRÊN THIẾT BỊ NÀY</span><h2>Checklist cá nhân</h2></div><strong>{loaded ? `${done}%` : "—"}</strong></header>
    <div className="topic-progress-bar"><i style={{ width: `${done}%` }} /></div>
    <div className="topic-checklist">
      {checklist.map((item, index) => {
        const active = checked.includes(index);
        return <label key={item} className={active ? "done" : ""}>
          <input type="checkbox" checked={active} onChange={() => persist(active ? checked.filter((value) => value !== index) : [...checked, index], note)} />
          <span><b>{active ? "✓" : index + 1}</b>{item}</span>
        </label>;
      })}
    </div>
    <label className="topic-note"><span>Ghi chú của tôi</span><textarea value={note} onChange={(event) => persist(checked, event.target.value)} placeholder="Ghi lại thông tin cần nhớ trên thiết bị này…" rows={5} /></label>
    <p className="topic-local-note">Tiến độ và ghi chú hiện chỉ lưu cục bộ trên thiết bị đang sử dụng; không phải dữ liệu quản trị và không thay đổi quyền truy cập.</p>
  </section>;
}

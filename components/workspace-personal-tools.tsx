"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  EMPTY_TOPIC_TOOLS,
  parseStoredTopicTools,
  reminderTimestamp,
  RU_LIFE_TOOLS_EVENT,
  topicToolsKey,
  type StoredTopicTools,
} from "@/lib/personal-tools-storage";
import { situationLabel, situationOptions, type SituationId } from "@/lib/topic-situations";

export type PersonalToolsTopic = {
  moduleSlug: string;
  moduleCode: string;
  moduleTitle: string;
  topicSlug: string;
  title: string;
  summary: string;
  priority: "essential" | "recommended" | "reference";
  situations: SituationId[];
};

type ToolsSnapshot = Record<string, StoredTopicTools>;
type PriorityFilter = "all" | PersonalToolsTopic["priority"];
type SituationFilter = "all" | SituationId;

const priorityLabel = {
  essential: "Cần ưu tiên",
  recommended: "Nên chuẩn bị",
  reference: "Tra cứu",
} as const;

function keyFor(topic: PersonalToolsTopic) {
  return topicToolsKey(topic.moduleSlug, topic.topicSlug);
}

function readSnapshot(topics: PersonalToolsTopic[]) {
  const next: ToolsSnapshot = {};
  for (const topic of topics) {
    const key = keyFor(topic);
    next[key] = parseStoredTopicTools(localStorage.getItem(key));
  }
  return next;
}

function formatReminder(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ thời điểm";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function WorkspacePersonalTools({ topics }: { topics: PersonalToolsTopic[] }) {
  const [tools, setTools] = useState<ToolsSnapshot>({});
  const [loaded, setLoaded] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [situationFilter, setSituationFilter] = useState<SituationFilter>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let frame = 0;
    const refresh = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setTools(readSnapshot(topics));
        setLoaded(true);
      });
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(RU_LIFE_TOOLS_EVENT, refresh);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(RU_LIFE_TOOLS_EVENT, refresh);
    };
  }, [topics]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNow(Date.now()));
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);

  function toggleFavorite(topic: PersonalToolsTopic) {
    const key = keyFor(topic);
    const current = tools[key] || { ...EMPTY_TOPIC_TOOLS };
    const next: StoredTopicTools = {
      ...current,
      favorite: !current.favorite,
      topicTitle: topic.title,
      updatedAt: new Date().toISOString(),
    };
    setTools((snapshot) => ({ ...snapshot, [key]: next }));
    try {
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(RU_LIFE_TOOLS_EVENT, { detail: { key } }));
    } catch {
      // Keep the optimistic in-memory favorite state if localStorage is unavailable.
    }
  }

  const favorites = useMemo(() => topics.filter((topic) => (tools[keyFor(topic)] || EMPTY_TOPIC_TOOLS).favorite), [tools, topics]);

  const reminders = useMemo(() => topics.flatMap((topic) => {
    const stored = tools[keyFor(topic)] || EMPTY_TOPIC_TOOLS;
    const timestamp = reminderTimestamp(stored);
    return timestamp === null ? [] : [{ topic, stored, timestamp }];
  }).sort((a, b) => a.timestamp - b.timestamp), [tools, topics]);

  const activeFilter = priorityFilter !== "all" || situationFilter !== "all" || favoritesOnly;
  const filteredTopics = useMemo(() => topics.filter((topic) => {
    if (priorityFilter !== "all" && topic.priority !== priorityFilter) return false;
    if (situationFilter !== "all" && !topic.situations.includes(situationFilter)) return false;
    if (favoritesOnly && !(tools[keyFor(topic)] || EMPTY_TOPIC_TOOLS).favorite) return false;
    return true;
  }), [favoritesOnly, priorityFilter, situationFilter, tools, topics]);

  return <section className="personal-tools" aria-labelledby="personal-tools-title">
    <div className="section-heading personal-tools-heading"><div><span>RU_LIFE V1.1 · CÔNG CỤ CÁ NHÂN</span><h2 id="personal-tools-title">Lọc nhanh · yêu thích · việc sắp tới</h2></div><p>Mọi trạng thái ở phần này chỉ lưu trên trình duyệt của thiết bị đang dùng. Không gửi bookmark, lịch nhắc hay bộ lọc sang Application-Management.</p></div>

    <div className="personal-tools-summary">
      <article><span>YÊU THÍCH</span><strong>{loaded ? favorites.length : "—"}</strong><p>Chủ đề được đánh dấu để mở lại nhanh.</p></article>
      <article><span>NHẮC VIỆC</span><strong>{loaded ? reminders.length : "—"}</strong><p>Lịch nhắc đang lưu cục bộ trên thiết bị.</p></article>
      <article><span>ĐẾN HẠN</span><strong>{loaded && now ? reminders.filter((entry) => entry.timestamp <= now).length : "—"}</strong><p>Việc đã tới thời điểm nhắc và chưa bị xóa.</p></article>
    </div>

    <div className="personal-filter-panel">
      <div className="personal-filter-controls">
        <label><span>Mức ưu tiên</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)}><option value="all">Tất cả</option><option value="essential">Cần ưu tiên</option><option value="recommended">Nên chuẩn bị</option><option value="reference">Tra cứu</option></select></label>
        <label><span>Tình huống</span><select value={situationFilter} onChange={(event) => setSituationFilter(event.target.value as SituationFilter)}><option value="all">Tất cả tình huống</option>{situationOptions.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}</select></label>
        <button type="button" className={favoritesOnly ? "active" : ""} aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly((value) => !value)}>★ Chỉ yêu thích</button>
        {activeFilter ? <button type="button" className="secondary" onClick={() => { setPriorityFilter("all"); setSituationFilter("all"); setFavoritesOnly(false); }}>Xóa bộ lọc</button> : null}
      </div>

      {activeFilter ? <div className="personal-filter-results" aria-live="polite">
        <p>{filteredTopics.length} chủ đề phù hợp</p>
        <div>{filteredTopics.map((topic) => {
          const favorite = (tools[keyFor(topic)] || EMPTY_TOPIC_TOOLS).favorite;
          return <article key={keyFor(topic)}>
            <button type="button" className={`mini-favorite ${favorite ? "active" : ""}`} aria-label={favorite ? `Bỏ ${topic.title} khỏi yêu thích` : `Thêm ${topic.title} vào yêu thích`} aria-pressed={favorite} onClick={() => toggleFavorite(topic)}>{favorite ? "★" : "☆"}</button>
            <Link href={`/app/${topic.moduleSlug}/${topic.topicSlug}`}><span>{topic.moduleCode} · {topic.moduleTitle}</span><strong>{topic.title}</strong><small>{priorityLabel[topic.priority]} · {topic.situations.map(situationLabel).join(" · ")}</small></Link>
          </article>;
        })}</div>
      </div> : <p className="personal-filter-empty">Chọn mức ưu tiên, tình huống hoặc “Chỉ yêu thích” để thu hẹp 20 chủ đề mà không phải đi qua từng module.</p>}
    </div>

    <div className="personal-quick-grid">
      <section className="favorites-panel" aria-labelledby="favorites-title">
        <header><span>YÊU THÍCH</span><h3 id="favorites-title">Mở lại nhanh</h3></header>
        {favorites.length ? <div>{favorites.slice(0, 6).map((topic) => <article key={keyFor(topic)}><Link href={`/app/${topic.moduleSlug}/${topic.topicSlug}`}><span>{topic.moduleCode} · {topic.moduleTitle}</span><strong>{topic.title}</strong></Link><button type="button" aria-label={`Bỏ ${topic.title} khỏi yêu thích`} onClick={() => toggleFavorite(topic)}>★</button></article>)}</div> : <p>Chưa có chủ đề yêu thích. Bạn có thể đánh dấu ngay tại trang chủ đề hoặc từ bộ lọc phía trên.</p>}
      </section>

      <section className="reminders-panel" aria-labelledby="reminders-title">
        <header><span>VIỆC SẮP TỚI</span><h3 id="reminders-title">Nhắc việc trên thiết bị</h3></header>
        {reminders.length ? <div>{reminders.slice(0, 6).map(({ topic, stored, timestamp }) => <Link href={`/app/${topic.moduleSlug}/${topic.topicSlug}`} className={now && timestamp <= now ? "overdue" : ""} key={keyFor(topic)}><span>{now && timestamp <= now ? "ĐẾN HẠN" : "SẮP TỚI"} · {formatReminder(stored.reminderAt)}</span><strong>{topic.title}</strong><p>{stored.reminderNote || "Mở chủ đề để xem việc đã đặt nhắc."}</p></Link>)}</div> : <p>Chưa có nhắc việc. Mở một chủ đề và đặt thời điểm nhắc tại khung “Công cụ cá nhân V1.1”.</p>}
      </section>
    </div>
  </section>;
}

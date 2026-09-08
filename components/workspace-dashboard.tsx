"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  parseStoredTopicProgress,
  progressPercent,
  RU_LIFE_PROGRESS_EVENT,
  topicProgressKey,
  validCheckedCount,
  type StoredTopicProgress,
} from "@/lib/progress-storage";

export type DashboardTopic = {
  moduleSlug: string;
  moduleCode: string;
  moduleTitle: string;
  stage: string;
  topicSlug: string;
  title: string;
  summary: string;
  priority: "essential" | "recommended" | "reference";
  checklist: string[];
  freshness: "verified" | "review-soon" | "stable-guidance";
  updatedAt: string;
};

type ProgressSnapshot = Record<string, StoredTopicProgress>;

const priorityLabel = {
  essential: "Cần ưu tiên",
  recommended: "Nên chuẩn bị",
  reference: "Tra cứu",
} as const;

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("vi").trim();
}

function topicKey(topic: DashboardTopic) {
  return topicProgressKey(topic.moduleSlug, topic.topicSlug);
}

function readSnapshot(topics: DashboardTopic[]): ProgressSnapshot {
  const next: ProgressSnapshot = {};
  for (const topic of topics) {
    const key = topicKey(topic);
    next[key] = parseStoredTopicProgress(localStorage.getItem(key));
  }
  return next;
}

export default function WorkspaceDashboard({ topics }: { topics: DashboardTopic[] }) {
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState<ProgressSnapshot>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let frame = 0;
    const refresh = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setProgress(readSnapshot(topics));
        setLoaded(true);
      });
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(RU_LIFE_PROGRESS_EVENT, refresh);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(RU_LIFE_PROGRESS_EVENT, refresh);
    };
  }, [topics]);

  const stats = useMemo(() => {
    let checkedItems = 0;
    let totalItems = 0;
    let completedTopics = 0;
    let notes = 0;
    for (const topic of topics) {
      const stored = progress[topicKey(topic)] || { checked: [], note: "", updatedAt: "" };
      const checked = validCheckedCount(stored, topic.checklist.length);
      checkedItems += checked;
      totalItems += topic.checklist.length;
      if (topic.checklist.length > 0 && checked === topic.checklist.length) completedTopics += 1;
      if (stored.note.trim()) notes += 1;
    }
    return {
      completedTopics,
      checkedItems,
      totalItems,
      notes,
      overall: totalItems ? Math.round((checkedItems / totalItems) * 100) : 0,
      reviewSoon: topics.filter((topic) => topic.freshness === "review-soon").length,
      verified: topics.filter((topic) => topic.freshness === "verified").length,
      stable: topics.filter((topic) => topic.freshness === "stable-guidance").length,
    };
  }, [progress, topics]);

  const nextTopic = useMemo(() => {
    for (const priority of ["essential", "recommended", "reference"] as const) {
      const candidate = topics.find((topic) => {
        if (topic.priority !== priority) return false;
        const stored = progress[topicKey(topic)] || { checked: [], note: "", updatedAt: "" };
        return validCheckedCount(stored, topic.checklist.length) < topic.checklist.length;
      });
      if (candidate) return candidate;
    }
    return null;
  }, [progress, topics]);

  const nextChecklistItem = useMemo(() => {
    if (!nextTopic) return null;
    const stored = progress[topicKey(nextTopic)] || { checked: [], note: "", updatedAt: "" };
    return nextTopic.checklist.find((_, index) => !stored.checked.includes(index)) || null;
  }, [nextTopic, progress]);

  const searchResults = useMemo(() => {
    const needle = normalizeSearch(query);
    if (!needle) return [];
    return topics.filter((topic) => normalizeSearch([
      topic.moduleTitle,
      topic.stage,
      topic.title,
      topic.summary,
      ...topic.checklist,
    ].join(" ")).includes(needle));
  }, [query, topics]);

  return <>
    <section className="dashboard-command" aria-labelledby="quick-search-title">
      <div className="dashboard-search-copy"><span>TRA NHANH 20 CHỦ ĐỀ</span><h2 id="quick-search-title">Tìm việc cần xử lý</h2><p>Tìm theo chủ đề, tình huống hoặc nội dung checklist. Dữ liệu tìm kiếm nằm trong RU_LIFE, không gửi sang Trung tâm quản trị.</p></div>
      <label className="dashboard-search"><span className="sr-only">Tìm trong Hòa nhập Nga</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: hộ chiếu, ký túc xá, cấp cứu, deadline…" autoComplete="off" /><kbd>/</kbd></label>
      {query.trim() ? <div className="dashboard-search-results" aria-live="polite">
        <p>{searchResults.length ? `${searchResults.length} chủ đề phù hợp` : "Không tìm thấy chủ đề phù hợp"}</p>
        <div>{searchResults.map((topic) => {
          const stored = progress[topicKey(topic)] || { checked: [], note: "", updatedAt: "" };
          const done = progressPercent(stored, topic.checklist.length);
          return <Link href={`/app/${topic.moduleSlug}/${topic.topicSlug}`} key={topicKey(topic)}>
            <span>{topic.moduleCode} · {topic.moduleTitle}</span><strong>{topic.title}</strong><small>{loaded ? `${done}% checklist` : "Đang đọc tiến độ…"} · {priorityLabel[topic.priority]}</small>
          </Link>;
        })}</div>
      </div> : null}
    </section>

    <section className="workspace-overview" aria-label="Tổng quan tiến độ cá nhân">
      <article><span>CHỦ ĐỀ HOÀN THÀNH</span><strong>{loaded ? `${stats.completedTopics}/${topics.length}` : "—"}</strong><p>Một chủ đề hoàn thành khi toàn bộ checklist của chủ đề đó đã được đánh dấu.</p></article>
      <article><span>CHECKLIST</span><strong>{loaded ? `${stats.overall}%` : "—"}</strong><p>{loaded ? `${stats.checkedItems}/${stats.totalItems} đầu việc đã hoàn thành trên thiết bị này.` : "Đang đọc tiến độ cục bộ…"}</p></article>
      <article><span>GHI CHÚ CÁ NHÂN</span><strong>{loaded ? stats.notes : "—"}</strong><p>Số chủ đề đang có ghi chú cục bộ; dữ liệu này không đi vào hệ thống quản trị.</p></article>
      <article><span>CẦN RÀ SOÁT NGUỒN</span><strong>{stats.reviewSoon}</strong><p>{stats.verified} chủ đề đã kiểm tra nguồn · {stats.stable} chủ đề là hướng dẫn ổn định.</p></article>
    </section>

    <section className="dashboard-next" aria-labelledby="next-action-title">
      <div><span>VIỆC NÊN LÀM TIẾP</span><h2 id="next-action-title">{nextTopic ? nextTopic.title : "Đã hoàn thành toàn bộ checklist V1"}</h2><p>{nextTopic ? nextChecklistItem || nextTopic.summary : "Không còn checklist chưa hoàn thành trên thiết bị này. Bạn vẫn có thể mở từng chủ đề để rà soát ghi chú và nguồn."}</p></div>
      {nextTopic ? <Link href={`/app/${nextTopic.moduleSlug}/${nextTopic.topicSlug}`}>Mở {nextTopic.moduleCode} · {nextTopic.moduleTitle} →</Link> : <Link href="/app/prepare">Rà lại từ Module 01 →</Link>}
    </section>

    <section className="freshness-strip" aria-label="Trạng thái độ mới nội dung">
      <div><span>ĐỘ MỚI NỘI DUNG</span><strong>Không coi dữ liệu biến động là cố định</strong></div>
      <p><b>{stats.reviewSoon}</b> chủ đề được đánh dấu cần rà soát thường xuyên. Ngày kiểm tra cụ thể vẫn hiển thị tại từng trang và nguồn chính thức đi kèm.</p>
    </section>
  </>;
}

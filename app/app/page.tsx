import Link from "next/link";
import LocalDataManager from "@/components/local-data-manager";
import WorkspaceDashboard, { type DashboardTopic } from "@/components/workspace-dashboard";
import WorkspacePersonalTools, { type PersonalToolsTopic } from "@/components/workspace-personal-tools";
import WorkspaceDeadlineBoard, { type DeadlineBoardTopic } from "@/components/workspace-deadline-board";
import { ruLifeModules, topicCount } from "@/lib/content-catalog";
import { getResolvedTopicContent } from "@/lib/content-resolver";
import { getTopicSituations } from "@/lib/topic-situations";

const moduleIcon: Record<string, string> = {
  prepare: "✈",
  "daily-life": "⌂",
  "study-procedures": "◆",
  health: "♥",
  integration: "文",
};

export default function ProtectedAppPage() {
  const dashboardTopics: DashboardTopic[] = ruLifeModules.flatMap((moduleData) => moduleData.topics.map((topic) => {
    const content = getResolvedTopicContent(moduleData.slug, topic.slug);
    return {
      moduleSlug: moduleData.slug,
      moduleCode: moduleData.code,
      moduleTitle: moduleData.title,
      stage: moduleData.stage,
      topicSlug: topic.slug,
      title: topic.title,
      summary: topic.summary,
      priority: topic.priority,
      checklist: topic.checklist,
      freshness: content?.freshness || "review-soon",
      updatedAt: content?.updatedAt || "",
    };
  }));

  const personalTopics: PersonalToolsTopic[] = ruLifeModules.flatMap((moduleData) => moduleData.topics.map((topic) => ({
    moduleSlug: moduleData.slug,
    moduleCode: moduleData.code,
    moduleTitle: moduleData.title,
    topicSlug: topic.slug,
    title: topic.title,
    summary: topic.summary,
    priority: topic.priority,
    situations: getTopicSituations(moduleData.slug, topic.slug),
  })));

  const deadlineTopics: DeadlineBoardTopic[] = dashboardTopics.map((topic) => ({
    moduleSlug: topic.moduleSlug,
    moduleCode: topic.moduleCode,
    moduleTitle: topic.moduleTitle,
    topicSlug: topic.topicSlug,
    topicTitle: topic.title,
    freshness: topic.freshness,
    updatedAt: topic.updatedAt,
  }));

  return <>
    <header className="workspace-hero premium-hero">
      <div><span>RU_LIFE · HÒA NHẬP NGA</span><h1>Dashboard Hòa nhập Nga</h1><p>Không gian cá nhân để chuẩn bị, sinh sống, học tập và hòa nhập tại Nga. Truy cập độc lập trên thiết bị đã được Quản trị ứng dụng phê duyệt; dữ liệu cá nhân vẫn nằm trong RU_LIFE.</p><span className="session-ok">THIẾT BỊ HỢP LỆ</span></div>
      <div className="hero-visual" aria-hidden="true"><small>WELCOME TO YOUR NEXT CHAPTER</small><strong>Добро пожаловать!</strong><p>Chuẩn bị kỹ hơn · thích nghi nhanh hơn · chủ động trong từng mốc quan trọng.</p><div className="hero-visual-art" /></div>
    </header>

    <WorkspaceDashboard topics={dashboardTopics} />
    <WorkspacePersonalTools topics={personalTopics} />
    <WorkspaceDeadlineBoard topics={deadlineTopics} />
    <LocalDataManager />

    <section className="module-section">
      <div className="section-heading"><div><span>KHÁM PHÁ CÁC CHỦ ĐỀ CHÍNH · {topicCount()} CHỦ ĐỀ</span><h2>Năm khu vực cho hành trình tại Nga</h2></div><p>Mỗi module là một khu vực độc lập, có hướng dẫn, checklist, nguồn và công cụ cá nhân riêng nhưng vẫn thống nhất trong một trải nghiệm RU_LIFE.</p></div>
      <div className="module-grid">
        {ruLifeModules.map((moduleData) => <Link href={`/app/${moduleData.slug}`} className="module-card" key={moduleData.slug}>
          <header><span>{moduleData.stage}</span><b>{moduleData.code}</b></header>
          <span className="module-icon" aria-hidden="true">{moduleIcon[moduleData.slug] || "•"}</span>
          <h3>{moduleData.title}</h3>
          <p>{moduleData.description}</p>
          <footer><span>{moduleData.topics.length} chủ đề</span><strong>Mở module →</strong></footer>
        </Link>)}
      </div>
    </section>

    <section className="workspace-next">
      <span>RU_LIFE V1.4 · PRIVATE BY DESIGN</span><h2>Dữ liệu cá nhân có migration và rollback mà không mang theo quyền thiết bị</h2><p>Backup chỉ gồm checklist/ghi chú, yêu thích/nhắc việc và deadline. Session, P-256 identity, heartbeat, introspection và trạng thái cấp quyền không bao giờ được xuất hoặc nhập qua cơ chế dữ liệu cá nhân.</p>
    </section>
  </>;
}

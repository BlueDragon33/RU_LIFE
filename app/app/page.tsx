import Link from "next/link";
import LocalDataManager from "@/components/local-data-manager";
import WorkspaceDashboard, { type DashboardTopic } from "@/components/workspace-dashboard";
import WorkspacePersonalTools, { type PersonalToolsTopic } from "@/components/workspace-personal-tools";
import WorkspaceDeadlineBoard, { type DeadlineBoardTopic } from "@/components/workspace-deadline-board";
import { ruLifeModules, topicCount } from "@/lib/content-catalog";
import { getResolvedTopicContent } from "@/lib/content-resolver";
import { getTopicSituations } from "@/lib/topic-situations";

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
    <header className="workspace-hero">
      <div><span>HÒA NHẬP NGA · KHÔNG GIAN CÁ NHÂN</span><h1>Mọi việc cần nhớ khi sống và học tập tại Nga</h1><p>20 chủ đề đã có nội dung thực. V1.4 bổ sung migration dữ liệu cũ, khôi phục transactional có rollback, cảnh báo lỗi/quota bộ nhớ và contract responsive; Trung tâm quản trị vẫn chỉ kiểm soát quyền thiết bị.</p></div>
      <span className="session-ok">THIẾT BỊ HỢP LỆ</span>
    </header>

    <WorkspaceDashboard topics={dashboardTopics} />
    <WorkspacePersonalTools topics={personalTopics} />
    <WorkspaceDeadlineBoard topics={deadlineTopics} />
    <LocalDataManager />

    <section className="module-section">
      <div className="section-heading"><div><span>BẢN ĐỒ NỘI DUNG · {topicCount()} CHỦ ĐỀ</span><h2>Chọn khu vực cần xử lý</h2></div><p>Mỗi module và chủ đề có route riêng. Có thể đi sâu, cập nhật nguồn hoặc chỉnh checklist từng phần mà không ảnh hưởng lớp cấp quyền thiết bị.</p></div>
      <div className="module-grid">
        {ruLifeModules.map((moduleData) => <Link href={`/app/${moduleData.slug}`} className="module-card" key={moduleData.slug}>
          <header><span>{moduleData.stage}</span><b>{moduleData.code}</b></header>
          <h3>{moduleData.title}</h3>
          <p>{moduleData.description}</p>
          <footer><span>{moduleData.topics.length} chủ đề</span><strong>Mở module →</strong></footer>
        </Link>)}
      </div>
    </section>

    <section className="workspace-next">
      <span>RU_LIFE V1.4 · DATA RESILIENCE</span><h2>Dữ liệu cá nhân có migration và rollback mà không mang theo quyền thiết bị</h2><p>Backup V1.4 chỉ gồm checklist/ghi chú, yêu thích/nhắc việc và deadline; backup V1.3 cũ vẫn được migrate khi nhập. Session, P-256 identity, heartbeat, introspection và trạng thái cấp quyền không bao giờ được xuất hoặc nhập qua cơ chế này.</p>
    </section>
  </>;
}

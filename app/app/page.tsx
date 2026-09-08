import Link from "next/link";
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
      <div><span>HÒA NHẬP NGA · KHÔNG GIAN CÁ NHÂN</span><h1>Mọi việc cần nhớ khi sống và học tập tại Nga</h1><p>20 chủ đề đã có nội dung thực. V1.2 bổ sung quản lý nhiều thời hạn, mức khẩn cấp, lịch 7 ngày, cảnh báo nguồn cần rà soát và xuất .ics; Trung tâm quản trị vẫn chỉ kiểm soát quyền thiết bị.</p></div>
      <span className="session-ok">THIẾT BỊ HỢP LỆ</span>
    </header>

    <WorkspaceDashboard topics={dashboardTopics} />
    <WorkspacePersonalTools topics={personalTopics} />
    <WorkspaceDeadlineBoard topics={deadlineTopics} />

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
      <span>RU_LIFE V1.2 · DEADLINE CONTROL</span><h2>Nội dung đã gắn được với thời hạn cá nhân mà vẫn tách khỏi dữ liệu quản trị</h2><p>Checklist, ghi chú, yêu thích, nhắc việc và deadline đều nằm trong RU_LIFE trên thiết bị. Mốc rà soát nguồn chỉ là cơ chế kiểm soát chất lượng nội dung. P-256, session, heartbeat, introspection và quyền thiết bị tiếp tục được quản lý độc lập qua Application-Management.</p>
    </section>
  </>;
}

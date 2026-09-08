import Link from "next/link";
import WorkspaceDashboard, { type DashboardTopic } from "@/components/workspace-dashboard";
import { ruLifeModules, topicCount } from "@/lib/content-catalog";
import { getResolvedTopicContent } from "@/lib/content-resolver";

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

  return <>
    <header className="workspace-hero">
      <div><span>HÒA NHẬP NGA · KHÔNG GIAN CÁ NHÂN</span><h1>Mọi việc cần nhớ khi sống và học tập tại Nga</h1><p>20 chủ đề V1 đã có nội dung thực, được chia theo tình huống và tiến trình sử dụng. Trung tâm quản trị chỉ kiểm soát quyền thiết bị; tiến độ và ghi chú cá nhân vẫn thuộc RU_LIFE trên thiết bị này.</p></div>
      <span className="session-ok">THIẾT BỊ HỢP LỆ</span>
    </header>

    <WorkspaceDashboard topics={dashboardTopics} />

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
      <span>RU_LIFE V1 · 20/20 CONTENT COVERAGE</span><h2>Kiến trúc nội dung đã đủ để chuyển sang tối ưu trải nghiệm sử dụng</h2><p>Module, topic, nguồn, checklist và ghi chú vẫn nằm trong RU_LIFE. P-256, session, heartbeat, introspection và quyền thiết bị tiếp tục được quản lý độc lập qua Application-Management.</p>
    </section>
  </>;
}

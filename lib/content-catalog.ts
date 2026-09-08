export type RuLifeTopic = {
  slug: string;
  title: string;
  summary: string;
  priority: "essential" | "recommended" | "reference";
  checklist: string[];
};

export type RuLifeModule = {
  slug: string;
  code: string;
  title: string;
  shortTitle: string;
  description: string;
  stage: string;
  topics: RuLifeTopic[];
};

export const ruLifeModules: RuLifeModule[] = [
  {
    slug: "prepare",
    code: "01",
    title: "Chuẩn bị sang Nga",
    shortTitle: "Chuẩn bị sang Nga",
    description: "Một nơi để gom các việc cần hoàn thành trước ngày khởi hành, tránh bỏ sót đầu việc quan trọng.",
    stage: "TRƯỚC KHI ĐI",
    topics: [
      { slug: "documents", title: "Hồ sơ · giấy tờ", summary: "Tập hợp giấy tờ cần mang theo, bản sao và cách lưu dự phòng.", priority: "essential", checklist: ["Lập danh sách giấy tờ bản gốc", "Chuẩn bị bản sao cần thiết", "Tạo bản lưu số hóa an toàn"] },
      { slug: "luggage", title: "Hành lý · trang bị", summary: "Chia hành lý theo mức cần thiết, khí hậu, học tập và sinh hoạt.", priority: "recommended", checklist: ["Chia nhóm đồ bắt buộc và mua sau", "Kiểm tra giới hạn hành lý của chuyến đi", "Đánh dấu đồ cần dùng ngay khi đến"] },
      { slug: "money-connectivity", title: "Tài chính · liên lạc", summary: "Chuẩn bị phương án tiền, liên lạc và các kênh dự phòng trong những ngày đầu.", priority: "essential", checklist: ["Chuẩn bị phương án thanh toán ban đầu", "Lưu số liên hệ quan trọng", "Chuẩn bị phương án Internet/liên lạc dự phòng"] },
      { slug: "arrival-plan", title: "Kế hoạch ngày đầu", summary: "Một checklist ngắn cho hành trình từ khi hạ cánh tới chỗ ở và ổn định ban đầu.", priority: "essential", checklist: ["Xác định điểm đến đầu tiên", "Lưu địa chỉ chỗ ở", "Chuẩn bị thứ tự các việc phải làm sau khi đến"] },
    ],
  },
  {
    slug: "daily-life",
    code: "02",
    title: "Cuộc sống tại Nga",
    shortTitle: "Cuộc sống tại Nga",
    description: "Các đầu việc đời sống hằng ngày được tổ chức theo tình huống để tra nhanh khi cần.",
    stage: "SINH HOẠT",
    topics: [
      { slug: "housing", title: "Nhà ở · ký túc xá", summary: "Quản lý chỗ ở, đồ dùng cơ bản, quy tắc sinh hoạt và các vấn đề thường gặp.", priority: "essential", checklist: ["Lưu thông tin chỗ ở", "Ghi lại đầu mối cần liên hệ", "Lập danh sách vật dụng còn thiếu"] },
      { slug: "transport", title: "Đi lại · giao thông", summary: "Khung tra cứu tuyến đi, vé, bản đồ và phương án di chuyển dự phòng.", priority: "recommended", checklist: ["Lưu các tuyến đi thường dùng", "Chuẩn bị phương án khi mất mạng", "Đánh dấu các điểm đến quan trọng"] },
      { slug: "shopping-services", title: "Mua sắm · dịch vụ", summary: "Tập hợp những nhóm dịch vụ thiết yếu để giảm thời gian tìm kiếm khi mới sang.", priority: "recommended", checklist: ["Xác định nhóm đồ mua định kỳ", "Lưu địa điểm dịch vụ thiết yếu", "Theo dõi chi tiêu ban đầu"] },
      { slug: "safety", title: "An toàn · tình huống khẩn", summary: "Một trang phản ứng nhanh cho các tình huống cần xử lý theo thứ tự rõ ràng.", priority: "essential", checklist: ["Lưu liên hệ khẩn cấp cá nhân", "Ghi địa chỉ chỗ ở bằng tiếng Nga", "Chuẩn bị thông tin nhận dạng cần thiết"] },
    ],
  },
  {
    slug: "study-procedures",
    code: "03",
    title: "Học tập · thủ tục",
    shortTitle: "Học tập · thủ tục",
    description: "Theo dõi các đầu việc hành chính và học tập theo tiến trình, thay vì để rải rác trong ghi chú.",
    stage: "HỌC TẬP",
    topics: [
      { slug: "enrollment", title: "Nhập học · xác nhận hồ sơ", summary: "Checklist các việc cần xác nhận với cơ sở đào tạo khi bắt đầu học.", priority: "essential", checklist: ["Xác định đầu mối phụ trách", "Ghi lại các mốc cần hoàn thành", "Lưu bản xác nhận đã nộp hồ sơ"] },
      { slug: "migration-registration", title: "Cư trú · giấy tờ người nước ngoài", summary: "Khung quản lý mốc thời gian và giấy tờ; nội dung pháp lý sẽ được cập nhật theo nguồn chính thức.", priority: "essential", checklist: ["Lưu ngày phát sinh giấy tờ", "Theo dõi hạn cần xử lý", "Lưu bản chụp sau mỗi lần cập nhật"] },
      { slug: "study-plan", title: "Kế hoạch học tập", summary: "Gom lịch học, mục tiêu, đầu việc và tài liệu thành một lộ trình dễ theo dõi.", priority: "recommended", checklist: ["Xác định mục tiêu học kỳ", "Tạo danh sách môn/đầu việc", "Đặt mốc rà soát tiến độ"] },
      { slug: "important-contacts", title: "Đầu mối quan trọng", summary: "Lưu các đầu mối học tập và hành chính theo chức năng để không phải tìm lại.", priority: "reference", checklist: ["Phân nhóm theo chức năng", "Lưu kênh liên hệ chính", "Ghi chú thời điểm đã liên hệ gần nhất"] },
    ],
  },
  {
    slug: "health",
    code: "04",
    title: "Sức khỏe · y tế",
    shortTitle: "Sức khỏe · y tế",
    description: "Khung tra cứu y tế dành cho sinh hoạt ở Nga; nội dung chuyên môn sẽ được bổ sung có nguồn và ngày cập nhật.",
    stage: "SỨC KHỎE",
    topics: [
      { slug: "insurance", title: "Bảo hiểm · hồ sơ y tế", summary: "Một nơi lưu thông tin bảo hiểm và những giấy tờ y tế cần tra nhanh.", priority: "essential", checklist: ["Lưu thông tin bảo hiểm", "Lưu tài liệu y tế cá nhân cần thiết", "Ghi đầu mối hỗ trợ khi cần"] },
      { slug: "care-navigation", title: "Tìm nơi khám · xử lý ban đầu", summary: "Khung quyết định nên tìm loại cơ sở nào và cần chuẩn bị thông tin gì.", priority: "essential", checklist: ["Ghi triệu chứng và thời điểm bắt đầu", "Chuẩn bị giấy tờ cần mang", "Lưu địa chỉ cơ sở thường dùng"] },
      { slug: "medicine-reference", title: "Thuốc · tên hoạt chất", summary: "Dùng hoạt chất và mục đích sử dụng làm trục tra cứu; không tự thay thế chẩn đoán hay kê đơn.", priority: "reference", checklist: ["Ghi tên hoạt chất thay vì chỉ tên thương mại", "Lưu thuốc đang dùng nếu có", "Đánh dấu dị ứng/không dung nạp đã biết"] },
      { slug: "emergency", title: "Cấp cứu · thông tin khẩn", summary: "Trang tối giản để mở nhanh khi cần trình bày thông tin y tế thiết yếu.", priority: "essential", checklist: ["Chuẩn bị thông tin nhận dạng", "Lưu người cần liên hệ", "Ghi thông tin sức khỏe quan trọng cần báo ngay"] },
    ],
  },
  {
    slug: "integration",
    code: "05",
    title: "Ngôn ngữ · hòa nhập",
    shortTitle: "Ngôn ngữ · hòa nhập",
    description: "Tập trung vào các tình huống giao tiếp thực tế, từ sinh hoạt tới học tập và xử lý vấn đề.",
    stage: "HÒA NHẬP",
    topics: [
      { slug: "daily-russian", title: "Tiếng Nga sinh hoạt", summary: "Tổ chức mẫu câu theo tình huống thực tế để tra nhanh và luyện hằng ngày.", priority: "recommended", checklist: ["Chọn nhóm tình huống cần dùng nhất", "Tạo danh sách từ/câu chủ động", "Ôn lại theo tình huống thay vì từ rời"] },
      { slug: "school-russian", title: "Tiếng Nga học tập", summary: "Từ vựng và mẫu trao đổi dùng với giảng viên, phòng đào tạo và bạn học.", priority: "recommended", checklist: ["Tạo nhóm từ theo môn/học vụ", "Lưu mẫu câu hỏi cần dùng", "Ghi lại cụm từ mới sau mỗi tình huống"] },
      { slug: "culture-etiquette", title: "Văn hóa · ứng xử", summary: "Ghi chú các tình huống dễ hiểu sai và cách chuẩn bị để giao tiếp rõ ràng hơn.", priority: "reference", checklist: ["Ghi lại tình huống từng gặp", "Tách khác biệt ngôn ngữ và khác biệt thói quen", "Bổ sung cách xử lý hiệu quả"] },
      { slug: "personal-notes", title: "Sổ tay hòa nhập", summary: "Không gian cá nhân để biến kinh nghiệm thực tế thành checklist dùng lại về sau.", priority: "reference", checklist: ["Ghi điều mới học được", "Chuyển kinh nghiệm lặp lại thành checklist", "Rà soát ghi chú định kỳ"] },
    ],
  },
];

export function getRuLifeModule(slug: string) {
  return ruLifeModules.find((module) => module.slug === slug) || null;
}

export function getRuLifeTopic(moduleSlug: string, topicSlug: string) {
  const module = getRuLifeModule(moduleSlug);
  if (!module) return null;
  const topic = module.topics.find((item) => item.slug === topicSlug) || null;
  return topic ? { module, topic } : null;
}

export function topicCount() {
  return ruLifeModules.reduce((total, module) => total + module.topics.length, 0);
}

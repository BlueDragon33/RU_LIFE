export type TopicContentBlock = {
  title: string;
  lead?: string;
  items: string[];
  tone?: "normal" | "important" | "warning";
};

export type TopicSource = {
  title: string;
  publisher: string;
  url: string;
  checkedAt: string;
  note: string;
};

export type TopicContent = {
  updatedAt: string;
  freshness: "verified" | "review-soon" | "stable-guidance";
  intro: string;
  blocks: TopicContentBlock[];
  sources: TopicSource[];
};

const checkedAt = "2026-09-08";

const preparationContent: Record<string, TopicContent> = {
  documents: {
    updatedAt: checkedAt,
    freshness: "verified",
    intro: "Mục tiêu là tạo một bộ hồ sơ có thể dùng ngay khi làm thủ tục nhập cảnh, nhập học và xử lý sự cố thất lạc. Danh mục cuối cùng luôn phải đối chiếu với trường, loại visa và diện nhập học của từng người.",
    blocks: [
      {
        title: "Bộ mang theo người",
        tone: "important",
        items: [
          "Hộ chiếu đang dùng để nhập cảnh và visa học tập nếu diện của bạn yêu cầu visa.",
          "Giấy tờ/ thông báo liên quan đến nhập học, thư mời hoặc hồ sơ quota nếu trường/cơ quan cử đi yêu cầu xuất trình.",
          "Địa chỉ nơi ở, tên trường, đầu mối đón hoặc phòng phụ trách sinh viên quốc tế được lưu cả trên điện thoại và bản giấy.",
          "Một bộ giấy tờ y tế/bảo hiểm mà trường hoặc cơ quan quản lý đã yêu cầu trước chuyến đi.",
        ],
      },
      {
        title: "Bộ sao lưu",
        items: [
          "Chụp/scan rõ toàn bộ trang thông tin hộ chiếu, visa và các giấy tờ quan trọng; không cắt mất mép, số hoặc dấu.",
          "Lưu ít nhất hai bản số ở hai nơi độc lập; tránh chỉ để duy nhất trong điện thoại mang theo.",
          "Chuẩn bị một số bản photocopy riêng để nộp khi cần, nhưng luôn giữ bản gốc trong kiểm soát của mình.",
          "Tên tiếng Việt/Latin trên mọi biểu mẫu phải được đối chiếu với hộ chiếu để tránh sai khác chính tả.",
        ],
      },
      {
        title: "Sau khi qua biên giới",
        tone: "warning",
        items: [
          "Kiểm tra và giữ kỹ giấy tờ nhập cảnh được cấp tại biên giới, bao gồm thẻ di trú khi áp dụng.",
          "Không tự suy đoán thời hạn đăng ký cư trú hay thủ tục sinh viên nước ngoài; báo ngay cho trường/ký túc xá và làm theo hướng dẫn hiện hành của đơn vị tiếp nhận.",
          "Nếu mất hộ chiếu, visa hoặc giấy tờ nhập cảnh, ưu tiên liên hệ cơ quan có thẩm quyền và đầu mối trường thay vì chờ đến sát hạn mới xử lý.",
        ],
      },
      {
        title: "Điều cần tránh",
        items: [
          "Không dùng e-visa như một phương án thay thế mặc định cho visa học tập. Trang e-visa của Bộ Ngoại giao Nga nêu các mục đích được phép riêng và mục đích học tập không nằm trong nhóm đó.",
          "Không dựa vào danh sách giấy tờ của một trường khác để kết luận hồ sơ của mình đã đủ; yêu cầu nhập học và y tế có thể khác nhau theo cơ sở đào tạo.",
        ],
      },
    ],
    sources: [
      {
        title: "Studying in Russia – Education / documents for life in Russia",
        publisher: "Study in Russia",
        url: "https://studyinrussia.ru/en/education",
        checkedAt,
        note: "Nguồn chính thức về nhóm giấy tờ nhập cảnh và các giấy tờ cần hoàn thiện sau khi vào Nga.",
      },
      {
        title: "Online application to a Russian university – arrival in Russia",
        publisher: "Study in Russia",
        url: "https://studyinrussia.ru/en/online-admission",
        checkedAt,
        note: "Dùng để đối chiếu luồng visa học tập, thư mời và chuẩn bị hồ sơ.",
      },
      {
        title: "Unified electronic visa – official instructions",
        publisher: "Consular Department, Ministry of Foreign Affairs of Russia",
        url: "https://evisa.kdmid.ru/Home/Instruction",
        checkedAt,
        note: "Dùng để phân biệt phạm vi e-visa với mục đích học tập; không thay thế hướng dẫn visa của trường/LSQ.",
      },
    ],
  },
  luggage: {
    updatedAt: checkedAt,
    freshness: "stable-guidance",
    intro: "Hành lý nên được thiết kế theo ba lớp: phải có khi xuống máy bay, cần cho 1–2 tuần đầu và có thể mua sau. Không hard-code số kg vì giới hạn phụ thuộc hãng, hạng vé và chặng bay.",
    blocks: [
      {
        title: "Túi luôn mang theo người",
        tone: "important",
        items: [
          "Hộ chiếu, visa, hồ sơ nhập cảnh và các giấy tờ không thể thay thế.",
          "Điện thoại, sạc, pin dự phòng đúng quy định hãng bay và một cáp sạc dự phòng.",
          "Thuốc cá nhân cần dùng trong hành trình kèm thông tin hoạt chất/đơn thuốc khi phù hợp; không chia thuốc quan trọng hết vào hành lý ký gửi.",
          "Một bộ quần áo tối thiểu và vật dụng thiết yếu đủ dùng nếu hành lý ký gửi đến chậm.",
        ],
      },
      {
        title: "Hành lý ký gửi",
        items: [
          "Ưu tiên đồ khó mua ngay trong ngày đầu hoặc cần đúng kích cỡ; tránh mang quá nhiều đồ thông dụng có thể mua tại Nga.",
          "Đồ mùa đông chỉ mang theo mức phù hợp với thời điểm đến; nếu đến trước mùa lạnh, có thể mua bổ sung tại chỗ sau khi biết điều kiện thực tế.",
          "Dán thông tin liên hệ bên trong vali và chụp ảnh vali trước khi gửi để hỗ trợ nhận dạng nếu thất lạc.",
          "Chia đồ quan trọng giữa các kiện nếu có nhiều kiện để giảm rủi ro mất toàn bộ một nhóm vật dụng.",
        ],
      },
      {
        title: "Kiểm tra trước ngày bay",
        tone: "warning",
        items: [
          "Mở đúng vé của mình và kiểm tra lại hạn mức cabin/ký gửi trên hãng khai thác thực tế, không dùng thông tin từ vé cũ hoặc người khác.",
          "Kiểm tra danh mục vật phẩm cấm/hạn chế và quy định pin lithium của hãng trước khi đóng vali.",
          "Cân thử từng kiện tại nhà và chừa biên an toàn thay vì đóng sát giới hạn công bố.",
        ],
      },
    ],
    sources: [],
  },
  "money-connectivity": {
    updatedAt: checkedAt,
    freshness: "review-soon",
    intro: "Phương án tiền và liên lạc phải có dự phòng vì khả năng thanh toán quốc tế, roaming và yêu cầu đăng ký thuê bao có thể thay đổi. Mục tiêu là không để một lỗi thẻ hoặc mất mạng làm gián đoạn ngày đầu.",
    blocks: [
      {
        title: "Tài chính ngày đầu",
        tone: "important",
        items: [
          "Chuẩn bị nhiều hơn một phương án thanh toán hợp pháp; không dựa duy nhất vào một thẻ quốc tế hoặc một ứng dụng.",
          "Tách tiền dự phòng khỏi ví sử dụng hằng ngày và không để toàn bộ phương tiện thanh toán trong cùng một chỗ.",
          "Lập ngân sách riêng cho di chuyển từ sân bay, ăn uống, SIM/Internet, đồ dùng thiết yếu và khoản phát sinh trong 72 giờ đầu.",
          "Trước khi bay, kiểm tra lại với ngân hàng/đơn vị phát hành khả năng sử dụng phương tiện thanh toán tại Nga ở thời điểm thực tế.",
        ],
      },
      {
        title: "Liên lạc không phụ thuộc một mạng",
        items: [
          "Bật phương án roaming tối thiểu hoặc có kênh dự phòng để nhận SMS/cuộc gọi trong ngày đầu nếu cần.",
          "Tải offline địa chỉ trường, ký túc xá, bản đồ khu vực đến và thông tin chuyến đi.",
          "Lưu số điện thoại và địa chỉ bằng cả tiếng Việt/Anh và tiếng Nga nếu đã có bản chính xác.",
          "Quy định đăng ký SIM cho người nước ngoài có thể thay đổi; xử lý theo yêu cầu hiện hành sau khi đến thay vì dựa vào hướng dẫn cũ.",
        ],
      },
      {
        title: "Kênh liên hệ khẩn",
        items: [
          "Đầu mối trường/ký túc xá hoặc người đón.",
          "Người thân tại Việt Nam và một người có thể hỗ trợ tại Nga nếu có.",
          "Thông tin cơ quan đại diện Việt Nam phù hợp với khu vực sẽ được bổ sung ở module An toàn sau khi xác minh nguồn chính thức.",
        ],
      },
    ],
    sources: [],
  },
  "arrival-plan": {
    updatedAt: checkedAt,
    freshness: "verified",
    intro: "Trang này dùng như một trình tự thao tác từ lúc hạ cánh đến khi ổn định chỗ ở. Các bước pháp lý sau nhập cảnh sẽ được tách sang module Thủ tục để tránh lẫn với checklist di chuyển.",
    blocks: [
      {
        title: "Trước khi máy bay hạ cánh",
        items: [
          "Đưa địa chỉ nơi ở, tên trường và đầu mối đón vào màn hình ghi chú có thể mở offline.",
          "Đảm bảo điện thoại còn pin và có phương án liên lạc dự phòng.",
          "Xác định trước điểm gặp, ga/terminal và cách đi dự phòng nếu người đón không xuất hiện.",
        ],
      },
      {
        title: "Tại cửa khẩu và khu lấy hành lý",
        tone: "important",
        items: [
          "Dùng đúng hộ chiếu/visa của hành trình và trả lời mục đích nhập cảnh nhất quán với hồ sơ.",
          "Nhận và kiểm tra giấy tờ nhập cảnh được cấp khi áp dụng; cất ngay cùng bộ hồ sơ chính.",
          "Kiểm tra đủ hành lý trước khi rời khu vực; nếu thất lạc, báo tại quầy hãng/sân bay trước khi đi khỏi sân bay và giữ biên nhận.",
        ],
      },
      {
        title: "Từ sân bay tới nơi ở",
        items: [
          "Ưu tiên phương án di chuyển đã xác định trước; không đổi kế hoạch chỉ vì lời mời chào không kiểm chứng tại sân bay.",
          "Không giao hộ chiếu hoặc toàn bộ giấy tờ cho người không có trách nhiệm xử lý thủ tục.",
          "Khi tới nơi ở, xác nhận ngay với đầu mối trường/ký túc xá rằng bạn đã đến và hỏi bước hành chính tiếp theo.",
        ],
      },
      {
        title: "Trong 24 giờ đầu",
        tone: "warning",
        items: [
          "Chụp lại toàn bộ giấy tờ nhập cảnh mới phát sinh và lưu bản sao số.",
          "Xác nhận lịch làm việc với bộ phận sinh viên quốc tế/đơn vị phụ trách thủ tục.",
          "Không trì hoãn các thủ tục cư trú chỉ vì chưa bắt đầu học; thời hạn và quy trình phải được kiểm tra theo hướng dẫn hiện hành.",
        ],
      },
    ],
    sources: [
      {
        title: "Studying in Russia – Arrival in Russia",
        publisher: "Study in Russia",
        url: "https://studyinrussia.ru/en?lang=en",
        checkedAt,
        note: "Nguồn chính thức mô tả bước chuẩn bị nhập cảnh và thông báo trường theo diện visa/không visa.",
      },
      {
        title: "Studying in Russia – documents after entry",
        publisher: "Study in Russia",
        url: "https://studyinrussia.ru/en/education",
        checkedAt,
        note: "Dùng để xác nhận nhóm giấy tờ phát sinh sau khi nhập cảnh; thời hạn cụ thể phải kiểm tra lại theo trường và quy định hiện hành.",
      },
    ],
  },
};

export function getTopicContent(moduleSlug: string, topicSlug: string): TopicContent | null {
  if (moduleSlug !== "prepare") return null;
  return preparationContent[topicSlug] || null;
}

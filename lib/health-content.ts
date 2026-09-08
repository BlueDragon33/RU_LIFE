import type { TopicContent } from "./topic-content";

const checkedAt = "2026-09-08";

export const healthContent: Record<string, TopicContent> = {
  insurance: {
    updatedAt: checkedAt,
    freshness: "verified",
    intro: "Bảo hiểm y tế trong RU_LIFE được dùng như một công cụ điều hướng: biết mình đang có loại bảo hiểm nào, cơ sở nào nằm trong phạm vi sử dụng và phải gọi ai trước khi đi khám. Không suy đoán quyền lợi chỉ từ tên gói bảo hiểm.",
    blocks: [
      {
        title: "Bộ hồ sơ y tế cần lưu",
        tone: "important",
        items: [
          "Lưu ảnh hoặc PDF của hợp đồng/policy, số hợp đồng, thời hạn hiệu lực và số hotline của đơn vị bảo hiểm.",
          "Ghi rõ loại bảo hiểm đang dùng: DMS/VHI, OMS nếu thuộc diện được cấp, hoặc cơ chế thanh toán khác theo tình trạng pháp lý của bạn.",
          "Lưu danh sách cơ sở y tế nằm trong chương trình bảo hiểm thay vì mặc định mọi bệnh viện đều tiếp nhận theo cùng điều kiện.",
          "Lưu riêng các giấy tờ y tế cá nhân quan trọng: dị ứng đã biết, thuốc đang dùng, bệnh nền cần báo cho bác sĩ và tài liệu điều trị trước đó nếu có.",
        ],
      },
      {
        title: "Trước khi đi khám theo kế hoạch",
        items: [
          "Kiểm tra cơ sở dự định đến có nằm trong mạng lưới của policy hay không và có cần gọi hotline/đặt lịch trước hay không.",
          "Hỏi rõ phần nào được bảo hiểm thanh toán, phần nào người bệnh phải tự trả; không dựa vào kinh nghiệm của người khác có policy khác.",
          "Mang giấy tờ nhận dạng và thông tin bảo hiểm; nếu trường có phòng y tế hoặc đầu mối sinh viên quốc tế, lưu kênh liên hệ để hỏi khi cần.",
        ],
      },
      {
        title: "Không trì hoãn cấp cứu vì bảo hiểm",
        tone: "warning",
        items: [
          "Quy định hiện hành của Nga nêu chăm sóc y tế ở dạng cấp cứu khi có tình trạng đe dọa tính mạng được cung cấp cho người nước ngoài miễn phí.",
          "Cấp cứu và chăm sóc theo kế hoạch là hai luồng khác nhau. Việc thiếu policy phù hợp không phải lý do để trì hoãn gọi trợ giúp khi có tình trạng khẩn cấp.",
          "Quyền lợi điều trị tiếp theo sau giai đoạn cấp cứu có thể phụ thuộc tình trạng bảo hiểm, hợp đồng dịch vụ và tình trạng pháp lý; xác minh với cơ sở y tế hoặc bảo hiểm.",
        ],
      },
    ],
    sources: [
      {
        title: "Why Russia – Medicine and voluntary health insurance",
        publisher: "Study in Russia",
        url: "https://studyinrussia.ru/en/why-russia",
        checkedAt,
        note: "Nguồn chính thức dành cho sinh viên quốc tế: mô tả DMS/VHI, phạm vi cơ sở trong chương trình và yêu cầu kiểm tra điều kiện theo từng trường.",
      },
      {
        title: "Government Resolution No. 631 of 8 May 2025 – medical care for foreign citizens",
        publisher: "Government of the Russian Federation",
        url: "https://government.ru/docs/all/158874/",
        checkedAt,
        note: "Quy tắc hiện hành từ 01/09/2025 về chăm sóc y tế cho người nước ngoài, gồm cấp cứu miễn phí và luồng chăm sóc không khẩn cấp/theo kế hoạch.",
      },
    ],
  },
  "care-navigation": {
    updatedAt: checkedAt,
    freshness: "verified",
    intro: "Trang này không chẩn đoán bệnh. Nó chỉ giúp quyết định nên dùng luồng cấp cứu, liên hệ bảo hiểm/phòng khám hay đặt lịch khám theo kế hoạch, đồng thời chuẩn bị thông tin để nhân viên y tế đánh giá nhanh hơn.",
    blocks: [
      {
        title: "Khi nào ưu tiên gọi cấp cứu",
        tone: "warning",
        items: [
          "Nếu tình trạng có vẻ đe dọa tính mạng, diễn biến nhanh hoặc người bệnh không thể tự di chuyển an toàn, ưu tiên gọi 112 hoặc 103 thay vì tự tìm chẩn đoán trên mạng.",
          "Nói ngắn gọn địa chỉ hiện tại, chuyện gì đang xảy ra, tuổi xấp xỉ của người bệnh và số điện thoại có thể gọi lại.",
          "Nếu có người hỗ trợ, một người gọi cấp cứu trong khi người còn lại chuẩn bị giấy tờ và mở đường cho đội y tế tiếp cận.",
        ],
      },
      {
        title: "Khám không cấp cứu hoặc theo kế hoạch",
        items: [
          "Bắt đầu từ hotline bảo hiểm, phòng y tế trường hoặc cơ sở nằm trong mạng lưới của policy nếu tình trạng không phải cấp cứu.",
          "Ghi trước triệu chứng chính theo ngôn ngữ đơn giản: bắt đầu từ khi nào, thay đổi ra sao, điều gì làm nặng hơn hoặc giảm đi, và các thuốc đã dùng gần đây.",
          "Mang danh sách thuốc đang sử dụng và dị ứng đã biết; không cố dịch tên thương mại nếu chưa chắc, ưu tiên hoạt chất/INN khi có thể xác định chính xác.",
          "Sau buổi khám, lưu chẩn đoán do bác sĩ ghi, đơn thuốc, kết quả xét nghiệm và hướng dẫn tái khám thành một bộ hồ sơ theo ngày.",
        ],
      },
      {
        title: "Nguyên tắc an toàn của RU_LIFE",
        tone: "important",
        items: [
          "RU_LIFE không dùng checklist triệu chứng để tự kết luận bệnh.",
          "Không dùng một kết quả xét nghiệm đơn lẻ để tự quyết định điều trị hoặc ngừng thuốc đã được bác sĩ kê.",
          "Nếu không hiểu hướng dẫn, yêu cầu cơ sở y tế hoặc người phiên dịch giải thích lại thay vì tự suy diễn từ bản dịch máy.",
        ],
      },
    ],
    sources: [
      {
        title: "Why Russia – Medicine",
        publisher: "Study in Russia",
        url: "https://studyinrussia.ru/en/why-russia",
        checkedAt,
        note: "Nguồn chính thức nêu số 112 và nguyên tắc bảo hiểm đối với chăm sóc theo kế hoạch cho sinh viên quốc tế.",
      },
      {
        title: "Government Resolution No. 631 of 8 May 2025",
        publisher: "Government of the Russian Federation",
        url: "https://government.ru/docs/all/158874/",
        checkedAt,
        note: "Dùng để phân biệt chăm sóc cấp cứu với chăm sóc không khẩn cấp/theo kế hoạch cho người nước ngoài.",
      },
    ],
  },
  "medicine-reference": {
    updatedAt: checkedAt,
    freshness: "stable-guidance",
    intro: "Mục tiêu là tránh nhầm thuốc khi chuyển giữa tên thương mại ở Việt Nam và Nga. Trục tra cứu chính là hoạt chất quốc tế/INN (МНН), dạng bào chế và hàm lượng trên bao bì; RU_LIFE không đề xuất liều dùng hoặc tự thay thế thuốc.",
    blocks: [
      {
        title: "Cách ghi một thuốc đang dùng",
        tone: "important",
        items: [
          "Tên thương mại trên hộp hoặc đơn thuốc.",
          "Hoạt chất/INN (МНН) được xác nhận từ nhãn, tờ hướng dẫn hoặc nguồn đăng ký thuốc chính thức.",
          "Dạng bào chế và hàm lượng đúng như trên sản phẩm; không suy ra hai sản phẩm là tương đương chỉ vì tên gần giống.",
          "Lý do bác sĩ đã kê, thời điểm bắt đầu dùng và cơ sở/bác sĩ kê nếu thông tin đó có sẵn.",
        ],
      },
      {
        title: "Khi tìm thuốc tương ứng tại Nga",
        items: [
          "Đưa hoạt chất/INN, dạng bào chế và thông tin đơn thuốc cho dược sĩ hoặc bác sĩ thay vì chỉ đọc tên thương mại ở Việt Nam.",
          "Kiểm tra thuốc trong nguồn đăng ký chính thức của Bộ Y tế Nga khi cần xác minh tên hoạt chất hoặc tình trạng đăng ký.",
          "Không tự đổi sang sản phẩm khác nếu khác hàm lượng, dạng bào chế, phối hợp hoạt chất hoặc điều kiện kê đơn.",
          "Không dùng RU_LIFE để quyết định tăng, giảm, chia hoặc ngừng liều thuốc.",
        ],
      },
      {
        title: "Thông tin nên lưu riêng",
        tone: "warning",
        items: [
          "Dị ứng thuốc hoặc phản ứng có hại đã từng được ghi nhận.",
          "Danh sách thuốc kê đơn, thuốc không kê đơn và thực phẩm bổ sung đang dùng nếu có.",
          "Ảnh rõ hai mặt hộp thuốc hoặc đơn thuốc khi đi xa để giảm nhầm lẫn tên sản phẩm.",
        ],
      },
    ],
    sources: [
      {
        title: "State Register of Medicines",
        publisher: "Ministry of Health of the Russian Federation",
        url: "https://minzdrav.gov.ru/opendata/7707778246-grls",
        checkedAt,
        note: "Nguồn chính thức xác nhận cơ sở dữ liệu đăng ký thuốc của Bộ Y tế Nga; dùng để kiểm tra tên/đăng ký, không dùng để tự kê đơn.",
      },
    ],
  },
  emergency: {
    updatedAt: checkedAt,
    freshness: "verified",
    intro: "Trang cấp cứu được thiết kế để mở nhanh, không yêu cầu đọc dài. Mục tiêu là gọi đúng số, truyền đạt vị trí và thông tin thiết yếu, sau đó để nhân viên y tế đánh giá tình trạng.",
    blocks: [
      {
        title: "Gọi trợ giúp",
        tone: "warning",
        items: [
          "112 — số thống nhất để gọi các dịch vụ khẩn cấp tại Nga.",
          "103 — cấp cứu y tế. Nếu không chắc cần dịch vụ nào hoặc khó kết nối đúng đầu mối, ưu tiên 112.",
          "Không trì hoãn cuộc gọi để tìm policy, tự chẩn đoán hoặc tra cứu thuốc nếu người bệnh có thể đang trong tình trạng nguy hiểm.",
        ],
      },
      {
        title: "Thông tin cần nói trước",
        items: [
          "Địa chỉ hiện tại hoặc điểm mốc rõ ràng; lưu địa chỉ chỗ ở bằng tiếng Nga để có thể đọc hoặc đưa cho người khác.",
          "Tình trạng chính đang xảy ra bằng một câu ngắn, thời điểm bắt đầu và số người cần trợ giúp.",
          "Số điện thoại có thể gọi lại và cách vào tòa nhà/ký túc xá nếu có kiểm soát cửa.",
        ],
      },
      {
        title: "Cụm từ tối thiểu bằng tiếng Nga",
        items: [
          "«Мне нужна скорая помощь» — Tôi cần xe cấp cứu.",
          "«Адрес: …» — Địa chỉ là…",
          "«У меня аллергия на …» — Tôi dị ứng với… (chỉ dùng khi bạn biết chắc thông tin dị ứng của mình).",
          "«Я принимаю …» — Tôi đang dùng… (đưa tên thuốc/đơn thuốc cho nhân viên y tế nếu có).",
        ],
      },
      {
        title: "Bộ thông tin khẩn trên điện thoại",
        tone: "important",
        items: [
          "Họ tên theo hộ chiếu, ngày sinh và người cần liên hệ.",
          "Địa chỉ nơi ở hiện tại bằng tiếng Nga.",
          "Dị ứng đã biết, bệnh nền quan trọng và thuốc đang dùng nếu có.",
          "Ảnh policy bảo hiểm và số hotline, nhưng không để việc tìm bảo hiểm làm chậm cuộc gọi cấp cứu.",
        ],
      },
    ],
    sources: [
      {
        title: "Why Russia – Medicine",
        publisher: "Study in Russia",
        url: "https://studyinrussia.ru/en/why-russia",
        checkedAt,
        note: "Nguồn chính thức dành cho sinh viên quốc tế xác nhận 112 và quyền được cấp cứu miễn phí.",
      },
      {
        title: "Government Resolution No. 631 of 8 May 2025",
        publisher: "Government of the Russian Federation",
        url: "https://government.ru/docs/all/158874/",
        checkedAt,
        note: "Nguồn pháp lý hiện hành về việc chăm sóc cấp cứu cho người nước ngoài tại Nga.",
      },
    ],
  },
};

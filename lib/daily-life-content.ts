import type { TopicContent } from "./topic-content";

const checkedAt = "2026-09-08";

export const dailyLifeContent: Record<string, TopicContent> = {
  housing: {
    updatedAt: checkedAt,
    freshness: "verified",
    intro: "Chỗ ở là điểm neo của cả cư trú, liên lạc và sinh hoạt. Với ký túc xá, thủ tục nhận phòng do từng trường quy định; sinh viên theo quota Chính phủ Nga được Study in Russia nêu là được bảo đảm chỗ ở ký túc xá, nhưng quy trình nhận phòng vẫn phải theo trường cụ thể.",
    blocks: [
      {
        title: "Trước khi nhận phòng",
        tone: "important",
        items: [
          "Xác nhận chính xác địa chỉ tòa nhà, giờ làm việc và đầu mối tiếp nhận; không chỉ lưu tên chung của ký túc xá.",
          "Chuẩn bị hộ chiếu, giấy tờ nhập cảnh và các giấy tờ trường yêu cầu; danh mục y tế/ảnh/bản dịch có thể khác nhau giữa các cơ sở.",
          "Hỏi rõ khoản nào phải thanh toán trước, hình thức thanh toán được chấp nhận và cần giữ loại biên nhận nào.",
          "Nếu đến ngoài giờ, phải có phương án lưu trú/đón nhận được xác nhận trước thay vì giả định bảo vệ sẽ tự cho vào.",
        ],
      },
      {
        title: "Khi nhận phòng",
        items: [
          "Chụp tình trạng phòng, đồ đạc và các hư hỏng có sẵn trước khi sắp xếp đồ cá nhân.",
          "Kiểm tra khóa cửa, ổ điện, nước, sưởi, cửa sổ và các thiết bị được bàn giao; báo lỗi theo kênh chính thức của ký túc xá.",
          "Lưu nội quy, giờ ra vào, quy trình khách thăm, giặt sấy, bếp và xử lý sự cố cháy/nước/điện.",
          "Ghi tên/số phòng của quản lý tầng hoặc đầu mối trực thay vì chỉ lưu một số điện thoại chung.",
        ],
      },
      {
        title: "Không trộn thủ tục cư trú với chuyện nhận phòng",
        tone: "warning",
        items: [
          "Việc được nhận phòng không đồng nghĩa mọi thủ tục cư trú đã hoàn tất.",
          "Ngay sau khi ổn định chỗ ở, hỏi bộ phận phụ trách sinh viên quốc tế/ký túc xá về giấy tờ cư trú cần nộp và mốc xử lý hiện hành.",
          "Mỗi lần đổi nơi ở hoặc phát sinh giấy tờ mới, phải kiểm tra lại nghĩa vụ hành chính thay vì áp dụng máy móc quy trình lần trước.",
        ],
      },
    ],
    sources: [
      {
        title: "Studying in Russia – Education / dormitory for foreign students",
        publisher: "Study in Russia",
        url: "https://studyinrussia.ru/en/education",
        checkedAt,
        note: "Nguồn chính thức nêu nguyên tắc chỗ ở ký túc xá và quyền của sinh viên quota; thủ tục nhận phòng cụ thể vẫn do từng trường quyết định.",
      },
    ],
  },
  transport: {
    updatedAt: checkedAt,
    freshness: "review-soon",
    intro: "Đi lại nên được tổ chức theo tuyến thường dùng và phương án dự phòng. RU_LIFE không khóa tên ứng dụng, giá vé hoặc biểu giá vì chúng thay đổi theo thành phố và thời điểm.",
    blocks: [
      {
        title: "Ba tuyến phải lưu trước",
        items: [
          "Nơi ở ↔ trường/cơ sở học tập.",
          "Nơi ở ↔ ga/sân bay hoặc điểm trung chuyển chính.",
          "Nơi ở ↔ cơ sở y tế/điểm hỗ trợ quan trọng gần nhất khi đã xác định được.",
        ],
      },
      {
        title: "Chuẩn bị offline",
        tone: "important",
        items: [
          "Lưu tên ga/bến và địa chỉ bằng tiếng Nga; ảnh chụp màn hình tuyến thường hữu ích hơn một đường link cần Internet.",
          "Biết điểm xuống trước một chặng và quan sát thông báo trên phương tiện thay vì chỉ chờ định vị GPS.",
          "Luôn có một phương án đi bộ ngắn hoặc tuyến thay thế khi tàu/bus đổi lịch, đóng lối vào hoặc điện thoại hết pin.",
        ],
      },
      {
        title: "Taxi và di chuyển ban đêm",
        tone: "warning",
        items: [
          "Ưu tiên dịch vụ có thông tin chuyến đi/biển số/giá hiển thị rõ thay vì nhận lời chào mời không kiểm chứng.",
          "Gửi hành trình hoặc thông tin xe cho người quen khi di chuyển khuya hoặc tới địa điểm lạ.",
          "Không để hộ chiếu, ví và điện thoại cùng một túi dễ quên trên xe.",
        ],
      },
    ],
    sources: [],
  },
  "shopping-services": {
    updatedAt: checkedAt,
    freshness: "stable-guidance",
    intro: "Mục tiêu không phải lập danh sách cửa hàng cố định mà là tạo hệ thống mua sắm có thể dùng ở bất kỳ thành phố nào: đồ cần ngay, đồ mua định kỳ và dịch vụ cần lưu địa chỉ.",
    blocks: [
      {
        title: "72 giờ đầu",
        items: [
          "Ưu tiên nước uống, thực phẩm cơ bản, đồ vệ sinh, ổ cắm/cáp cần thiết và vật dụng ngủ nếu ký túc xá không cấp đủ.",
          "Không mua số lượng lớn ngay khi chưa biết kích thước tủ, bếp, tủ lạnh và quy định phòng.",
          "Giữ hóa đơn cho đồ điện/điện tử và vật dụng có bảo hành.",
        ],
      },
      {
        title: "Danh sách dịch vụ nên lưu",
        items: [
          "Siêu thị/cửa hàng thực phẩm thường dùng.",
          "Hiệu thuốc và cơ sở y tế gần nơi ở.",
          "Giặt sấy, sửa khóa/điện/nước theo kênh ký túc xá hoặc chủ nhà.",
          "Điểm in/photocopy/chụp ảnh giấy tờ gần trường.",
        ],
      },
      {
        title: "Kiểm soát chi tiêu",
        items: [
          "Tách chi phí bắt buộc hằng tháng khỏi chi phí mua sắm ban đầu.",
          "Theo dõi giá theo đơn vị/kg/lít thay vì chỉ nhìn giá gói để dễ so sánh khi chưa quen sản phẩm.",
          "Không khóa ngân sách bằng mức giá mẫu cũ trong RU_LIFE; giá và khuyến mại phải xem ở thời điểm mua.",
        ],
      },
    ],
    sources: [],
  },
  safety: {
    updatedAt: checkedAt,
    freshness: "verified",
    intro: "Trang an toàn phải mở nhanh và ưu tiên hành động. Tại Nga, 112 là số thống nhất để gọi các dịch vụ khẩn cấp; các số chuyên biệt 101/102/103/104 cũng đang được sử dụng theo hệ thống đánh số hiện hành.",
    blocks: [
      {
        title: "Khi có nguy hiểm ngay lập tức",
        tone: "important",
        items: [
          "Gọi 112 khi cần dịch vụ khẩn cấp hoặc không chắc phải gọi lực lượng nào; nêu địa điểm, chuyện gì xảy ra và số người bị ảnh hưởng.",
          "Nếu cần dịch vụ chuyên biệt: 101 cứu hỏa/cứu nạn, 102 cảnh sát, 103 cấp cứu y tế, 104 sự cố khí gas.",
          "Không cúp máy trước khi người tiếp nhận xác nhận đã đủ thông tin; nếu có thể, chuẩn bị địa chỉ bằng tiếng Nga để đọc rõ.",
        ],
      },
      {
        title: "Bộ thông tin khẩn cấp cá nhân",
        items: [
          "Họ tên theo hộ chiếu, ngày sinh và quốc tịch.",
          "Địa chỉ đang ở bằng tiếng Nga và số phòng/tầng nếu có.",
          "Tên trường, đầu mối sinh viên quốc tế/ký túc xá và một người thân cần báo.",
          "Thông tin y tế quan trọng như dị ứng nghiêm trọng hoặc thuốc bắt buộc nếu có.",
        ],
      },
      {
        title: "Mất giấy tờ hoặc điện thoại",
        tone: "warning",
        items: [
          "Dùng bản sao số để xác định chính xác số hộ chiếu/visa/giấy tờ bị mất nhưng không coi bản sao là giấy tờ thay thế hợp pháp.",
          "Khóa tài khoản/ngân hàng/thiết bị có nguy cơ bị truy cập và báo cho đầu mối trường nếu sự cố ảnh hưởng thủ tục cư trú.",
          "Liên hệ cơ quan có thẩm quyền và cơ quan đại diện phù hợp; không chờ đến sát hạn giấy tờ mới bắt đầu xử lý.",
        ],
      },
    ],
    sources: [
      {
        title: "Система-112 – единый номер вызова экстренных служб",
        publisher: "МЧС России",
        url: "https://50.mchs.gov.ru/deyatelnost/poleznaya-informaciya/rekomendacii-naseleniyu/sistema-112",
        checkedAt,
        note: "Nguồn MChS mô tả 112 là số thống nhất gọi các dịch vụ khẩn cấp trên lãnh thổ Nga.",
      },
      {
        title: "Важно: о номерах телефонов вызова экстренных служб",
        publisher: "МЧС России",
        url: "https://60.mchs.gov.ru/deyatelnost/press-centr/novosti/5469897",
        checkedAt,
        note: "Nguồn MChS cập nhật hệ thống số 101/102/103/104 và 112.",
      },
    ],
  },
};

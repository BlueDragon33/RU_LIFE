import type { TopicContent } from "./topic-content";

const checkedAt = "2026-09-08";

export const integrationContent: Record<string, TopicContent> = {
  "daily-russian": {
    updatedAt: checkedAt,
    freshness: "stable-guidance",
    intro: "Mục tiêu không phải học thật nhiều từ rời rạc, mà là có một bộ câu ngắn dùng được ngay trong những tình huống lặp lại hằng ngày. Người dùng nên nghe cách người bản địa diễn đạt trong tình huống thực tế rồi bổ sung dần vào sổ tay cá nhân.",
    blocks: [
      {
        title: "Bộ câu mở đầu tối thiểu",
        tone: "important",
        items: [
          "Здравствуйте. — Xin chào (lịch sự/trang trọng).",
          "Подскажите, пожалуйста… — Xin vui lòng cho tôi hỏi/cho tôi biết…",
          "Я плохо говорю по-русски. Говорите, пожалуйста, медленнее. — Tôi nói tiếng Nga chưa tốt. Xin hãy nói chậm hơn.",
          "Я не понимаю. Можете повторить? — Tôi không hiểu. Bạn có thể nói lại không?",
        ],
      },
      {
        title: "Đi đường · mua sắm · dịch vụ",
        items: [
          "Где находится …? — … ở đâu?",
          "Как туда добраться? — Đi tới đó như thế nào?",
          "Сколько это стоит? — Cái này giá bao nhiêu?",
          "Можно оплатить картой? — Có thể thanh toán bằng thẻ không?",
          "Мне нужен чек, пожалуйста. — Cho tôi xin hóa đơn/biên lai.",
        ],
      },
      {
        title: "Cách luyện để dùng được",
        items: [
          "Học theo tình huống: đi siêu thị, ký túc xá, nhà ga, phòng hành chính, bệnh viện; không học một danh sách dài không có ngữ cảnh.",
          "Mỗi tình huống chỉ giữ 3–5 câu chủ động mà bạn có thể tự nói ngay, sau đó mới mở rộng.",
          "Ghi lại câu thật đã nghe trong đời sống và đối chiếu nghĩa trước khi đưa vào bộ câu dùng lại.",
          "Ưu tiên phát âm dễ hiểu và câu ngắn đúng ý hơn là cố tạo câu dài phức tạp.",
        ],
      },
      {
        title: "Khi không chắc mình đã hiểu đúng",
        tone: "warning",
        items: [
          "Không gật đầu cho qua nếu nội dung liên quan tiền, giấy tờ, lịch hẹn hoặc nghĩa vụ hành chính.",
          "Yêu cầu viết lại địa chỉ, số phòng, ngày giờ hoặc tên giấy tờ nếu nghe không chắc.",
          "Có thể dùng câu: Правильно ли я понял, что…? — Tôi hiểu như thế này có đúng không…? rồi nhắc lại ý chính.",
        ],
      },
    ],
    sources: [],
  },
  "school-russian": {
    updatedAt: checkedAt,
    freshness: "stable-guidance",
    intro: "Tiếng Nga học tập cần ưu tiên khả năng xác nhận yêu cầu, deadline, phòng học và đầu mối phụ trách. Đây là các mẫu câu vận hành, không thay thế việc học tiếng Nga chuyên ngành của từng chương trình.",
    blocks: [
      {
        title: "Trong lớp và khi hỏi giảng viên",
        tone: "important",
        items: [
          "Я иностранный студент. — Tôi là sinh viên nước ngoài.",
          "Можно уточнить требования к заданию? — Tôi có thể hỏi lại yêu cầu của bài tập không?",
          "Когда нужно сдать работу? — Khi nào phải nộp bài?",
          "Я не понимаю этот пункт. Можете объяснить ещё раз? — Tôi chưa hiểu mục này. Thầy/cô có thể giải thích lại không?",
        ],
      },
      {
        title: "Phòng học · lịch · học vụ",
        items: [
          "В какой аудитории будет занятие? — Buổi học ở phòng nào?",
          "Расписание изменилось? — Lịch học có thay đổi không?",
          "К кому обратиться по этому вопросу? — Tôi cần liên hệ ai về việc này?",
          "Какие документы нужно предоставить? — Cần nộp những giấy tờ nào?",
        ],
      },
      {
        title: "Xác nhận thông tin quan trọng",
        items: [
          "Sau trao đổi miệng về deadline hoặc hồ sơ quan trọng, ghi lại ngày giờ và nội dung ngay trong ghi chú.",
          "Nếu có thể, xin đường dẫn hoặc văn bản chính thức thay vì chỉ dựa vào lời truyền miệng từ bạn học.",
          "Khi gửi email/tin nhắn học vụ, viết ngắn: bạn là ai, chương trình/lớp nào, vấn đề gì, cần xác nhận điều gì.",
        ],
      },
      {
        title: "Từ chuyên ngành",
        items: [
          "Tạo bộ thuật ngữ riêng theo từng môn: tiếng Nga → nghĩa tiếng Việt/Anh → ví dụ đúng ngữ cảnh môn học.",
          "Không dịch máy một thuật ngữ rồi mặc định là chuẩn; đối chiếu giáo trình, slide hoặc cách giảng viên sử dụng.",
          "Những cụm từ lặp lại trong đề bài, tiêu chí chấm hoặc báo cáo nên được ưu tiên trước từ vựng ít dùng.",
        ],
      },
    ],
    sources: [],
  },
  "culture-etiquette": {
    updatedAt: checkedAt,
    freshness: "stable-guidance",
    intro: "Phần văn hóa không được biến thành các 'luật tính cách người Nga'. Mỗi môi trường, thành phố, thế hệ và cá nhân có thể khác nhau. RU_LIFE chỉ cung cấp cách quan sát và giảm hiểu nhầm trong giao tiếp.",
    blocks: [
      {
        title: "Вы và ты",
        tone: "important",
        items: [
          "Trong tình huống mới, hành chính, học thuật hoặc với người chưa thân, Вы là lựa chọn an toàn hơn.",
          "Chuyển sang ты khi người đối thoại chủ động đề nghị hoặc quan hệ đã đủ thân; không coi tuổi tác là tiêu chí duy nhất.",
          "Tên + patronymic có thể được dùng trong bối cảnh trang trọng/học thuật; hãy quan sát cách đơn vị và giảng viên giới thiệu chính họ.",
        ],
      },
      {
        title: "Giao tiếp rõ ràng",
        items: [
          "Một câu trả lời ngắn hoặc trực tiếp không tự động đồng nghĩa với thiếu thiện chí; hãy đánh giá theo toàn bộ ngữ cảnh thay vì chỉ giọng điệu.",
          "Khi cần giúp đỡ, nói rõ vấn đề và điều bạn cần thay vì vòng vo quá lâu.",
          "Với nội dung hành chính, ưu tiên ngày giờ, mã hồ sơ, tên phòng ban và bằng chứng bằng văn bản.",
        ],
      },
      {
        title: "Không biến trải nghiệm cá nhân thành quy tắc",
        tone: "warning",
        items: [
          "Một trải nghiệm với một người, một ký túc xá hoặc một cơ quan không đại diện cho toàn bộ nước Nga.",
          "Phân biệt ba khả năng: khác biệt ngôn ngữ, khác biệt quy trình và khác biệt ứng xử cá nhân.",
          "Nếu một cách giao tiếp gây khó khăn, thử đổi cách diễn đạt hoặc hỏi một đầu mối khác trước khi kết luận nguyên nhân là văn hóa.",
        ],
      },
      {
        title: "Thích nghi mà không đánh mất ranh giới cá nhân",
        items: [
          "Tôn trọng quy tắc nơi ở, trường học và không gian chung, nhưng không cần đồng ý với hành vi khiến bạn không an toàn.",
          "Trong tình huống có dấu hiệu đe dọa, lừa đảo hoặc ép buộc, ưu tiên an toàn và sử dụng luồng hỗ trợ ở module An toàn thay vì cố 'hòa nhập'.",
          "Ghi lại những tình huống lặp lại để biến kinh nghiệm thực tế thành quy tắc cá nhân hữu ích.",
        ],
      },
    ],
    sources: [],
  },
  "personal-notes": {
    updatedAt: checkedAt,
    freshness: "stable-guidance",
    intro: "Sổ tay hòa nhập là nơi biến trải nghiệm thật thành dữ liệu dùng lại: tình huống đã gặp, câu nói hiệu quả, điều cần làm lần sau. Nó không phải nơi lưu bí mật tài khoản hay toàn bộ thông tin định danh nhạy cảm.",
    blocks: [
      {
        title: "Mẫu ghi nhanh sau mỗi tình huống",
        tone: "important",
        items: [
          "Tình huống: mình đang ở đâu và cần giải quyết việc gì?",
          "Cụm từ/cách làm nào đã hiệu quả?",
          "Điểm nào mình hiểu sai hoặc mất thời gian?",
          "Lần sau: chuẩn bị trước một câu, giấy tờ hoặc bước nào?",
        ],
      },
      {
        title: "Biến kinh nghiệm thành checklist",
        items: [
          "Nếu một việc lặp lại từ hai lần trở lên, chuyển nó thành checklist ngắn thay vì tiếp tục ghi nhật ký dài.",
          "Tách checklist theo bối cảnh: đi học, ký túc xá, mua sắm, giao thông, hành chính, y tế.",
          "Xóa hoặc sửa những mẹo không còn đúng; không giữ kinh nghiệm cũ chỉ vì đã từng có tác dụng một lần.",
        ],
      },
      {
        title: "Không lưu dữ liệu nhạy cảm không cần thiết",
        tone: "warning",
        items: [
          "Không ghi mật khẩu, mã OTP, mã khôi phục tài khoản hoặc thông tin thẻ thanh toán vào sổ tay.",
          "Không cần chép toàn bộ số hộ chiếu/visa nếu mục đích chỉ là ghi kinh nghiệm; tài liệu định danh nên ở kho lưu trữ an toàn riêng.",
          "Ghi chú RU_LIFE hiện lưu cục bộ trên thiết bị và có thể mất khi xóa dữ liệu trình duyệt; nội dung quan trọng cần có phương án sao lưu phù hợp.",
        ],
      },
      {
        title: "Rà soát định kỳ",
        items: [
          "Mỗi tuần, chọn những ghi chú có giá trị dùng lại và rút gọn thành câu/mẫu/checklist.",
          "Mỗi tháng, xóa thông tin đã lỗi thời hoặc trùng lặp.",
          "Thông tin pháp lý, giá, giờ làm việc hoặc quy trình thay đổi phải quay lại nguồn hiện hành; sổ tay cá nhân không được coi là nguồn chính thức.",
        ],
      },
    ],
    sources: [],
  },
};

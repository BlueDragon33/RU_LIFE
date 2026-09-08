import type { TopicContent } from "./topic-content";

const checkedAt = "2026-09-08";

export const studyProceduresContent: Record<string, TopicContent> = {
  enrollment: {
    updatedAt: checkedAt,
    freshness: "review-soon",
    intro: "Nhập học không nên được coi là một lần nộp hồ sơ duy nhất. Hãy tách thành ba trạng thái: đã có căn cứ tiếp nhận, đã hoàn thành hồ sơ tại trường và đã xác nhận mình thực sự có tên trong hệ thống học tập. Danh mục giấy tờ cuối cùng phải theo đúng trường, chương trình và diện nhập học của bạn.",
    blocks: [
      {
        title: "Trước khi đến trường",
        tone: "important",
        items: [
          "Lưu bản gốc và bản số của hộ chiếu, visa học tập nếu thuộc diện visa, giấy tờ nhập học/giới thiệu theo diện của bạn và hồ sơ học vấn đã dùng khi đăng ký.",
          "Đối chiếu họ tên, ngày sinh, số hộ chiếu và cách phiên âm trên hồ sơ với hộ chiếu đang dùng; nếu có sai khác phải hỏi trường trước khi ký/nộp bản chính thức.",
          "Nếu giấy tờ học vấn cần dịch công chứng, hợp pháp hóa hoặc công nhận tại Nga, xử lý theo đúng yêu cầu của trường; không lấy yêu cầu của một trường khác để áp dụng mặc định.",
          "Lưu địa chỉ và giờ làm việc của phòng sinh viên quốc tế/phòng tuyển sinh/phòng visa-migration của chính trường mình.",
        ],
      },
      {
        title: "Khi làm thủ tục nhập học trực tiếp",
        items: [
          "Yêu cầu đơn vị tiếp nhận xác nhận những bản gốc nào họ cần xem, những bản nào họ giữ và những bản nào chỉ cần sao chụp.",
          "Lưu biên nhận, ảnh chụp hoặc xác nhận điện tử cho từng nhóm hồ sơ đã nộp; không dựa vào trí nhớ rằng 'đã đưa cho trường rồi'.",
          "Xác nhận tình trạng lệnh nhập học/enrollment order hoặc trạng thái tương đương, khoa/chương trình, hình thức học và ngày bắt đầu thực tế.",
          "Hỏi ngay bước tiếp theo liên quan đến thẻ sinh viên, tài khoản trường, lịch học, ký túc xá và bộ phận phụ trách thủ tục người nước ngoài.",
        ],
      },
      {
        title: "Nếu học theo quota Chính phủ Nga",
        tone: "important",
        items: [
          "Phân biệt giấy xác nhận trúng tuyển/quota với thủ tục nhập học nội bộ tại trường; được phân bổ quota không có nghĩa là mọi bước hành chính của trường đã tự hoàn tất.",
          "Giữ tài liệu giới thiệu/phân bổ từ cơ quan có thẩm quyền nếu trường yêu cầu đối chiếu khi nhập học.",
          "Mọi thay đổi về thời điểm nhập học, dự bị, chuyển cơ sở hoặc xử lý visa phải có xác nhận từ đầu mối có thẩm quyền; không tự suy diễn từ lịch của nhóm khác.",
        ],
      },
      {
        title: "Dấu hiệu coi là hoàn tất bước nhập học",
        items: [
          "Bạn biết chính xác đơn vị quản lý mình trong trường và có kênh liên hệ hoạt động.",
          "Bạn đã xác nhận trạng thái nhập học/chương trình và có thể truy cập lịch hoặc hệ thống học tập khi trường đã cấp.",
          "Bạn biết đầu việc còn thiếu và hạn xử lý của từng việc thay vì chỉ nhận câu trả lời chung 'hồ sơ đang xử lý'.",
        ],
      },
    ],
    sources: [
      {
        title: "Online application to a Russian university",
        publisher: "Study in Russia",
        url: "https://studyinrussia.ru/en/online-admission",
        checkedAt,
        note: "Nguồn chính thức mô tả luồng đăng ký, hộ chiếu, giấy tờ học vấn, thông tin visa/nhập cảnh và bước sau khi đến Nga.",
      },
      {
        title: "Studying in Russia – education and documents",
        publisher: "Study in Russia",
        url: "https://studyinrussia.ru/en/education",
        checkedAt,
        note: "Dùng để đối chiếu nhóm hồ sơ và nguyên tắc chung; danh mục cuối cùng vẫn theo trường/chương trình cụ thể.",
      },
    ],
  },

  "migration-registration": {
    updatedAt: checkedAt,
    freshness: "verified",
    intro: "Đây là chủ đề pháp lý nhạy với thời gian. Tính đến ngày kiểm tra 08/09/2026, thủ tục lưu trú dài ngày phải tách ít nhất ba việc độc lập: đăng ký tại nơi lưu trú, đăng ký vân tay/chụp ảnh và khám y tế. Không coi giấy ký túc xá hay một loại giấy xác nhận là thay thế cho toàn bộ các nghĩa vụ còn lại.",
    blocks: [
      {
        title: "Ngay sau khi nhập cảnh",
        tone: "important",
        items: [
          "Giữ hộ chiếu, visa nếu áp dụng, thẻ di trú/migration card khi được cấp và mọi giấy tờ có dấu nhập cảnh.",
          "Mục đích nhập cảnh phải phù hợp với việc học khi quy định/giấy tờ của bạn yêu cầu; nếu phát hiện sai dữ liệu, báo ngay cho đầu mối trường phụ trách người nước ngoài.",
          "Thông báo cho trường/ký túc xá ngay khi đến và hỏi quy trình đăng ký tại nơi lưu trú của chính địa chỉ mình ở; trường có thể yêu cầu nộp giấy tờ rất sớm để họ kịp làm thủ tục.",
          "Chụp lại mọi giấy tờ mới phát sinh và lưu bản số ở nơi độc lập với điện thoại mang theo.",
        ],
      },
      {
        title: "Đăng ký tại nơi lưu trú (migration registration)",
        tone: "warning",
        items: [
          "Đăng ký tại nơi lưu trú là thủ tục riêng; được nhận phòng ký túc xá không tự động đồng nghĩa đã hoàn tất migration registration.",
          "Thời hạn và cách nộp phụ thuộc loại chỗ ở, bên tiếp nhận và tình trạng của bạn; làm theo phòng visa-migration/ký túc xá và quy định hiện hành thay vì chờ tới một mốc 'quen thuộc' truyền miệng.",
          "Sau khi đăng ký, lưu bản thông báo/xác nhận và kiểm tra họ tên, số hộ chiếu, địa chỉ, thời gian lưu trú; sai thông tin phải được báo sửa sớm.",
          "Khi đổi nơi ở, gia hạn visa/thời gian lưu trú hoặc có giấy tờ mới, hỏi lại xem có phải cập nhật đăng ký hay không.",
        ],
      },
      {
        title: "Vân tay bắt buộc và chụp ảnh",
        tone: "important",
        items: [
          "Theo Điều 5 Luật liên bang 115-FZ hiện hành, người nước ngoài vào Nga với mục đích không phải lao động và dự kiến ở trên 90 ngày thuộc diện đăng ký vân tay bắt buộc và chụp ảnh trong vòng 90 ngày kể từ ngày nhập cảnh, trừ trường hợp pháp luật quy định ngoại lệ.",
          "Đây là thủ tục khác với khám y tế. Hoàn thành khám y tế không tự động chứng minh đã đăng ký vân tay và ngược lại.",
          "Sau khi hoàn tất, giữ giấy xác nhận/tài liệu được cấp và cung cấp cho trường nếu bộ phận người nước ngoài yêu cầu.",
        ],
      },
      {
        title: "Khám y tế – quy định mới từ 01/09/2026",
        tone: "warning",
        items: [
          "Từ 01/09/2026, Luật liên bang số 162-FZ sửa Luật 115-FZ: người nước ngoài thuộc nhóm lưu trú trên 90 ngày phải thực hiện khám y tế theo luật trong vòng 30 ngày kể từ ngày nhập cảnh, trừ các ngoại lệ hợp lệ được luật quy định.",
          "Nội dung khám theo luật bao gồm kiểm tra liên quan đến chất ma túy/chất hướng thần, bệnh truyền nhiễm nguy hiểm và HIV theo danh mục pháp luật hiện hành.",
          "Luật mới cũng thiết lập chu kỳ khám lại; vì đây là quy định vừa thay đổi, trước mỗi lần thực hiện phải kiểm tra hướng dẫn cập nhật của cơ quan có thẩm quyền và trường.",
          "Không dùng giấy khám cũ hoặc giấy khám phục vụ mục đích khác để tự kết luận mình đã đáp ứng nghĩa vụ hiện hành nếu chưa được cơ quan/trường xác nhận.",
        ],
      },
      {
        title: "Bộ hồ sơ cá nhân nên lưu",
        items: [
          "Hộ chiếu + visa hiện hành nếu có.",
          "Migration card/giấy tờ nhập cảnh khi áp dụng.",
          "Xác nhận đăng ký tại nơi lưu trú.",
          "Xác nhận đăng ký vân tay/chụp ảnh nếu thuộc diện.",
          "Giấy tờ khám y tế hiện hành và ngày thực hiện.",
          "Mốc hết hạn visa/thời gian lưu trú và ngày cần làm việc lại với trường.",
        ],
      },
    ],
    sources: [
      {
        title: "Article 5 – temporary stay of foreign citizens (current text of Federal Law 115-FZ)",
        publisher: "ConsultantPlus – current legal text",
        url: "https://www.consultant.ru/document/cons_doc_LAW_37868/e9d581e7e11d7901295efd89c869ae044dd3d20f/",
        checkedAt,
        note: "Điều 5 hiện ghi thời hạn 90 ngày cho đăng ký vân tay/chụp ảnh của người ở trên 90 ngày và quy định khám y tế 30 ngày sau sửa đổi năm 2026.",
      },
      {
        title: "Federal Law No. 274-FZ of 01.07.2021",
        publisher: "Official Internet Portal of Legal Information",
        url: "https://publication.pravo.gov.ru/Document/View/0001202107010039",
        checkedAt,
        note: "Văn bản nền tảng đưa nghĩa vụ đăng ký vân tay/chụp ảnh bắt buộc đối với nhiều nhóm người nước ngoài lưu trú dài ngày.",
      },
      {
        title: "Unified rules for medical examination of foreign citizens – explanation of Law 162-FZ",
        publisher: "Prosecutor's Office of the Moscow Region",
        url: "https://epp.genproc.gov.ru/ru/proc_50/activity/legal-education/explain/e8585073/",
        checkedAt,
        note: "Giải thích chính thức tháng 07/2026 về thay đổi khám y tế; Luật 162-FZ có hiệu lực từ 01/09/2026.",
      },
      {
        title: "Studying in Russia – migration documents after arrival",
        publisher: "Study in Russia",
        url: "https://studyinrussia.ru/en/education",
        checkedAt,
        note: "Nguồn chính thức dành cho sinh viên quốc tế; dùng để đối chiếu nhóm giấy tờ sau khi nhập cảnh và vai trò của trường.",
      },
    ],
  },

  "study-plan": {
    updatedAt: checkedAt,
    freshness: "stable-guidance",
    intro: "Kế hoạch học tập nên là một bảng điều khiển hành động, không phải danh sách mục tiêu chung. Mỗi môn/đầu việc cần có đầu ra, mốc gần nhất, tài liệu và trạng thái rõ ràng.",
    blocks: [
      {
        title: "Thiết lập học kỳ",
        items: [
          "Lưu tên chương trình, khoa/bộ môn, học kỳ và lịch học chính thức ở một nơi duy nhất.",
          "Với mỗi môn, ghi rõ hình thức đánh giá: bài tập, kiểm tra, зачёт, экзамен, đồ án hoặc yêu cầu tương đương.",
          "Tạo một mốc rà soát hằng tuần để cập nhật việc đã xong, việc trễ và việc cần hỏi giảng viên.",
        ],
      },
      {
        title: "Mỗi đầu việc phải có đầu ra",
        tone: "important",
        items: [
          "Không ghi 'học Toán'; ghi 'đọc chương X, giải Y bài, lưu câu chưa hiểu'.",
          "Không ghi 'học tiếng Nga'; ghi tình huống/từ vựng/mẫu câu cần sử dụng trong tuần.",
          "Với đồ án hoặc nghiên cứu, tách thành đề bài – tài liệu – thử nghiệm – kết quả – bản nộp thay vì một task duy nhất kéo dài nhiều tháng.",
        ],
      },
      {
        title: "Bảo toàn dữ liệu học tập",
        items: [
          "Tài liệu quan trọng phải có ít nhất một bản sao ngoài máy chính.",
          "Đặt tên file theo môn + nội dung + phiên bản/ngày để tránh ghi đè bản tốt bằng bản cũ.",
          "Lưu riêng yêu cầu chính thức của giảng viên và bản đang làm; không chỉ giữ trong lịch sử chat/messenger.",
        ],
      },
    ],
    sources: [],
  },

  "important-contacts": {
    updatedAt: checkedAt,
    freshness: "stable-guidance",
    intro: "Danh bạ hữu ích phải trả lời được 'gọi ai cho việc gì' trong vài giây. Không gom mọi số điện thoại vào một danh sách không có vai trò hoặc thời điểm đã xác minh.",
    blocks: [
      {
        title: "Nhóm liên hệ tối thiểu",
        items: [
          "Phòng sinh viên quốc tế / đơn vị quản lý sinh viên nước ngoài.",
          "Phòng visa-migration hoặc đầu mối xử lý đăng ký cư trú của trường.",
          "Ký túc xá / quản lý tòa nhà đang ở.",
          "Khoa/bộ môn và người phụ trách chương trình học.",
          "Đầu mối cơ quan cử đi/quota nếu diện học của bạn có đơn vị quản lý riêng.",
          "Người liên hệ khẩn cấp tại Việt Nam và tại Nga nếu có.",
        ],
      },
      {
        title: "Mỗi contact cần bốn trường dữ liệu",
        tone: "important",
        items: [
          "Tên đơn vị/người phụ trách.",
          "Việc gì được phép hỏi hoặc nhờ xử lý.",
          "Kênh liên hệ chính và kênh dự phòng.",
          "Ngày gần nhất bạn xác minh thông tin còn đúng.",
        ],
      },
      {
        title: "Khi có vấn đề hành chính",
        items: [
          "Ưu tiên gửi câu hỏi có dữ kiện: họ tên, mã sinh viên nếu đã có, ngày nhập cảnh/mốc liên quan và vấn đề cụ thể.",
          "Sau trao đổi miệng quan trọng, tự ghi lại ngày, người trao đổi và hướng xử lý để tránh mất dấu.",
          "Nếu hai đầu mối hướng dẫn khác nhau, không tự chọn hướng thuận tiện hơn; yêu cầu xác nhận từ đơn vị chịu trách nhiệm cuối cùng.",
        ],
      },
    ],
    sources: [],
  },
};

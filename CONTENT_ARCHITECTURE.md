# RU_LIFE — kiến trúc nội dung Hòa nhập Nga

## Mục tiêu

RU_LIFE là Web App độc lập. `Application-Management` chỉ quản lý quyền thiết bị, phiên, trạng thái và kiểm soát từ xa; không chứa route nội dung, checklist, ghi chú, bookmark, reminder, deadline hay runtime của Hòa nhập Nga.

## Cấu trúc cố định

`/app` là dashboard sau khi thiết bị được Quản trị ứng dụng cấp quyền.

Nội dung tổ chức theo năm lớp:

1. **Module** — mảng lớn của cuộc sống/học tập tại Nga.
2. **Topic** — tình huống hoặc nhóm đầu việc cập nhật độc lập.
3. **Content blocks** — hướng dẫn, quy trình, tình huống và mẫu câu.
4. **Source/Freshness** — nguồn, ngày kiểm tra và mức cần rà soát.
5. **Local user state** — tiến độ và công cụ cá nhân lưu trên thiết bị.

Routes:

- `/app`
- `/app/<module>`
- `/app/<module>/<topic>`

Tất cả `/app/*` đi qua `app/app/layout.tsx`, vì vậy cùng bắt buộc phiên RU_LIFE hợp lệ, heartbeat và introspection với Application-Management.

## Catalog V1 — 20/20 topic có content layer

`lib/content-catalog.ts` chỉ mô tả cấu trúc/điều hướng, gồm 5 module × 4 topic:

1. `prepare` — Chuẩn bị sang Nga.
2. `daily-life` — Cuộc sống tại Nga.
3. `study-procedures` — Học tập · thủ tục.
4. `health` — Sức khỏe · y tế.
5. `integration` — Ngôn ngữ · hòa nhập.

Content được tách theo miền:

- `lib/topic-content.ts` — Module 01;
- `lib/daily-life-content.ts` — Module 02;
- `lib/study-procedures-content.ts` — Module 03;
- `lib/health-content.ts` — Module 04;
- `lib/integration-content.ts` — Module 05;
- `lib/content-resolver.ts` — điểm phân giải chung.

`tests/content-coverage.test.mjs` khóa 20/20 topic. Nếu một topic mất content entry hoặc resolver mất một module, CI phải fail.

## Dashboard vận hành V1

`components/workspace-dashboard.tsx` cung cấp:

- tìm nhanh trong 20 topic theo module, tiêu đề, mô tả và checklist;
- phím `/` đưa focus vào ô tìm kiếm;
- số topic hoàn thành, tỷ lệ checklist và số topic có ghi chú;
- số topic `review-soon`;
- “Việc nên làm tiếp” theo `essential` → `recommended` → `reference`;
- search/thống kê chỉ chạy trên dữ liệu RU_LIFE/localStorage.

## Ba miền dữ liệu cục bộ độc lập

V1.2 cố định ba namespace khác nhau. Không gộp chúng chỉ để giảm số file.

### 1. Progress — checklist và ghi chú

`lib/progress-storage.ts`

Namespace:

`ru-life-progress:v1:*`

Dùng cho checklist và ghi chú topic. Sự kiện cục bộ: `ru-life-progress-changed`.

### 2. Personal tools — yêu thích và một mốc nhắc

`lib/personal-tools-storage.ts`

Namespace:

`ru-life-tools:v1:topic:*`

Dùng cho bookmark/yêu thích, reminder, trạng thái đã phát notification. Sự kiện cục bộ: `ru-life-tools-changed`.

`components/local-reminder-runtime.tsx` chỉ được mount trong protected layout. Notification chỉ là best-effort khi ứng dụng/trình duyệt có cơ hội chạy; không được mô tả như một background scheduler bảo đảm chạy khi app đã đóng.

### 3. Deadlines — nhiều thời hạn trên cùng topic

`lib/deadline-storage.ts`

Namespace:

`ru-life-deadlines:v1:topic:*`

Một topic có thể lưu nhiều deadline độc lập. Mỗi deadline có:

- `id`;
- `title`;
- `dueAt`;
- `urgency`: `normal`, `important`, `critical`;
- `completed`;
- `createdAt` / `updatedAt`.

Sự kiện cục bộ: `ru-life-deadlines-changed`.

`components/topic-deadlines.tsx` quản lý deadline tại từng topic. `components/workspace-deadline-board.tsx` tổng hợp toàn bộ deadline tại dashboard thành:

- quá hạn;
- hôm nay;
- 7 ngày tới;
- mức khẩn;
- lịch 7 ngày;
- danh sách deadline đang mở.

Deadline không phải dữ liệu quản trị và không được gửi sang Application-Management.

## Xuất lịch `.ics`

`buildDeadlineCalendar()` trong `lib/deadline-storage.ts` tạo iCalendar chuẩn cơ bản từ deadline chưa hoàn thành.

Dashboard tải file `ru-life-deadlines.ics` bằng `Blob` trong trình duyệt. Không cần Google Calendar API, không gửi lịch sang bên thứ ba và không phụ thuộc tài khoản lịch bên ngoài.

`.ics` là bản xuất tại thời điểm người dùng bấm tải; thay đổi deadline trong RU_LIFE sau đó không tự sửa sự kiện đã nhập vào ứng dụng lịch.

## Nguồn và mốc rà soát V1.2

Không hard-code quy định dễ thay đổi rồi coi là kiến thức cố định.

`TopicContent` duy trì:

- `updatedAt`;
- `freshness`: `verified`, `review-soon`, `stable-guidance`;
- `blocks`;
- `sources`.

`TopicSource` lưu publisher, title, URL, `checkedAt` và phạm vi dùng nguồn.

`lib/source-review.ts` bổ sung lịch kiểm soát chất lượng nội bộ:

- `review-soon`: rà lại sau 30 ngày;
- `verified`: rà lại sau 90 ngày;
- `stable-guidance`: rà lại sau 365 ngày.

Các mốc này **không phải ngày hết hiệu lực pháp lý** và không chứng minh quy định chắc chắn còn đúng cho tới ngày đó. Với nội dung hành chính, pháp lý, y tế, giá/phí hoặc điều kiện nhà cung cấp, người dùng vẫn phải kiểm tra nguồn chính thức tại thời điểm sử dụng.

Topic page hiển thị mốc kiểm tra nội bộ. Dashboard cảnh báo topic `overdue` hoặc `due-soon` để đội nội dung biết phần nào cần rà lại.

## V1.1 — lọc theo tình huống và yêu thích

`lib/topic-situations.ts` phân loại đủ 20 topic theo các tình huống dùng thực tế như trước khi đi, những ngày đầu, sinh hoạt, hành chính, học tập, sức khỏe, khẩn cấp và giao tiếp.

`components/workspace-personal-tools.tsx` cho phép:

- lọc theo mức ưu tiên;
- lọc theo tình huống;
- chỉ xem yêu thích;
- xem reminder sắp tới/đến hạn.

Mọi thao tác vẫn cục bộ.

## Ranh giới CSS

CSS được chia theo trách nhiệm:

- `app/globals.css` — biến toàn cục + landing/access gate công khai;
- `app/workspace.css` — protected shell, sidebar, navigation, device badge, skip link;
- `app/content.css` — dashboard/module/topic, source/freshness, checklist;
- `app/tools.css` — V1.1 favorite/filter/reminder;
- `app/deadlines.css` — V1.2 deadline board, topic deadlines và source-review alert.

Các CSS protected chỉ được import từ `app/app/layout.tsx`; access gate công khai không tải các lớp giao diện cá nhân này.

## Accessibility / responsive

Contract hiện có:

- skip link tới `#workspace-content`;
- focus-visible cho control chính;
- checklist dùng checkbox thật;
- progress dùng ARIA progressbar;
- search có label ẩn và phím tắt `/`;
- deadline hoàn thành dùng checkbox thật;
- control deadline có label, input/select native;
- dashboard/module/topic/tools/deadlines thu lưới theo tablet/mobile;
- `prefers-reduced-motion` vẫn được tôn trọng.

## Ranh giới bảo mật

- `app/app/layout.tsx`: bảo vệ toàn bộ workspace.
- `DeviceHeartbeat`: heartbeat + kiểm tra thu hồi phiên.
- `LocalReminderRuntime`: chỉ chạy sau khi phiên hợp lệ.
- `WorkspaceNavigation`: chỉ điều hướng, không quyết định quyền.
- Content/progress/tools/deadline files không chứa secret hoặc logic quản trị.
- Service worker không cache `/app*` hoặc `/api/*`.
- Không dùng `managed_app_devices` hoặc `control_devices` làm kho dữ liệu cá nhân.

Nếu sau này cần đồng bộ đa thiết bị, phải xây một miền dữ liệu người dùng riêng với mô hình quyền riêng, không trộn vào control plane.

## Hướng phát triển sau V1.2

Không mở thêm module chỉ để tăng số lượng. Ưu tiên tiếp theo:

1. kiểm thử UX trên desktop/tablet/phone thật;
2. rà source-review policy theo mức rủi ro nội dung thay vì chỉ theo một mốc chung;
3. cho phép deadline liên kết trực tiếp tới một checklist item nếu thật sự cần;
4. bổ sung backup/export/import dữ liệu cá nhân cục bộ theo định dạng riêng;
5. chỉ sau khi V1.2 ổn định mới quyết định có cần đồng bộ đa thiết bị hay không.

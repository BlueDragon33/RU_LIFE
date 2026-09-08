# RU_LIFE — kiến trúc nội dung Hòa nhập Nga

## Mục tiêu

RU_LIFE là Web App độc lập. `Application-Management` chỉ quản lý quyền thiết bị, phiên, trạng thái và kiểm soát từ xa; không chứa route nội dung, checklist, ghi chú hay runtime của Hòa nhập Nga.

## Cấu trúc cố định

`/app` là dashboard sau khi thiết bị được Quản trị ứng dụng cấp quyền.

Nội dung tổ chức theo năm lớp:

1. **Module** — mảng lớn của cuộc sống/học tập tại Nga.
2. **Topic** — tình huống hoặc nhóm đầu việc cập nhật độc lập.
3. **Content blocks** — hướng dẫn, quy trình, tình huống và mẫu câu.
4. **Source/Freshness** — nguồn, ngày kiểm tra và mức cần rà soát.
5. **Local progress** — checklist và ghi chú cá nhân lưu trên thiết bị.

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

`components/workspace-dashboard.tsx` biến `/app` từ trang giới thiệu thành bảng điều khiển sử dụng thật:

- tìm nhanh trong 20 topic theo module, tiêu đề, mô tả và checklist;
- phím `/` đưa focus vào ô tìm kiếm;
- hiển thị số topic hoàn thành, tỷ lệ checklist và số topic có ghi chú;
- hiển thị số topic `review-soon` cần rà soát thường xuyên;
- chọn “Việc nên làm tiếp” theo thứ tự `essential` → `recommended` → `reference`;
- search và thống kê chỉ chạy trên dữ liệu RU_LIFE/localStorage, không gọi API quản trị.

Dashboard nhận `freshness`/`updatedAt` từ content resolver. Ngày kiểm tra nguồn chi tiết vẫn nằm ở trang topic; dashboard không thay thế metadata nguồn.

## Tiến độ cục bộ

`lib/progress-storage.ts` là hợp đồng duy nhất cho namespace `ru-life-progress:v1:*`.

`components/topic-progress.tsx` và dashboard cùng dùng:

- `topicProgressKey`;
- `parseStoredTopicProgress`;
- `validCheckedCount`;
- `progressPercent`.

Khi checklist/ghi chú thay đổi, topic phát sự kiện cục bộ `ru-life-progress-changed` để UI có thể cập nhật mà không liên quan Application-Management.

Dữ liệu tiến độ:

- chỉ phục vụ người dùng trên thiết bị hiện tại;
- không phải quyền truy cập;
- không thay đổi P-256 device identity;
- không gửi sang API quản trị;
- có thể mất nếu người dùng xóa dữ liệu trình duyệt.

Nếu sau này đồng bộ đa thiết bị, phải xây miền dữ liệu người dùng riêng; không dùng `managed_app_devices` hoặc `control_devices` làm kho nội dung cá nhân.

## Nguyên tắc nguồn và độ mới

Không hard-code quy định dễ thay đổi rồi coi là kiến thức cố định.

`TopicContent` duy trì:

- `updatedAt`;
- `freshness`: `verified`, `review-soon`, `stable-guidance`;
- `blocks`;
- `sources`.

`TopicSource` lưu publisher, title, URL, `checkedAt` và phạm vi dùng nguồn.

Các nhóm xuất nhập cảnh/cư trú, giấy tờ người nước ngoài, y tế/bảo hiểm, quy định trường, giao thông/dịch vụ, giá/phí/thời hạn phải dùng nguồn phù hợp và được rà soát theo thời điểm. Dữ liệu phụ thuộc hãng bay, ngân hàng, nhà mạng, cửa hàng hoặc giá thị trường không được đóng băng thành số liệu cố định.

## Ranh giới CSS

CSS được chia đúng trách nhiệm:

- `app/globals.css` — biến toàn cục + landing/access gate công khai;
- `app/workspace.css` — protected shell, sidebar, navigation, device badge, skip link;
- `app/content.css` — dashboard, module/topic, source/freshness, checklist và responsive nội dung.

`content.css` và `workspace.css` chỉ được import từ `app/app/layout.tsx`; trang access gate không tải lớp giao diện nội dung protected.

## Accessibility / responsive

V1 có các contract cơ bản:

- skip link tới `#workspace-content`;
- focus-visible rõ ràng;
- checklist dùng checkbox thật và giữ keyboard focus;
- progress dùng `role="progressbar"` + ARIA values;
- search có label ẩn và phím tắt `/`;
- `prefers-reduced-motion` tắt animation không cần thiết;
- dashboard/module/topic chuyển lưới 4 → 2 → 1 cột theo viewport.

## Ranh giới bảo mật

- `app/app/layout.tsx`: bảo vệ toàn bộ workspace.
- `DeviceHeartbeat`: heartbeat + kiểm tra thu hồi phiên.
- `WorkspaceNavigation`: chỉ điều hướng, không quyết định quyền.
- Content/progress files không chứa secret hoặc logic quản trị.
- Service worker không cache `/app*` hoặc `/api/*`.

## Hướng phát triển sau V1

Không mở thêm module chỉ để tăng số lượng. Ưu tiên tiếp theo là nâng chất lượng trải nghiệm và dữ liệu hiện có: rà nội dung từng topic, làm nguồn/freshness dễ bảo trì hơn, bổ sung điều hướng theo tình huống, kiểm thử thiết bị thật desktop/tablet/phone và sau đó mới quyết định tính năng V2 như bookmark, lịch nhắc hoặc đồng bộ người dùng độc lập.

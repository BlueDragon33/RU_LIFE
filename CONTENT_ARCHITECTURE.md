# RU_LIFE — kiến trúc nội dung Hòa nhập Nga

## Mục tiêu

RU_LIFE là Web App độc lập. `Application-Management` chỉ quản lý quyền thiết bị, phiên, trạng thái và kiểm soát từ xa; không chứa route nội dung, checklist, ghi chú, bookmark, reminder, deadline, backup hay runtime của Hòa nhập Nga.

Tất cả `/app/*` đi qua `app/app/layout.tsx`, vì vậy đều bắt buộc phiên RU_LIFE hợp lệ, heartbeat và introspection với Application-Management.

## Catalog V1 — 20/20 topic có content layer

`lib/content-catalog.ts` chỉ mô tả cấu trúc/điều hướng, gồm 5 module × 4 topic:

1. `prepare` — Chuẩn bị sang Nga.
2. `daily-life` — Cuộc sống tại Nga.
3. `study-procedures` — Học tập · thủ tục.
4. `health` — Sức khỏe · y tế.
5. `integration` — Ngôn ngữ · hòa nhập.

Content được tách theo miền và phân giải qua `lib/content-resolver.ts`. `tests/content-coverage.test.mjs` khóa 20/20 topic.

## Dashboard vận hành

Dashboard hiện có:

- tìm nhanh 20 topic và phím `/`;
- tổng hợp checklist/ghi chú;
- “Việc nên làm tiếp”;
- lọc theo tình huống/ưu tiên/yêu thích;
- reminder cục bộ;
- deadline theo quá hạn/hôm nay/7 ngày tới/mức khẩn;
- lịch 7 ngày và xuất `.ics`;
- cảnh báo source-review;
- backup/restore/xóa an toàn dữ liệu cá nhân.

Không tính năng nào trong nhóm này quyết định quyền thiết bị.

## Ba miền dữ liệu cục bộ độc lập

Không gộp ba namespace chỉ để giảm số file.

### 1. Progress

`lib/progress-storage.ts`

Namespace: `ru-life-progress:v1:*`

Checklist + ghi chú. Event: `ru-life-progress-changed`.

### 2. Personal tools

`lib/personal-tools-storage.ts`

Namespace: `ru-life-tools:v1:topic:*`

Favorite + reminder + trạng thái notification. Event: `ru-life-tools-changed`.

### 3. Deadlines

`lib/deadline-storage.ts`

Namespace: `ru-life-deadlines:v1:topic:*`

Một topic có nhiều deadline. Mỗi deadline có:

- `id`;
- `title`;
- `dueAt`;
- `urgency`;
- `completed`;
- `checklistIndex` nullable;
- `createdAt` / `updatedAt`.

Event: `ru-life-deadlines-changed`.

## Deadline ↔ checklist V1.3

`components/topic-deadlines.tsx` cho phép gắn một deadline với một checklist item của cùng topic.

Quy tắc đồng bộ cố định:

- hoàn thành deadline có liên kết → đánh dấu checklist item tương ứng là hoàn thành;
- bỏ trạng thái hoàn thành deadline → **không** tự bỏ checklist item;
- deadline cũ không có `checklistIndex` vẫn được parser đọc bình thường với giá trị `null`.

Đây là đồng bộ một chiều có chủ đích để không vô tình xóa tiến độ mà người dùng đã xác nhận độc lập.

## Backup / restore V1.3

`lib/local-data-backup.ts` định nghĩa schema:

`ru-life-local-backup-v1`

Backup chỉ được phép chứa các key thuộc ba prefix cá nhân ở trên. Nó **không** được chứa:

- cookie/session;
- access token;
- P-256 device identity/private key;
- device code/approval state;
- `managed_app_devices`;
- `control_devices`;
- bất kỳ dữ liệu Application-Management nào.

### Validation trước ghi

`validateLocalBackupText()` kiểm tra toàn bộ file trước khi ghi một key:

- schema/app đúng;
- giới hạn 2 MB;
- tối đa 200 entry;
- không có key ngoài ba prefix cho phép;
- không có key trùng;
- progress/tools/deadline phải đúng shape tương ứng;
- ngày và deadline phải parse được;
- urgency/checklistIndex phải hợp lệ.

Chỉ sau khi toàn bộ file pass mới được gọi `replaceLocalPersonalData()`.

### Đường lui bắt buộc

Trước khi:

- khôi phục backup; hoặc
- xóa một miền dữ liệu,

`components/local-data-manager.tsx` tự xuất một backup hiện trạng (`before-restore` hoặc `before-clear`).

Khôi phục thay thế đúng ba miền dữ liệu cá nhân, không gọi `localStorage.clear()` và không đụng key ngoài allowlist.

Xóa dữ liệu cũng chỉ xóa theo một namespace được chọn sau khi người dùng nhập xác nhận `XÓA`.

## `.ics`

`buildDeadlineCalendar()` xuất các deadline chưa hoàn thành ra iCalendar. File `.ics` là snapshot khi tải, không phải đồng bộ hai chiều và không yêu cầu Google Calendar API.

## Source review

`lib/source-review.ts` dùng mốc kiểm soát nội bộ:

- `review-soon`: 30 ngày;
- `verified`: 90 ngày;
- `stable-guidance`: 365 ngày.

Đây không phải ngày hết hiệu lực pháp lý. Nội dung hành chính, pháp lý, y tế, giá/phí hoặc điều kiện nhà cung cấp vẫn phải kiểm tra nguồn chính thức tại thời điểm sử dụng.

## CSS boundary

- `app/globals.css` — public/access gate;
- `app/workspace.css` — protected shell/navigation;
- `app/content.css` — content/dashboard/topic/progress;
- `app/tools.css` — favorite/filter/reminder;
- `app/deadlines.css` — deadline/source review;
- `app/backup.css` — backup/restore/xóa dữ liệu V1.3.

Các CSS cá nhân chỉ import từ protected `app/app/layout.tsx`.

## Ranh giới bảo mật

- `app/app/layout.tsx`: bảo vệ workspace.
- `DeviceHeartbeat`: heartbeat + revocation check.
- `LocalReminderRuntime`: chỉ chạy sau khi session hợp lệ.
- content/progress/tools/deadline/backup không chứa secret hoặc logic cấp quyền.
- Service worker không cache `/app*` hoặc `/api/*`.
- Không dùng control-plane tables làm kho dữ liệu cá nhân.

Nếu cần đồng bộ đa thiết bị trong tương lai, phải xây user-data domain riêng; backup V1.3 không phải cơ chế nhân bản quyền thiết bị.

## Hướng phát triển sau V1.3

1. kiểm thử UX thực tế trên desktop/tablet/phone;
2. kiểm thử restore với file hỏng, file cũ và quota localStorage thấp;
3. thêm version migration nếu schema cá nhân thay đổi;
4. rà source-review theo mức rủi ro cụ thể;
5. sau khi V1.3 ổn định mới quyết định có cần user-data sync đa thiết bị hay không.

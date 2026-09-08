# RU_LIFE — kiến trúc nội dung Hòa nhập Nga

## Mục tiêu

RU_LIFE là Web App độc lập. `Application-Management` chỉ quản lý quyền thiết bị, phiên, trạng thái và kiểm soát từ xa; không chứa route nội dung, checklist, ghi chú, bookmark, reminder, deadline, backup, migration hay runtime của Hòa nhập Nga.

Tất cả `/app/*` đi qua `app/app/layout.tsx`, vì vậy đều bắt buộc phiên RU_LIFE hợp lệ, heartbeat và introspection với Application-Management trước khi các runtime dữ liệu cá nhân được mount.

## Catalog V1 — 20/20 topic

`lib/content-catalog.ts` chỉ mô tả cấu trúc/điều hướng, gồm 5 module × 4 topic:

1. `prepare` — Chuẩn bị sang Nga.
2. `daily-life` — Cuộc sống tại Nga.
3. `study-procedures` — Học tập · thủ tục.
4. `health` — Sức khỏe · y tế.
5. `integration` — Ngôn ngữ · hòa nhập.

Content tách theo miền và phân giải qua `lib/content-resolver.ts`. `tests/content-coverage.test.mjs` khóa 20/20 topic.

## Dashboard vận hành

Dashboard hiện có tìm kiếm 20 topic, tiến độ/checklist, ghi chú, việc nên làm tiếp, lọc theo tình huống/ưu tiên/yêu thích, reminder cục bộ, deadline, lịch 7 ngày, `.ics`, source-review và quản lý backup/restore. Không tính năng nào trong nhóm này quyết định quyền thiết bị.

## Ba miền dữ liệu cục bộ độc lập

Không gộp ba namespace:

- Progress: `ru-life-progress:v1:*` — checklist + ghi chú.
- Personal tools: `ru-life-tools:v1:topic:*` — favorite + reminder + trạng thái notification.
- Deadlines: `ru-life-deadlines:v1:topic:*` — nhiều deadline trên một topic, có `checklistIndex` nullable.

Deadline liên kết checklist theo một chiều: hoàn thành deadline có thể hoàn thành checklist item; bỏ trạng thái hoàn thành deadline không tự bỏ checklist.

## Backup V1.4 và tương thích V1.3

`lib/local-data-backup.ts` hiện xuất schema:

`ru-life-local-backup-v2`

File V1.3 dùng schema `ru-life-local-backup-v1` vẫn được chấp nhận. Khi import, dữ liệu legacy được validate rồi normalize trong bộ nhớ sang shape hiện tại trước khi ghi.

Backup chỉ được chứa ba namespace dữ liệu cá nhân ở trên. Nó không được chứa:

- cookie/session/access token;
- P-256 device identity/private key;
- device code hoặc approval state;
- `managed_app_devices` / `control_devices`;
- bất kỳ dữ liệu Application-Management nào.

Giới hạn hiện tại: tối đa 2 MB và 200 entry. Tất cả entry phải pass validation trước khi bắt đầu replacement.

## Restore transactional và rollback

`replaceLocalPersonalData()` thực hiện theo thứ tự:

1. validate backup hoàn chỉnh;
2. snapshot ba miền dữ liệu hiện tại trong bộ nhớ;
3. thay thế dữ liệu;
4. nếu bất kỳ lần ghi nào thất bại, xóa trạng thái ghi dở và cố phục hồi snapshot trước thao tác.

`components/local-data-manager.tsx` vẫn tải thêm file `before-restore` trước khi bắt đầu khôi phục. Vì vậy có hai lớp phục hồi: rollback tức thời trong runtime và file backup ngoài trình duyệt.

Nếu chính rollback runtime cũng không ghi được, UI phải báo rõ để người dùng phục hồi từ file `before-restore`; không được báo thành công giả.

Xóa dữ liệu tiếp tục chỉ xóa theo miền và không dùng `localStorage.clear()`.

## Migration trạng thái cục bộ V1.4

`lib/local-state-migration.ts` dùng marker:

`ru-life-local-state-version`

Phiên bản hiện tại: `2`.

Marker này chỉ là metadata migration nội bộ của RU_LIFE, không phải identity, session hoặc quyền thiết bị.

`components/local-state-runtime.tsx` được mount trong protected layout sau khi `readDeviceSession()` hợp lệ. Runtime:

- đọc version hiện tại;
- normalize progress/tools/deadlines cũ;
- chỉ ghi version mới sau khi toàn bộ migration thành công;
- nếu migration lỗi, cố rollback snapshot cũ;
- phát refresh event sau migration thành công.

## Ghi localStorage có kiểm soát

`lib/local-storage-safe.ts` tập trung các lần ghi quan trọng qua `safeSetLocalStorage()`.

Các component progress, tools, dashboard favorite, deadlines, linked-checklist và reminder persistence đều dùng lớp này. Khi trình duyệt ném `QuotaExceededError` hoặc lỗi storage khác, runtime phát `ru-life-storage-error` và `LocalStateRuntime` hiển thị cảnh báo thay vì âm thầm bỏ qua.

`navigator.storage.estimate()` chỉ dùng để hiển thị ước lượng usage/quota của **toàn bộ origin**. Nó không phải số dung lượng riêng của localStorage RU_LIFE và không được dùng như bảo đảm còn đủ chỗ cho lần ghi tiếp theo.

## `.ics`

`buildDeadlineCalendar()` xuất deadline chưa hoàn thành ra iCalendar. `.ics` là snapshot khi tải, không phải đồng bộ hai chiều và không yêu cầu Google Calendar API.

## Source review

Mốc kiểm soát nội bộ:

- `review-soon`: 30 ngày;
- `verified`: 90 ngày;
- `stable-guidance`: 365 ngày.

Đây không phải ngày hết hiệu lực pháp lý. Nội dung hành chính, pháp lý, y tế, giá/phí hoặc điều kiện nhà cung cấp vẫn phải kiểm tra nguồn chính thức tại thời điểm sử dụng.

## CSS và responsive boundary

- `app/globals.css` — public/access gate;
- `app/workspace.css` — protected shell/navigation;
- `app/content.css` — content/dashboard/topic/progress;
- `app/tools.css` — favorite/filter/reminder;
- `app/deadlines.css` — deadline/source review;
- `app/backup.css` — backup/migration/storage warning.

Regression hiện khóa breakpoint và cách stack layout cho desktop/tablet/phone, bao gồm 900 px và 620 px ở khu backup. Đây là **source/layout contract**, không phải bằng chứng rằng UI đã được kiểm tra trên mọi trình duyệt hoặc thiết bị vật lý. Kiểm thử thiết bị thật vẫn là một gate riêng.

## Ranh giới bảo mật

- `app/app/layout.tsx`: bảo vệ workspace.
- `DeviceHeartbeat`: heartbeat + revocation check.
- `LocalReminderRuntime` và `LocalStateRuntime`: chỉ chạy trong protected workspace.
- content/progress/tools/deadline/backup/migration không chứa secret hoặc logic cấp quyền.
- Service worker không cache `/app*` hoặc `/api/*`.
- Không dùng control-plane tables làm kho dữ liệu cá nhân.

Nếu cần đồng bộ đa thiết bị trong tương lai, phải xây user-data domain riêng. Backup/migration RU_LIFE không bao giờ là cơ chế nhân bản quyền thiết bị.

## Hướng phát triển sau V1.4

1. kiểm thử trực tiếp trên browser desktop/tablet/phone thực;
2. kiểm thử fault injection cho quota và rollback bằng môi trường browser automation;
3. rà source-review theo mức rủi ro cụ thể;
4. kiểm thử file backup legacy với nhiều mẫu dữ liệu thực;
5. chỉ sau các gate trên mới cân nhắc đồng bộ user-data đa thiết bị.

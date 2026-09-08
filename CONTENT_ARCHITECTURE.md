# RU_LIFE — kiến trúc nội dung Hòa nhập Nga

## Mục tiêu

Nội dung Hòa nhập Nga phải phát triển độc lập với lớp quản trị thiết bị. `Application-Management` không chứa các trang, route, checklist hay dữ liệu sinh hoạt của RU_LIFE.

## Cấu trúc cố định

`/app` là dashboard sau khi thiết bị đã được Quản trị ứng dụng cấp quyền.

Nội dung được tổ chức theo bốn lớp:

1. **Module** — một mảng lớn của cuộc sống/học tập tại Nga.
2. **Topic** — một tình huống hoặc nhóm đầu việc có thể cập nhật độc lập.
3. **Content blocks** — hướng dẫn, tình huống, quy trình, mẫu câu, tài liệu tham chiếu.
4. **Local progress** — checklist và ghi chú cá nhân lưu trên thiết bị.

Routes:

- `/app`
- `/app/<module>`
- `/app/<module>/<topic>`

Tất cả route dưới `/app/*` đi qua `app/app/layout.tsx`, do đó đều bắt buộc có phiên thiết bị RU_LIFE hợp lệ và cùng cơ chế heartbeat/introspection với Trung tâm.

## Catalog v1

Catalog nằm tại `lib/content-catalog.ts`, hiện gồm 5 module:

1. `prepare` — Chuẩn bị sang Nga.
2. `daily-life` — Cuộc sống tại Nga.
3. `study-procedures` — Học tập · thủ tục.
4. `health` — Sức khỏe · y tế.
5. `integration` — Ngôn ngữ · hòa nhập.

Mỗi module hiện có 4 topic khởi tạo. Đây là dữ liệu cấu trúc để tiếp tục phát triển, không phải giới hạn cố định về số lượng chủ đề.

## Nguyên tắc nguồn và độ mới

Không được hard-code một quy định dễ thay đổi rồi coi đó là kiến thức cố định.

Các nhóm nội dung như:

- xuất nhập cảnh/cư trú;
- giấy tờ người nước ngoài;
- quy định trường học;
- y tế/bảo hiểm;
- giao thông/dịch vụ;
- giá, phí, mốc thời hạn;

khi đi vào nội dung chi tiết phải có lớp metadata về nguồn tham chiếu và lần kiểm tra gần nhất. Nếu nguồn chưa được xác minh, giao diện phải thể hiện trạng thái chưa hoàn thiện thay vì suy đoán.

## Tiến độ cục bộ

`components/topic-progress.tsx` lưu dữ liệu với namespace `ru-life-progress:v1:*` trong `localStorage`.

Dữ liệu này:

- chỉ phục vụ người đang dùng thiết bị;
- không phải quyền truy cập;
- không thay đổi device identity P-256;
- không gửi sang API quản trị;
- có thể mất nếu người dùng xóa dữ liệu trình duyệt.

Nếu sau này cần đồng bộ đa thiết bị, phải thiết kế một miền dữ liệu người dùng riêng; không được tận dụng `managed_app_devices` hoặc `control_devices` làm kho nội dung cá nhân.

## Ranh giới bảo mật

- `app/app/layout.tsx`: bảo vệ toàn bộ workspace.
- `DeviceHeartbeat`: heartbeat + kiểm tra thu hồi phiên.
- `WorkspaceNavigation`: chỉ điều hướng nội dung, không quyết định quyền.
- `content-catalog.ts`: chỉ chứa cấu trúc nội dung, không chứa secret hay logic quản trị.
- Service worker không cache `/app*` hoặc `/api/*`.

## Hướng phát triển tiếp theo

Đi sâu theo từng topic, ưu tiên nội dung người dùng cần trước khi sang Nga và những việc phải xử lý ngay khi mới đến. Mỗi lượt nên hoàn thiện một nhóm topic có nguồn rõ ràng, regression pass, rồi mới mở rộng sang nhóm tiếp theo.

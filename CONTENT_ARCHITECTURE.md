# RU_LIFE — kiến trúc nội dung Hòa nhập Nga

## Mục tiêu

Nội dung Hòa nhập Nga phải phát triển độc lập với lớp quản trị thiết bị. `Application-Management` không chứa các trang, route, checklist hay dữ liệu sinh hoạt của RU_LIFE.

## Cấu trúc cố định

`/app` là dashboard sau khi thiết bị đã được Quản trị ứng dụng cấp quyền.

Nội dung được tổ chức theo năm lớp:

1. **Module** — một mảng lớn của cuộc sống/học tập tại Nga.
2. **Topic** — một tình huống hoặc nhóm đầu việc có thể cập nhật độc lập.
3. **Content blocks** — hướng dẫn, tình huống, quy trình, mẫu câu.
4. **Source/Freshness** — nguồn tham chiếu, ngày kiểm tra và mức độ cần rà soát.
5. **Local progress** — checklist và ghi chú cá nhân lưu trên thiết bị.

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

Nội dung chi tiết được tách khỏi catalog tại `lib/topic-content.ts`. Catalog chỉ mô tả cấu trúc/điều hướng; content layer chứa các block thực tế và metadata nguồn. Nhờ đó có thể cập nhật một topic mà không phải sửa cây điều hướng chung.

## Trạng thái nội dung Module 01

Bốn topic của `prepare` đã có content layer thực:

- `documents` — Hồ sơ · giấy tờ;
- `luggage` — Hành lý · trang bị;
- `money-connectivity` — Tài chính · liên lạc;
- `arrival-plan` — Kế hoạch ngày đầu.

Các topic này dùng cùng renderer tại `/app/<module>/<topic>`; những topic chưa có content layer vẫn hiển thị fallback “chưa bổ sung dữ liệu chuyên sâu” thay vì tạo dữ liệu giả.

## Nguyên tắc nguồn và độ mới

Không được hard-code một quy định dễ thay đổi rồi coi đó là kiến thức cố định.

Các nhóm nội dung như:

- xuất nhập cảnh/cư trú;
- giấy tờ người nước ngoài;
- quy định trường học;
- y tế/bảo hiểm;
- giao thông/dịch vụ;
- giá, phí, mốc thời hạn;

khi đi vào nội dung chi tiết phải có metadata về nguồn tham chiếu và lần kiểm tra gần nhất. `TopicContent` hiện có:

- `updatedAt`;
- `freshness` (`verified`, `review-soon`, `stable-guidance`);
- `blocks`;
- `sources`.

Mỗi `TopicSource` lưu `publisher`, `title`, `url`, `checkedAt` và ghi chú phạm vi sử dụng nguồn.

Nguồn chính thức được ưu tiên cho quy định pháp lý/hành chính. Module 01 hiện liên kết trực tiếp tới `Study in Russia` và hệ thống e-visa của Cục Lãnh sự Bộ Ngoại giao Nga khi nội dung liên quan tới nhập cảnh/visa. Thông tin phụ thuộc hãng bay, ngân hàng hoặc nhà mạng không được đóng băng thành số liệu cố định; giao diện yêu cầu kiểm tra lại nhà cung cấp ở thời điểm sử dụng.

Nếu nguồn chưa được xác minh, giao diện phải thể hiện trạng thái chưa hoàn thiện thay vì suy đoán.

## Tiến độ cục bộ

`components/topic-progress.tsx` lưu dữ liệu với namespace `ru-life-progress:v1:*` trong `localStorage`.

Dữ liệu này:

- chỉ phục vụ người đang dùng thiết bị;
- không phải quyền truy cập;
- không thay đổi device identity P-256;
- không gửi sang API quản trị;
- có thể mất nếu người dùng xóa dữ liệu trình duyệt.

Nếu sau này cần đồng bộ đa thiết bị, phải thiết kế một miền dữ liệu người dùng riêng; không được tận dụng `managed_app_devices` hoặc `control_devices` làm kho nội dung cá nhân.

## Ranh giới giao diện

- `app/globals.css`: shell công khai, access gate và workspace nền tảng.
- `app/content.css`: dashboard nội dung, module/topic, source/freshness và local progress.

Không đưa style nội dung vào component quản trị thiết bị. Tách CSS giúp nâng cấp nội dung mà không ảnh hưởng màn hình cấp quyền.

## Ranh giới bảo mật

- `app/app/layout.tsx`: bảo vệ toàn bộ workspace.
- `DeviceHeartbeat`: heartbeat + kiểm tra thu hồi phiên.
- `WorkspaceNavigation`: chỉ điều hướng nội dung, không quyết định quyền.
- `content-catalog.ts` / `topic-content.ts`: chỉ chứa nội dung, không chứa secret hay logic quản trị.
- Service worker không cache `/app*` hoặc `/api/*`.

## Hướng phát triển tiếp theo

Sau Module 01, ưu tiên Module 02 — Cuộc sống tại Nga: nhà ở/ký túc xá, đi lại, mua sắm/dịch vụ và an toàn/tình huống khẩn. Nội dung có địa điểm, giá, dịch vụ hoặc quy định thay đổi phải tiếp tục đi qua lớp Source/Freshness trước khi gắn trạng thái đã kiểm tra.

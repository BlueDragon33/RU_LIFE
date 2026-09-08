# RU_LIFE ↔ Quản trị ứng dụng

## Hai runtime độc lập

- `BlueDragon33/RU_LIFE`: Web App Hòa nhập Nga, PWA, khóa cục bộ và session người dùng.
- `BlueDragon33/Application-Management`: Quản trị ứng dụng, registry thiết bị, hồ sơ người sử dụng, phân loại thiết bị, duyệt/thu hồi/khóa và audit.

Không import code runtime giữa hai repo. Không iframe, không route proxy biến Quản trị ứng dụng thành Hòa nhập Nga.

## Luồng truy cập

1. RU_LIFE tạo cặp khóa ECDSA P-256 trong secure context; private key được tạo `extractable=false` và lưu trong IndexedDB.
2. RU_LIFE tự thu thập tín hiệu nhận diện thiết bị rồi gọi `POST <CONTROL_CENTER>/api/apps/hoa-nhap-nga/device` với `action=register`, public JWK và profile thiết bị.
3. Quản trị ứng dụng **tự kiểm tra lại và quyết định phân loại cuối cùng**: `computer`, `phone`, `tablet` hoặc `unknown`.
4. Quản trị ứng dụng trả `deviceId`, mã `HN-...`, loại thiết bị đã phân loại và trạng thái `pending`.
5. Publisher/Owner phải gắn **Họ tên + Mã người dùng** trước khi `approve`.
6. RU_LIFE tự kiểm tra lại mỗi 60 giây khi đang chờ và tab đang hiển thị.
7. Khi `approved`, RU_LIFE xin challenge rồi ký đúng chuỗi:
   `managed-app:hoa-nhap-nga:<deviceId>:<challenge>`.
8. Quản trị ứng dụng xác minh khóa và trả access token HMAC 15 phút.
9. Trình duyệt gửi access token về `POST /api/device/session` của RU_LIFE.
10. RU_LIFE server xác minh HMAC, issuer, audience, appId, deviceId và expiry rồi mới đặt cookie `HttpOnly; SameSite=Strict`.
11. `/app` chỉ render nếu cookie token còn hợp lệ. Không có form đăng nhập tại RU_LIFE.

## Nhận diện và phân loại thiết bị

RU_LIFE thu thập nhiều tín hiệu đồng thời, không dựa vào một chuỗi User-Agent duy nhất:

- User-Agent;
- User-Agent Client Hints khi trình duyệt hỗ trợ (`platform`, `mobile`, `model`, `architecture`, `bitness`);
- `navigator.maxTouchPoints`;
- coarse pointer;
- kích thước màn hình và viewport;
- platform/model hint;
- hệ điều hành và trình duyệt suy ra cục bộ.

Phía Quản trị ứng dụng nhận các tín hiệu này và **phân loại lại ở server**. Trường `deviceClass` do browser gửi lên không được coi là quyết định cuối cùng. Quy tắc ưu tiên hiện tại:

- iPhone/iPod → `phone`;
- Android Mobile → `phone`;
- Android không Mobile → `tablet`;
- iPad/iPadOS, kể cả iPadOS giả dạng Macintosh nhưng có multi-touch → `tablet`;
- Windows/macOS/Linux/ChromeOS desktop → `computer`;
- thiết bị cảm ứng chưa rõ loại → kết hợp touch + coarse pointer + cạnh màn hình ngắn nhất;
- không đủ tín hiệu → `unknown`, không tự đoán bừa.

Phân loại chỉ giúp quản trị và thống kê; **không phải căn cứ bảo mật**. Danh tính bảo mật vẫn là fingerprint SHA-256 của public key P-256.

## Biến môi trường

### RU_LIFE

- `NEXT_PUBLIC_CONTROL_CENTER_BASE_URL=https://quan-ly-hoc-tap.dinhnam3391.chatgpt.site`
- `MEDICINE_SERVICE_SECRET=<cùng giá trị với Quản trị ứng dụng>`

### Application-Management

- `MEDICINE_APP_BASE_URL=https://hoa-nhap-nga.dinhnam3391.chatgpt.site`
- `MEDICINE_SERVICE_SECRET=<cùng giá trị với RU_LIFE>`

`MEDICINE_SERVICE_SECRET` phải tối thiểu 32 ký tự và không bao giờ xuất hiện trong mã client hoặc biến `NEXT_PUBLIC_*`.

## PWA

Service worker RU_LIFE chỉ cache shell công khai. `/api/*` và `/app*` không được cache để tránh giữ nội dung/phiên sau khi Trung tâm đã thu hồi quyền.

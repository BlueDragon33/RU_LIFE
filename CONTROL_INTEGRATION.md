# RU_LIFE ↔ Site Quản trị

## Hai runtime độc lập

- `BlueDragon33/RU_LIFE`: Web App Hòa nhập Nga, PWA, khóa cục bộ và session người dùng.
- `BlueDragon33/Learning-Management`: Site Quản trị, registry thiết bị, hồ sơ người sử dụng, duyệt/thu hồi/khóa và audit.

Không import code runtime giữa hai repo. Không iframe, không route proxy biến Site Quản trị thành Hòa nhập Nga.

## Luồng truy cập

1. RU_LIFE tạo cặp khóa ECDSA P-256 trong secure context; private key được tạo `extractable=false` và lưu trong IndexedDB.
2. RU_LIFE gọi `POST <CONTROL_CENTER>/api/apps/hoa-nhap-nga/device` với `action=register`, public JWK và profile thiết bị.
3. Site Quản trị trả `deviceId`, mã `HN-...` và trạng thái `pending`.
4. Publisher/Owner ở Site Quản trị phải gắn **Họ tên + Mã người dùng** trước khi `approve`.
5. RU_LIFE tự kiểm tra lại mỗi 60 giây khi đang chờ và tab đang hiển thị.
6. Khi `approved`, RU_LIFE xin challenge rồi ký đúng chuỗi:
   `managed-app:hoa-nhap-nga:<deviceId>:<challenge>`.
7. Site Quản trị xác minh khóa và trả access token HMAC 15 phút.
8. Trình duyệt gửi access token về `POST /api/device/session` của RU_LIFE.
9. RU_LIFE server xác minh HMAC, issuer, audience, appId, deviceId và expiry rồi mới đặt cookie `HttpOnly; SameSite=Strict`.
10. `/app` chỉ render nếu cookie token còn hợp lệ. Không có form đăng nhập tại RU_LIFE.

## Biến môi trường

### RU_LIFE

- `NEXT_PUBLIC_CONTROL_CENTER_BASE_URL=https://quan-ly-hoc-tap.dinhnam3391.chatgpt.site`
- `MEDICINE_SERVICE_SECRET=<cùng giá trị với Site Quản trị>`

### Learning-Management

- `MEDICINE_APP_BASE_URL=https://hoa-nhap-nga.dinhnam3391.chatgpt.site`
- `MEDICINE_SERVICE_SECRET=<cùng giá trị với RU_LIFE>`

`MEDICINE_SERVICE_SECRET` phải tối thiểu 32 ký tự và không bao giờ xuất hiện trong mã client hoặc biến `NEXT_PUBLIC_*`.

## PWA

Service worker RU_LIFE chỉ cache shell công khai. `/api/*` và `/app*` không được cache để tránh giữ nội dung/phiên sau khi Trung tâm đã thu hồi quyền.

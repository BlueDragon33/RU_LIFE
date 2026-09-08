# RU_LIFE ↔ Application Management

## Ranh giới bắt buộc

- `BlueDragon33/RU_LIFE` là Web App/PWA **Hòa nhập Nga** độc lập.
- `BlueDragon33/Application-Management` là control-plane quản trị.
- Không import runtime giữa hai repo, không iframe, không dùng database Bơi ếch hoặc Health_Care.
- RU_LIFE không có form đăng nhập trực tiếp. Người dùng chỉ vào `/app` sau khi thiết bị được cấp quyền.
- Namespace thiết bị Hòa nhập Nga là `HN-...`; không dùng `QT-`, `BE-` hoặc `SK-`.

## Luồng truy cập thiết bị

1. RU_LIFE tạo cặp ECDSA P-256 trong secure context; private key `extractable=false` và lưu ở IndexedDB.
2. RU_LIFE thu thập tín hiệu thiết bị và gọi:
   `POST <APPLICATION_MANAGEMENT>/api/apps/hoa-nhap-nga/device`
   với `action=register`, public JWK và profile.
3. Application Management kiểm tra lại tín hiệu và phân loại `computer`, `phone`, `tablet` hoặc `unknown`.
4. Control-plane trả `deviceId`, mã `HN-...`, loại thiết bị và trạng thái `pending`.
5. Publisher/Owner phải gắn **Họ tên + Mã người dùng** trước khi `approve`.
6. Khi đang `pending`, RU_LIFE kiểm tra lại tối đa mỗi 60 giây khi tab đang hiển thị.
7. Khi `approved`, RU_LIFE xin challenge và ký đúng chuỗi:
   `managed-app:hoa-nhap-nga:<deviceId>:<challenge>`.
8. Application Management xác minh P-256 và phát access token HMAC 15 phút với:
   - issuer `application-management`;
   - audience `hoa-nhap-nga-device`;
   - appId `hoa-nhap-nga`;
   - session id `jti`;
   - quyền `editEnabled`.
9. Trình duyệt gửi access token về `POST /api/device/session` của RU_LIFE.
10. RU_LIFE xác minh token bằng `RU_LIFE_CONTROL_SERVICE_SECRET`, sau đó introspect chính token tại:
    `POST <APPLICATION_MANAGEMENT>/api/apps/hoa-nhap-nga/session`.
11. Chỉ khi token còn hợp lệ và session ledger chưa bị thu hồi, RU_LIFE mới đặt cookie `HttpOnly; SameSite=Strict` và cho phép `/app`.

## Phân loại thiết bị

RU_LIFE gửi nhiều tín hiệu, không dùng một User-Agent duy nhất:

- raw User-Agent;
- User-Agent Client Hints khi có;
- `navigator.maxTouchPoints`;
- coarse pointer;
- kích thước màn hình/viewport;
- platform/model hint;
- OS/browser suy ra cục bộ.

Application Management phân loại lại ở server. `deviceClass` do browser gửi chỉ là gợi ý. Phân loại phục vụ UX/quản trị, không phải danh tính bảo mật; danh tính bảo mật là SHA-256 của public key P-256.

## API contract

### Public device gateway

`POST /api/apps/hoa-nhap-nga/device`

Actions:
- `register`
- `challenge`
- `authorize`

### Session introspection

`POST /api/apps/hoa-nhap-nga/session`

RU_LIFE gửi access token hiện tại để kiểm tra session ledger và trạng thái thiết bị HN.

### Integration liveness

RU_LIFE cung cấp:
- `GET /api/integration/control`
- `POST /api/integration/control`

Protocol: `ru-life-control-v1`. Endpoint này chỉ xác nhận contract/capabilities; không trả dữ liệu người dùng.

## Biến môi trường

### RU_LIFE

```env
NEXT_PUBLIC_APPLICATION_MANAGEMENT_BASE_URL=https://learning-management.boiech-ai.workers.dev
RU_LIFE_CONTROL_SERVICE_SECRET=<secret RU_LIFE riêng, tối thiểu 32 ký tự>
```

### Application Management

```env
RU_LIFE_ORIGIN=<origin production của RU_LIFE>
RU_LIFE_CONTROL_SERVICE_SECRET=<cùng giá trị với RU_LIFE>
```

`RU_LIFE_CONTROL_SERVICE_SECRET` không được xuất hiện trong mã client hoặc biến `NEXT_PUBLIC_*`. Không dùng `MEDICINE_*`, `HEALTH_*` hoặc secret Bơi ếch cho Hòa nhập Nga.

## PWA và thu hồi quyền

Service worker chỉ cache shell công khai. `/api/*` và `/app*` không được cache. Khi session bị thu hồi hoặc thiết bị HN bị khóa, heartbeat phải đưa người dùng ra khỏi workspace bảo vệ.

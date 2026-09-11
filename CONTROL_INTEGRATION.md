# RU_LIFE ↔ Application Management

## Ranh giới bắt buộc

- `BlueDragon33/RU_LIFE` là Web App/PWA **Hòa nhập Nga** độc lập và sở hữu runtime, D1, registry thiết bị `HN-`, challenge, session ledger, command ledger và audit.
- `BlueDragon33/Application-Management` là control-plane quản trị; không lưu registry/session HN trong database Trung tâm.
- Không import runtime giữa hai repo, không iframe, không dùng database Bơi ếch hoặc Health_Care.
- RU_LIFE không có form đăng nhập trực tiếp. Người dùng chỉ vào `/app` sau khi thiết bị được cấp quyền.
- Namespace thiết bị Hòa nhập Nga là `HN-...`; không dùng `QT-`, `BE-` hoặc `SK-`.

## Luồng truy cập thiết bị

1. RU_LIFE tạo cặp ECDSA P-256 trong secure context; private key `extractable=false` và lưu ở IndexedDB.
2. Trình duyệt gửi public JWK và profile tới same-origin `POST /api/device/access` với `action=register`.
3. RU_LIFE server tự kiểm tra lại tín hiệu, phân loại `computer`, `phone`, `tablet` hoặc `unknown`, rồi lưu vào D1 riêng của RU_LIFE.
4. RU_LIFE trả `deviceId`, mã `HN-...`, loại thiết bị và trạng thái `pending`.
5. Publisher/Owner trong Application Management mở khu quản trị Hòa nhập Nga. Trung tâm phát vé quản trị ngắn hạn rồi gọi `/api/control/*` của RU_LIFE để gắn **Họ tên + Mã người dùng** và `approve`.
6. Khi đang `pending`, trình duyệt RU_LIFE kiểm tra lại same-origin tối đa mỗi 60 giây khi tab đang hiển thị.
7. Khi `approved`, RU_LIFE cấp challenge; thiết bị ký chuỗi `managed-app:hoa-nhap-nga:<deviceId>:<challenge>`.
8. RU_LIFE xác minh P-256 và tự phát access token HMAC 15 phút với issuer `ru-life`, audience `hoa-nhap-nga-device`, appId `hoa-nhap-nga`, session id `jti` và `editEnabled`.
9. Trình duyệt gửi access token tới `POST /api/device/session` cùng origin.
10. RU_LIFE xác minh HMAC + session ledger + trạng thái thiết bị trong D1 riêng rồi đặt cookie `HttpOnly; SameSite=Strict`.
11. Nếu Application Management khóa thiết bị hoặc thu hồi session qua Control API, RU_LIFE cập nhật D1 của chính mình; heartbeat local sẽ loại phiên khỏi workspace bảo vệ.

## Phân loại thiết bị

RU_LIFE thu thập nhiều tín hiệu, không dùng một User-Agent duy nhất:

- raw User-Agent;
- User-Agent Client Hints khi có;
- `navigator.maxTouchPoints`;
- coarse pointer;
- kích thước màn hình/viewport;
- platform/model hint;
- OS/browser suy ra cục bộ.

Browser classification chỉ là gợi ý. RU_LIFE server phân loại lại trước khi lưu. Phân loại phục vụ UX/quản trị, không phải danh tính bảo mật; danh tính bảo mật là SHA-256 của public key P-256.

## API contract

### Public device gateway — RU_LIFE sở hữu

`POST /api/device/access`

Actions: `register`, `challenge`, `authorize`.

### Local session — RU_LIFE sở hữu

- `GET /api/device/session`
- `POST /api/device/session`
- `DELETE /api/device/session`

### Remote admin — Application Management chỉ gọi qua signed/opaque ticket

- `GET|POST /api/control/devices`
- `POST /api/control/device-commands`
- `GET|POST /api/control/sessions`
- `GET /api/control/audit`
- `GET /api/control/status`

Vé browser admin canonical:
- issuer `application-management`;
- audience `ru-life-control`;
- app `hoa-nhap-nga`;
- chứa actor, role, central control-device id, jti và expiry ngắn hạn.

Opaque ticket `ru-life-control-opaque-v1` chỉ được introspect tại **đúng** `APPLICATION_MANAGEMENT_ORIGIN` đã cấu hình. RU_LIFE không còn thử fallback sang ChatGPT Site hay Worker quản trị cũ. Nếu origin chưa cấu hình hoặc sai origin, control path fail closed.

### Integration liveness

RU_LIFE vẫn cung cấp `GET|POST /api/integration/control` để kiểm tra secret/capabilities mà không trả dữ liệu người dùng. `/api/control/status` công bố ownership, capabilities và deployment metadata để Trung tâm xác minh đúng runtime đang chạy.

## Biến môi trường

### RU_LIFE local

```env
RU_LIFE_CONTROL_SERVICE_SECRET=<secret RU_LIFE riêng, tối thiểu 32 ký tự>
APPLICATION_MANAGEMENT_ORIGIN=http://127.0.0.1:3000
LOCAL_CONTROL_PLANE=true
RU_LIFE_DATABASE_ID=00000000-0000-0000-0000-000000000001
```

HTTP chỉ được chấp nhận cho loopback khi `LOCAL_CONTROL_PLANE=true`.

### RU_LIFE preview/production

```env
RU_LIFE_CONTROL_SERVICE_SECRET=<secret app-scoped, tối thiểu 32 ký tự>
APPLICATION_MANAGEMENT_ORIGIN=https://<application-management-origin>
RU_LIFE_DATABASE_ID=<D1 database id thuộc đúng môi trường RU_LIFE>
```

Không cần biến `NEXT_PUBLIC_*` để đăng ký hoặc xác thực thiết bị HN; browser chỉ gọi same-origin RU_LIFE.

### Application Management

```env
RU_LIFE_BASE_URL=https://<ru-life-origin>
RU_LIFE_CONTROL_SERVICE_SECRET=<cùng giá trị với RU_LIFE>
```

`RU_LIFE_CONTROL_SERVICE_SECRET` không được xuất hiện trong mã client hoặc biến `NEXT_PUBLIC_*`. Không dùng `MEDICINE_*`, `HEALTH_*` hoặc secret Bơi ếch cho Hòa nhập Nga.

## Cloudflare preview

Preview sử dụng Worker `ru-life-preview` và D1 `ru-life-preview-db`. Workflow `.github/workflows/deploy-preview.yml` chỉ chạy thủ công và yêu cầu xác nhận `DEPLOY_PREVIEW`.

GitHub Environment `ru-life-preview` cần:

- Secret `CLOUDFLARE_API_TOKEN`;
- Secret `CLOUDFLARE_ACCOUNT_ID`;
- Secret `RU_LIFE_PREVIEW_D1_DATABASE_ID`;
- Secret `RU_LIFE_CONTROL_SERVICE_SECRET`;
- tùy chọn Secret `RU_LIFE_PRODUCTION_D1_DATABASE_ID` để guard không dùng nhầm production;
- Variable `APPLICATION_MANAGEMENT_PREVIEW_ORIGIN`;
- Variable `RU_LIFE_PREVIEW_ORIGIN` sau khi Worker có URL thực.

Preview không được dùng D1 local placeholder, không được dùng D1 production, và `APPLICATION_MANAGEMENT_PREVIEW_ORIGIN` không được trỏ về `*.chatgpt.site`. Production auto-deploy vẫn tắt cho tới khi kiểm chứng E2E.

## PWA và thu hồi quyền

Service worker chỉ cache shell công khai. `/api/*` và `/app*` không được cache. Khi session bị thu hồi hoặc thiết bị HN bị khóa, heartbeat phải đưa người dùng ra khỏi workspace bảo vệ.

## Migration từ kiến trúc cũ

Application Management từng chứa bảng `ru_life_*`. Các bảng đó chỉ được coi là dữ liệu legacy trong thời gian chuyển đổi. Runtime mới không được đọc/ghi các bảng này. Không drop dữ liệu cũ cho tới khi xác minh production và chuyển dữ liệu cần giữ sang D1 RU_LIFE.

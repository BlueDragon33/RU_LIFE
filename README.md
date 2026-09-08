# RU_LIFE — Hòa nhập Nga

`RU_LIFE` là mã nguồn độc lập của Web App **Hòa nhập Nga**.

## Ranh giới kiến trúc

- Repo này sở hữu giao diện, runtime, PWA, khóa thiết bị cục bộ và session của Hòa nhập Nga.
- Repo `BlueDragon33/Application-Management` là **control-plane quản trị**, không phải runtime RU_LIFE.
- Hòa nhập Nga không có màn hình đăng nhập trực tiếp.
- Quyền truy cập được quyết định theo từng thiết bị qua Application Management.
- Hai repo chỉ giao tiếp qua API/token; không iframe, không import runtime và không dùng database nghiệp vụ của nhau.
- Thiết bị Hòa nhập Nga dùng namespace riêng `HN-...`; không chia sẻ namespace/registry với `QT-`, `BE-` hay `SK-`.

## Nhận diện thiết bị

RU_LIFE tự thu thập nhiều tín hiệu để nhận diện **Máy tính / Điện thoại / Tablet-iPad**, gồm User-Agent, Client Hints, touch, pointer, màn hình/viewport, platform và model hint. Application Management kiểm tra lại các tín hiệu trước khi lưu loại thiết bị cuối cùng.

Phân loại chỉ phục vụ UX/quản trị. Danh tính bảo mật là fingerprint SHA-256 của public key ECDSA P-256; private key không rời thiết bị.

## Luồng quyền thiết bị

`detect → register HN → pending → gắn Họ tên + Mã người dùng → approve → challenge P-256 → authorize → token 15 phút → session RU_LIFE`

Khi thiết bị bị khóa hoặc session bị thu hồi, RU_LIFE kiểm tra lại với Application Management và chặn workspace bảo vệ.

Xem [`CONTROL_INTEGRATION.md`](CONTROL_INTEGRATION.md) để biết contract chi tiết.

# RU_LIFE — Hòa nhập Nga

`RU_LIFE` là mã nguồn độc lập của Web App **Hòa nhập Nga**.

## Ranh giới kiến trúc

- Repo này sở hữu giao diện, runtime, PWA, database, registry thiết bị, challenge P-256, session ledger và audit của Hòa nhập Nga.
- Repo `BlueDragon33/Application-Management` là **control-plane quản trị**: cấp policy/quyền và gửi thao tác quản trị qua signed Control API; không sở hữu registry/session HN.
- Hòa nhập Nga không có màn hình đăng nhập trực tiếp.
- Thiết bị Hòa nhập Nga dùng namespace riêng `HN-...`; không chia sẻ namespace/registry với `QT-`, `BE-` hay `SK-`.
- Hai repo chỉ giao tiếp qua API/token quản trị ngắn hạn; không iframe, không import runtime và không dùng database nghiệp vụ của nhau.

## Nhận diện thiết bị

RU_LIFE tự thu thập nhiều tín hiệu để nhận diện **Máy tính / Điện thoại / Tablet-iPad**, gồm User-Agent, Client Hints, touch, pointer, màn hình/viewport, platform và model hint. RU_LIFE kiểm tra lại các tín hiệu ở server trước khi lưu phân loại cuối cùng.

Phân loại chỉ phục vụ UX/quản trị. Danh tính bảo mật là fingerprint SHA-256 của public key ECDSA P-256; private key không rời thiết bị.

## Luồng quyền thiết bị

`detect → register HN tại RU_LIFE → pending → Application Management gắn Họ tên + Mã người dùng qua Control API → approve → challenge P-256 tại RU_LIFE → authorize → token RU_LIFE 15 phút → session RU_LIFE`

Application Management có thể khóa thiết bị, bật/tắt quyền sửa hoặc thu hồi session bằng vé quản trị ngắn hạn. Trạng thái thật vẫn được ghi trong database RU_LIFE; request người dùng bình thường không phụ thuộc runtime của Application Management.

Xem [`CONTROL_INTEGRATION.md`](CONTROL_INTEGRATION.md) để biết contract chi tiết.

# RU_LIFE — Hòa nhập Nga

`RU_LIFE` là mã nguồn độc lập của Web App **Hòa nhập Nga**.

## Ranh giới kiến trúc

- Repo này chứa giao diện/runtime/PWA/session của Hòa nhập Nga.
- Repo `BlueDragon33/Learning-Management` chỉ là **Site Quản trị**.
- Hòa nhập Nga không có màn hình đăng nhập quản trị riêng.
- Quyền truy cập người dùng được quyết định từ Site Quản trị theo từng thiết bị.
- Hai repo giao tiếp qua API và token dịch vụ; không nhúng runtime hoặc giao diện của nhau.

## Luồng quyền thiết bị

`register → pending → quản trị gắn người dùng → approve → challenge → authorize → session RU_LIFE`

Khóa riêng P-256 chỉ nằm trên thiết bị người dùng. Site Quản trị giữ khóa công khai và trạng thái cấp quyền.

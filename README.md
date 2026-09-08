# RU_LIFE — Hòa nhập Nga

`RU_LIFE` là mã nguồn độc lập của Web App **Hòa nhập Nga**.

## Ranh giới kiến trúc

- Repo này chứa giao diện/runtime/PWA/session của Hòa nhập Nga.
- Repo `BlueDragon33/Application-Management` chỉ là **Quản trị ứng dụng**.
- Hòa nhập Nga không có màn hình đăng nhập quản trị riêng.
- Quyền truy cập người dùng được quyết định từ Quản trị ứng dụng theo từng thiết bị.
- Hai repo giao tiếp qua API và token dịch vụ; không nhúng runtime hoặc giao diện của nhau.

## Nhận diện thiết bị

RU_LIFE tự thu thập nhiều tín hiệu để nhận diện **Máy tính / Điện thoại / Máy tính bảng** rồi gửi profile sang Quản trị ứng dụng. Phía Quản trị ứng dụng kiểm tra lại User-Agent, Client Hints và các tín hiệu touch/màn hình trước khi lưu loại thiết bị cuối cùng.

Phân loại chỉ phục vụ quản trị và thống kê. Danh tính bảo mật vẫn là khóa ECDSA P-256 riêng của từng thiết bị.

## Luồng quyền thiết bị

`detect → register → pending → quản trị gắn người dùng → approve → challenge → authorize → session RU_LIFE`

Khóa riêng P-256 chỉ nằm trên thiết bị người dùng. Quản trị ứng dụng giữ khóa công khai, loại thiết bị đã phân loại và trạng thái cấp quyền.

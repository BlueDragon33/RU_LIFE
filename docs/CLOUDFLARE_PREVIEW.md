# RU_LIFE Cloudflare Preview

## Mục tiêu

Môi trường preview dùng để kiểm chứng Hòa nhập Nga trên Cloudflare trước khi bật production. GitHub là source of truth; preview và local không dùng chung D1 với production.

## Tài nguyên preview

- Worker: `ru-life-preview`
- D1: `ru-life-preview-db`
- GitHub Environment: `ru-life-preview`
- Workflow: `.github/workflows/deploy-preview.yml`

## GitHub Environment cần cấu hình

Secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `RU_LIFE_PREVIEW_D1_DATABASE_ID`
- `RU_LIFE_CONTROL_SERVICE_SECRET`
- `RU_LIFE_PRODUCTION_D1_DATABASE_ID` (khuyến nghị; dùng làm guard chống dùng nhầm production)

Variables:

- `APPLICATION_MANAGEMENT_PREVIEW_ORIGIN`: HTTPS origin chính xác của Application Management preview
- `RU_LIFE_PREVIEW_ORIGIN`: HTTPS origin của RU_LIFE preview sau lần deploy đầu tiên

Không commit các giá trị trên vào repository.

## Chạy deploy

Vào GitHub Actions → `RU_LIFE Cloudflare Preview Deploy` → Run workflow → nhập chính xác `DEPLOY_PREVIEW`.

Workflow sẽ validate source, materialize Wrangler config tạm, apply migration chỉ vào `ru-life-preview-db`, build bằng Cloudflare Vite plugin, deploy Worker, cài/rotate secret và smoke-test public shell nếu đã cấu hình `RU_LIFE_PREVIEW_ORIGIN`.

## Gate trước khi nối Application Management

1. `GET /` của RU_LIFE preview trả public shell.
2. `GET /api/control/status` với service credential hợp lệ trả `application=ru-life`, `deviceIdempotentCommands=true`, `optimisticConcurrency=true` và deployment channel/revision đúng.
3. Application Management preview dùng `RU_LIFE_BASE_URL=<RU_LIFE_PREVIEW_ORIGIN>` và cùng `RU_LIFE_CONTROL_SERVICE_SECRET`.
4. Thiết bị HN mới xuất hiện pending ở RU_LIFE preview; central approve bằng command idempotent; thiết bị hoàn tất P-256 challenge rồi vào `/app`.
5. Central block thiết bị; RU_LIFE revoke session; heartbeat đưa client khỏi workspace.
6. Reload/sync ở Application Management chỉ đọc trạng thái, không tự mutation.

Chỉ sau khi E2E trên pass mới xem xét workflow production. Không copy dữ liệu D1 production sang preview nếu chưa có quy trình dữ liệu riêng được phê duyệt.

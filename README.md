# Sushi Care

PWA tiếng Việt theo dõi việc chăm sóc bé sau sinh: bú, ngủ, tã, sức khỏe, nhắc nhở và AI hỏi nhanh.

## Công nghệ

- React + Vite + TypeScript
- PHP 8+ API, session auth, PDO
- MySQL/MariaDB
- PWA manifest + service worker

## Chạy local

1. Cài frontend:

```bash
cd frontend
npm install
npm run dev
```

2. Tạo database `sushi_care`, sao chép cấu hình:

```bash
cp backend/config/local.example.php backend/config/local.php
php -r "echo password_hash('MatKhauMoiCuaBan', PASSWORD_DEFAULT), PHP_EOL;"
```

3. Điền database, `appKey`, `installToken` và hash vừa tạo vào `backend/config/local.php`.
4. Chạy PHP server từ thư mục deploy local hoặc đặt symlink phù hợp:

```bash
php -S 127.0.0.1:8080 -t backend
```

5. Import `database/schema.sql` sau khi thay `__ADMIN_PASSWORD_HASH__`, hoặc truy cập `install.php?token=...` một lần rồi xóa `install.php`.

## Kiểm thử và build

```bash
cd frontend
npm test -- --run
npm run build
cd ..
php backend/tests/run.php
find backend -name '*.php' -print0 | xargs -0 -n1 php -l
bash scripts/package-deploy.sh
```

## Deploy cPanel

1. Tạo MySQL database và user trong cPanel, cấp `ALL PRIVILEGES`.
2. Build frontend, chạy `scripts/package-deploy.sh` và giải nén nội dung gói vào `/public_html/baby-care`.
3. Tạo `/public_html/baby-care/config/local.php` từ `local.example.php`; dùng mật khẩu database riêng và `appKey` ngẫu nhiên.
4. Đặt quyền thư mục `uploads` là `0755`. Không cấp `0777` nếu hosting không yêu cầu.
5. Tạm cho phép `install.php`, gọi URL kèm install token đúng một lần, sau đó xóa `install.php` và thư mục `database`.
6. Đăng nhập bằng `admin@example.com` cùng mật khẩu dùng để tạo hash.
7. Vào **Thêm → Hồ sơ bé** để cập nhật thông tin và đổi mật khẩu admin sau lần cài đặt đầu.
8. Vào **Thêm → AI Settings**, nhập Base URL, model và API key, bấm **Test kết nối**, sau đó bật AI và lưu.

## Dự đoán cữ bú và email nhắc hâm sữa

- Prediction chạy hoàn toàn bằng PHP, không gọi AI/API và vẫn hoạt động khi AI bị tắt.
- Vào **Thêm → Hồ sơ bé** chọn loại nuôi, sau đó vào **Thêm → Nhắc hâm sữa** để nhập email và thời gian nhắc.
- Tài khoản admin cấu hình SMTP tại cùng màn hình. Khuyến nghị dùng TLS cổng `587`; mật khẩu SMTP được mã hóa bằng `appKey`.
- Email gửi mặc định từ `Sushi Care <sushi@leminhhieu.com>` và có thể đổi trong phần SMTP.
- Cài PHPMailer khi deploy thủ công bằng `composer install --no-dev --optimize-autoloader` trong thư mục app. Gói deploy từ `scripts/package-deploy.sh` đã kèm `vendor`.
- Tạo cron trong cPanel chạy mỗi 5 phút:

```cron
*/5 * * * * /usr/local/bin/php /home/CPANEL_USER/public_html/baby-care/cron/check-feeding-reminders.php >/dev/null 2>&1
```

Thay `CPANEL_USER` và đường dẫn PHP theo tài khoản cPanel. Cron chỉ chạy bằng CLI, truy cập qua web sẽ trả `404`.

## Cấu hình AI

Mặc định:

- Provider: OpenAI-compatible
- Base URL: `https://token.v-claw.org`
- Model: `gpt-5.5`
- API key: để trống

API key được mã hóa AES-256-GCM bằng `appKey`. Không đặt key trong frontend, Git hoặc log.

## Lưu ý y tế

Sushi Care là công cụ ghi chép và thông tin tham khảo, không thay thế bác sĩ. Với dấu hiệu khó thở, tím tái, co giật, bỏ bú, lừ đừ, mất nước hoặc tình trạng khẩn cấp khác, hãy liên hệ bác sĩ/cấp cứu ngay.

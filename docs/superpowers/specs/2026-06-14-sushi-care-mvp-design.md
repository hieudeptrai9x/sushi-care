# Sushi Care MVP Design

## Mục tiêu

Xây dựng PWA tiếng Việt dành cho một gia đình theo dõi bé sau sinh, chạy tốt trên iPhone, có backend PHP 8 + MySQL/MariaDB và triển khai được trên shared hosting cPanel.

## Phạm vi MVP

- Đăng nhập bằng session.
- Hồ sơ bé và dashboard tổng hợp dữ liệu hôm nay.
- Tạo, xem, sửa, xóa nhật ký bú, ngủ, tã, cân nặng/nhiệt độ/ọc sữa.
- Nhật ký theo ngày và bộ lọc loại hoạt động.
- Upload, xem, sửa caption và xóa khoảnh khắc.
- Tạo, sửa, hoàn thành và xóa nhắc nhở.
- Chat AI qua backend, cấu hình provider/key trong trang quản trị, có cảnh báo y tế bắt buộc.
- PWA có manifest, icon, service worker và shell offline cơ bản.
- README cài local và deploy cPanel.

## Kiến trúc

Frontend là React + Vite + TypeScript, dùng React Router và CSS thuần theo design token để giữ bundle nhỏ. Toàn bộ gọi API đi qua một client typed; các màn hình có loading, empty, error và toast. Backend là các endpoint PHP nhỏ dùng chung bootstrap, PDO, session auth, validation và JSON response.

Database lưu `users`, `babies`, `activities`, `moments`, `reminders`, `settings`, `ai_messages`. Secret AI được mã hóa bằng khóa server-side trước khi ghi database; API chỉ trả giá trị đã mask. Upload được kiểm tra MIME, phần mở rộng và kích thước, đặt tên ngẫu nhiên trong `/uploads`.

Frontend production được build vào `dist`, sau đó ghép với `backend/api`, `backend/config`, `backend/lib`, `uploads` và `.htaccess` thành gói deploy cho `/public_html`.

## Luồng dữ liệu

Sau đăng nhập, frontend gọi `/api/auth/me.php`, lấy hồ sơ bé và tải dashboard. Form ghi nhật ký gửi payload chuẩn hóa đến `/api/activities/create.php`; dashboard và journal tải lại dữ liệu sau khi lưu. AI chat gửi message và tùy chọn context; backend tự lấy summary 24 giờ, áp safety prompt, gọi provider OpenAI-compatible và lưu lịch sử.

## An toàn và lỗi

Mọi endpoint riêng tư yêu cầu session hợp lệ, dùng prepared statement và trả lỗi chung trong production. Mutation yêu cầu CSRF token lấy từ `/api/auth/me.php`. Upload chỉ nhận JPG, PNG, WebP, MP4, MOV trong giới hạn cấu hình. AI key không xuất hiện trong HTML, JS, response hay log. Các từ khóa nguy hiểm được chặn trước provider để luôn trả khuyến nghị liên hệ bác sĩ/cấp cứu.

## Kiểm thử

Vitest kiểm thử logic tuổi bé, thời lượng, summary và API client. PHP test script kiểm thử validator, safety classifier, secret masking và payload mapping không cần database. Production gate gồm frontend tests, TypeScript build, PHP syntax check, kiểm tra bundle không chứa secret, rồi smoke test HTTP sau deploy.

## Ngoài phạm vi MVP

Multi-tenant nâng cao, push notification server-side, đồng bộ nhiều thiết bị theo thời gian thực, Gemini/Claude native provider và xử lý video nền chưa thuộc MVP. Provider khác có thể dùng chế độ OpenAI-compatible hoặc được bổ sung sau.

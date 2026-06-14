# Sushi Care Mobile Polish Design

## Mục tiêu

Sửa các lỗi hiển thị trên iPhone 15 Pro, làm giao diện hài hòa hơn nhưng giữ hồng là màu thương hiệu chính, loại bỏ Khoảnh khắc, bổ sung avatar bé và thay icon PWA.

## Thiết kế giao diện

- Hồng coral tiếp tục là màu primary cho header, CTA và trạng thái active.
- Tím lavender, xanh dương, mint và cam phân biệt các nhóm bú, ngủ, tã, sức khỏe và AI.
- Bottom navigation còn bốn tab: Trang chủ, Nhật ký, Lịch, Thêm. Nút ghi nhanh nằm giữa hai cặp tab, dùng safe-area và không che nội dung.
- Home thay slogan bằng thông tin lượng sữa công thức tham khảo theo tuổi. Nội dung luôn ghi rõ đây là mức tham khảo, ưu tiên tín hiệu đói/no và lời khuyên bác sĩ.

## Lượng sữa tham khảo

Dùng mốc từ CDC và American Academy of Pediatrics:

- Những ngày đầu: 30-60 ml/cữ, thường mỗi 2-3 giờ.
- Từ cuối tháng đầu: 90-120 ml/cữ, thường mỗi 3-4 giờ.
- Từ tháng 2 đến trước 6 tháng: không nội suy một con số cứng; hiển thị lượng tăng dần theo nhu cầu và tăng trưởng của bé.
- Khoảng 6 tháng: 180-240 ml/cữ.
- Trên 6 tháng: hiển thị nhắc rằng sữa mẹ/sữa công thức vẫn quan trọng và lượng phụ thuộc ăn dặm.

## Avatar và icon

Hồ sơ bé cho phép chọn JPG, PNG hoặc WebP tối đa theo cấu hình upload. Backend xác thực MIME, đổi tên ngẫu nhiên, xóa avatar cũ thuộc thư mục upload khi thay mới, rồi trả URL mới. Ảnh app do người dùng cung cấp được crop vuông và xuất PNG 180, 192, 512 cùng bản maskable.

## Nhập số và Safari

Tất cả input/select/textarea có font-size tối thiểu 16px để Safari không tự zoom. Trường số thập phân hiển thị dạng text với `inputmode="decimal"` và được chuẩn hóa dấu phẩy thành dấu chấm trước khi gửi. Backend tiếp tục chuẩn hóa để dữ liệu từ client cũ vẫn hợp lệ.

## Loại bỏ Khoảnh khắc

Xóa route, tab, quick action, page và endpoint Moments khỏi bản deploy. Không drop bảng hay xóa file upload cũ trong database để tránh mất dữ liệu ngoài ý muốn.

## Kiểm thử

- Unit test lượng sữa theo tuổi và parse số `2,7`.
- PHP test normalize `weight_kg` và `birth_weight` có dấu phẩy.
- Frontend build và PHP lint.
- Kiểm thử production ở viewport iPhone: bottom nav, form cân nặng, upload avatar, icon/manifest và console.

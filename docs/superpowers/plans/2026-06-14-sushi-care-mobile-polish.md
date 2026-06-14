# Sushi Care Mobile Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện UI mobile, avatar, icon PWA và nhập số tiếng Việt cho Sushi Care production.

**Architecture:** Bổ sung utility thuần cho dữ liệu theo tuổi và decimal parsing, tái sử dụng upload validation phía PHP cho avatar. Giao diện giữ cấu trúc React hiện tại nhưng thay bottom nav thành bốn tab với action slot giữa.

**Tech Stack:** React, TypeScript, Vitest, PHP 8, PDO, CSS, ImageMagick/sips cho asset.

---

### Task 1: Domain tests

**Files:** `frontend/src/utils/baby.test.ts`, `backend/tests/run.php`

- [ ] Viết test cho hướng dẫn sữa theo tuổi và parse `2,7`.
- [ ] Chạy test và xác nhận fail vì functions chưa tồn tại.
- [ ] Cài utility tối thiểu và chạy test xanh.

### Task 2: Mobile navigation và homepage

**Files:** `frontend/src/components/AppShell.tsx`, `frontend/src/pages/HomePage.tsx`, `frontend/src/styles.css`

- [ ] Bỏ Moments khỏi nav và quick action.
- [ ] Tạo nav bốn tab với khoảng giữa dành cho FAB.
- [ ] Thay slogan bằng card hướng dẫn sữa có nguồn và disclaimer.
- [ ] Cân lại palette: hồng primary, màu phụ theo chức năng.

### Task 3: Decimal input

**Files:** `frontend/src/pages/HealthPage.tsx`, `frontend/src/pages/BabyProfilePage.tsx`, `frontend/src/utils/number.ts`, `backend/lib/ActivityService.php`, `backend/api/baby/update.php`

- [ ] Dùng text + decimal inputmode cho kg/cm/°C.
- [ ] Normalize dấu phẩy frontend và backend.
- [ ] Đặt form controls 16px trên mobile.

### Task 4: Avatar upload

**Files:** `backend/api/baby/avatar.php`, `frontend/src/pages/BabyProfilePage.tsx`, `frontend/src/types.ts`

- [ ] Thêm endpoint upload xác thực MIME/dung lượng.
- [ ] Thêm chọn ảnh, preview, upload và cập nhật header.
- [ ] PHP lint và smoke test upload.

### Task 5: PWA icon và loại bỏ Moments

**Files:** `frontend/public/icons/*`, `frontend/index.html`, `frontend/public/manifest.webmanifest`, routes/pages/API Moments

- [ ] Xuất icon 180/192/512/maskable từ ảnh người dùng.
- [ ] Khai báo apple-touch-icon và manifest icons.
- [ ] Xóa page/route/API Moments nhưng giữ schema.

### Task 6: Verify và deploy

- [ ] Chạy Vitest, TypeScript/Vite build và PHP tests/lint.
- [ ] Kiểm tra viewport iPhone và browser console.
- [ ] Đóng gói, backup production và upload.
- [ ] Smoke test nav, decimal input, avatar, manifest và API auth.

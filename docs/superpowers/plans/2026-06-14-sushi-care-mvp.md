# Sushi Care MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo và deploy một PWA chăm sóc trẻ sơ sinh bằng tiếng Việt với React, PHP và MySQL hoạt động end-to-end.

**Architecture:** React SPA gọi các PHP JSON endpoint cùng origin. PHP dùng session, PDO và các thư viện nhỏ dùng chung; MySQL lưu dữ liệu nghiệp vụ và cấu hình AI mã hóa server-side. Bản build frontend và backend được đóng gói chung để chạy tại document root cPanel.

**Tech Stack:** React 19, Vite, TypeScript, React Router, Vitest, PHP 8+, PDO MySQL, MySQL/MariaDB, PWA service worker.

---

### Task 1: Scaffold và domain utilities

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/src/utils/baby.ts`
- Test: `frontend/src/utils/baby.test.ts`

- [ ] Viết test cho cách tính tuổi dưới 30 ngày, trên một tháng và duration qua ngày.
- [ ] Chạy `npm test -- --run` và xác nhận test fail vì module chưa tồn tại.
- [ ] Cài đặt utilities typed tối thiểu.
- [ ] Chạy test và xác nhận pass.

### Task 2: Backend foundation và auth

**Files:**
- Create: `backend/config/app.php`
- Create: `backend/config/database.php`
- Create: `backend/lib/Auth.php`
- Create: `backend/lib/Response.php`
- Create: `backend/lib/Validator.php`
- Create: `backend/api/auth/login.php`
- Create: `backend/api/auth/logout.php`
- Create: `backend/api/auth/me.php`
- Test: `backend/tests/run.php`

- [ ] Viết PHP assertions cho email, enum, secret masking và CSRF.
- [ ] Chạy `php backend/tests/run.php` và xác nhận fail vì class chưa tồn tại.
- [ ] Cài bootstrap, JSON response, PDO factory, session auth và CSRF.
- [ ] Cài ba endpoint auth với password hashing.
- [ ] Chạy PHP tests và syntax check.

### Task 3: Database và activity API

**Files:**
- Create: `database/schema.sql`
- Create: `backend/lib/ActivityService.php`
- Create: `backend/api/baby/get.php`
- Create: `backend/api/baby/update.php`
- Create: `backend/api/activities/{list,create,update,delete}.php`
- Create: `backend/api/stats/{today,weekly,weight}.php`

- [ ] Thêm failing assertions cho normalize activity và summary.
- [ ] Cài schema có seed admin an toàn qua installer hash placeholder.
- [ ] Cài CRUD activity, baby profile và truy vấn thống kê prepared.
- [ ] Chạy PHP tests và syntax check toàn backend.

### Task 4: Frontend shell, login và dashboard

**Files:**
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/services/api.ts`
- Create: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/src/pages/HomePage.tsx`
- Create: `frontend/src/components/AppShell.tsx`
- Create: `frontend/src/styles.css`

- [ ] Viết API client tests cho success, unauthorized và error payload.
- [ ] Xác nhận tests fail.
- [ ] Cài auth guard, login, mobile shell, bottom nav, quick-add sheet và dashboard.
- [ ] Chạy tests và build TypeScript.

### Task 5: Forms và journal

**Files:**
- Create: `frontend/src/pages/ActivityFormPage.tsx`
- Create: `frontend/src/pages/HealthPage.tsx`
- Create: `frontend/src/pages/JournalPage.tsx`
- Create: `frontend/src/components/ActivityCard.tsx`

- [ ] Viết test cho mapping form bú/ngủ/tã/sức khỏe thành API payload.
- [ ] Xác nhận tests fail.
- [ ] Cài forms động, tự tính duration, validation, toast, filter và confirm delete.
- [ ] Chạy tests và build.

### Task 6: Moments và reminders

**Files:**
- Create: `backend/api/moments/{list,upload,update,delete}.php`
- Create: `backend/api/reminders/{list,create,update,delete}.php`
- Create: `frontend/src/pages/MomentsPage.tsx`
- Create: `frontend/src/pages/RemindersPage.tsx`

- [ ] Viết assertions PHP cho loại file và giới hạn upload.
- [ ] Xác nhận assertions fail.
- [ ] Cài upload an toàn, gallery/viewer/caption và reminder CRUD.
- [ ] Chạy tests, PHP lint và frontend build.

### Task 7: AI settings và chat

**Files:**
- Create: `backend/lib/AiProviderInterface.php`
- Create: `backend/lib/OpenAICompatibleProvider.php`
- Create: `backend/lib/AiSafety.php`
- Create: `backend/api/ai/{chat,test,settings,settings_update}.php`
- Create: `frontend/src/pages/AiChatPage.tsx`
- Create: `frontend/src/pages/AiSettingsPage.tsx`

- [ ] Viết assertions cho nhận diện dấu hiệu nguy hiểm, mask key và provider response mapping.
- [ ] Xác nhận tests fail.
- [ ] Cài abstraction provider, context 24h, safety response, encrypted settings và chat history.
- [ ] Cài UI chat, quick chips, disclaimer, test/lưu settings.
- [ ] Chạy toàn bộ tests và build.

### Task 8: Settings, PWA và packaging

**Files:**
- Create: `frontend/public/manifest.webmanifest`
- Create: `frontend/public/sw.js`
- Create: `frontend/src/pages/SettingsPage.tsx`
- Create: `.htaccess`
- Create: `scripts/package-deploy.sh`
- Create: `README.md`

- [ ] Cài profile/settings UI và các endpoint settings.
- [ ] Cài manifest, icons, service worker và offline shell.
- [ ] Thêm GA4 đúng mã yêu cầu.
- [ ] Viết hướng dẫn cài đặt, đổi password, AI và deploy tiếng Việt.
- [ ] Build và đóng gói production.

### Task 9: Deploy và smoke test

**Files:**
- Create: `outputs/sushi-care-deploy.zip`

- [ ] Tạo database/user qua cPanel API nếu quyền token cho phép.
- [ ] Import schema và cấu hình production ngoài web root khi hosting hỗ trợ.
- [ ] Upload gói qua FTP vào `/public_html`.
- [ ] Kiểm tra trang login, manifest, API health và PHP error log.
- [ ] Quét production bundle để bảo đảm không có FTP/cPanel/API secret.

<?php

declare(strict_types=1);

namespace SushiCare\Lib;

final class Auth
{
    public static function userId(): int
    {
        $id = (int) ($_SESSION['user_id'] ?? 0);
        if ($id < 1) {
            Response::error('Vui lòng đăng nhập.', 401);
        }
        return $id;
    }

    public static function csrfToken(): string
    {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(24));
        }
        return $_SESSION['csrf_token'];
    }

    public static function verifyCsrf(): void
    {
        $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!hash_equals((string) ($_SESSION['csrf_token'] ?? ''), $provided)) {
            Response::error('Phiên làm việc không hợp lệ. Vui lòng tải lại trang.', 419);
        }
    }
}

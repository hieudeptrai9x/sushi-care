<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$data = input();
$current = (string) ($data['current_password'] ?? '');
$next = (string) ($data['new_password'] ?? '');
if (strlen($next) < 10) {
    Response::error('Mật khẩu mới cần ít nhất 10 ký tự.', 422);
}
$stmt = db()->prepare('SELECT password_hash FROM users WHERE id=?');
$stmt->execute([$userId]);
if (!password_verify($current, (string) $stmt->fetchColumn())) {
    Response::error('Mật khẩu hiện tại không đúng.', 422);
}
$update = db()->prepare('UPDATE users SET password_hash=?, must_change_password=0 WHERE id=?');
$update->execute([password_hash($next, PASSWORD_DEFAULT), $userId]);
Response::json(['message' => 'Đã đổi mật khẩu.']);

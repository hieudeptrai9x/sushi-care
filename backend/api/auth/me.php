<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$stmt = db()->prepare('SELECT id, name, email, role, must_change_password FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();
if (!$user) {
    Response::error('Tài khoản không tồn tại.', 401);
}
$_SESSION['role'] = (string) $user['role'];
$user['csrf_token'] = Auth::csrfToken();
Response::json($user);

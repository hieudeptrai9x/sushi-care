<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;
use SushiCare\Lib\Validator;

require_method('POST');
$data = input();
$email = strtolower(trim((string) ($data['email'] ?? '')));
if (!Validator::loginId($email) || !is_string($data['password'] ?? null)) {
    Response::error('ID hoặc mật khẩu không hợp lệ.', 422);
}

$stmt = db()->prepare('SELECT id, name, email, password_hash, role, must_change_password FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();
if (!$user || !password_verify((string) $data['password'], $user['password_hash'])) {
    Response::error('ID hoặc mật khẩu không đúng.', 401);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['role'] = (string) $user['role'];
unset($user['password_hash']);
$user['csrf_token'] = Auth::csrfToken();
Response::json($user);

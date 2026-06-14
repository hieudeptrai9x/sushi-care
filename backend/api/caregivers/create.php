<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;
use SushiCare\Lib\Validator;

require_method('POST');
$userId = Auth::userId();
Auth::requireAdmin();
Auth::verifyCsrf();
$data = input();
$name = Validator::requiredString($data, 'name', 120);
$loginId = strtolower(trim((string) ($data['email'] ?? '')));
$password = (string) ($data['password'] ?? '');
if (!Validator::loginId($loginId)) {
    Response::error('ID đăng nhập cần ít nhất 3 ký tự và chỉ dùng chữ, số, dấu chấm, gạch ngang hoặc @.', 422);
}
if (strlen($password) < 8) {
    Response::error('Mật khẩu cần ít nhất 8 ký tự.', 422);
}

$babyId = baby_id($userId);
$pdo = db();
$pdo->beginTransaction();
try {
    $existing = $pdo->prepare('SELECT id FROM users WHERE email=? LIMIT 1');
    $existing->execute([$loginId]);
    $caregiverId = (int) $existing->fetchColumn();
    if ($caregiverId < 1) {
        $create = $pdo->prepare(
            "INSERT INTO users (name,email,password_hash,role,must_change_password) VALUES (?,?,?,'caregiver',1)"
        );
        $create->execute([$name, $loginId, password_hash($password, PASSWORD_DEFAULT)]);
        $caregiverId = (int) $pdo->lastInsertId();
    } else {
        $update = $pdo->prepare(
            "UPDATE users SET name=?,password_hash=?,role='caregiver',must_change_password=1 WHERE id=?"
        );
        $update->execute([$name, password_hash($password, PASSWORD_DEFAULT), $caregiverId]);
    }
    $share = $pdo->prepare('INSERT IGNORE INTO baby_caregivers (baby_id,user_id) VALUES (?,?)');
    $share->execute([$babyId, $caregiverId]);
    $pdo->commit();
} catch (Throwable $error) {
    $pdo->rollBack();
    throw $error;
}

Response::json(['id' => $caregiverId, 'message' => 'Đã tạo tài khoản người chăm sóc.'], 201);

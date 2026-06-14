<?php

declare(strict_types=1);

use SushiCare\Config\Database;

$config = require __DIR__ . '/config/app.php';
require __DIR__ . '/config/database.php';

header('Content-Type: application/json; charset=utf-8');
if ($config['install_token'] === '' || !hash_equals($config['install_token'], (string) ($_GET['token'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Token cài đặt không hợp lệ.']);
    exit;
}
if ($config['admin_password_hash'] === '' || str_contains($config['admin_password_hash'], 'thay_')) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Chưa cấu hình password hash.']);
    exit;
}
try {
    $schema = file_get_contents(__DIR__ . '/database/schema.sql');
    if ($schema === false) {
        throw new RuntimeException('Không tìm thấy schema.sql.');
    }
    $schema = str_replace('__ADMIN_PASSWORD_HASH__', str_replace("'", "''", $config['admin_password_hash']), $schema);
    Database::connection($config)->exec($schema);
    echo json_encode(['success' => true, 'message' => 'Cài đặt database thành công.'], JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    error_log($error->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Không thể cài đặt database.'], JSON_UNESCAPED_UNICODE);
}

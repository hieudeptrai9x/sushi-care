<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    Response::error('Vui lòng chọn ảnh đại diện.', 422);
}

$file = $_FILES['avatar'];
if ($file['size'] > min($config['max_upload_bytes'], 8 * 1024 * 1024)) {
    Response::error('Ảnh đại diện không được vượt quá 8 MB.', 422);
}

$mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];
if (!isset($allowed[$mime])) {
    Response::error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.', 422);
}

if (!is_dir($config['upload_dir']) && !mkdir($config['upload_dir'], 0755, true) && !is_dir($config['upload_dir'])) {
    throw new RuntimeException('Không thể tạo thư mục upload.');
}

$babyId = baby_id($userId);
$current = db()->prepare('SELECT avatar_url FROM babies WHERE id=? LIMIT 1');
$current->execute([$babyId]);
$oldUrl = (string) ($current->fetchColumn() ?: '');
$name = 'avatar-' . bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
$target = $config['upload_dir'] . '/' . $name;
if (!move_uploaded_file($file['tmp_name'], $target)) {
    throw new RuntimeException('Không thể lưu ảnh đại diện.');
}

$basePath = rtrim(dirname((string) ($_SERVER['SCRIPT_NAME'] ?? ''), 3), '/');
$url = $basePath . '/uploads/' . $name;
$stmt = db()->prepare('UPDATE babies SET avatar_url=? WHERE id=?');
$stmt->execute([$url, $babyId]);

if (str_starts_with($oldUrl, $basePath . '/uploads/avatar-')) {
    $oldPath = $config['upload_dir'] . '/' . basename($oldUrl);
    if (is_file($oldPath)) {
        unlink($oldPath);
    }
}

Response::json(['avatar_url' => $url, 'message' => 'Đã cập nhật ảnh đại diện.']);

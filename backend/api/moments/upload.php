<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    Response::error('Vui lòng chọn ảnh hoặc video.', 422);
}
$file = $_FILES['file'];
if ($file['size'] > $config['max_upload_bytes']) {
    Response::error('Tệp vượt quá dung lượng cho phép.', 422);
}
$mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
$allowed = [
    'image/jpeg' => ['jpg', 'image'],
    'image/png' => ['png', 'image'],
    'image/webp' => ['webp', 'image'],
    'video/mp4' => ['mp4', 'video'],
    'video/quicktime' => ['mov', 'video'],
];
if (!isset($allowed[$mime])) {
    Response::error('Định dạng tệp không được hỗ trợ.', 422);
}
[$extension, $fileType] = $allowed[$mime];
if (!is_dir($config['upload_dir']) && !mkdir($config['upload_dir'], 0755, true) && !is_dir($config['upload_dir'])) {
    throw new RuntimeException('Không thể tạo thư mục upload.');
}
$name = bin2hex(random_bytes(18)) . '.' . $extension;
if (!move_uploaded_file($file['tmp_name'], $config['upload_dir'] . '/' . $name)) {
    throw new RuntimeException('Không thể lưu tệp.');
}
$takenAt = strtotime((string) ($_POST['taken_at'] ?? 'now')) ?: time();
$basePath = rtrim(dirname((string) ($_SERVER['SCRIPT_NAME'] ?? ''), 3), '/');
$stmt = db()->prepare('INSERT INTO moments (baby_id,user_id,file_url,file_type,caption,milestone_label,taken_at) VALUES (?,?,?,?,?,?,?)');
$stmt->execute([
    baby_id($userId), $userId, $basePath . '/uploads/' . $name, $fileType,
    trim((string) ($_POST['caption'] ?? '')) ?: null,
    trim((string) ($_POST['milestone_label'] ?? '')) ?: null,
    date('Y-m-d H:i:s', $takenAt),
]);
Response::json(['id' => (int) db()->lastInsertId(), 'message' => 'Đã thêm khoảnh khắc.'], 201);

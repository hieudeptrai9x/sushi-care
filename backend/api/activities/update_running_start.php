<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$data = input();
$id = (int) ($data['id'] ?? 0);
$timestamp = strtotime((string) ($data['start_time'] ?? ''));
if ($id < 1 || $timestamp === false) {
    Response::error('Thời gian bắt đầu không hợp lệ.', 422);
}
$startTime = date('Y-m-d H:i:s', $timestamp);
if ($timestamp > time() + 60) {
    Response::error('Giờ bắt đầu không thể ở tương lai.', 422);
}

$babyId = baby_id($userId);
$stmt = db()->prepare('SELECT id,meta_json,end_time FROM activities WHERE id=? AND baby_id=? LIMIT 1');
$stmt->execute([$id, $babyId]);
$activity = $stmt->fetch();
if (!$activity) {
    Response::error('Không tìm thấy hoạt động.', 404);
}
$meta = json_decode((string) ($activity['meta_json'] ?? ''), true);
$meta = is_array($meta) ? $meta : [];
if (($meta['status'] ?? '') !== 'running' || $activity['end_time']) {
    Response::error('Chỉ có thể sửa giờ bắt đầu của hoạt động đang chạy.', 422);
}

$update = db()->prepare('UPDATE activities SET start_time=?,duration_minutes=0 WHERE id=? AND baby_id=?');
$update->execute([$startTime, $id, $babyId]);
Response::json(['message' => 'Đã cập nhật giờ bắt đầu.', 'start_time' => $startTime]);

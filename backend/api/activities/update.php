<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\ActivityService;
use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$data = input();
$id = (int) ($data['id'] ?? 0);
$babyId = baby_id($userId);
$activity = ActivityService::normalize($data);
$sets = implode(',', array_map(fn ($key) => "{$key}=?", array_keys($activity)));
$stmt = db()->prepare("UPDATE activities SET {$sets} WHERE id=? AND baby_id=?");
$stmt->execute([...array_values($activity), $id, $babyId]);
if ($stmt->rowCount() < 1) {
    $check = db()->prepare('SELECT id FROM activities WHERE id=? AND baby_id=?');
    $check->execute([$id, $babyId]);
    if (!$check->fetchColumn()) {
        Response::error('Không tìm thấy hoạt động.', 404);
    }
}
Response::json(['message' => 'Đã cập nhật nhật ký.']);

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
$activity = ActivityService::normalize($data);
$sets = implode(',', array_map(fn ($key) => "{$key}=?", array_keys($activity)));
$stmt = db()->prepare("UPDATE activities SET {$sets} WHERE id=? AND user_id=?");
$stmt->execute([...array_values($activity), $id, $userId]);
Response::json(['message' => 'Đã cập nhật nhật ký.']);

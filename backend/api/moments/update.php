<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$data = input();
$stmt = db()->prepare('UPDATE moments SET caption=?, milestone_label=?, taken_at=? WHERE id=? AND user_id=?');
$stmt->execute([
    trim((string) ($data['caption'] ?? '')) ?: null,
    trim((string) ($data['milestone_label'] ?? '')) ?: null,
    date('Y-m-d H:i:s', strtotime((string) ($data['taken_at'] ?? 'now'))),
    (int) ($data['id'] ?? 0),
    $userId,
]);
Response::json(['message' => 'Đã cập nhật khoảnh khắc.']);

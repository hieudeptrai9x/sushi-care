<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$data = input();
$stmt = db()->prepare('UPDATE reminders SET title=?,reminder_type=?,reminder_time=?,repeat_rule=?,note=?,is_done=? WHERE id=? AND baby_id=?');
$stmt->execute([
    trim((string) ($data['title'] ?? '')),
    $data['reminder_type'] ?? 'other',
    date('Y-m-d H:i:s', strtotime((string) ($data['reminder_time'] ?? 'now'))),
    in_array($data['repeat_rule'] ?? '', ['none', 'daily', 'weekly', 'monthly'], true) ? $data['repeat_rule'] : 'none',
    $data['note'] ?? null,
    !empty($data['is_done']) ? 1 : 0,
    (int) ($data['id'] ?? 0),
    baby_id($userId),
]);
Response::json(['message' => 'Đã cập nhật nhắc nhở.']);

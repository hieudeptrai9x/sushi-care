<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;
use SushiCare\Lib\Validator;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$data = input();
$title = Validator::requiredString($data, 'title', 255);
$time = strtotime((string) ($data['reminder_time'] ?? ''));
if ($time === false) {
    Response::error('Ngày giờ nhắc không hợp lệ.', 422);
}
$repeat = in_array($data['repeat_rule'] ?? '', ['none', 'daily', 'weekly', 'monthly'], true) ? $data['repeat_rule'] : 'none';
$stmt = db()->prepare('INSERT INTO reminders (baby_id,user_id,title,reminder_type,reminder_time,repeat_rule,note) VALUES (?,?,?,?,?,?,?)');
$stmt->execute([baby_id($userId), $userId, $title, $data['reminder_type'] ?? 'other', date('Y-m-d H:i:s', $time), $repeat, $data['note'] ?? null]);
Response::json(['id' => (int) db()->lastInsertId(), 'message' => 'Đã tạo nhắc nhở.'], 201);

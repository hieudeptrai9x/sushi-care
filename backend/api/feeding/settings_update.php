<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\FeedingReminderSettings;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$babyId = baby_id($userId);
$ownerId = baby_owner_id($babyId);
$data = input();
$minutes = (int) ($data['minutes_before'] ?? 10);
if (!in_array($minutes, [5, 10, 15, 20], true)) {
    Response::error('Thời gian nhắc không hợp lệ.', 422);
}
$port = (int) ($data['smtp_port'] ?? 0);
if ($port === 465) {
    $data['smtp_encryption'] = 'ssl';
} elseif ($port === 587 && empty($data['smtp_encryption'])) {
    $data['smtp_encryption'] = 'tls';
}
if (($data['enabled'] ?? false) && FeedingReminderSettings::emails((string) ($data['emails'] ?? '')) === []) {
    Response::error('Vui lòng nhập ít nhất một email hợp lệ.', 422);
}
FeedingReminderSettings::save(db(), $ownerId, $data, $config['app_key'], Auth::role() === 'admin');
Response::json(['message' => 'Đã lưu cài đặt nhắc hâm sữa.']);

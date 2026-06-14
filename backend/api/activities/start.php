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
$type = (string) ($data['type'] ?? '');
if (!in_array($type, ['feeding', 'sleep'], true)) {
    Response::error('Chỉ có thể bắt đầu nhanh cữ bú hoặc giấc ngủ.', 422);
}
$babyId = baby_id($userId);
$subtype = $type === 'feeding' && ($data['subtype'] ?? '') === 'pump' ? 'pump' : ($type === 'feeding' ? 'breast_direct' : null);
$check = db()->prepare("SELECT id,meta_json FROM activities WHERE baby_id=? AND type=? AND end_time IS NULL ORDER BY id DESC LIMIT 20");
$check->execute([$babyId, $type]);
foreach ($check->fetchAll() as $row) {
    $meta = json_decode((string) ($row['meta_json'] ?? ''), true);
    if (($meta['status'] ?? '') === 'running') {
        Response::json(['id' => (int) $row['id'], 'already_running' => true]);
    }
}
$activity = ActivityService::normalize([
    'type' => $type,
    'subtype' => $subtype,
    'start_time' => date('Y-m-d H:i:s'),
    'meta' => ['status' => 'running'],
]);
$activity['baby_id'] = $babyId;
$activity['user_id'] = $userId;
$fields = array_keys($activity);
$stmt = db()->prepare('INSERT INTO activities (' . implode(',', $fields) . ') VALUES (' . implode(',', array_fill(0, count($fields), '?')) . ')');
$stmt->execute(array_values($activity));
Response::json(['id' => (int) db()->lastInsertId(), 'already_running' => false], 201);

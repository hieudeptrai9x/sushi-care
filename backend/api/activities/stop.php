<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$id = (int) (input()['id'] ?? 0);
$babyId = baby_id($userId);
$stmt = db()->prepare('SELECT start_time,meta_json FROM activities WHERE id=? AND baby_id=? LIMIT 1');
$stmt->execute([$id, $babyId]);
$activity = $stmt->fetch();
if (!$activity) {
    Response::error('Không tìm thấy hoạt động.', 404);
}
$end = date('Y-m-d H:i:s');
$duration = max(0, (int) round((strtotime($end) - strtotime((string) $activity['start_time'])) / 60));
$meta = json_decode((string) ($activity['meta_json'] ?? ''), true);
$meta = is_array($meta) ? $meta : [];
$meta['status'] = 'paused';
$update = db()->prepare('UPDATE activities SET end_time=?,duration_minutes=?,meta_json=? WHERE id=? AND baby_id=?');
$update->execute([$end, $duration, json_encode($meta, JSON_UNESCAPED_UNICODE), $id, $babyId]);
Response::json(['id' => $id, 'end_time' => $end, 'duration_minutes' => $duration]);

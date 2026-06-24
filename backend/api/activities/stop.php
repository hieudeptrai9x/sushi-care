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
$stmt = db()->prepare('SELECT type,subtype,start_time,meta_json FROM activities WHERE id=? AND baby_id=? LIMIT 1');
$stmt->execute([$id, $babyId]);
$activity = $stmt->fetch();
if (!$activity) {
    Response::error('Không tìm thấy hoạt động.', 404);
}
$end = date('Y-m-d H:i:s');
$duration = \SushiCare\Lib\ActivityService::elapsedMinutes((string) $activity['start_time'], $end);
$meta = json_decode((string) ($activity['meta_json'] ?? ''), true);
$meta = is_array($meta) ? $meta : [];
$meta['status'] = 'paused';
$update = db()->prepare('UPDATE activities SET end_time=?,duration_minutes=?,meta_json=? WHERE id=? AND baby_id=?');
$update->execute([$end, $duration, json_encode($meta, JSON_UNESCAPED_UNICODE), $id, $babyId]);
$prediction = null;
if ($activity['type'] === 'feeding' && $activity['subtype'] !== 'pump') {
    ensure_feeding_prediction_schema();
    $prediction = \SushiCare\Lib\FeedingPredictionService::refreshForBaby(db(), $babyId);
}
Response::json(['id' => $id, 'end_time' => $end, 'duration_minutes' => $duration, 'prediction' => $prediction]);

<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\ActivityService;
use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$activity = ActivityService::normalize(input());
$activity['baby_id'] = baby_id($userId);
$activity['user_id'] = $userId;
$fields = array_keys($activity);
$stmt = db()->prepare('INSERT INTO activities (' . implode(',', $fields) . ') VALUES (' . implode(',', array_fill(0, count($fields), '?')) . ')');
$stmt->execute(array_values($activity));
$prediction = null;
if ($activity['type'] === 'feeding' && $activity['subtype'] !== 'pump') {
    ensure_feeding_prediction_schema();
    $prediction = \SushiCare\Lib\FeedingPredictionService::refreshForBaby(db(), $activity['baby_id']);
}
Response::json(['id' => (int) db()->lastInsertId(), 'message' => 'Đã lưu nhật ký.', 'prediction' => $prediction], 201);

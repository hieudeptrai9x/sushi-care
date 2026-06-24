<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\ActivityService;
use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;
use SushiCare\Lib\Validator;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$data = input();
$babyId = baby_id($userId);
if (!empty($data['baby_id']) && (int) $data['baby_id'] !== $babyId) {
    Response::error('Hồ sơ bé không hợp lệ.', 403);
}
if (!is_array($data['activity'] ?? null)) {
    Response::error('Dữ liệu nhật ký không hợp lệ.', 422);
}

$draft = $data['activity'];
$incomingType = (string) ($draft['type'] ?? '');
$meta = $draft['meta_json'] ?? [];
if (is_string($meta)) {
    $meta = json_decode($meta, true);
}
$meta = is_array($meta) ? $meta : [];
$meta['source'] = 'ai_quick_input';
$meta['original_text'] = Validator::requiredString($data, 'original_text', 1000);

if ($incomingType === 'pumping') {
    $draft['type'] = 'feeding';
    $draft['subtype'] = 'pump';
    if (empty($draft['amount_ml'])) {
        $draft['amount_ml'] = (float) ($meta['left_ml'] ?? 0) + (float) ($meta['right_ml'] ?? 0);
    }
} elseif ($incomingType === 'feeding') {
    $draft['subtype'] = match ((string) ($draft['subtype'] ?? '')) {
        'breastfeeding' => 'breast_direct',
        'bottle' => 'breast_bottle',
        'formula' => 'formula',
        default => throw new InvalidArgumentException('Loại bú chưa rõ ràng.'),
    };
} elseif ($incomingType === 'health' && ($draft['subtype'] ?? '') === 'spit_up') {
    $draft['subtype'] = 'spitup';
}
$draft['meta'] = $meta;
unset($draft['meta_json']);

$activity = ActivityService::normalize($draft);
$activity['baby_id'] = $babyId;
$activity['user_id'] = $userId;
$fields = array_keys($activity);
$stmt = db()->prepare('INSERT INTO activities (' . implode(',', $fields) . ') VALUES (' . implode(',', array_fill(0, count($fields), '?')) . ')');
$stmt->execute(array_values($activity));
$prediction = null;
if ($activity['type'] === 'feeding' && $activity['subtype'] !== 'pump') {
    ensure_feeding_prediction_schema();
    $prediction = \SushiCare\Lib\FeedingPredictionService::refreshForBaby(db(), $babyId);
}
Response::json(['id' => (int) db()->lastInsertId(), 'activity' => $activity, 'message' => 'Đã lưu nhật ký cho bé.', 'prediction' => $prediction], 201);

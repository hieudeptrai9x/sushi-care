<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\FeedingPredictionService;
use SushiCare\Lib\FeedingReminderSettings;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$babyId = baby_id($userId);
ensure_feeding_prediction_schema();
$prediction = FeedingPredictionService::predictForBaby(db(), $babyId);
$ownerId = baby_owner_id($babyId);
$settings = FeedingReminderSettings::load(db(), $ownerId, $config['app_key']);
$baby = db()->prepare('SELECT feeding_type FROM babies WHERE id=?');
$baby->execute([$babyId]);
Response::json([
    'prediction' => $prediction,
    'reminder_enabled' => $settings['enabled'] === '1' && $baby->fetchColumn() !== 'breast_direct',
    'minutes_before' => (int) $settings['minutes_before'],
]);

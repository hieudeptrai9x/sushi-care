<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once dirname(__DIR__) . '/api/bootstrap.php';

use SushiCare\Lib\EmailReminderService;
use SushiCare\Lib\FeedingPredictionService;
use SushiCare\Lib\FeedingReminderSettings;

ensure_feeding_prediction_schema();
$babies = db()->query("SELECT id,user_id,name,feeding_type FROM babies WHERE feeding_type<>'breast_direct'")->fetchAll();
$insert = db()->prepare(
    "INSERT IGNORE INTO email_reminders (baby_id,reminder_type,scheduled_at,email,status,meta_json)
     VALUES (?,'feeding_warmup',?,?,'pending',?)"
);
$claim = db()->prepare("UPDATE email_reminders SET status='sending' WHERE id=? AND status='pending'");
$sent = db()->prepare("UPDATE email_reminders SET status='sent',sent_at=NOW() WHERE id=?");
$failed = db()->prepare("UPDATE email_reminders SET status='failed',meta_json=? WHERE id=?");

foreach ($babies as $baby) {
    $settings = FeedingReminderSettings::load(db(), (int) $baby['user_id'], $config['app_key']);
    if ($settings['enabled'] !== '1' || $settings['smtp_host'] === '') {
        continue;
    }
    $prediction = FeedingPredictionService::predictForBaby(db(), (int) $baby['id']);
    if (!$prediction || $prediction['confidence'] < 45) {
        continue;
    }
    $scheduledAt = date('Y-m-d H:i:s', strtotime($prediction['predicted_time']) - ((int) $settings['minutes_before'] * 60));
    if (strtotime($scheduledAt) > time() + 300 || strtotime($scheduledAt) < time() - 900) {
        continue;
    }
    foreach (FeedingReminderSettings::emails($settings['emails']) as $email) {
        $meta = json_encode(['prediction' => $prediction], JSON_UNESCAPED_UNICODE);
        $insert->execute([$baby['id'], $scheduledAt, $email, $meta]);
        if ($insert->rowCount() < 1) {
            continue;
        }
        $id = (int) db()->lastInsertId();
        if ($id < 1) {
            continue;
        }
        $claim->execute([$id]);
        try {
            EmailReminderService::send($settings, $email, $baby, $prediction);
            $sent->execute([$id]);
        } catch (Throwable $error) {
            $failed->execute([json_encode(['prediction' => $prediction, 'error' => mb_substr($error->getMessage(), 0, 500)], JSON_UNESCAPED_UNICODE), $id]);
            error_log('Sushi Care feeding email: ' . $error->getMessage());
        }
    }
}

echo "Feeding reminders checked at " . date('Y-m-d H:i:s') . PHP_EOL;

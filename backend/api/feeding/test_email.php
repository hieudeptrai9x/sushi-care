<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\EmailReminderService;
use SushiCare\Lib\FeedingPredictionService;
use SushiCare\Lib\FeedingReminderSettings;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
Auth::requireAdmin();

$babyId = baby_id($userId);
$ownerId = baby_owner_id($babyId);
$settings = FeedingReminderSettings::load(db(), $ownerId, $config['app_key']);
$emails = FeedingReminderSettings::emails($settings['emails']);
if ($emails === []) {
    Response::error('Chưa có email nhận thông báo hợp lệ.', 422);
}
if ($settings['smtp_host'] === '' || $settings['smtp_username'] === '' || $settings['smtp_password'] === '') {
    Response::error('Chưa cấu hình đủ SMTP Host, Username hoặc Password.', 422);
}

$stmt = db()->prepare('SELECT id,name FROM babies WHERE id=? LIMIT 1');
$stmt->execute([$babyId]);
$baby = $stmt->fetch();
if (!$baby) {
    Response::error('Không tìm thấy hồ sơ bé.', 404);
}

$prediction = FeedingPredictionService::predictForBaby(db(), $babyId) ?: [
    'predicted_time' => date('Y-m-d H:i:s', time() + 30 * 60),
    'last_feeding_time' => date('Y-m-d H:i:s', time() - 2 * 60 * 60),
    'average_interval_minutes' => 120,
    'confidence' => 60,
    'sample_size' => 0,
    'segment' => 'test',
];

$sent = [];
$errors = [];
foreach ($emails as $email) {
    try {
        EmailReminderService::send($settings, $email, $baby, $prediction);
        $sent[] = $email;
    } catch (Throwable $error) {
        $errors[$email] = mb_substr($error->getMessage(), 0, 500);
    }
}

if ($errors !== []) {
    $firstEmail = array_key_first($errors);
    Response::error('Gửi email test thất bại cho ' . $firstEmail . ': ' . $errors[$firstEmail], 502);
}

Response::json(['message' => 'Đã gửi email test.', 'sent' => $sent]);

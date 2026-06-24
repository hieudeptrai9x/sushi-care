<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\FeedingReminderSettings;
use SushiCare\Lib\Response;
use SushiCare\Lib\Secret;

$userId = Auth::userId();
$babyId = baby_id($userId);
$ownerId = baby_owner_id($babyId);
$settings = FeedingReminderSettings::load(db(), $ownerId, $config['app_key']);
if (Auth::role() !== 'admin') {
    foreach (['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_encryption', 'from_email', 'from_name'] as $key) {
        unset($settings[$key]);
    }
} else {
    $settings['smtp_password'] = Secret::mask($settings['smtp_password']);
}
Response::json($settings);

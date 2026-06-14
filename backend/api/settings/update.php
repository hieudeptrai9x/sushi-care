<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$allowed = ['notifications.enabled', 'theme', 'language'];
$stmt = db()->prepare('INSERT INTO settings (user_id,setting_key,setting_value,is_secret) VALUES (?,?,?,0) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value),is_secret=0');
foreach (input() as $key => $value) {
    if (in_array($key, $allowed, true)) {
        $stmt->execute([$userId, $key, is_bool($value) ? ($value ? '1' : '0') : (string) $value]);
    }
}
Response::json(['message' => 'Đã lưu cài đặt.']);

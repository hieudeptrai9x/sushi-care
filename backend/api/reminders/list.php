<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$stmt = db()->prepare('SELECT * FROM reminders WHERE baby_id=? ORDER BY is_done, reminder_time');
$stmt->execute([baby_id($userId)]);
$reminders = array_map(static function (array $reminder): array {
    $reminder['id'] = (int) $reminder['id'];
    $reminder['baby_id'] = (int) $reminder['baby_id'];
    $reminder['user_id'] = (int) $reminder['user_id'];
    $reminder['is_done'] = (int) $reminder['is_done'];
    return $reminder;
}, $stmt->fetchAll());
Response::json($reminders);

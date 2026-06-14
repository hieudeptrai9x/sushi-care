<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$stmt = db()->prepare('SELECT * FROM reminders WHERE baby_id=? ORDER BY is_done, reminder_time');
$stmt->execute([baby_id($userId)]);
Response::json($stmt->fetchAll());

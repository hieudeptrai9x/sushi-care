<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$stmt = db()->prepare("SELECT setting_key, setting_value FROM settings WHERE user_id=? AND is_secret=0 AND setting_key NOT LIKE 'ai.%'");
$stmt->execute([$userId]);
Response::json(array_column($stmt->fetchAll(), 'setting_value', 'setting_key'));

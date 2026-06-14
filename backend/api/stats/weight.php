<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$stmt = db()->prepare("SELECT id, DATE(start_time) day, weight_kg FROM activities WHERE baby_id=? AND type='health' AND subtype='weight' AND weight_kg IS NOT NULL ORDER BY start_time");
$stmt->execute([baby_id($userId)]);
Response::json($stmt->fetchAll());

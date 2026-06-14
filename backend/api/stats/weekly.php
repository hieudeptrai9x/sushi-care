<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$stmt = db()->prepare(
    "SELECT DATE(start_time) day,
      SUM(type='feeding') feeding_count,
      SUM(CASE WHEN type='feeding' THEN COALESCE(amount_ml,0) ELSE 0 END) feeding_ml,
      SUM(CASE WHEN type='sleep' THEN duration_minutes ELSE 0 END) sleep_minutes,
      SUM(type='diaper') diaper_count
     FROM activities WHERE baby_id=? AND start_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(start_time) ORDER BY day"
);
$stmt->execute([baby_id($userId)]);
Response::json($stmt->fetchAll());

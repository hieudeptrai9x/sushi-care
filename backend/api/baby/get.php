<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
ensure_feeding_prediction_schema();
$stmt = db()->prepare('SELECT * FROM babies WHERE id=? LIMIT 1');
$stmt->execute([baby_id($userId)]);
Response::json($stmt->fetch());

<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$stmt = db()->prepare('SELECT * FROM moments WHERE baby_id=? ORDER BY taken_at DESC, id DESC');
$stmt->execute([baby_id($userId)]);
Response::json($stmt->fetchAll());

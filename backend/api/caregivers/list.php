<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
Auth::requireAdmin();
$babyId = baby_id($userId);
$stmt = db()->prepare(
    "SELECT u.id,u.name,u.email,u.role,u.must_change_password
     FROM users u
     JOIN baby_caregivers bc ON bc.user_id=u.id
     WHERE bc.baby_id=?
     ORDER BY u.name"
);
$stmt->execute([$babyId]);
Response::json($stmt->fetchAll());

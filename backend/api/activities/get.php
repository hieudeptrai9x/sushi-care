<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$babyId = baby_id($userId);
$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT a.*,u.name creator_name FROM activities a JOIN users u ON u.id=a.user_id WHERE a.id=? AND a.baby_id=? LIMIT 1');
$stmt->execute([$id, $babyId]);
$activity = $stmt->fetch();
if (!$activity) {
    Response::error('Không tìm thấy hoạt động.', 404);
}
Response::json($activity);

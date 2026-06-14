<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT * FROM activities WHERE id=? AND user_id=? LIMIT 1');
$stmt->execute([$id, $userId]);
$activity = $stmt->fetch();
if (!$activity) {
    Response::error('Không tìm thấy hoạt động.', 404);
}
Response::json($activity);

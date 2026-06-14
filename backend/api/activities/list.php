<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$babyId = baby_id($userId);
$date = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($_GET['date'] ?? '')) ? $_GET['date'] : date('Y-m-d');
$type = (string) ($_GET['type'] ?? 'all');
$params = [$babyId, $date];
$sql = 'SELECT * FROM activities WHERE baby_id=? AND DATE(start_time)=?';
if (in_array($type, ['feeding', 'sleep', 'diaper', 'health', 'note'], true)) {
    $sql .= ' AND type=?';
    $params[] = $type;
}
$sql .= ' ORDER BY start_time DESC, id DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);
Response::json($stmt->fetchAll());

<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\ActivityService;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$babyId = baby_id($userId);
$date = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($_GET['date'] ?? '')) ? $_GET['date'] : date('Y-m-d');
$type = (string) ($_GET['type'] ?? 'all');
[$dayStart, $dayEnd] = ActivityService::dayWindow((string) $date);
$params = array_merge([$babyId], ActivityService::dateOverlapParams($dayStart, $dayEnd, (string) $date));
$sql = 'SELECT a.*,u.name creator_name FROM activities a JOIN users u ON u.id=a.user_id WHERE a.baby_id=? AND ' . ActivityService::dateOverlapSql('a');
if (in_array($type, ['feeding', 'sleep', 'diaper', 'health', 'note'], true)) {
    $sql .= ' AND a.type=?';
    $params[] = $type;
}
$sql .= ' ORDER BY a.start_time DESC, a.id DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);
Response::json($stmt->fetchAll());

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
$recent = ($_GET['recent'] ?? '') === '1';
$limit = min(50, max(1, (int) ($_GET['limit'] ?? 50)));
$params = [$babyId];
$sql = 'SELECT a.*,u.name creator_name FROM activities a JOIN users u ON u.id=a.user_id WHERE a.baby_id=?';
if (!$recent) {
    [$dayStart, $dayEnd] = ActivityService::dayWindow((string) $date);
    $sql .= ' AND ' . ActivityService::dateOverlapSql('a');
    $params = array_merge($params, ActivityService::dateOverlapParams($dayStart, $dayEnd, (string) $date));
}
if (in_array($type, ['feeding', 'sleep', 'diaper', 'health', 'note'], true)) {
    $sql .= ' AND a.type=?';
    $params[] = $type;
}
$sql .= ' ORDER BY a.start_time DESC, a.id DESC';
if ($recent) {
    $sql .= ' LIMIT ' . $limit;
}
$stmt = db()->prepare($sql);
$stmt->execute($params);
Response::json($stmt->fetchAll());

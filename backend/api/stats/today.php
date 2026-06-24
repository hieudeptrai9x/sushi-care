<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\ActivityService;
use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

$userId = Auth::userId();
$babyId = baby_id($userId);
$date = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($_GET['date'] ?? '')) ? (string) $_GET['date'] : date('Y-m-d');
[$dayStart, $dayEnd] = ActivityService::dayWindow($date);
$stmt = db()->prepare('SELECT type, subtype, amount_ml, duration_minutes, meta_json, start_time, end_time FROM activities WHERE baby_id=? AND ' . ActivityService::dateOverlapSql());
$stmt->execute(array_merge([$babyId], ActivityService::dateOverlapParams($dayStart, $dayEnd, $date)));
$summary = ActivityService::summarizeForDay($stmt->fetchAll(), $dayStart, $dayEnd);
$weight = db()->prepare("SELECT weight_kg, start_time FROM activities WHERE baby_id=? AND type='health' AND subtype='weight' AND weight_kg IS NOT NULL ORDER BY start_time DESC LIMIT 2");
$weight->execute([$babyId]);
$weights = $weight->fetchAll();
$summary['weight'] = [
    'current' => isset($weights[0]) ? (float) $weights[0]['weight_kg'] : null,
    'change' => isset($weights[1]) ? round((float) $weights[0]['weight_kg'] - (float) $weights[1]['weight_kg'], 2) : null,
];
Response::json($summary);

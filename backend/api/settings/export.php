<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;

$userId = Auth::userId();
Auth::requireAdmin();
$babyId = baby_id($userId);
$baby = db()->prepare('SELECT name,nickname,birth_date,gender,avatar_url,birth_weight,birth_length,note,created_at,updated_at FROM babies WHERE id=?');
$baby->execute([$babyId]);
$activities = db()->prepare('SELECT type,subtype,start_time,end_time,duration_minutes,amount_ml,side,wet_level,poop_color,poop_texture,temperature,weight_kg,meta_json,note,created_at,updated_at FROM activities WHERE baby_id=? ORDER BY start_time');
$activities->execute([$babyId]);
$reminders = db()->prepare('SELECT title,reminder_type,reminder_time,repeat_rule,note,is_done,created_at,updated_at FROM reminders WHERE baby_id=? ORDER BY reminder_time');
$reminders->execute([$babyId]);
$payload = [
    'exported_at' => date(DATE_ATOM),
    'app' => 'Sushi Care',
    'baby' => $baby->fetch(),
    'activities' => $activities->fetchAll(),
    'reminders' => $reminders->fetchAll(),
];
header('Content-Type: application/json; charset=utf-8');
header('Content-Disposition: attachment; filename="sushi-care-backup-' . date('Y-m-d') . '.json"');
echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

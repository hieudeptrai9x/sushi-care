<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\AiSafety;
use SushiCare\Lib\AiSettings;
use SushiCare\Lib\Auth;
use SushiCare\Lib\OpenAICompatibleProvider;
use SushiCare\Lib\Response;
use SushiCare\Lib\Validator;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$data = input();
$message = Validator::requiredString($data, 'message', 4000);
$babyId = baby_id($userId);

if (AiSafety::isEmergency($message)) {
    $reply = AiSafety::emergencyMessage();
} else {
    $settings = AiSettings::load(db(), $userId, $config['app_key']);
    if ($settings['enabled'] !== '1' || $settings['api_key'] === '') {
        Response::error('AI chưa được bật hoặc chưa có API key.', 422);
    }
    $context = '';
    if (!empty($data['include_context'])) {
        $babyStmt = db()->prepare('SELECT name,nickname,birth_date,gender,birth_weight,birth_length,note FROM babies WHERE id=?');
        $babyStmt->execute([$babyId]);
        $stmt = db()->prepare("SELECT type,subtype,start_time,end_time,duration_minutes,amount_ml,side,wet_level,poop_color,poop_texture,temperature,weight_kg,note,meta_json FROM activities WHERE baby_id=? AND start_time >= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY start_time DESC LIMIT 80");
        $stmt->execute([$babyId]);
        $reminderStmt = db()->prepare("SELECT title,reminder_type,reminder_time,note FROM reminders WHERE baby_id=? AND is_done=0 AND reminder_time >= NOW() ORDER BY reminder_time LIMIT 10");
        $reminderStmt->execute([$babyId]);
        $historyStmt = db()->prepare("SELECT role,content FROM ai_messages WHERE baby_id=? ORDER BY id DESC LIMIT 8");
        $historyStmt->execute([$babyId]);
        $contextData = [
            'baby_profile' => $babyStmt->fetch(),
            'current_time' => date(DATE_ATOM),
            'activities_last_7_days' => $stmt->fetchAll(),
            'upcoming_reminders' => $reminderStmt->fetchAll(),
            'recent_conversation' => array_reverse($historyStmt->fetchAll()),
        ];
        $context = "\n\nBỐI CẢNH RIÊNG CỦA BÉ SUSHI (ưu tiên dữ liệu này, nói rõ khi dữ liệu còn thiếu; không bịa):\n"
            . json_encode($contextData, JSON_UNESCAPED_UNICODE);
        $context .= "\nQUY TẮC DỮ LIỆU BÚ: Không quy đổi thời lượng bú trực tiếp hoặc lượng máy hút thành số ml bé đã bú. Có thể mô tả xu hướng; nếu cần ước lượng lượng truyền sữa, khuyên trao đổi chuyên gia và cân bé trước/sau cữ bú bằng cân phù hợp.";
    }
    $provider = new OpenAICompatibleProvider();
    $reply = $provider->chat([
        ['role' => 'system', 'content' => $settings['system_prompt'] . $context],
        ['role' => 'user', 'content' => $message],
    ], $settings);
}

$stmt = db()->prepare('INSERT INTO ai_messages (baby_id,user_id,role,content) VALUES (?,?,?,?)');
$stmt->execute([$babyId, $userId, 'user', $message]);
$stmt->execute([$babyId, $userId, 'assistant', $reply]);
Response::json(['reply' => $reply]);

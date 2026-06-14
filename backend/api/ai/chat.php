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
        $stmt = db()->prepare("SELECT type,subtype,start_time,duration_minutes,amount_ml,temperature,weight_kg,note FROM activities WHERE baby_id=? AND start_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR) ORDER BY start_time DESC LIMIT 100");
        $stmt->execute([$babyId]);
        $context = "\nDữ liệu nhật ký 24 giờ gần nhất:\n" . json_encode($stmt->fetchAll(), JSON_UNESCAPED_UNICODE);
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

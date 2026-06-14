<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\AiSettings;
use SushiCare\Lib\Auth;
use SushiCare\Lib\OpenAICompatibleProvider;
use SushiCare\Lib\QuickInputParser;
use SushiCare\Lib\Response;
use SushiCare\Lib\Validator;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$data = input();
$text = Validator::requiredString($data, 'text', 1000);
$today = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($data['today'] ?? '')) ? (string) $data['today'] : date('Y-m-d');
$babyId = baby_id($userId);
if (!empty($data['baby_id']) && (int) $data['baby_id'] !== $babyId) {
    Response::error('Hồ sơ bé không hợp lệ.', 403);
}

$result = null;
$settings = AiSettings::load(db(), baby_owner_id($babyId), $config['app_key']);
if ($settings['enabled'] === '1' && $settings['api_key'] !== '') {
    $systemPrompt = <<<'PROMPT'
Bạn là bộ phân tích câu nhập nhanh cho app chăm sóc trẻ sơ sinh bằng tiếng Việt.
Chỉ trả về một JSON object hợp lệ, không markdown, không giải thích.

Activity hợp lệ: feeding, sleep, diaper, health, pumping, note.
Không tự bịa dữ liệu. Thiếu dữ liệu quan trọng thì trả:
{"success":false,"needs_clarification":true,"question":"...","suggestions":[]}

Khi hiểu được, trả:
{"success":true,"confidence":0.9,"needs_confirmation":false,"activity":{"type":"sleep","subtype":null,"start_time":"YYYY-MM-DD HH:mm:ss","end_time":null,"duration_minutes":0,"amount_ml":null,"side":null,"wet_level":null,"poop_color":null,"poop_texture":null,"temperature":null,"weight_kg":null,"meta_json":{},"note":""},"human_summary":"...","warning":null}

Quy tắc:
- Timezone Asia/Ho_Chi_Minh. Giờ không có ngày là ngày today.
- 6h tối=18:00, 8h30 tối=20:30, 7h sáng=07:00, 12h đêm=00:00, 12h trưa=12:00.
- Tính duration_minutes khi có khoảng thời gian hoặc thời lượng.
- Kết thúc nhỏ hơn bắt đầu có thể qua ngày sau nhưng needs_confirmation=true.
- Feeding bú mẹ: subtype=breastfeeding, side=left/right/both.
- Bú bình: subtype=bottle. Sữa công thức: subtype=formula.
- Pumping giữ type=pumping; meta_json có left_ml/right_ml nếu có.
- Diaper: subtype=wet/dirty/mixed; wet_level=low/medium/high.
- Health: subtype=temperature/spit_up/cough/medicine/other.
- Không chẩn đoán. Với khó thở, tím tái, co giật, sốt cao, bỏ bú, lừ đừ, mất nước, ọc sữa kèm sặc/khó thở, thêm warning.
PROMPT;
    try {
        $aiSettings = $settings;
        $aiSettings['temperature'] = '0.1';
        $aiSettings['max_tokens'] = '900';
        $reply = (new OpenAICompatibleProvider())->chat([
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => json_encode([
                'text' => $text,
                'timezone' => 'Asia/Ho_Chi_Minh',
                'today' => $today,
            ], JSON_UNESCAPED_UNICODE)],
        ], $aiSettings);
        $decoded = QuickInputParser::decodeJson($reply);
        if ($decoded) {
            $result = QuickInputParser::normalizeAiResult($decoded, $today);
        }
    } catch (Throwable $error) {
        error_log('Quick AI parse fallback: ' . $error->getMessage());
    }
}

$result ??= QuickInputParser::parse($text, $today);
Response::json($result);

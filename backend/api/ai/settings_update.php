<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\AiSettings;
use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;
use SushiCare\Lib\Validator;

require_method('POST');
$userId = Auth::userId();
Auth::requireAdmin();
Auth::verifyCsrf();
$data = input();
if (!in_array($data['provider'] ?? '', ['openai-compatible', 'openai', 'openrouter', 'custom'], true)) {
    Response::error('Provider chưa được hỗ trợ trong MVP.', 422);
}
if (
    array_key_exists('api_key', $data)
    && !str_contains((string) $data['api_key'], '*')
    && !Validator::apiKey($data['api_key'])
) {
    Response::error('API key phải là key đầy đủ bắt đầu bằng sk-. Không dùng key rút gọn hoặc Serial.', 422);
}
AiSettings::save(db(), $userId, $data, $config['app_key']);
Response::json(['message' => 'Đã lưu cấu hình AI.']);

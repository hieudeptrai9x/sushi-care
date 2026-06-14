<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\AiSettings;
use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$data = input();
if (!in_array($data['provider'] ?? '', ['openai-compatible', 'openai', 'openrouter', 'custom'], true)) {
    Response::error('Provider chưa được hỗ trợ trong MVP.', 422);
}
AiSettings::save(db(), $userId, $data, $config['app_key']);
Response::json(['message' => 'Đã lưu cấu hình AI.']);

<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\AiSettings;
use SushiCare\Lib\Auth;
use SushiCare\Lib\OpenAICompatibleProvider;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$data = input();
$current = AiSettings::load(db(), $userId, $config['app_key']);
foreach ($data as $key => $value) {
    if ($key !== 'api_key' || !str_contains((string) $value, '*')) {
        $current[$key] = is_bool($value) ? ($value ? '1' : '0') : (string) $value;
    }
}
if ($current['api_key'] === '') {
    Response::error('Vui lòng nhập API key.', 422);
}
$reply = (new OpenAICompatibleProvider())->chat([
    ['role' => 'user', 'content' => 'Chỉ trả lời đúng hai từ: Kết nối tốt'],
], $current);
Response::json(['message' => 'Kết nối thành công.', 'reply' => $reply]);

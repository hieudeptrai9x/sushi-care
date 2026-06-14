<?php

declare(strict_types=1);

require_once __DIR__ . '/../lib/Validator.php';
require_once __DIR__ . '/../lib/AiSafety.php';
require_once __DIR__ . '/../lib/Secret.php';
require_once __DIR__ . '/../lib/ActivityService.php';

use SushiCare\Lib\ActivityService;
use SushiCare\Lib\AiSafety;
use SushiCare\Lib\Secret;
use SushiCare\Lib\Validator;

function assertSameValue(mixed $expected, mixed $actual, string $message): void
{
    if ($expected !== $actual) {
        fwrite(STDERR, "FAIL: {$message}\nExpected: " . var_export($expected, true) . "\nActual: " . var_export($actual, true) . "\n");
        exit(1);
    }
}

assertSameValue(true, Validator::email('me@example.com'), 'Email hợp lệ');
assertSameValue(false, Validator::email('not-an-email'), 'Email không hợp lệ');
assertSameValue(true, Validator::loginId('admin'), 'ID đăng nhập hợp lệ');
assertSameValue(false, Validator::loginId('a'), 'ID đăng nhập quá ngắn');
assertSameValue(true, Validator::oneOf('sleep', ['feeding', 'sleep']), 'Enum hợp lệ');
assertSameValue('sk-************abcd', Secret::mask('sk-1234567890abcd'), 'Mask secret');
assertSameValue(true, AiSafety::isEmergency('Bé bị tím tái và khó thở'), 'Nhận diện dấu hiệu nguy hiểm');
assertSameValue(false, AiSafety::isEmergency('Bé ngủ hơi ít hôm nay'), 'Không cảnh báo sai');

$activity = ActivityService::normalize([
    'type' => 'feeding',
    'subtype' => 'formula',
    'start_time' => '2026-06-14 08:00:00',
    'amount_ml' => 120,
    'note' => 'Bú tốt',
]);
assertSameValue('feeding', $activity['type'], 'Normalize type');
assertSameValue(120.0, $activity['amount_ml'], 'Normalize lượng sữa');

$localizedActivity = ActivityService::normalize([
    'type' => 'health',
    'subtype' => 'weight',
    'start_time' => '2026-06-14 08:00:00',
    'weight_kg' => '2,7',
    'temperature' => '37,2',
]);
assertSameValue(2.7, $localizedActivity['weight_kg'], 'Normalize cân nặng có dấu phẩy');
assertSameValue(37.2, $localizedActivity['temperature'], 'Normalize nhiệt độ có dấu phẩy');

$summary = ActivityService::summarize([
    ['type' => 'feeding', 'amount_ml' => 120, 'duration_minutes' => 0, 'subtype' => 'formula'],
    ['type' => 'feeding', 'amount_ml' => null, 'duration_minutes' => 20, 'subtype' => 'breast'],
    ['type' => 'sleep', 'duration_minutes' => 90, 'amount_ml' => null, 'subtype' => null],
    ['type' => 'diaper', 'subtype' => 'mixed', 'duration_minutes' => 0, 'amount_ml' => null],
]);
assertSameValue(2, $summary['feeding']['count'], 'Đếm cữ bú');
assertSameValue(120.0, $summary['feeding']['total_ml'], 'Tổng ml');
assertSameValue(90, $summary['sleep']['minutes'], 'Tổng ngủ');
assertSameValue(1, $summary['diaper']['wet'], 'Tã ướt từ mixed');
assertSameValue(1, $summary['diaper']['dirty'], 'Tã bẩn từ mixed');

echo "Backend tests passed\n";

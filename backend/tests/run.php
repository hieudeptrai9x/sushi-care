<?php

declare(strict_types=1);

require_once __DIR__ . '/../lib/Validator.php';
require_once __DIR__ . '/../lib/AiSafety.php';
require_once __DIR__ . '/../lib/Secret.php';
require_once __DIR__ . '/../lib/ActivityService.php';
require_once __DIR__ . '/../lib/QuickInputParser.php';
require_once __DIR__ . '/../lib/FeedingPredictionService.php';
require_once __DIR__ . '/../lib/FeedingReminderSettings.php';
require_once __DIR__ . '/../lib/EmailReminderService.php';

use SushiCare\Lib\ActivityService;
use SushiCare\Lib\AiSafety;
use SushiCare\Lib\Secret;
use SushiCare\Lib\Validator;
use SushiCare\Lib\FeedingPredictionService;
use SushiCare\Lib\FeedingReminderSettings;
use SushiCare\Lib\EmailReminderService;

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
assertSameValue(true, Validator::apiKey('sk-1234567890abcdefghijklmnop'), 'API key hợp lệ');
assertSameValue(false, Validator::apiKey('sk-0...5f73'), 'Không nhận key rút gọn');
assertSameValue(false, Validator::apiKey('DLG-XXXX-XXXX-XXXX'), 'Không nhận serial làm API key');
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
assertSameValue(1, ActivityService::elapsedMinutes('2026-06-14 10:00:00', '2026-06-14 10:00:10'), 'Timer ngắn làm tròn lên một phút');
assertSameValue(75, ActivityService::elapsedMinutes('2026-06-14 10:00:00', '2026-06-14 11:15:00'), 'Timer tính thời lượng từ mốc bắt đầu và kết thúc');

$summary = ActivityService::summarize([
    ['type' => 'feeding', 'amount_ml' => 120, 'duration_minutes' => 0, 'subtype' => 'formula'],
    ['type' => 'feeding', 'amount_ml' => null, 'duration_minutes' => 20, 'subtype' => 'breast'],
    ['type' => 'feeding', 'amount_ml' => null, 'duration_minutes' => 10, 'subtype' => 'breast_direct', 'meta_json' => '{"status":"running"}'],
    ['type' => 'sleep', 'duration_minutes' => 90, 'amount_ml' => null, 'subtype' => null],
    ['type' => 'sleep', 'duration_minutes' => 15, 'amount_ml' => null, 'subtype' => null, 'meta_json' => '{"status":"paused"}'],
    ['type' => 'diaper', 'subtype' => 'mixed', 'duration_minutes' => 0, 'amount_ml' => null],
]);
assertSameValue(2, $summary['feeding']['count'], 'Đếm cữ bú');
assertSameValue(120.0, $summary['feeding']['total_ml'], 'Tổng ml');
assertSameValue(90, $summary['sleep']['minutes'], 'Tổng ngủ');
assertSameValue(1, $summary['diaper']['wet'], 'Tã ướt từ mixed');
assertSameValue(1, $summary['diaper']['dirty'], 'Tã bẩn từ mixed');

[$dayStart, $dayEnd] = ActivityService::dayWindow('2026-06-16');
assertSameValue('2026-06-16 00:00:00', $dayStart, 'Mốc đầu ngày');
assertSameValue('2026-06-17 00:00:00', $dayEnd, 'Mốc cuối ngày');
assertSameValue(
    'a.start_time < ? AND (a.end_time >= ? OR DATE(a.start_time)=? OR (a.end_time IS NULL AND ? >= ? AND (a.meta_json LIKE ? OR a.meta_json LIKE ?)))',
    ActivityService::dateOverlapSql('a'),
    'SQL lọc activity giao với ngày đang xem'
);
assertSameValue(
    ['2026-06-17 00:00:00', '2026-06-16 00:00:00', '2026-06-16', '2026-06-16 02:00:00', '2026-06-16 00:00:00', '%"status":"running"%', '%"status":"paused"%'],
    ActivityService::dateOverlapParams($dayStart, $dayEnd, '2026-06-16', '2026-06-16 02:00:00'),
    'Params lọc activity giao ngày'
);

$overnightSummary = ActivityService::summarizeForDay([
    [
        'type' => 'sleep',
        'subtype' => null,
        'start_time' => '2026-06-15 23:00:00',
        'end_time' => '2026-06-16 01:00:00',
        'duration_minutes' => 120,
        'amount_ml' => null,
        'meta_json' => '{}',
    ],
], $dayStart, $dayEnd, '2026-06-16 02:00:00');
assertSameValue(1, $overnightSummary['sleep']['count'], 'Ngủ qua ngày vẫn được tính ở ngày mới');
assertSameValue(60, $overnightSummary['sleep']['minutes'], 'Ngủ qua ngày chỉ tính phần giao với ngày mới');

$prediction = FeedingPredictionService::calculate([
    ['start_time' => '2026-06-15 00:15:00', 'subtype' => 'formula', 'meta_json' => '{}'],
    ['start_time' => '2026-06-15 03:00:00', 'subtype' => 'breast_bottle', 'meta_json' => '{}'],
    ['start_time' => '2026-06-15 05:40:00', 'subtype' => 'breast_direct', 'meta_json' => '{}'],
    ['start_time' => '2026-06-15 08:25:00', 'subtype' => 'formula', 'meta_json' => '{}'],
], new DateTimeImmutable('2026-06-15 08:30:00'));
assertSameValue('2026-06-15 11:08:00', $prediction['predicted_time'], 'Dự đoán cữ bú kế tiếp theo khoảng cách có trọng số');
assertSameValue(163, $prediction['average_interval_minutes'], 'Khoảng cách trung bình có trọng số');
assertSameValue(true, $prediction['confidence'] >= 60, 'Độ tin cậy đủ dùng khi có bốn cữ');

$withoutPump = FeedingPredictionService::calculate([
    ['start_time' => '2026-06-15 06:00:00', 'subtype' => 'formula', 'meta_json' => '{}'],
    ['start_time' => '2026-06-15 07:00:00', 'subtype' => 'pump', 'meta_json' => '{}'],
    ['start_time' => '2026-06-15 09:00:00', 'subtype' => 'formula', 'meta_json' => '{}'],
], new DateTimeImmutable('2026-06-15 09:05:00'));
assertSameValue(180, $withoutPump['average_interval_minutes'], 'Hút sữa không được tính là cữ bé bú');

$tooLittleData = FeedingPredictionService::calculate([
    ['start_time' => '2026-06-15 06:00:00', 'subtype' => 'formula', 'meta_json' => '{}'],
], new DateTimeImmutable('2026-06-15 06:05:00'));
assertSameValue(null, $tooLittleData, 'Một cữ chưa đủ để dự đoán');
assertSameValue(['a@example.com', 'b@example.com'], FeedingReminderSettings::emails('a@example.com, b@example.com; a@example.com'), 'Chuẩn hóa danh sách email');
assertSameValue(true, EmailReminderService::closing(2) !== '', 'Câu kết email được tạo bằng code');

require __DIR__ . '/QuickInputParserTest.php';

echo "Backend tests passed\n";

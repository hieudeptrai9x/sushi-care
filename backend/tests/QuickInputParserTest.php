<?php

declare(strict_types=1);

use SushiCare\Lib\QuickInputParser;

$today = '2026-06-14';
$cases = [
    ['7h bé ngủ, 9h30 dậy', ['type' => 'sleep', 'start_time' => '2026-06-14 07:00:00', 'end_time' => '2026-06-14 09:30:00', 'duration_minutes' => 150]],
    ['10h thay tã ướt nhiều', ['type' => 'diaper', 'subtype' => 'wet', 'start_time' => '2026-06-14 10:00:00', 'wet_level' => 'high']],
    ['hút sữa 30 phút được 50ml lúc 20h00', ['type' => 'pumping', 'start_time' => '2026-06-14 20:00:00', 'duration_minutes' => 30, 'amount_ml' => 50.0]],
    ['bé bú sữa mẹ lúc 6h tối đến 6h30 tối', ['type' => 'feeding', 'subtype' => 'breastfeeding', 'start_time' => '2026-06-14 18:00:00', 'end_time' => '2026-06-14 18:30:00', 'duration_minutes' => 30]],
    ['bé bú bình 90ml lúc 8h30', ['type' => 'feeding', 'subtype' => 'bottle', 'start_time' => '2026-06-14 08:30:00', 'amount_ml' => 90.0]],
    ['bé ị phân vàng sệt lúc 5h30', ['type' => 'diaper', 'subtype' => 'dirty', 'start_time' => '2026-06-14 05:30:00', 'poop_color' => 'yellow', 'poop_texture' => 'soft']],
    ['bé sốt 38.5 độ lúc 21h', ['type' => 'health', 'subtype' => 'temperature', 'start_time' => '2026-06-14 21:00:00', 'temperature' => 38.5]],
    ['bé ọc sữa nhẹ sau bú lúc 11h', ['type' => 'health', 'subtype' => 'spit_up', 'start_time' => '2026-06-14 11:00:00']],
    ['bé ngủ 2 tiếng lúc 13h', ['type' => 'sleep', 'start_time' => '2026-06-14 13:00:00', 'end_time' => '2026-06-14 15:00:00', 'duration_minutes' => 120]],
    ['bé bú mẹ bên trái 15 phút lúc 7h sáng', ['type' => 'feeding', 'subtype' => 'breastfeeding', 'side' => 'left', 'start_time' => '2026-06-14 07:00:00', 'duration_minutes' => 15]],
];

foreach ($cases as [$text, $expected]) {
    $result = QuickInputParser::parse($text, $today);
    assertSameValue(true, $result['success'] ?? false, "Quick parse thành công: {$text}");
    foreach ($expected as $key => $value) {
        assertSameValue($value, $result['activity'][$key] ?? null, "{$text} -> {$key}");
    }
}

$ambiguous = QuickInputParser::parse('bé bú lúc 8h', $today);
assertSameValue(true, $ambiguous['needs_clarification'] ?? false, 'Bú chưa rõ loại phải hỏi lại');

$overnight = QuickInputParser::parse('bé ngủ từ 23h đến 2h', $today);
assertSameValue(true, $overnight['needs_confirmation'] ?? false, 'Khoảng ngủ qua ngày phải xác nhận');
assertSameValue(180, $overnight['activity']['duration_minutes'] ?? 0, 'Khoảng ngủ qua ngày tính đúng thời lượng');

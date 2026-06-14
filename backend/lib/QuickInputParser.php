<?php

declare(strict_types=1);

namespace SushiCare\Lib;

final class QuickInputParser
{
    public static function parse(string $text, string $today): array
    {
        $text = trim($text);
        $lower = mb_strtolower($text);
        $times = self::times($lower, $today);
        $duration = self::duration($lower);
        $amount = self::number($lower, '/(\d+(?:[.,]\d+)?)\s*ml/u');
        $activity = self::emptyActivity();
        $warning = null;

        if (str_contains($lower, 'hút sữa')) {
            $activity['type'] = 'pumping';
            $activity['subtype'] = 'pump';
            $activity['amount_ml'] = $amount;
            $activity['duration_minutes'] = $duration ?? 0;
            $activity['start_time'] = $times[0] ?? null;
            if ($activity['start_time'] && $duration) {
                $activity['end_time'] = date('Y-m-d H:i:s', strtotime($activity['start_time']) + $duration * 60);
            }
            $activity['meta_json'] = self::pumpMeta($lower);
        } elseif (str_contains($lower, 'tã') || preg_match('/\b(ị|đi ị|phân)\b/u', $lower)) {
            $activity['type'] = 'diaper';
            $wet = str_contains($lower, 'ướt');
            $dirty = preg_match('/\b(bẩn|ị|đi ị|phân)\b/u', $lower) === 1;
            $activity['subtype'] = $wet && $dirty ? 'mixed' : ($dirty ? 'dirty' : 'wet');
            $activity['wet_level'] = self::wetLevel($lower);
            $activity['poop_color'] = self::mapFirst($lower, ['vàng' => 'yellow', 'xanh' => 'green', 'nâu' => 'brown', 'đen' => 'black', 'đỏ' => 'red']);
            $activity['poop_texture'] = self::mapFirst($lower, ['sệt' => 'soft', 'lỏng' => 'liquid', 'cứng' => 'hard', 'nhầy' => 'mucus']);
            $activity['start_time'] = $times[0] ?? null;
        } elseif (preg_match('/\b(sốt|nhiệt độ|ọc sữa|trớ|ho|uống thuốc)\b/u', $lower)) {
            $activity['type'] = 'health';
            if (str_contains($lower, 'sốt') || str_contains($lower, 'nhiệt độ')) {
                $activity['subtype'] = 'temperature';
                $activity['temperature'] = self::number($lower, '/(\d{2}(?:[.,]\d+)?)\s*(?:độ|°)/u');
                if (($activity['temperature'] ?? 0) >= 38) {
                    $warning = 'Trẻ sơ sinh có nhiệt độ từ 38°C cần được đánh giá y tế sớm. Nếu bé khó thở, tím tái, co giật, bỏ bú hoặc lừ đừ, hãy đi cấp cứu.';
                }
            } elseif (str_contains($lower, 'ọc sữa') || str_contains($lower, 'trớ')) {
                $activity['subtype'] = 'spit_up';
                $activity['meta_json'] = ['severity' => self::severity($lower)];
                if (preg_match('/sặc|khó thở|tím/u', $lower)) {
                    $warning = 'Ọc sữa kèm sặc, khó thở hoặc tím tái là dấu hiệu nguy hiểm. Hãy đưa bé đi cấp cứu.';
                }
            } elseif (str_contains($lower, 'ho')) {
                $activity['subtype'] = 'cough';
            } else {
                $activity['subtype'] = 'medicine';
            }
            $activity['start_time'] = $times[0] ?? null;
        } elseif (str_contains($lower, 'ngủ') && (count($times) > 0 || $duration !== null)) {
            $activity['type'] = 'sleep';
            $activity['start_time'] = $times[0] ?? null;
            if (isset($times[1])) {
                $activity['end_time'] = $times[1];
                if (strtotime($activity['end_time']) < strtotime((string) $activity['start_time'])) {
                    $activity['end_time'] = date('Y-m-d H:i:s', strtotime($activity['end_time']) + 86400);
                    $activity['meta_json'] = ['needs_overnight_confirmation' => true];
                }
                $activity['duration_minutes'] = ActivityService::elapsedMinutes((string) $activity['start_time'], $activity['end_time']);
            } elseif ($activity['start_time'] && $duration) {
                $activity['duration_minutes'] = $duration;
                $activity['end_time'] = date('Y-m-d H:i:s', strtotime($activity['start_time']) + $duration * 60);
            }
        } elseif (preg_match('/\b(bú|uống sữa)\b/u', $lower)) {
            $activity['type'] = 'feeding';
            $isBreast = str_contains($lower, 'bú mẹ') || str_contains($lower, 'sữa mẹ');
            $isFormula = str_contains($lower, 'công thức');
            $isBottle = str_contains($lower, 'bú bình') || $isFormula;
            if (!$isBreast && !$isBottle) {
                return self::clarification('Anh muốn ghi bú mẹ hay bú bình ạ?', ['Bú mẹ', 'Bú bình', 'Hút sữa']);
            }
            $activity['subtype'] = $isBreast ? 'breastfeeding' : ($isFormula ? 'formula' : 'bottle');
            $activity['amount_ml'] = $amount;
            $activity['side'] = self::mapFirst($lower, ['bên trái' => 'left', 'trái' => 'left', 'bên phải' => 'right', 'phải' => 'right', 'hai bên' => 'both']);
            $activity['start_time'] = $times[0] ?? null;
            if (isset($times[1])) {
                $activity['end_time'] = $times[1];
                $activity['duration_minutes'] = ActivityService::elapsedMinutes((string) $activity['start_time'], $activity['end_time']);
            } elseif ($duration) {
                $activity['duration_minutes'] = $duration;
                if ($activity['start_time']) {
                    $activity['end_time'] = date('Y-m-d H:i:s', strtotime($activity['start_time']) + $duration * 60);
                }
            }
        } else {
            $activity['type'] = 'note';
            $activity['start_time'] = $times[0] ?? "{$today} " . date('H:i:s');
            $activity['note'] = $text;
        }

        if ($activity['type'] !== 'note' && !$activity['start_time']) {
            return self::clarification('Anh cho em biết hoạt động này diễn ra lúc mấy giờ nhé.', ['Lúc vừa xong', 'Lúc này']);
        }
        if ($activity['type'] === 'feeding' && in_array($activity['subtype'], ['bottle', 'formula'], true) && !$activity['amount_ml']) {
            return self::clarification('Bé đã bú khoảng bao nhiêu ml ạ?', []);
        }

        $summary = self::summary($activity);
        return [
            'success' => true,
            'confidence' => 0.9,
            'needs_confirmation' => !empty($activity['meta_json']['needs_overnight_confirmation']),
            'activity' => $activity,
            'human_summary' => $summary,
            'warning' => $warning,
        ];
    }

    public static function normalizeAiResult(array $result, string $today): ?array
    {
        if (!isset($result['success'])) {
            return null;
        }
        if ($result['success'] === false && !empty($result['needs_clarification'])) {
            return [
                'success' => false,
                'needs_clarification' => true,
                'question' => (string) ($result['question'] ?? 'Anh bổ sung thêm chút nhé.'),
                'suggestions' => is_array($result['suggestions'] ?? null) ? $result['suggestions'] : [],
            ];
        }
        if (!is_array($result['activity'] ?? null)) {
            return null;
        }
        $activity = array_replace(self::emptyActivity(), $result['activity']);
        if (!in_array($activity['type'], ['feeding', 'sleep', 'diaper', 'health', 'pumping', 'note'], true)) {
            return null;
        }
        if (!$activity['start_time']) {
            return null;
        }
        return [
            'success' => true,
            'confidence' => (float) ($result['confidence'] ?? 0.85),
            'needs_confirmation' => !empty($result['needs_confirmation']),
            'activity' => $activity,
            'human_summary' => (string) ($result['human_summary'] ?? self::summary($activity)),
            'warning' => $result['warning'] ?? null,
        ];
    }

    public static function decodeJson(string $content): ?array
    {
        $clean = trim($content);
        $clean = preg_replace('/^```(?:json)?\s*|\s*```$/u', '', $clean) ?? $clean;
        $decoded = json_decode($clean, true);
        return is_array($decoded) ? $decoded : null;
    }

    private static function emptyActivity(): array
    {
        return [
            'type' => null, 'subtype' => null, 'start_time' => null, 'end_time' => null,
            'duration_minutes' => 0, 'amount_ml' => null, 'side' => null, 'wet_level' => null,
            'poop_color' => null, 'poop_texture' => null, 'temperature' => null,
            'weight_kg' => null, 'meta_json' => [], 'note' => '',
        ];
    }

    private static function times(string $text, string $today): array
    {
        preg_match_all('/(?<!\d)(\d{1,2})(?:h|:)(\d{1,2})?\s*(sáng|trưa|chiều|tối|đêm)?/u', $text, $matches, PREG_SET_ORDER);
        $result = [];
        foreach ($matches as $match) {
            $hour = (int) $match[1];
            $minute = isset($match[2]) && $match[2] !== '' ? (int) $match[2] : 0;
            $period = $match[3] ?? '';
            if ($period === 'đêm' && $hour === 12) {
                $hour = 0;
            } elseif (in_array($period, ['chiều', 'tối', 'đêm'], true) && $hour < 12) {
                $hour += 12;
            } elseif ($period === 'trưa' && $hour < 6) {
                $hour += 12;
            }
            if ($hour <= 23 && $minute <= 59) {
                $result[] = sprintf('%s %02d:%02d:00', $today, $hour, $minute);
            }
        }
        return $result;
    }

    private static function duration(string $text): ?int
    {
        if (!preg_match('/(\d+(?:[.,]\d+)?)\s*(phút|tiếng|giờ)/u', $text, $match)) {
            return null;
        }
        $value = (float) str_replace(',', '.', $match[1]);
        return (int) round($value * (in_array($match[2], ['tiếng', 'giờ'], true) ? 60 : 1));
    }

    private static function number(string $text, string $pattern): ?float
    {
        return preg_match($pattern, $text, $match) ? (float) str_replace(',', '.', $match[1]) : null;
    }

    private static function wetLevel(string $text): ?string
    {
        return self::mapFirst($text, ['nhiều' => 'high', 'vừa' => 'medium', 'ít' => 'low']);
    }

    private static function severity(string $text): string
    {
        return self::mapFirst($text, ['nhiều' => 'high', 'nặng' => 'high', 'nhẹ' => 'low', 'ít' => 'low']) ?? 'medium';
    }

    private static function mapFirst(string $text, array $map): ?string
    {
        foreach ($map as $needle => $value) {
            if (str_contains($text, $needle)) {
                return $value;
            }
        }
        return null;
    }

    private static function pumpMeta(string $text): array
    {
        $meta = [];
        if (preg_match('/(?:bên\s*)?trái\s*(\d+(?:[.,]\d+)?)\s*ml/u', $text, $left)) {
            $meta['left_ml'] = (float) str_replace(',', '.', $left[1]);
        }
        if (preg_match('/(?:bên\s*)?phải\s*(\d+(?:[.,]\d+)?)\s*ml/u', $text, $right)) {
            $meta['right_ml'] = (float) str_replace(',', '.', $right[1]);
        }
        return $meta;
    }

    private static function summary(array $activity): string
    {
        $time = $activity['start_time'] ? substr((string) $activity['start_time'], 11, 5) : '';
        return match ($activity['type']) {
            'sleep' => "Bé ngủ lúc {$time}" . ($activity['end_time'] ? ' đến ' . substr((string) $activity['end_time'], 11, 5) : '') . ", tổng {$activity['duration_minutes']} phút.",
            'pumping' => "Hút sữa lúc {$time}" . ($activity['duration_minutes'] ? ", {$activity['duration_minutes']} phút" : '') . ($activity['amount_ml'] ? ", được {$activity['amount_ml']} ml." : '.'),
            'feeding' => "Bé bú lúc {$time}" . ($activity['amount_ml'] ? ", {$activity['amount_ml']} ml." : ($activity['duration_minutes'] ? ", {$activity['duration_minutes']} phút." : '.')),
            'diaper' => "Thay tã lúc {$time}.",
            'health' => "Ghi nhận sức khỏe lúc {$time}.",
            default => (string) $activity['note'],
        };
    }

    private static function clarification(string $question, array $suggestions): array
    {
        return ['success' => false, 'needs_clarification' => true, 'question' => $question, 'suggestions' => $suggestions];
    }
}

<?php

declare(strict_types=1);

namespace SushiCare\Lib;

final class ActivityService
{
    private const TYPES = ['feeding', 'sleep', 'diaper', 'health', 'note'];

    public static function normalize(array $data): array
    {
        $type = (string) ($data['type'] ?? '');
        if (!in_array($type, self::TYPES, true)) {
            throw new \InvalidArgumentException('Loại nhật ký không hợp lệ.');
        }
        return [
            'type' => $type,
            'subtype' => self::nullableString($data['subtype'] ?? null),
            'start_time' => self::dateTime($data['start_time'] ?? null),
            'end_time' => self::nullableDateTime($data['end_time'] ?? null),
            'duration_minutes' => max(0, (int) ($data['duration_minutes'] ?? 0)),
            'amount_ml' => Validator::decimal($data['amount_ml'] ?? null),
            'side' => self::nullableString($data['side'] ?? null),
            'wet_level' => self::nullableString($data['wet_level'] ?? null),
            'poop_color' => self::nullableString($data['poop_color'] ?? null),
            'poop_texture' => self::nullableString($data['poop_texture'] ?? null),
            'temperature' => Validator::decimal($data['temperature'] ?? null),
            'weight_kg' => Validator::decimal($data['weight_kg'] ?? null),
            'meta_json' => json_encode($data['meta'] ?? new \stdClass(), JSON_UNESCAPED_UNICODE),
            'note' => self::nullableString($data['note'] ?? null, 2000),
        ];
    }

    public static function summarize(array $rows): array
    {
        $result = [
            'feeding' => ['count' => 0, 'total_ml' => 0.0, 'minutes' => 0],
            'sleep' => ['count' => 0, 'minutes' => 0],
            'diaper' => ['wet' => 0, 'dirty' => 0],
        ];
        foreach ($rows as $row) {
            $meta = json_decode((string) ($row['meta_json'] ?? ''), true);
            if (in_array($meta['status'] ?? '', ['running', 'paused'], true)) {
                continue;
            }
            if ($row['type'] === 'feeding') {
                $result['feeding']['count']++;
                $result['feeding']['total_ml'] += (float) ($row['amount_ml'] ?? 0);
                $result['feeding']['minutes'] += (int) ($row['duration_minutes'] ?? 0);
            } elseif ($row['type'] === 'sleep') {
                $result['sleep']['count']++;
                $result['sleep']['minutes'] += (int) ($row['duration_minutes'] ?? 0);
            } elseif ($row['type'] === 'diaper') {
                $subtype = $row['subtype'] ?? '';
                $result['diaper']['wet'] += in_array($subtype, ['wet', 'mixed'], true) ? 1 : 0;
                $result['diaper']['dirty'] += in_array($subtype, ['dirty', 'mixed'], true) ? 1 : 0;
            }
        }
        return $result;
    }

    public static function summarizeForDay(array $rows, string $dayStart, string $dayEnd, ?string $now = null): array
    {
        $result = [
            'feeding' => ['count' => 0, 'total_ml' => 0.0, 'minutes' => 0],
            'sleep' => ['count' => 0, 'minutes' => 0],
            'diaper' => ['wet' => 0, 'dirty' => 0],
        ];
        $now ??= date('Y-m-d H:i:s');

        foreach ($rows as $row) {
            $meta = json_decode((string) ($row['meta_json'] ?? ''), true);
            if (in_array($meta['status'] ?? '', ['running', 'paused'], true)) {
                continue;
            }

            $isTimed = ($row['end_time'] ?? null) || in_array($meta['status'] ?? '', ['running', 'paused'], true);
            $clippedMinutes = $isTimed
                ? self::clippedMinutes(
                    (string) ($row['start_time'] ?? ''),
                    (string) (($row['end_time'] ?? null) ?: $now),
                    $dayStart,
                    $dayEnd
                )
                : (int) ($row['duration_minutes'] ?? 0);

            if ($row['type'] === 'feeding') {
                $result['feeding']['count']++;
                $result['feeding']['total_ml'] += (float) ($row['amount_ml'] ?? 0);
                $result['feeding']['minutes'] += $clippedMinutes;
            } elseif ($row['type'] === 'sleep') {
                $result['sleep']['count']++;
                $result['sleep']['minutes'] += $clippedMinutes;
            } elseif ($row['type'] === 'diaper') {
                $subtype = $row['subtype'] ?? '';
                $result['diaper']['wet'] += in_array($subtype, ['wet', 'mixed'], true) ? 1 : 0;
                $result['diaper']['dirty'] += in_array($subtype, ['dirty', 'mixed'], true) ? 1 : 0;
            }
        }

        return $result;
    }

    public static function dayWindow(string $date): array
    {
        $date = preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ? $date : date('Y-m-d');
        $start = date('Y-m-d 00:00:00', strtotime($date));
        $end = date('Y-m-d 00:00:00', strtotime($start . ' +1 day'));

        return [$start, $end];
    }

    public static function dateOverlapSql(string $alias = ''): string
    {
        $prefix = $alias !== '' ? $alias . '.' : '';

        return $prefix . 'start_time < ? AND ('
            . $prefix . 'end_time >= ? OR DATE(' . $prefix . 'start_time)=? OR ('
            . $prefix . 'end_time IS NULL AND ? >= ? AND ('
            . $prefix . 'meta_json LIKE ? OR ' . $prefix . 'meta_json LIKE ?)))';
    }

    public static function dateOverlapParams(string $dayStart, string $dayEnd, string $date, ?string $now = null): array
    {
        return [$dayEnd, $dayStart, $date, $now ?? date('Y-m-d H:i:s'), $dayStart, '%"status":"running"%', '%"status":"paused"%'];
    }

    public static function elapsedMinutes(string $start, string $end): int
    {
        return max(0, (int) ceil((strtotime($end) - strtotime($start)) / 60));
    }

    private static function clippedMinutes(string $start, string $end, string $dayStart, string $dayEnd): int
    {
        $startTs = strtotime($start);
        $endTs = strtotime($end);
        $dayStartTs = strtotime($dayStart);
        $dayEndTs = strtotime($dayEnd);

        if ($startTs === false || $endTs === false || $dayStartTs === false || $dayEndTs === false) {
            return 0;
        }

        $overlapStart = max($startTs, $dayStartTs);
        $overlapEnd = min($endTs, $dayEndTs);

        return max(0, (int) ceil(($overlapEnd - $overlapStart) / 60));
    }

    private static function dateTime(mixed $value): string
    {
        $timestamp = strtotime((string) $value);
        if ($timestamp === false) {
            throw new \InvalidArgumentException('Thời gian không hợp lệ.');
        }
        return date('Y-m-d H:i:s', $timestamp);
    }

    private static function nullableDateTime(mixed $value): ?string
    {
        return $value ? self::dateTime($value) : null;
    }

    private static function nullableString(mixed $value, int $max = 100): ?string
    {
        if ($value === null || trim((string) $value) === '') {
            return null;
        }
        return mb_substr(trim((string) $value), 0, $max);
    }
}

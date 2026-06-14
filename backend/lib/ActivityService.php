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
            'amount_ml' => isset($data['amount_ml']) && $data['amount_ml'] !== '' ? (float) $data['amount_ml'] : null,
            'side' => self::nullableString($data['side'] ?? null),
            'wet_level' => self::nullableString($data['wet_level'] ?? null),
            'poop_color' => self::nullableString($data['poop_color'] ?? null),
            'poop_texture' => self::nullableString($data['poop_texture'] ?? null),
            'temperature' => isset($data['temperature']) && $data['temperature'] !== '' ? (float) $data['temperature'] : null,
            'weight_kg' => isset($data['weight_kg']) && $data['weight_kg'] !== '' ? (float) $data['weight_kg'] : null,
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

<?php

declare(strict_types=1);

namespace SushiCare\Lib;

final class Validator
{
    public static function email(mixed $value): bool
    {
        return is_string($value) && filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function oneOf(mixed $value, array $allowed): bool
    {
        return is_string($value) && in_array($value, $allowed, true);
    }

    public static function decimal(mixed $value): ?float
    {
        if ($value === null || trim((string) $value) === '') {
            return null;
        }
        $normalized = str_replace(',', '.', preg_replace('/\s+/', '', trim((string) $value)) ?? '');
        if (!preg_match('/^-?\d+(?:\.\d+)?$/', $normalized)) {
            throw new \InvalidArgumentException('Số thập phân không hợp lệ.');
        }
        return (float) $normalized;
    }

    public static function requiredString(array $data, string $key, int $max = 5000): string
    {
        $value = trim((string) ($data[$key] ?? ''));
        if ($value === '' || mb_strlen($value) > $max) {
            throw new \InvalidArgumentException("Dữ liệu {$key} không hợp lệ.");
        }
        return $value;
    }
}

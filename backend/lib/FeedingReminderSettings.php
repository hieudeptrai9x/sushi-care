<?php

declare(strict_types=1);

namespace SushiCare\Lib;

use PDO;

final class FeedingReminderSettings
{
    public const DEFAULTS = [
        'enabled' => '0',
        'minutes_before' => '10',
        'emails' => 'hieulm.work@gmail.com',
        'smtp_host' => 'leminhhieu.com',
        'smtp_port' => '465',
        'smtp_username' => 'sushi@leminhhieu.com',
        'smtp_password' => '',
        'smtp_encryption' => 'ssl',
        'from_email' => 'sushi@leminhhieu.com',
        'from_name' => 'Sushi Care',
    ];

    public static function load(PDO $db, int $ownerId, string $appKey): array
    {
        $stmt = $db->prepare("SELECT setting_key,setting_value,is_secret FROM settings WHERE user_id=? AND setting_key LIKE 'feeding_reminder.%'");
        $stmt->execute([$ownerId]);
        $values = self::DEFAULTS;
        foreach ($stmt->fetchAll() as $row) {
            $key = substr((string) $row['setting_key'], 17);
            $values[$key] = $row['is_secret'] ? Secret::decrypt((string) $row['setting_value'], $appKey) : (string) $row['setting_value'];
        }
        return $values;
    }

    public static function save(PDO $db, int $ownerId, array $data, string $appKey, bool $includeSmtp): void
    {
        $public = ['enabled', 'minutes_before', 'emails'];
        $smtp = ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_encryption', 'from_email', 'from_name'];
        $allowed = $includeSmtp ? [...$public, ...$smtp] : $public;
        $stmt = $db->prepare('INSERT INTO settings (user_id,setting_key,setting_value,is_secret) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value),is_secret=VALUES(is_secret)');
        foreach ($allowed as $key) {
            if (!array_key_exists($key, $data) || ($key === 'smtp_password' && str_contains((string) $data[$key], '*'))) {
                continue;
            }
            $value = is_bool($data[$key]) ? ($data[$key] ? '1' : '0') : trim((string) $data[$key]);
            $secret = $key === 'smtp_password';
            $stmt->execute([$ownerId, 'feeding_reminder.' . $key, $secret ? Secret::encrypt($value, $appKey) : $value, $secret ? 1 : 0]);
        }
    }

    public static function emails(string $value): array
    {
        return array_values(array_unique(array_filter(array_map('trim', preg_split('/[,;\\s]+/', $value) ?: []), fn (string $email): bool => filter_var($email, FILTER_VALIDATE_EMAIL) !== false)));
    }
}

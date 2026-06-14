<?php

declare(strict_types=1);

namespace SushiCare\Lib;

use PDO;

final class AiSettings
{
    public const DEFAULTS = [
        'enabled' => '0',
        'provider' => 'openai-compatible',
        'base_url' => 'https://token.v-claw.org',
        'model' => 'gpt-5.5',
        'system_prompt' => 'Bạn là trợ lý chăm sóc trẻ sơ sinh bằng tiếng Việt. Trả lời thân thiện, dễ hiểu, không thay thế bác sĩ. Luôn khuyến nghị đi khám/cấp cứu nếu có dấu hiệu nguy hiểm như khó thở, tím tái, co giật, sốt cao, bỏ bú, lừ đừ, mất nước, ọc sữa kèm sặc/khó thở. Không chẩn đoán chắc chắn. Hỏi thêm thông tin khi thiếu dữ liệu.',
        'max_tokens' => '800',
        'temperature' => '0.4',
        'api_key' => '',
    ];

    public static function load(PDO $db, int $userId, string $appKey): array
    {
        $stmt = $db->prepare("SELECT setting_key,setting_value,is_secret FROM settings WHERE user_id=? AND setting_key LIKE 'ai.%'");
        $stmt->execute([$userId]);
        $values = self::DEFAULTS;
        foreach ($stmt->fetchAll() as $row) {
            $key = substr($row['setting_key'], 3);
            $values[$key] = $row['is_secret'] ? Secret::decrypt((string) $row['setting_value'], $appKey) : (string) $row['setting_value'];
        }
        return $values;
    }

    public static function save(PDO $db, int $userId, array $data, string $appKey): void
    {
        $stmt = $db->prepare('INSERT INTO settings (user_id,setting_key,setting_value,is_secret) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value),is_secret=VALUES(is_secret)');
        foreach (array_keys(self::DEFAULTS) as $key) {
            if (!array_key_exists($key, $data) || ($key === 'api_key' && str_contains((string) $data[$key], '*'))) {
                continue;
            }
            $value = is_bool($data[$key]) ? ($data[$key] ? '1' : '0') : (string) $data[$key];
            $secret = $key === 'api_key';
            $stmt->execute([$userId, 'ai.' . $key, $secret ? Secret::encrypt($value, $appKey) : $value, $secret ? 1 : 0]);
        }
    }
}

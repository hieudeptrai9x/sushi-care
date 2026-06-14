<?php

declare(strict_types=1);

namespace SushiCare\Lib;

final class AiSafety
{
    private const TERMS = [
        'khó thở', 'tím tái', 'co giật', 'sốt cao', 'bỏ bú',
        'lừ đừ', 'mất nước', 'sặc', 'không đánh thức', 'ngừng thở',
    ];

    public static function isEmergency(string $message): bool
    {
        $message = mb_strtolower($message);
        foreach (self::TERMS as $term) {
            if (str_contains($message, $term)) {
                return true;
            }
        }
        return false;
    }

    public static function emergencyMessage(): string
    {
        return 'Những dấu hiệu bạn mô tả có thể cần được đánh giá khẩn cấp. Hãy liên hệ bác sĩ hoặc cơ sở cấp cứu ngay; nếu bé khó thở, tím tái, co giật hoặc không phản ứng, hãy gọi cấp cứu. AI chỉ mang tính tham khảo và không thay thế chẩn đoán của bác sĩ.';
    }
}

<?php

declare(strict_types=1);

namespace SushiCare\Lib;

final class Secret
{
    public static function mask(string $secret): string
    {
        if ($secret === '') {
            return '';
        }
        $prefix = str_starts_with($secret, 'sk-') ? 'sk-' : '';
        return $prefix . '************' . mb_substr($secret, -4);
    }

    public static function encrypt(string $plain, string $key): string
    {
        $iv = random_bytes(12);
        $tag = '';
        $cipher = openssl_encrypt($plain, 'aes-256-gcm', hash('sha256', $key, true), OPENSSL_RAW_DATA, $iv, $tag);
        if ($cipher === false) {
            throw new \RuntimeException('Không thể mã hóa secret.');
        }
        return base64_encode($iv . $tag . $cipher);
    }

    public static function decrypt(string $encoded, string $key): string
    {
        $raw = base64_decode($encoded, true);
        if ($raw === false || strlen($raw) < 29) {
            return '';
        }
        $plain = openssl_decrypt(substr($raw, 28), 'aes-256-gcm', hash('sha256', $key, true), OPENSSL_RAW_DATA, substr($raw, 0, 12), substr($raw, 12, 16));
        return $plain === false ? '' : $plain;
    }
}

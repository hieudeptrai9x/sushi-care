<?php

declare(strict_types=1);

namespace SushiCare\Lib;

final class OpenAICompatibleProvider implements AiProviderInterface
{
    public function chat(array $messages, array $settings): string
    {
        $baseUrl = rtrim((string) $settings['base_url'], '/');
        $endpoint = str_ends_with($baseUrl, '/v1') ? $baseUrl . '/chat/completions' : $baseUrl . '/v1/chat/completions';
        $curl = curl_init($endpoint);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_TIMEOUT => 45,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $settings['api_key'],
                'Content-Type: application/json',
            ],
            CURLOPT_POSTFIELDS => json_encode([
                'model' => $settings['model'],
                'messages' => $messages,
                'max_tokens' => (int) $settings['max_tokens'],
                'temperature' => (float) $settings['temperature'],
            ], JSON_UNESCAPED_UNICODE),
        ]);
        $body = curl_exec($curl);
        $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $error = curl_error($curl);
        curl_close($curl);
        if ($body === false || $status >= 400) {
            throw new \RuntimeException($error ?: "AI provider trả về HTTP {$status}.");
        }
        $json = json_decode($body, true);
        $content = $json['choices'][0]['message']['content'] ?? null;
        if (!is_string($content) || trim($content) === '') {
            throw new \RuntimeException('AI provider trả về dữ liệu không hợp lệ.');
        }
        return trim($content);
    }
}

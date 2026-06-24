<?php

declare(strict_types=1);

namespace SushiCare\Lib;

use PHPMailer\PHPMailer\PHPMailer;

final class EmailReminderService
{
    public static function send(array $settings, string $email, array $baby, array $prediction): void
    {
        if (!class_exists(PHPMailer::class)) {
            throw new \RuntimeException('PHPMailer chưa được cài đặt.');
        }
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = $settings['smtp_host'];
        $mail->Port = (int) $settings['smtp_port'];
        $mail->SMTPAuth = $settings['smtp_username'] !== '';
        $mail->Username = $settings['smtp_username'];
        $mail->Password = $settings['smtp_password'];
        if ($settings['smtp_encryption'] !== 'none') {
            $mail->SMTPSecure = $settings['smtp_encryption'];
        }
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($settings['from_email'], $settings['from_name']);
        $mail->addAddress($email);
        $mail->isHTML(true);
        $mail->Subject = '🍼 ' . $baby['name'] . ' sắp đói rồi đó ba mẹ ơii';
        $mail->Body = self::html($baby, $prediction);
        $mail->AltBody = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $mail->Body));
        $mail->send();
    }

    public static function closing(int $seed): string
    {
        $lines = [
            '💗 Chúc ba mẹ có một ngày thật nhẹ nhàng cùng bé.',
            '🌙 Chúc cả nhà có một đêm thật ngon giấc.',
            '🥰 Bé đang lớn lên từng ngày đó nha.',
            '🐻 Tranh thủ ngủ thêm chút nữa nha ba mẹ.',
            '✨ Hôm nay bé bú rất đều đó.',
        ];
        return $lines[abs($seed) % count($lines)];
    }

    private static function html(array $baby, array $prediction): string
    {
        $time = date('H:i', strtotime($prediction['predicted_time']));
        $last = date('H:i', strtotime($prediction['last_feeding_time']));
        $hours = intdiv((int) $prediction['average_interval_minutes'], 60);
        $minutes = (int) $prediction['average_interval_minutes'] % 60;
        $interval = trim(($hours ? "{$hours} giờ " : '') . ($minutes ? "{$minutes} phút" : ''));
        $closing = self::closing((int) strtotime($prediction['predicted_time']));
        return '<div style="background:#fff7fa;padding:28px;font-family:Arial,sans-serif;color:#342830"><div style="max-width:560px;margin:auto;background:white;border:1px solid #ffe4ec;border-radius:24px;padding:28px"><div style="font-size:36px">🍼</div><h1 style="color:#ff5f8f;font-size:24px">Sắp đến cữ bú của ' . htmlspecialchars($baby['name']) . '</h1><p>Chào ba mẹ 👋</p><p><strong>' . htmlspecialchars($baby['name']) . '</strong> có thể sẽ đòi bú vào khoảng <strong style="color:#ff5f8f">' . $time . '</strong> (±15 phút).</p><div style="background:#fff0f4;border-radius:16px;padding:16px;line-height:1.8">• Lần bú gần nhất: ' . $last . '<br>• Khoảng cách bú trung bình: ' . $interval . '<br>• Độ tin cậy: ' . (int) $prediction['confidence'] . '%</div><p>Nếu cần, ba mẹ có thể chuẩn bị sữa từ bây giờ nha 😊</p><p>' . $closing . '</p><hr style="border:0;border-top:1px solid #ffe4ec"><small>— Sushi Care</small></div></div>';
    }
}

<?php

declare(strict_types=1);

namespace SushiCare\Lib;

use PDO;

final class FeedingSchema
{
    public static function ensure(PDO $db): void
    {
        static $ready = false;
        if ($ready) {
            return;
        }
        $column = $db->query("SHOW COLUMNS FROM babies LIKE 'feeding_type'")->fetch();
        if (!$column) {
            $db->exec("ALTER TABLE babies ADD feeding_type VARCHAR(30) NOT NULL DEFAULT 'mixed' AFTER birth_length");
        }
        $db->exec(
            'CREATE TABLE IF NOT EXISTS feeding_predictions (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                baby_id BIGINT UNSIGNED NOT NULL,
                predicted_time DATETIME NOT NULL,
                confidence TINYINT UNSIGNED NOT NULL,
                average_interval_minutes INT UNSIGNED NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_feeding_predictions_baby_time (baby_id,predicted_time),
                CONSTRAINT fk_feeding_predictions_baby FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
        $db->exec(
            'CREATE TABLE IF NOT EXISTS email_reminders (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                baby_id BIGINT UNSIGNED NOT NULL,
                reminder_type VARCHAR(50) NOT NULL,
                scheduled_at DATETIME NOT NULL,
                sent_at DATETIME NULL,
                email VARCHAR(190) NOT NULL,
                status VARCHAR(30) NOT NULL DEFAULT "pending",
                meta_json JSON NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_feeding_email (baby_id,reminder_type,scheduled_at,email),
                INDEX idx_email_reminders_due (status,scheduled_at),
                CONSTRAINT fk_email_reminders_baby FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
        $ready = true;
    }
}

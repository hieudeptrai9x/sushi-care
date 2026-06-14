SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','caregiver') NOT NULL DEFAULT 'caregiver',
  must_change_password TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS babies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL DEFAULT 'Bé Sushi',
  nickname VARCHAR(120) NULL,
  birth_date DATE NOT NULL,
  gender ENUM('female','male','other') NOT NULL DEFAULT 'female',
  avatar_url VARCHAR(500) NULL,
  birth_weight DECIMAL(5,2) NULL,
  birth_length DECIMAL(5,2) NULL,
  note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_babies_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  baby_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('feeding','sleep','diaper','health','note') NOT NULL,
  subtype VARCHAR(40) NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NULL,
  duration_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  amount_ml DECIMAL(7,2) NULL,
  side VARCHAR(30) NULL,
  wet_level VARCHAR(30) NULL,
  poop_color VARCHAR(50) NULL,
  poop_texture VARCHAR(50) NULL,
  temperature DECIMAL(4,1) NULL,
  weight_kg DECIMAL(5,2) NULL,
  meta_json JSON NULL,
  note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_activities_baby_time (baby_id, start_time),
  CONSTRAINT fk_activities_baby FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE,
  CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS moments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  baby_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type ENUM('image','video') NOT NULL,
  caption VARCHAR(1000) NULL,
  milestone_label VARCHAR(100) NULL,
  taken_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_moments_baby_time (baby_id, taken_at),
  CONSTRAINT fk_moments_baby FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE,
  CONSTRAINT fk_moments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reminders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  baby_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  reminder_type VARCHAR(50) NOT NULL DEFAULT 'other',
  reminder_time DATETIME NOT NULL,
  repeat_rule ENUM('none','daily','weekly','monthly') NOT NULL DEFAULT 'none',
  note TEXT NULL,
  is_done TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reminders_baby_time (baby_id, reminder_time),
  CONSTRAINT fk_reminders_baby FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE,
  CONSTRAINT fk_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  setting_key VARCHAR(120) NOT NULL,
  setting_value MEDIUMTEXT NULL,
  is_secret TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_setting (user_id, setting_key),
  CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  baby_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  content MEDIUMTEXT NOT NULL,
  meta_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ai_messages_baby_time (baby_id, created_at),
  CONSTRAINT fk_ai_messages_baby FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE,
  CONSTRAINT fk_ai_messages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo hash bằng: php -r "echo password_hash('MAT_KHAU_MOI', PASSWORD_DEFAULT), PHP_EOL;"
-- Sau đó thay __ADMIN_PASSWORD_HASH__ trước khi import production.
INSERT INTO users (name, email, password_hash, role)
SELECT 'Quản trị viên', 'admin@example.com', '__ADMIN_PASSWORD_HASH__', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');

INSERT INTO babies (user_id, name, birth_date, gender, birth_weight, birth_length)
SELECT id, 'Bé Sushi', CURDATE(), 'female', 3.20, 50.00
FROM users WHERE email = 'admin@example.com'
AND NOT EXISTS (SELECT 1 FROM babies WHERE user_id = users.id);

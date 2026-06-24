<?php

declare(strict_types=1);

use SushiCare\Config\Database;
use SushiCare\Lib\Response;

date_default_timezone_set('Asia/Ho_Chi_Minh');

$sessionLifetime = 60 * 60 * 24 * 30;
ini_set('session.gc_maxlifetime', (string) $sessionLifetime);
ini_set('session.cookie_lifetime', (string) $sessionLifetime);
session_name('sushi_care_session');
session_set_cookie_params([
    'lifetime' => $sessionLifetime,
    'httponly' => true,
    'secure' => !empty($_SERVER['HTTPS']),
    'samesite' => 'Lax',
    'path' => '/baby-care/',
]);
session_start();

require_once dirname(__DIR__) . '/config/database.php';
if (is_file(dirname(__DIR__) . '/vendor/autoload.php')) {
    require_once dirname(__DIR__) . '/vendor/autoload.php';
}

spl_autoload_register(function (string $class): void {
    $prefix = 'SushiCare\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $relative = str_replace('\\', '/', substr($class, strlen($prefix)));
    $base = dirname(__DIR__);
    $path = $base . '/' . lcfirst($relative) . '.php';
    if (is_file($path)) {
        require_once $path;
    }
});

$config = require dirname(__DIR__) . '/config/app.php';

set_exception_handler(function (Throwable $error) use ($config): void {
    error_log($error->getMessage());
    $message = $config['env'] === 'development' ? $error->getMessage() : 'Có lỗi xảy ra. Vui lòng thử lại.';
    Response::error($message, $error instanceof InvalidArgumentException ? 422 : 500);
});

function db(): PDO
{
    global $config;
    return Database::connection($config);
}

function input(): array
{
    $type = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($type, 'application/json')) {
        $data = json_decode((string) file_get_contents('php://input'), true);
        return is_array($data) ? $data : [];
    }
    return $_POST;
}

function require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== $method) {
        Response::error('Phương thức không được hỗ trợ.', 405);
    }
}

function baby_id(int $userId): int
{
    ensure_shared_care_schema();
    $stmt = db()->prepare(
        'SELECT b.id FROM babies b
         LEFT JOIN baby_caregivers bc ON bc.baby_id=b.id AND bc.user_id=?
         WHERE b.user_id=? OR bc.user_id=?
         ORDER BY b.id LIMIT 1'
    );
    $stmt->execute([$userId, $userId, $userId]);
    $id = (int) $stmt->fetchColumn();
    if ($id < 1) {
        throw new RuntimeException('Chưa có hồ sơ bé.');
    }
    return $id;
}

function ensure_shared_care_schema(): void
{
    static $ready = false;
    if ($ready) {
        return;
    }
    db()->exec(
        'CREATE TABLE IF NOT EXISTS baby_caregivers (
            baby_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (baby_id,user_id),
            CONSTRAINT fk_baby_caregivers_baby FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE,
            CONSTRAINT fk_baby_caregivers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
    $ready = true;
}

function baby_owner_id(int $babyId): int
{
    $stmt = db()->prepare('SELECT user_id FROM babies WHERE id=? LIMIT 1');
    $stmt->execute([$babyId]);
    $ownerId = (int) $stmt->fetchColumn();
    if ($ownerId < 1) {
        throw new RuntimeException('Không tìm thấy tài khoản quản trị của bé.');
    }
    return $ownerId;
}

function ensure_feeding_prediction_schema(): void
{
    \SushiCare\Lib\FeedingSchema::ensure(db());
}

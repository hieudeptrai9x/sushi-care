<?php

declare(strict_types=1);

$local = __DIR__ . '/local.php';
if (is_file($local)) {
    require $local;
}

return [
    'env' => getenv('APP_ENV') ?: ($appEnv ?? 'production'),
    'app_key' => getenv('APP_KEY') ?: ($appKey ?? 'change-this-key-before-production'),
    'install_token' => $installToken ?? '',
    'admin_password_hash' => $adminPasswordHash ?? '',
    'upload_dir' => dirname(__DIR__) . '/uploads',
    'max_upload_bytes' => 20 * 1024 * 1024,
    'db' => [
        'host' => getenv('DB_HOST') ?: ($dbHost ?? '127.0.0.1'),
        'port' => getenv('DB_PORT') ?: ($dbPort ?? '3306'),
        'name' => getenv('DB_NAME') ?: ($dbName ?? 'sushi_care'),
        'user' => getenv('DB_USER') ?: ($dbUser ?? 'root'),
        'pass' => getenv('DB_PASS') ?: ($dbPass ?? ''),
    ],
];

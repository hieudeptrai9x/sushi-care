<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$id = (int) (input()['id'] ?? 0);
$stmt = db()->prepare('SELECT file_url FROM moments WHERE id=? AND user_id=?');
$stmt->execute([$id, $userId]);
$url = $stmt->fetchColumn();
if ($url) {
    $path = dirname(__DIR__, 2) . $url;
    if (is_file($path)) {
        unlink($path);
    }
}
$delete = db()->prepare('DELETE FROM moments WHERE id=? AND user_id=?');
$delete->execute([$id, $userId]);
Response::json(['message' => 'Đã xóa khoảnh khắc.']);

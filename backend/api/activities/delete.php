<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$stmt = db()->prepare('DELETE FROM activities WHERE id=? AND user_id=?');
$stmt->execute([(int) (input()['id'] ?? 0), $userId]);
Response::json(['message' => 'Đã xóa nhật ký.']);

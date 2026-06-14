<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;
use SushiCare\Lib\Validator;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$name = Validator::requiredString(input(), 'name', 120);
$stmt = db()->prepare('UPDATE users SET name=? WHERE id=?');
$stmt->execute([$name, $userId]);
Response::json(['name' => $name, 'message' => 'Đã cập nhật tên hiển thị.']);

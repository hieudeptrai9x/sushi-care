<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;

require_method('POST');
Auth::userId();
Auth::verifyCsrf();
$_SESSION = [];
session_destroy();
Response::json(['message' => 'Đã đăng xuất.']);

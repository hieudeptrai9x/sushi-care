<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\AiSettings;
use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;
use SushiCare\Lib\Secret;

$userId = Auth::userId();
Auth::requireAdmin();
$settings = AiSettings::load(db(), $userId, $config['app_key']);
$settings['api_key'] = Secret::mask($settings['api_key']);
Response::json($settings);

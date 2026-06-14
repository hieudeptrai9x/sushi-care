<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use SushiCare\Lib\Auth;
use SushiCare\Lib\Response;
use SushiCare\Lib\Validator;

require_method('POST');
$userId = Auth::userId();
Auth::verifyCsrf();
$data = input();
$name = Validator::requiredString($data, 'name', 120);
$birthDate = date_create_from_format('Y-m-d', (string) ($data['birth_date'] ?? ''));
if (!$birthDate) {
    Response::error('Ngày sinh không hợp lệ.', 422);
}
$gender = in_array($data['gender'] ?? '', ['female', 'male', 'other'], true) ? $data['gender'] : 'other';
$stmt = db()->prepare(
    'UPDATE babies SET name=?, nickname=?, birth_date=?, gender=?, birth_weight=?, birth_length=?, note=? WHERE user_id=?'
);
$stmt->execute([
    $name,
    trim((string) ($data['nickname'] ?? '')) ?: null,
    $birthDate->format('Y-m-d'),
    $gender,
    ($data['birth_weight'] ?? '') !== '' ? (float) $data['birth_weight'] : null,
    ($data['birth_length'] ?? '') !== '' ? (float) $data['birth_length'] : null,
    trim((string) ($data['note'] ?? '')) ?: null,
    $userId,
]);
Response::json(['message' => 'Đã lưu hồ sơ bé.']);

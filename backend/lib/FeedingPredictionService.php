<?php

declare(strict_types=1);

namespace SushiCare\Lib;

use DateTimeImmutable;
use PDO;

final class FeedingPredictionService
{
    private const FEEDING_SUBTYPES = ['breast_direct', 'breast_bottle', 'formula', 'bottle', 'breastfeeding', 'breast'];

    public static function calculate(array $rows, ?DateTimeImmutable $now = null): ?array
    {
        $now ??= new DateTimeImmutable('now');
        $feedings = [];
        foreach ($rows as $row) {
            if (!in_array((string) ($row['subtype'] ?? ''), self::FEEDING_SUBTYPES, true)) {
                continue;
            }
            $meta = json_decode((string) ($row['meta_json'] ?? ''), true);
            if (in_array($meta['status'] ?? '', ['running', 'paused'], true)) {
                continue;
            }
            $timestamp = strtotime((string) ($row['start_time'] ?? ''));
            if ($timestamp !== false) {
                $feedings[] = $timestamp;
            }
        }
        sort($feedings);
        $feedings = array_slice($feedings, -30);
        if (count($feedings) < 2) {
            return null;
        }

        $intervals = [];
        $recentBoundary = $now->modify('-7 days')->getTimestamp();
        for ($index = 1, $count = count($feedings); $index < $count; $index++) {
            $minutes = (int) round(($feedings[$index] - $feedings[$index - 1]) / 60);
            if ($minutes < 30 || $minutes > 720) {
                continue;
            }
            $intervals[] = [
                'minutes' => $minutes,
                'segment' => self::segment($feedings[$index]),
                'recent' => $feedings[$index] >= $recentBoundary,
                'order' => $index,
            ];
        }
        if ($intervals === []) {
            return null;
        }
        $recentIntervals = array_slice(array_column($intervals, 'minutes'), -15);
        $recentAverage = (int) round(array_sum($recentIntervals) / max(1, count($recentIntervals)));

        $lastFeeding = end($feedings);
        $segment = self::segment($lastFeeding);
        $segmented = array_values(array_filter($intervals, fn (array $item): bool => $item['segment'] === $segment));
        $selected = count($segmented) >= 2 ? $segmented : $intervals;

        $weightedSum = 0.0;
        $weightTotal = 0.0;
        foreach ($selected as $position => $item) {
            $weight = 1 + (($position + 1) / max(1, count($selected)));
            if ($item['recent']) {
                $weight *= 2;
            }
            $weightedSum += $item['minutes'] * $weight;
            $weightTotal += $weight;
        }
        $average = (int) round($weightedSum / $weightTotal);
        $variance = 0.0;
        foreach ($selected as $item) {
            $variance += ($item['minutes'] - $average) ** 2;
        }
        $deviation = sqrt($variance / count($selected));
        $variationPenalty = min(35, (int) round(($deviation / max(1, $average)) * 100));
        $confidence = max(35, min(95, 46 + count($selected) * 9 - $variationPenalty + (count(array_filter($selected, fn (array $item): bool => $item['recent'])) >= 2 ? 8 : 0)));
        if (count($segmented) < 2) {
            $confidence = max(35, $confidence - 12);
        }

        return [
            'predicted_time' => date('Y-m-d H:i:s', $lastFeeding + ($average * 60)),
            'average_interval_minutes' => $average,
            'recent_average_interval_minutes' => $recentAverage,
            'recent_average_sample_size' => count($recentIntervals),
            'confidence' => $confidence,
            'last_feeding_time' => date('Y-m-d H:i:s', $lastFeeding),
            'sample_size' => count($selected) + 1,
            'segment' => $segment,
        ];
    }

    public static function predictForBaby(PDO $db, int $babyId): ?array
    {
        $stmt = $db->prepare(
            "SELECT start_time,subtype,meta_json
             FROM activities
             WHERE baby_id=? AND type='feeding' AND subtype<>'pump'
             ORDER BY start_time DESC LIMIT 30"
        );
        $stmt->execute([$babyId]);
        return self::calculate(array_reverse($stmt->fetchAll()));
    }

    public static function refreshForBaby(PDO $db, int $babyId): ?array
    {
        $prediction = self::predictForBaby($db, $babyId);
        if ($prediction === null) {
            return null;
        }
        $stmt = $db->prepare(
            'INSERT INTO feeding_predictions (baby_id,predicted_time,confidence,average_interval_minutes)
             VALUES (?,?,?,?)'
        );
        $stmt->execute([
            $babyId,
            $prediction['predicted_time'],
            $prediction['confidence'],
            $prediction['average_interval_minutes'],
        ]);
        $prediction['id'] = (int) $db->lastInsertId();
        return $prediction;
    }

    private static function segment(int $timestamp): string
    {
        $hour = (int) date('G', $timestamp);
        return $hour >= 6 && $hour <= 21 ? 'day' : 'night';
    }
}

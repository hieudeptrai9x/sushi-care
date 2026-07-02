<?php

declare(strict_types=1);

namespace SushiCare\Lib;

use DateTimeImmutable;
use PDO;

final class FeedingPredictionService
{
    private const FEEDING_SUBTYPES = ['breast_direct', 'breast_bottle', 'formula', 'bottle', 'breastfeeding', 'breast'];
    private const MAX_VOLUME_ADJUSTMENT_MINUTES = 45;
    private const VOLUME_INTERVAL_WEIGHT = 0.6;

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
                $feedings[] = [
                    'timestamp' => $timestamp,
                    'amount_ml' => self::amount($row['amount_ml'] ?? null),
                ];
            }
        }
        usort($feedings, fn (array $a, array $b): int => $a['timestamp'] <=> $b['timestamp']);
        $feedings = array_slice($feedings, -30);
        if (count($feedings) < 2) {
            return null;
        }

        $intervals = [];
        $recentBoundary = $now->modify('-7 days')->getTimestamp();
        for ($index = 1, $count = count($feedings); $index < $count; $index++) {
            $minutes = (int) round(($feedings[$index]['timestamp'] - $feedings[$index - 1]['timestamp']) / 60);
            if ($minutes < 30 || $minutes > 720) {
                continue;
            }
            $intervals[] = [
                'minutes' => $minutes,
                'segment' => self::segment($feedings[$index]['timestamp']),
                'recent' => $feedings[$index]['timestamp'] >= $recentBoundary,
                'order' => $index,
            ];
        }
        if ($intervals === []) {
            return null;
        }

        $lastFeeding = end($feedings);
        $segment = self::segment($lastFeeding['timestamp']);
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
        $volume = self::volumeAdjustment($feedings, $average);
        $adjustedAverage = max(30, min(720, $average + $volume['adjustment_minutes']));
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
        if ($volume['adjustment_minutes'] !== 0) {
            $confidence = min(95, $confidence + 4);
        }

        return [
            'predicted_time' => date('Y-m-d H:i:s', $lastFeeding['timestamp'] + ($adjustedAverage * 60)),
            'average_interval_minutes' => $adjustedAverage,
            'base_interval_minutes' => $average,
            'volume_adjustment_minutes' => $volume['adjustment_minutes'],
            'last_amount_ml' => $volume['last_amount_ml'],
            'average_amount_ml' => $volume['average_amount_ml'],
            'confidence' => $confidence,
            'last_feeding_time' => date('Y-m-d H:i:s', $lastFeeding['timestamp']),
            'sample_size' => count($selected) + 1,
            'segment' => $segment,
        ];
    }

    public static function predictForBaby(PDO $db, int $babyId): ?array
    {
        $stmt = $db->prepare(
            "SELECT start_time,subtype,amount_ml,meta_json
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

    private static function amount(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }
        $amount = (float) $value;
        return $amount > 0 ? $amount : null;
    }

    /**
     * Treat milk volume as a bounded correction, not the whole prediction.
     * A larger-than-usual bottle gently stretches the next interval; a small
     * bottle pulls it closer. Direct breastfeeding without ml keeps the old
     * time-pattern-only behavior.
     */
    private static function volumeAdjustment(array $feedings, int $baseInterval): array
    {
        $last = end($feedings);
        $lastAmount = self::amount($last['amount_ml'] ?? null);
        if ($lastAmount === null) {
            return ['adjustment_minutes' => 0, 'last_amount_ml' => null, 'average_amount_ml' => null];
        }

        $previousAmounts = [];
        $previousFeedings = array_slice($feedings, 0, -1);
        foreach (array_slice($previousFeedings, -12) as $feeding) {
            $amount = self::amount($feeding['amount_ml'] ?? null);
            if ($amount !== null) {
                $previousAmounts[] = $amount;
            }
        }
        if (count($previousAmounts) < 2) {
            return ['adjustment_minutes' => 0, 'last_amount_ml' => $lastAmount, 'average_amount_ml' => null];
        }

        $weightedSum = 0.0;
        $weightTotal = 0.0;
        foreach ($previousAmounts as $index => $amount) {
            $weight = 1 + (($index + 1) / count($previousAmounts));
            $weightedSum += $amount * $weight;
            $weightTotal += $weight;
        }
        $averageAmount = $weightedSum / $weightTotal;
        if ($averageAmount < 20) {
            return ['adjustment_minutes' => 0, 'last_amount_ml' => $lastAmount, 'average_amount_ml' => round($averageAmount, 1)];
        }

        $ratioDelta = ($lastAmount / $averageAmount) - 1;
        $rawAdjustment = (int) round($baseInterval * $ratioDelta * self::VOLUME_INTERVAL_WEIGHT);
        $adjustment = max(-self::MAX_VOLUME_ADJUSTMENT_MINUTES, min(self::MAX_VOLUME_ADJUSTMENT_MINUTES, $rawAdjustment));

        return [
            'adjustment_minutes' => $adjustment,
            'last_amount_ml' => $lastAmount,
            'average_amount_ml' => round($averageAmount, 1),
        ];
    }
}

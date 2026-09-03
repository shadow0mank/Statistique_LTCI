<?php
/**
 * LOTTO CI ANALYTICS - DataNormalizer.php
 * Normalisation des dates, heures et noms de tirages LONACI
 */

class DataNormalizer {
    public static function normalizeDate($rawDate, $year) {
        // Parse date such as "mercredi 02/09"
        if (preg_match('/(\d{1,2})\/(\d{1,2})/', $rawDate, $matches)) {
            $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            $month = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
            return "$year-$month-$day";
        }
        return $rawDate;
    }

    public static function normalizeNumbersString($numStr) {
        if (empty($numStr) || $numStr === '. - . - . - . - .') {
            return [];
        }
        $parts = explode('-', $numStr);
        $balls = [];
        foreach ($parts as $p) {
            $val = intval(trim($p));
            if ($val > 0) {
                $balls[] = $val;
            }
        }
        return $balls;
    }

    public static function extractHourFromNameOrSlot($drawName, $slotIndex, $isNight = false) {
        // Look for pattern like "Digital Reveil 7h" or "Digital 21h"
        if (preg_match('/(\d{1,2})h/i', $drawName, $m)) {
            return str_pad($m[1], 2, '0', STR_PAD_LEFT) . ':00';
        }

        // Standard LONACI scheduled draw slots
        $standardSlots = [
            0 => '10:00', // Premiere Heure, La Matinale, Kado, Akwaba...
            1 => '13:00', // Fortune, Emergence, Privilege, Etoile...
            2 => '16:00', // Baraka, Sika, Monni, Monday Special...
            3 => '18:00', // Afterwork
            4 => '19:00', // Midweek, Lucky Tuesday, Fortune Thursday, National...
        ];

        return $standardSlots[$slotIndex] ?? '10:00';
    }
}

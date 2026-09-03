<?php
/**
 * LOTTO CI ANALYTICS - DataValidator.php
 * Contrôle qualité strict: 5 numéros distincts entre 1 et 90 + calcul empreinte SHA-256
 */

class DataValidator {
    public static function validateDraw($date, $time, $gameName, array $balls) {
        $errors = [];

        // 1. Vérification du nombre de boules
        if (count($balls) !== 5) {
            $errors[] = "Le tirage doit comporter exactement 5 numéros gagnants (reçu: " . count($balls) . ")";
        }

        // 2. Vérification des bornes (1 à 90)
        foreach ($balls as $ball) {
            if (!is_numeric($ball) || $ball < 1 || $ball > 90) {
                $errors[] = "Numéro hors limites (1 à 90): '$ball'";
            }
        }

        // 3. Vérification de l'unicité des numéros dans la même combinaison
        if (count(array_unique($balls)) !== count($balls)) {
            $errors[] = "Numéros doublons détectés dans la combinaison gagnante: " . implode(', ', $balls);
        }

        // 4. Vérification du format de l'heure
        if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $time)) {
            $errors[] = "Format de l'heure invalide: '$time'";
        }

        // 5. Calcul du Hash Cryptographique SHA-256
        $hashInput = sprintf('%s-%s-%s-%s', $date, $time, $gameName, implode(',', $balls));
        $sha256 = hash('sha256', $hashInput);

        return [
            'isValid' => empty($errors),
            'errors' => $errors,
            'sha256' => $sha256,
            'sum' => array_sum($balls),
            'evenCount' => count(array_filter($balls, fn($n) => $n % 2 === 0)),
            'oddCount' => count(array_filter($balls, fn($n) => $n % 2 !== 0)),
        ];
    }
}

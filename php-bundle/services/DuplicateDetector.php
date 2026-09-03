<?php
/**
 * LOTTO CI ANALYTICS - DuplicateDetector.php & HourDetector.php
 */

class DuplicateDetector {
    private $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function checkDuplicate($date, $time, $gameName, $sha256) {
        // Check by unique slot
        $stmt = $this->pdo->prepare("SELECT id, status FROM draws WHERE draw_date = ? AND draw_time = ? AND game_name = ? LIMIT 1");
        $stmt->execute([$date, $time, $gameName]);
        $existing = $stmt->fetch();

        if ($existing) {
            return ['isDuplicate' => true, 'existingId' => $existing['id'], 'reason' => 'Tirage déjà enregistré pour ce créneau'];
        }

        // Check by hash
        $stmtHash = $this->pdo->prepare("SELECT id FROM draws WHERE sha256_hash = ? LIMIT 1");
        $stmtHash->execute([$sha256]);
        $existingHash = $stmtHash->fetch();

        if ($existingHash) {
            return ['isDuplicate' => true, 'existingId' => $existingHash['id'], 'reason' => 'Empreinte SHA-256 identique déjà présente'];
        }

        return ['isDuplicate' => false];
    }
}

class HourDetector {
    private $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Analyse l'historique complet et met à jour dynamiquement la table detected_hours
     */
    public function syncDetectedHours() {
        // Group all distinct hours from draws table
        $sql = "
            SELECT 
                draw_time, 
                COUNT(*) as draw_count, 
                MIN(draw_date) as first_seen, 
                MAX(draw_date) as last_seen 
            FROM draws 
            GROUP BY draw_time 
            ORDER BY draw_time ASC
        ";
        $stmt = $this->pdo->query($sql);
        $hours = $stmt->fetchAll();

        $upsertStmt = $this->pdo->prepare("
            INSERT INTO detected_hours (hour_value, draw_count, first_seen_date, last_seen_date, is_active, slot_label)
            VALUES (?, ?, ?, ?, 1, ?)
            ON DUPLICATE KEY UPDATE
                draw_count = VALUES(draw_count),
                first_seen_date = VALUES(first_seen_date),
                last_seen_date = VALUES(last_seen_date),
                is_active = 1,
                slot_label = VALUES(slot_label)
        ");

        $detectedCount = 0;
        foreach ($hours as $row) {
            $h = $row['draw_time'];
            $label = $this->determineSlotLabel($h);
            $upsertStmt->execute([
                $h,
                $row['draw_count'],
                $row['first_seen'],
                $row['last_seen'],
                $label
            ]);
            $detectedCount++;
        }

        return $detectedCount;
    }

    private function determineSlotLabel($timeStr) {
        $parts = explode(':', $timeStr);
        $h = intval($parts[0] ?? 0);
        if ($h >= 21 || $h < 6) return 'Nocturne / Digital';
        if ($h >= 6 && $h <= 8) return 'Digital Réveil';
        if ($h === 10) return 'Matinée';
        if ($h === 13) return 'Midi';
        if ($h === 16) return 'Après-midi';
        if ($h === 18) return 'Afterwork';
        if ($h === 19 || $h === 20) return 'Soirée';
        return 'Tirage Standard';
    }
}

<?php
/**
 * LOTTO CI ANALYTICS - StatisticsEngine.php
 * Moteur statistique multicritère stricte par heure de jeu (Scores 0 à 100)
 */

class StatisticsEngine {
    private $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Calcule le classement statistique des 90 numéros pour une heure de jeu spécifique
     */
    public function calculateForHour($hour, array $weights = []) {
        $w_history = $weights['history24M'] ?? 30;
        $w_trend   = $weights['recentTrend'] ?? 20;
        $w_gap     = $weights['gap90d'] ?? 15;
        $w_stab    = $weights['stability6M'] ?? 15;
        $w_hour    = $weights['hourlyFreq'] ?? 20;

        // Fetch all draws for this specific hour
        $stmt = $this->pdo->prepare("SELECT id, draw_date, ball_1, ball_2, ball_3, ball_4, ball_5 FROM draws WHERE draw_time = ? ORDER BY draw_date DESC, id DESC");
        $stmt->execute([$hour]);
        $draws = $stmt->fetchAll();

        $totalDraws = count($draws);
        if ($totalDraws === 0) {
            return [];
        }

        $results = [];
        $expectedFreq = (5.0 / 90.0) * $totalDraws;

        for ($num = 1; $num <= 90; $num++) {
            $appearances = 0;
            $currentGap = -1;
            $maxGap = 0;
            $runningGap = 0;
            $recent30dCount = 0;

            foreach ($draws as $idx => $d) {
                $hasNumber = ($d['ball_1'] == $num || $d['ball_2'] == $num || $d['ball_3'] == $num || $d['ball_4'] == $num || $d['ball_5'] == $num);
                if ($hasNumber) {
                    $appearances++;
                    if ($currentGap === -1) {
                        $currentGap = $runningGap;
                    }
                    if ($runningGap > $maxGap) {
                        $maxGap = $runningGap;
                    }
                    $runningGap = 0;
                    if ($idx < 30) {
                        $recent30dCount++;
                    }
                } else {
                    $runningGap++;
                }
            }

            if ($currentGap === -1) $currentGap = $runningGap;
            if ($runningGap > $maxGap) $maxGap = $runningGap;

            $freqPct = round(($appearances / $totalDraws) * 100, 2);

            // Trend
            $recentExpected = (5.0 / 90.0) * min(30, $totalDraws);
            $trend = 'stable';
            if ($recent30dCount > $recentExpected * 1.25) $trend = 'up';
            else if ($recent30dCount < $recentExpected * 0.75) $trend = 'down';

            // Criteria scores normalized to 100
            $c1_vol = min(100, max(0, ($appearances / max(1, $expectedFreq * 1.5)) * 100));
            $c2_tr  = ($trend === 'up' ? 95 : ($trend === 'stable' ? 65 : 35));
            $c3_gp  = min(100, max(0, (1 - min($currentGap, 35) / 35) * 100));
            $c4_reg = $maxGap > 0 ? min(100, max(20, (1 - $maxGap / 80) * 100)) : 50;
            $c5_fr  = min(100, ($freqPct / 12) * 100);

            $totalW = $w_history + $w_trend + $w_gap + $w_stab + $w_hour;
            $score = round(($c1_vol * $w_history + $c2_tr * $w_trend + $c3_gp * $w_gap + $c4_reg * $w_stab + $c5_fr * $w_hour) / max(1, $totalW));
            $score = max(15, min(99, $score));

            $results[] = [
                'number' => $num,
                'hour' => $hour,
                'appearances' => $appearances,
                'total_draws' => $totalDraws,
                'frequency_percent' => $freqPct,
                'current_gap' => $currentGap,
                'max_gap' => $maxGap,
                'trend' => $trend,
                'score' => $score,
                'is_high_score' => ($score >= 90)
            ];
        }

        // Sort descending by score
        usort($results, fn($a, $b) => $b['score'] <=> $a['score']);
        return $results;
    }
}

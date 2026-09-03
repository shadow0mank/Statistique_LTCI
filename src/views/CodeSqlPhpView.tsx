import { useState } from 'react';
import { Code2, Database, Copy, CheckCircle2, Download, Terminal, Server, FileText } from 'lucide-react';

export default function CodeSqlPhpView() {
  const [activeTab, setActiveTab] = useState<'sql' | 'php-db' | 'php-engine' | 'wamp-guide'>('sql');
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- ==============================================================================
-- LOTTO CI ANALYTICS - Schéma de Base de Données MySQL (Production)
-- Plateforme Analytique & Moteur Statistique pour Tirages LONACI
-- Compatible: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+, WAMP, XAMPP, Laragon
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS \`lotto_ci_analytics\`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE \`lotto_ci_analytics\`;

-- 1. Table des Tirages Enregistrés (draws)
DROP TABLE IF EXISTS \`draws\`;
CREATE TABLE \`draws\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`draw_number\` INT UNSIGNED NOT NULL,
  \`game_code\` VARCHAR(50) NOT NULL,
  \`game_name\` VARCHAR(100) NOT NULL,
  \`draw_date\` DATE NOT NULL,
  \`draw_time\` TIME NOT NULL,
  \`ball_1\` TINYINT UNSIGNED NOT NULL,
  \`ball_2\` TINYINT UNSIGNED NOT NULL,
  \`ball_3\` TINYINT UNSIGNED NOT NULL,
  \`ball_4\` TINYINT UNSIGNED NOT NULL,
  \`ball_5\` TINYINT UNSIGNED NOT NULL,
  \`machine_1\` TINYINT UNSIGNED NULL,
  \`machine_2\` TINYINT UNSIGNED NULL,
  \`machine_3\` TINYINT UNSIGNED NULL,
  \`machine_4\` TINYINT UNSIGNED NULL,
  \`machine_5\` TINYINT UNSIGNED NULL,
  \`sum_balls\` SMALLINT UNSIGNED NOT NULL,
  \`even_count\` TINYINT UNSIGNED NOT NULL,
  \`odd_count\` TINYINT UNSIGNED NOT NULL,
  \`max_gap\` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  \`sha256_hash\` CHAR(64) NOT NULL,
  \`source\` VARCHAR(100) NOT NULL DEFAULT 'lotobonheur.ci',
  \`source_url\` VARCHAR(255) NULL,
  \`status\` ENUM('CONFORME', 'A_VERIFIER', 'DUPLICATE', 'ERREUR') NOT NULL DEFAULT 'CONFORME',
  \`verification_notes\` VARCHAR(255) NULL,
  \`retrieved_at\` DATETIME NOT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_draw_slot\` (\`draw_date\`, \`draw_time\`, \`game_name\`),
  KEY \`idx_draw_date\` (\`draw_date\`),
  KEY \`idx_draw_time\` (\`draw_time\`),
  KEY \`idx_game_code\` (\`game_code\`),
  KEY \`idx_status\` (\`status\`),
  KEY \`idx_sha256\` (\`sha256_hash\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table des Heures Détectées (detected_hours)
DROP TABLE IF EXISTS \`detected_hours\`;
CREATE TABLE \`detected_hours\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`hour_value\` TIME NOT NULL,
  \`draw_count\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`slot_label\` VARCHAR(100) NULL,
  \`first_seen_date\` DATE NULL,
  \`last_seen_date\` DATE NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_hour_value\` (\`hour_value\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table des Statistiques par Heure (ball_statistics_hourly)
DROP TABLE IF EXISTS \`ball_statistics_hourly\`;
CREATE TABLE \`ball_statistics_hourly\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`ball_number\` TINYINT UNSIGNED NOT NULL,
  \`hour_value\` TIME NOT NULL,
  \`total_draws_at_hour\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`appearances\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`frequency_percent\` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  \`current_gap\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`max_gap\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`trend\` ENUM('up', 'stable', 'down') NOT NULL DEFAULT 'stable',
  \`statistical_score\` TINYINT UNSIGNED NOT NULL DEFAULT 50,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_ball_hour\` (\`ball_number\`, \`hour_value\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  const phpDbCode = `<?php
/**
 * LOTTO CI ANALYTICS - Configuration de Base de Données MySQL (PDO)
 * Compatible WAMP (C:\\wamp64\\www), XAMPP (C:\\xampp\\htdocs), Laragon (C:\\laragon\\www)
 */

class Database {
    private static $host = '127.0.0.1';
    private static $port = '3306';
    private static $db_name = 'lotto_ci_analytics';
    private static $username = 'root';
    private static $password = '';
    private static $conn = null;

    public static function getConnection() {
        if (self::$conn === null) {
            try {
                $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$db_name . ";charset=utf8mb4";
                self::$conn = new PDO($dsn, self::$username, self::$password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                die(json_encode([
                    'success' => false,
                    'error' => 'Échec de connexion MySQL: ' . $e->getMessage(),
                ]));
            }
        }
        return self::$conn;
    }
}`;

  const phpEngineCode = `<?php
/**
 * LOTTO CI ANALYTICS - StatisticsEngine.php
 * Moteur statistique multicritère stricte par heure de jeu (Scores 0 à 100)
 */

class StatisticsEngine {
    private $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function calculateForHour($hour, array $weights = []) {
        $w_history = $weights['history24M'] ?? 30;
        $w_trend   = $weights['recentTrend'] ?? 20;
        $w_gap     = $weights['gap90d'] ?? 15;
        $w_stab    = $weights['stability6M'] ?? 15;
        $w_hour    = $weights['hourlyFreq'] ?? 20;

        $stmt = $this->pdo->prepare("SELECT ball_1, ball_2, ball_3, ball_4, ball_5 FROM draws WHERE draw_time = ?");
        $stmt->execute([$hour]);
        $draws = $stmt->fetchAll();

        $total = count($draws);
        if ($total === 0) return [];

        $results = [];
        for ($num = 1; $num <= 90; $num++) {
            $hits = 0;
            foreach ($draws as $d) {
                if ($d['ball_1'] == $num || $d['ball_2'] == $num || $d['ball_3'] == $num || $d['ball_4'] == $num || $d['ball_5'] == $num) {
                    $hits++;
                }
            }
            $freq = round(($hits / $total) * 100, 2);
            $score = round(($hits / max(1, (5/90)*$total*1.3)) * 70 + ($freq / 12) * 30);
            $score = max(15, min(99, $score));

            $results[] = [
                'number' => $num,
                'hour' => $hour,
                'appearances' => $hits,
                'frequency_percent' => $freq,
                'score' => $score,
                'is_high_score' => ($score >= 90)
            ];
        }
        usort($results, fn($a, $b) => $b['score'] <=> $a['score']);
        return $results;
    }
}`;

  const currentCode =
    activeTab === 'sql'
      ? sqlCode
      : activeTab === 'php-db'
      ? phpDbCode
      : activeTab === 'php-engine'
      ? phpEngineCode
      : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSQL = () => {
    const blob = new Blob([sqlCode], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'database_schema.sql';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#171f33] p-5 rounded-xl border border-[#222a3d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#4edea3]" />
            <h2 className="font-sans text-lg text-[#dae2fd] font-bold">
              Code SQL &amp; Architecture PHP MVC (WAMP / XAMPP / Laragon)
            </h2>
            <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
              Export Développeur
            </span>
          </div>
          <p className="font-sans text-xs text-[#bbcabf] mt-1">
            Scripts prêts à l'emploi pour déployer la base MySQL et le backend PHP sur votre environnement local.
          </p>
        </div>

        <button
          onClick={handleDownloadSQL}
          className="bg-[#10b981] hover:bg-[#4edea3] text-[#003824] px-4 py-2.5 rounded-lg font-mono text-xs font-bold transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Télécharger schema.sql</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222a3d] pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('sql')}
          className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'sql'
              ? 'bg-[#10b981] text-[#003824]'
              : 'text-[#bbcabf] hover:bg-[#222a3d] hover:text-[#dae2fd]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>database/schema.sql</span>
        </button>

        <button
          onClick={() => setActiveTab('php-db')}
          className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'php-db'
              ? 'bg-[#10b981] text-[#003824]'
              : 'text-[#bbcabf] hover:bg-[#222a3d] hover:text-[#dae2fd]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>config/database.php</span>
        </button>

        <button
          onClick={() => setActiveTab('php-engine')}
          className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'php-engine'
              ? 'bg-[#10b981] text-[#003824]'
              : 'text-[#bbcabf] hover:bg-[#222a3d] hover:text-[#dae2fd]'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>services/StatisticsEngine.php</span>
        </button>

        <button
          onClick={() => setActiveTab('wamp-guide')}
          className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'wamp-guide'
              ? 'bg-[#10b981] text-[#003824]'
              : 'text-[#bbcabf] hover:bg-[#222a3d] hover:text-[#dae2fd]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Guide WAMP / Laragon</span>
        </button>
      </div>

      {/* Code Viewer */}
      {activeTab !== 'wamp-guide' ? (
        <div className="bg-[#131b2e] rounded-xl border border-[#222a3d] overflow-hidden shadow-lg">
          <div className="p-3 bg-[#060e20] border-b border-[#222a3d] flex items-center justify-between font-mono text-xs">
            <span className="text-[#dae2fd] font-bold">
              {activeTab === 'sql'
                ? 'database/schema.sql'
                : activeTab === 'php-db'
                ? 'php-bundle/config/database.php'
                : 'php-bundle/services/StatisticsEngine.php'}
            </span>

            <button
              onClick={handleCopy}
              className="bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
                  <span className="text-[#4edea3]">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#7bd0ff]" />
                  <span>Copier le code</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-[#bbcabf] overflow-x-auto max-h-[600px] leading-relaxed select-all">
            <code>{currentCode}</code>
          </pre>
        </div>
      ) : (
        /* Setup Guide */
        <div className="bg-[#171f33] p-6 rounded-xl border border-[#222a3d] space-y-5 font-mono text-xs text-[#bbcabf]">
          <h3 className="font-sans text-base text-[#dae2fd] font-bold">
            Guide Pas-à-Pas de Déploiement Local (WAMP / Laragon / XAMPP)
          </h3>

          <div className="space-y-4">
            <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] space-y-2">
              <span className="text-[#4edea3] font-bold block text-sm">
                1. Importation du Schéma MySQL
              </span>
              <p className="font-sans">
                Ouvrez phpMyAdmin (<code className="text-[#dae2fd]">http://localhost/phpmyadmin</code>) ou votre invite de commande MySQL :
              </p>
              <div className="bg-[#060e20] p-2.5 rounded text-[#7bd0ff]">
                mysql -u root -p &lt; database/schema.sql
              </div>
            </div>

            <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] space-y-2">
              <span className="text-[#4edea3] font-bold block text-sm">
                2. Emplacement des Fichiers
              </span>
              <p className="font-sans">
                Copiez le dossier complet dans le répertoire web racine de votre serveur :
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#dae2fd]">
                <li><strong>Laragon :</strong> C:\laragon\www\lotto-ci-analytics</li>
                <li><strong>WampServer :</strong> C:\wamp64\www\lotto-ci-analytics</li>
                <li><strong>XAMPP :</strong> C:\xampp\htdocs\lotto-ci-analytics</li>
              </ul>
            </div>

            <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] space-y-2">
              <span className="text-[#4edea3] font-bold block text-sm">
                3. Tâche Planifiée (Cron)
              </span>
              <p className="font-sans">
                Activez la synchronisation bi-quotidienne avec le planificateur de tâches Windows ou la crontab Linux :
              </p>
              <div className="bg-[#060e20] p-2.5 rounded text-[#ffdbca]">
                05 10,23 * * * /usr/bin/php /var/www/lotto-ci-analytics/php-bundle/api/sync.php
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

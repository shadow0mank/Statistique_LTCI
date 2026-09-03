-- ==============================================================================
-- LOTTO CI ANALYTICS - Schéma de Base de Données MySQL (Production)
-- Plateforme Analytique & Moteur Statistique pour Tirages LONACI
-- Compatible: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+, WAMP, XAMPP, Laragon
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `lotto_ci_analytics`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `lotto_ci_analytics`;

-- ------------------------------------------------------------------------------
-- 1. Table des Tirages Enregistrés (draws)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `draws`;
CREATE TABLE `draws` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `draw_number` INT UNSIGNED NOT NULL,
  `game_code` VARCHAR(50) NOT NULL,
  `game_name` VARCHAR(100) NOT NULL,
  `draw_date` DATE NOT NULL,
  `draw_time` TIME NOT NULL,
  `ball_1` TINYINT UNSIGNED NOT NULL,
  `ball_2` TINYINT UNSIGNED NOT NULL,
  `ball_3` TINYINT UNSIGNED NOT NULL,
  `ball_4` TINYINT UNSIGNED NOT NULL,
  `ball_5` TINYINT UNSIGNED NOT NULL,
  `machine_1` TINYINT UNSIGNED NULL,
  `machine_2` TINYINT UNSIGNED NULL,
  `machine_3` TINYINT UNSIGNED NULL,
  `machine_4` TINYINT UNSIGNED NULL,
  `machine_5` TINYINT UNSIGNED NULL,
  `sum_balls` SMALLINT UNSIGNED NOT NULL,
  `even_count` TINYINT UNSIGNED NOT NULL,
  `odd_count` TINYINT UNSIGNED NOT NULL,
  `max_gap` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `sha256_hash` CHAR(64) NOT NULL,
  `source` VARCHAR(100) NOT NULL DEFAULT 'lotobonheur.ci',
  `source_url` VARCHAR(255) NULL,
  `status` ENUM('CONFORME', 'A_VERIFIER', 'DUPLICATE', 'ERREUR') NOT NULL DEFAULT 'CONFORME',
  `verification_notes` VARCHAR(255) NULL,
  `retrieved_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_draw_slot` (`draw_date`, `draw_time`, `game_name`),
  KEY `idx_draw_date` (`draw_date`),
  KEY `idx_draw_time` (`draw_time`),
  KEY `idx_game_code` (`game_code`),
  KEY `idx_status` (`status`),
  KEY `idx_sha256` (`sha256_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table des Heures de Jeu Détectées Dynamiquement (detected_hours)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `detected_hours`;
CREATE TABLE `detected_hours` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `hour_value` TIME NOT NULL,
  `draw_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `slot_label` VARCHAR(100) NULL,
  `first_seen_date` DATE NULL,
  `last_seen_date` DATE NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_hour_value` (`hour_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table des Statistiques par Numéro et par Heure (ball_statistics_hourly)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `ball_statistics_hourly`;
CREATE TABLE `ball_statistics_hourly` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ball_number` TINYINT UNSIGNED NOT NULL,
  `hour_value` TIME NOT NULL,
  `total_draws_at_hour` INT UNSIGNED NOT NULL DEFAULT 0,
  `appearances` INT UNSIGNED NOT NULL DEFAULT 0,
  `frequency_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `current_gap` INT UNSIGNED NOT NULL DEFAULT 0,
  `max_gap` INT UNSIGNED NOT NULL DEFAULT 0,
  `trend` ENUM('up', 'stable', 'down') NOT NULL DEFAULT 'stable',
  `statistical_score` TINYINT UNSIGNED NOT NULL DEFAULT 50,
  `is_high_score` TINYINT(1) GENERATED ALWAYS AS (`statistical_score` >= 90) STORED,
  `calculated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ball_hour` (`ball_number`, `hour_value`),
  KEY `idx_hour_score` (`hour_value`, `statistical_score`),
  KEY `idx_ball` (`ball_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table du Journal d'Audit des Synchronisations (synchronization_logs)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `synchronization_logs`;
CREATE TABLE `synchronization_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sync_started_at` DATETIME NOT NULL,
  `sync_ended_at` DATETIME NOT NULL,
  `source_name` VARCHAR(100) NOT NULL,
  `total_scraped` INT UNSIGNED NOT NULL DEFAULT 0,
  `new_inserted` INT UNSIGNED NOT NULL DEFAULT 0,
  `duplicates_found` INT UNSIGNED NOT NULL DEFAULT 0,
  `errors_found` INT UNSIGNED NOT NULL DEFAULT 0,
  `to_verify_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `detected_hours_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `duration_ms` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('SUCCESS', 'WARNING', 'ERROR') NOT NULL,
  `log_details` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sync_date` (`sync_started_at`),
  KEY `idx_sync_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table des Sources de Données (data_sources)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `data_sources`;
CREATE TABLE `data_sources` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `source_name` VARCHAR(100) NOT NULL,
  `source_url` VARCHAR(255) NOT NULL,
  `priority` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_status_code` SMALLINT UNSIGNED NULL,
  `last_checked_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_source_url` (`source_url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Données Initiales de Configuration des Sources
-- ------------------------------------------------------------------------------
INSERT INTO `data_sources` (`source_name`, `source_url`, `priority`, `is_active`) VALUES
('LONACI Public Portal (lotobonheur.ci)', 'https://lotobonheur.ci/resultats', 1, 1),
('LONACI JSON API Gateway', 'https://lotobonheur.ci/api/results', 2, 1)
ON DUPLICATE KEY UPDATE `is_active` = 1;

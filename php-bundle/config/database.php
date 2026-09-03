<?php
/**
 * LOTTO CI ANALYTICS - Configuration de Base de Données MySQL (PDO)
 * Compatible WAMP (C:\wamp64\www), XAMPP (C:\xampp\htdocs), Laragon (C:\laragon\www)
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
                    'instructions' => 'Vérifiez que MySQL est démarré sur WAMP/XAMPP/Laragon et que schema.sql a été importé.'
                ]));
            }
        }
        return self::$conn;
    }
}

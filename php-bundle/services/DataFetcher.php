<?php
/**
 * LOTTO CI ANALYTICS - DataFetcher.php
 * Récupérateur officiel de résultats depuis lotobonheur.ci
 */

class DataFetcher {
    private $baseApiUrl = 'https://lotobonheur.ci/api/results';

    public function fetchMonthResults($monthYear = null) {
        $url = $this->baseApiUrl;
        if (!empty($monthYear)) {
            $url .= '?monthYear=' . urlencode($monthYear);
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode !== 200 || empty($response)) {
            throw new Exception("Erreur cURL lors de l'appel à la source lotobonheur.ci (Code: $httpCode): $error");
        }

        $data = json_decode($response, true);
        if (!$data || !isset($data['success']) || !$data['success']) {
            throw new Exception("Format de réponse invalide ou échec de l'API lotobonheur.ci");
        }

        return $data;
    }
}

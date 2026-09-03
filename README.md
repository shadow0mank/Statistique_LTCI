# LOTTO CI ANALYTICS

Plateforme d'analyse statistique et moteur de classement historique pour les tirages de la Loterie Nationale de Côte d'Ivoire (LONACI).

---

## ⚖️ AVERTISSEMENT LÉGAL ET CADRE DE CONFORMITÉ (NON-PRÉDICTION)

> **IMPORTANT :**
> - Les données et scores fournis par cette application sont des **analyses purement statistiques basées sur l'historique officiel**.
> - En aucun cas cette application ne prétend prédire l'avenir ou garantir un gain : les tirages de loterie sont strictement indépendants et régis par le hasard mathématique.
> - La mention d'un **Score statistique ≥ 90/100** signifie uniquement :
>   *« Ce numéro possède un score statistique de 90/100 ou plus selon les critères historiques analysés pour cette heure de jeu. »*

---

## 🏛️ PRINCIPE DE FONCTIONNEMENT DU SYSTÈME

L'architecture suit scrupuleusement la chaîne de traitement suivante :

$$\text{RÉCUPÉRER} \longrightarrow \text{CONTRÔLER} \longrightarrow \text{STOCKER} \longrightarrow \text{ANALYSER PAR HEURE} \longrightarrow \text{CLASSER}$$

1. **RÉCUPÉRER :** Collecte des résultats officiels depuis le portail LONACI (`lotobonheur.ci`).
2. **CONTRÔLER :** Vérification stricte des 5 numéros distincts (1 à 90), élimination des doublons et calcul de l'empreinte de sécurité **SHA-256**.
3. **STOCKER :** Archivage normalisé dans la base MySQL (ou stockage local haute performance).
4. **ANALYSER PAR HEURE :** Détection automatique des créneaux horaires réels (01h, 03h, 07h, 08h, 10h, 13h, 16h, 18h, 19h, 21h, 22h, 23h). Aucun créneau arbitraire ou codé en dur !
5. **CLASSER :** Calcul du score multicritère (0 à 100) spécifique à chaque heure de jeu.

---

## 💻 GUIDE D'INSTALLATION LOCALE (WAMP / XAMPP / LARAGON)

### Prérequis
- **PHP** : version 7.4, 8.0, 8.1 ou 8.2+ avec extensions `pdo_mysql`, `curl`, `json`, `mbstring`.
- **MySQL / MariaDB** : version 5.7+ ou 8.0+.
- **Serveur Web Local** : WampServer, XAMPP ou Laragon sous Windows / Linux / macOS.

---

### Étape 1 : Création et Importation de la Base de Données

1. Démarrez votre serveur MySQL depuis l'interface de WAMP / XAMPP / Laragon.
2. Ouvrez **phpMyAdmin** (`http://localhost/phpmyadmin`) ou votre console MySQL :
   ```bash
   mysql -u root -p
   ```
3. Créez la base de données et importez le schéma SQL officiel situé dans `database/schema.sql` :
   ```sql
   CREATE DATABASE IF NOT EXISTS `lotto_ci_analytics` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE `lotto_ci_analytics`;
   SOURCE database/schema.sql;
   ```

---

### Étape 2 : Déploiement des Fichiers

#### Option A : Utilisation avec Laragon (Recommandé pour la rapidité)
1. Copiez le dossier du projet dans `C:\laragon\www\lotto-ci-analytics`.
2. Laragon génère automatiquement le virtual host `http://lotto-ci-analytics.test`.
3. Vérifiez la configuration de la base dans `php-bundle/config/database.php` (identifiants par défaut `root` sans mot de passe).

#### Option B : Utilisation avec WampServer
1. Copiez le dossier dans `C:\wamp64\www\lotto-ci-analytics`.
2. Accédez à l'application via `http://localhost/lotto-ci-analytics`.

#### Option C : Utilisation avec XAMPP
1. Copiez le dossier dans `C:\xampp\htdocs\lotto-ci-analytics`.
2. Accédez à l'application via `http://localhost/lotto-ci-analytics`.

---

### Étape 3 : Automatisation de la Synchronisation (Tâche Planifiée / Cron)

Pour que votre base de données se synchronise automatiquement avec les nouveaux tirages de la LONACI :

- **Sous Linux (Crontab) :**
  ```bash
  # Synchronisation 2 fois par jour à 10h05 et 23h35
  05 10 * * * /usr/bin/php /var/www/lotto-ci-analytics/php-bundle/api/sync.php >> /var/log/lotto_sync.log 2>&1
  35 23 * * * /usr/bin/php /var/www/lotto-ci-analytics/php-bundle/api/sync.php >> /var/log/lotto_sync.log 2>&1
  ```

- **Sous Windows (Planificateur de tâches) :**
  Créez une tâche planifiée exécutant :
  - **Programme :** `C:\wamp64\bin\php\php8.x.x\php.exe` (ou chemin PHP XAMPP)
  - **Arguments :** `C:\wamp64\www\lotto-ci-analytics\php-bundle\api\sync.php`

---

## 🔬 FORMULE DE SCORE STATISTIQUE (TRANSPARENCE TOTALE)

Le score d'un numéro pour une heure donnée est calculé de manière totalement transparente :

$$\text{Score} = \frac{w_1 \cdot C_{\text{volume}} + w_2 \cdot C_{\text{tendance}} + w_3 \cdot C_{\text{écart}} + w_4 \cdot C_{\text{stabilité}} + w_5 \cdot C_{\text{créneau}}}{\sum w_i}$$

- **$w_1$ (30%) : Volume historique sur 24 mois** pour ce créneau horaire.
- **$w_2$ (20%) : Tendance récente (30 derniers jours)**.
- **$w_3$ (15%) : Écart critique** (nombre de tirages écoulés depuis la dernière apparition).
- **$w_4$ (15%) : Régularité des cycles** (écart maximum observé).
- **$w_5$ (20%) : Affinité horaire** (fréquence préférentielle sur cette heure précise).

---

## 🛡️ GARANTIES DE SÉCURITÉ ET D'INTÉGRITÉ
- **Signatures Cryptographiques SHA-256** pour chaque tirage inséré.
- **Bouton de Réconciliation Directe** : compare les champs de la base locale avec la source en direct.
- **Journal d'Audit Complet** : traçabilité de chaque lot ingéré avec détection des anomalies.

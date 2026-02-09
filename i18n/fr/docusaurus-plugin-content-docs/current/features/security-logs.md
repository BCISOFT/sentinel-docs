---
sidebar_position: 5
---

# Logs de sécurité

Sentinel enregistre tous les événements de sécurité pour vous aider à surveiller les menaces contre votre boutique.

## Emplacement des logs

Les logs sont stockés dans : `/var/logs/sentinel-YYYY-MM-DD.log`

Exemple : `/var/logs/sentinel-2025-12-17.log`

## Types de logs

Sentinel génère plusieurs types de logs selon les événements détectés.

### 1. Détection d'attaque (Signature URI)

Lorsqu'une signature malveillante est détectée dans une requête :

```json
[2025-12-17 14:35:22] [WARNING] ATTACK DETECTED - Pattern: (.*)select(.*)sleep(.*)
{
  "ip": "192.168.1.100",
  "uri": "/index.php?id=1 AND SELECT SLEEP(5)",
  "method": "GET",
  "signature_pattern": "(.*)select(.*)sleep(.*)",
  "signature_target": "/modules/vulnerable/",
  "request_body_sample": "SELECT SLEEP(5)",
  "get_params": {"id": "1 AND SELECT SLEEP(5)"},
  "post_params": {},
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-12-17 14:35:22"
}
```

### 2. Échecs de connexion

Tentatives de connexion échouées au back-office :

```json
[2025-12-17 10:15:30] [WARNING] FAILED LOGIN ATTEMPT - Email: admin@test.com
{
  "ip": "192.168.1.50",
  "uri": "/admin/index.php?controller=AdminLogin",
  "method": "POST",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-12-17 10:15:30"
}
```

### 3. Requêtes POST

Toutes les requêtes POST sont enregistrées avec leur payload :

```json
[2025-12-17 11:20:15] [INFO] POST REQUEST
{
  "ip": "192.168.1.75",
  "uri": "/admin/index.php?controller=AdminProducts",
  "method": "POST",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-12-17 11:20:15",
  "post_data": {
    "name": "Nouveau produit",
    "price": "19.99"
  },
  "raw_body": "name=Nouveau+produit&price=19.99"
}
```

### 4. Requêtes PUT/PATCH/DELETE

Requêtes de modification/suppression via API :

```json
[2025-12-17 12:30:45] [INFO] PUT REQUEST
{
  "ip": "192.168.1.80",
  "uri": "/api/products/123",
  "method": "PUT",
  "user_agent": "APIClient/1.0",
  "timestamp": "2025-12-17 12:30:45",
  "raw_body": "{\"price\": \"24.99\"}"
}
```

### 5. Auto Prepend File

Accès directs aux fichiers PHP (voir [Protection Auto Prepend](./auto-prepend-protection.md)) :

```json
[2025-12-17 13:45:10] [INFO] AUTO PREPEND FILE
{
  "ip": "192.168.1.90",
  "uri": "/modules/oldmodule/upload.php",
  "method": "POST",
  "user_agent": "curl/7.68.0",
  "timestamp": "2025-12-17 13:45:10",
  "source": "auto_prepend",
  "post_data": {"action": "upload"},
  "files": {
    "file": {
      "name": "shell.php",
      "size": 1234,
      "type": "application/x-php"
    }
  }
}
```

## Rotation des logs

- **Fréquence** : Quotidienne (nouveau fichier chaque jour)
- **Rétention** : 7 jours (fichiers plus anciens automatiquement supprimés)
- **Nomenclature** : `sentinel-YYYY-MM-DD.log`

## Visualiser les logs

### Via le Back-Office

Pour visualiser les logs de sécurité depuis le back-office :

1. Connectez-vous à votre back-office PrestaShop
2. Allez dans **Modules > Sentinel > Security Logs**
3. Utilisez les filtres pour rechercher par date, IP, type ou sévérité

### Via la commande Sentinel

Sentinel fournit une commande dédiée pour visualiser et gérer les logs :

**Voir les logs récents :**

```bash
php bin/console sentinel:logs
```

**Filtrer par type :**

```bash
php bin/console sentinel:logs --type=attack
php bin/console sentinel:logs --type=login_failed
php bin/console sentinel:logs --type=post_request
```

**Filtrer par sévérité :**

```bash
php bin/console sentinel:logs --severity=warning
php bin/console sentinel:logs --severity=critical
```

**Filtrer par adresse IP :**

```bash
php bin/console sentinel:logs --ip=192.168.1.100
```

**Filtrer par plage de dates :**

```bash
php bin/console sentinel:logs --from="2025-01-01" --to="2025-01-31"
```

**Limiter les résultats :**

```bash
php bin/console sentinel:logs --limit=50
```

**Sortie en JSON :**

```bash
php bin/console sentinel:logs --json
```

**Supprimer tous les logs :**

```bash
php bin/console sentinel:logs --clear
```

### Via ligne de commande système

**Voir les événements du jour :**

```bash
tail -f /var/logs/sentinel-$(date +%Y-%m-%d).log
```

**Compter les attaques :**

```bash
grep "ATTACK DETECTED" /var/logs/sentinel-*.log | wc -l
```

**Trouver les attaques d'une IP spécifique :**

```bash
grep "192.168.1.100" /var/logs/sentinel-*.log
```

**Patterns d'attaque les plus courants :**

```bash
grep "ATTACK DETECTED" /var/logs/sentinel-*.log | \
  grep -oP 'Pattern: [^"]*' | \
  sort | uniq -c | sort -rn | head -10
```

**Voir tous les échecs de connexion :**

```bash
grep "FAILED LOGIN ATTEMPT" /var/logs/sentinel-*.log
```

**Voir les accès Auto Prepend File :**

```bash
grep "AUTO PREPEND FILE" /var/logs/sentinel-*.log
```

**Voir toutes les requêtes POST du jour :**

```bash
grep "POST REQUEST" /var/logs/sentinel-$(date +%Y-%m-%d).log
```

## Protection des données sensibles

Sentinel masque automatiquement les informations sensibles dans les logs :

**Champs protégés :**

Mots de passe :

- `password`, `passwd`, `pwd`, `motdepasse`, `motpasse`, `pass`
- `repeat_password`, `password_confirmation`, `new_password`, `old_password`

Tokens et authentification :

- `secret`, `token`, `api_key`, `apikey`, `access_token`, `refresh_token`
- `bearer`, `auth`, `authorization`, `oauth`, `jwt`, `session`

Clés privées :

- `private_key`, `priv_key`, `ssh_key`, `key`, `pem`, `certificate`

Informations bancaires :

- `credit_card`, `card_number`, `cvv`, `cvv2`, `cvc`, `iban`, `swift`

Autres :

- `ssn`, `pin`, `cookie`, `encryption_key`, `salt`, `hash`, `signature`

**Exemple :**

```json
Requête : username=admin&password=secret123&api_key=abc123
Loggé : username=admin&password=********&api_key=********
```

## Que faire avec les logs

### Surveillance quotidienne

1. Vérifier l'augmentation des attaques
2. Identifier les IPs récurrentes attaquantes
3. Repérer les patterns d'attaques

### Quand des attaques sont détectées

1. **Identifier la menace** : Quel pattern a été matché ?
2. **Vérifier l'IP** : Est-ce un récidiviste ?
3. **Agir** :
   - Bloquer l'IP au niveau du serveur
   - Signaler au fournisseur d'hébergement
   - Surveiller les patterns similaires

### Analyser les échecs de connexion

Si vous voyez de nombreux échecs de connexion :

1. Vérifier si l'IP correspond à un administrateur légitime
2. Si non, bloquer l'IP (attaque par force brute)
3. Envisager l'activation d'un système 2FA

### Surveiller les accès directs aux fichiers PHP

Les logs Auto Prepend File peuvent révéler :

1. Des tentatives d'exploitation de modules vulnérables
2. Des uploads de fichiers malveillants
3. Des accès à des fichiers qui ne devraient pas être accessibles directement

## Analyse forensique

En cas d'incident de sécurité, les logs Sentinel permettent de :

### 1. Reconstituer la chronologie

```bash
# Tous les événements d'une IP suspecte
grep "192.168.1.100" /var/logs/sentinel-*.log | sort
```

### 2. Identifier le point d'entrée

```bash
# Premier événement de l'attaquant
grep "192.168.1.100" /var/logs/sentinel-*.log | head -1
```

### 3. Voir tous les fichiers ciblés

```bash
# Tous les fichiers PHP accédés directement
grep "AUTO PREPEND FILE" /var/logs/sentinel-*.log | grep "192.168.1.100"
```

### 4. Analyser les payloads

Les logs contiennent les payloads complets des requêtes POST, permettant de comprendre exactement ce que l'attaquant a tenté.

## Résolution des problèmes

### Aucun log créé

Vérifiez les permissions :

```bash
chmod 755 /var/logs
ls -la /var/logs
```

### Logs trop volumineux

Si les logs deviennent trop volumineux :

1. Réduisez la période de rétention (modifiez `LOG_RETENTION_DAYS` dans `SecurityLogger.php`)
2. Archivez les anciens logs
3. Envisagez de filtrer certains types de logs (par exemple, désactiver le log de toutes les requêtes POST)

### Logs manquants après rotation

Si les logs disparaissent après rotation, vérifiez :

1. Les permissions du répertoire `/var/logs`
2. Que le serveur web peut écrire dans ce répertoire
3. Que Monolog est correctement installé (`composer install`)

---

**Voir aussi :**

- [Détection de menaces](./threat-detection.md)
- [Protection Auto Prepend](./auto-prepend-protection.md)
- [Scanner de vulnérabilités](./vulnerability-scanner.md)

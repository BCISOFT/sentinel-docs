---
sidebar_position: 4
---

# Protection Auto Prepend File

La protection **Auto Prepend File** est une couche de sécurité supplémentaire qui protège votre site contre les accès directs aux fichiers PHP, contournant ainsi la sécurité de PrestaShop.

## Pourquoi est-ce important ?

Par défaut, Sentinel protège votre site uniquement lorsque les requêtes passent par le système de PrestaShop (via `index.php`). Cependant, un attaquant pourrait tenter d'accéder directement à un fichier PHP vulnérable :

```
https://votresite.com/modules/modulevulnerable/exploit.php
```

Cette requête **ne passerait pas** par Sentinel car elle ne passe pas par le dispatcher PrestaShop.

## Comment ça fonctionne

La protection Auto Prepend File configure PHP pour exécuter automatiquement un fichier Sentinel **avant** tout autre fichier PHP sur votre site.

### Schéma de fonctionnement

**Sans Auto Prepend :**

```
Attaquant → exploit.php → Code vulnérable exécuté ❌
```

**Avec Auto Prepend :**

```
Attaquant → auto_prepend_file.php → Log + Protection → exploit.php → Code bloqué ✓
```

## Ce que fait auto_prepend_file.php

Le fichier `auto_prepend_file.php` :

1. **Enregistre toutes les requêtes** vers des fichiers PHP directs
2. **Log les requêtes POST/PUT/PATCH/DELETE** avec leur payload
3. **Log les fichiers uploadés** (nom, taille, type)
4. **Ajoute un header HTTP** `X-Sentinel-Protected: 1` pour confirmer l'activation

### Exemple de log

```json
[2025-12-17 10:30:45] [INFO] AUTO PREPEND FILE {
  "ip": "192.168.1.100",
  "uri": "/modules/vulnerable/upload.php",
  "method": "POST",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-12-17 10:30:45",
  "source": "auto_prepend",
  "post_data": {
    "action": "upload"
  },
  "files": {
    "file": {
      "name": "shell.php",
      "size": 1234,
      "type": "application/x-php"
    }
  }
}
```

## Installation

### Installation automatique (Recommandée)

1. Allez dans **Modules > Sentinel > Configuration**
2. Cliquez sur le bouton **Installer Auto Prepend File**
3. Sentinel tentera automatiquement d'installer la protection

Si l'installation automatique réussit, vous verrez :

- ✓ **Direct PHP File Access Protection** : Activé

### Installation manuelle

Si l'installation automatique échoue, vous devrez configurer manuellement `auto_prepend_file` dans votre configuration PHP.

#### Méthode 1 : Fichier php.ini

Ajoutez cette ligne à votre fichier `php.ini` :

```ini
; BEGIN Sentinel Security Module
auto_prepend_file = "/chemin/absolu/vers/prestashop/modules/sentinel/auto_prepend_file.php"
; END Sentinel Security Module
```

#### Méthode 2 : Fichier .user.ini

Créez un fichier `.user.ini` à la racine de votre PrestaShop :

```ini
; BEGIN Sentinel Security Module
auto_prepend_file = "/chemin/absolu/vers/prestashop/modules/sentinel/auto_prepend_file.php"
; END Sentinel Security Module
```

#### Méthode 3 : Fichier .htaccess (Apache uniquement)

Ajoutez cette ligne à votre fichier `.htaccess` :

```apache
php_value auto_prepend_file "/chemin/absolu/vers/prestashop/modules/sentinel/auto_prepend_file.php"
```

:::warning
Le chemin doit être **absolu**, pas relatif. Exemple :

- ✓ Correct : `/var/www/html/prestashop/modules/sentinel/auto_prepend_file.php`
- ✗ Incorrect : `modules/sentinel/auto_prepend_file.php`
  :::

## Vérification

Pour vérifier que l'Auto Prepend File est actif :

### Méthode 1 : Via l'interface Sentinel

Allez dans **Modules > Sentinel > Configuration** et vérifiez le statut :

- ✓ **Direct PHP File Access Protection** : Activé
- ✗ **Direct PHP File Access Protection** : Désactivé

### Méthode 2 : Test manuel

Créez un fichier `test.php` à la racine de PrestaShop :

```php
<?php
echo 'Test';
```

Accédez à `https://votresite.com/test.php` et inspectez les headers HTTP :

```bash
curl -I https://votresite.com/test.php
```

Si vous voyez `X-Sentinel-Protected: 1`, la protection est active. ✓

N'oubliez pas de supprimer `test.php` après le test.

## Logs générés

L'Auto Prepend File génère des logs dans le même fichier que les autres logs Sentinel :

`/var/logs/sentinel-YYYY-MM-DD.log`

### Types de logs

#### Requêtes GET vers des fichiers PHP

```json
[2025-12-17 10:30:45] [INFO] AUTO PREPEND FILE {
  "ip": "192.168.1.100",
  "uri": "/modules/module/file.php",
  "method": "GET",
  "source": "auto_prepend"
}
```

#### Requêtes POST avec payload

```json
[2025-12-17 10:30:45] [INFO] AUTO PREPEND FILE {
  "ip": "192.168.1.100",
  "uri": "/modules/module/upload.php",
  "method": "POST",
  "source": "auto_prepend",
  "post_data": {
    "param1": "value1"
  },
  "raw_body": "param1=value1&param2=value2"
}
```

#### Upload de fichiers

```json
[2025-12-17 10:30:45] [INFO] AUTO PREPEND FILE {
  "ip": "192.168.1.100",
  "uri": "/modules/module/upload.php",
  "method": "POST",
  "source": "auto_prepend",
  "files": {
    "file": {
      "name": "document.pdf",
      "size": 52480,
      "type": "application/pdf"
    }
  }
}
```

## Cas d'usage

### Détection d'exploitation de module vulnérable

Un attaquant tente d'exploiter un module vulnérable :

```
POST /modules/oldmodule/upload.php
```

Sans Auto Prepend, cette requête ne serait **pas détectée**.

Avec Auto Prepend, vous aurez un log complet :

- IP de l'attaquant
- Fichier ciblé
- Données POST envoyées
- Fichiers uploadés

### Analyse forensique après incident

En cas d'incident de sécurité, les logs Auto Prepend permettent de :

- Identifier tous les fichiers PHP accédés directement
- Voir les payloads envoyés
- Tracer l'origine de l'attaque
- Comprendre la chronologie

## Compatibilité

### Compatible avec

- ✓ Apache avec mod_php
- ✓ Apache avec PHP-FPM
- ✓ Nginx avec PHP-FPM
- ✓ LiteSpeed
- ✓ Hébergements mutualisés (si configuration PHP personnalisable)

### Peut nécessiter un support technique

- ⚠️ Hébergements mutualisés avec restrictions
- ⚠️ Serveurs avec configuration PHP verrouillée

## Désinstallation

Si vous désinstallez Sentinel, l'Auto Prepend File est automatiquement désactivé.

Si vous souhaitez le désactiver manuellement :

1. Supprimez les lignes Sentinel de votre fichier de configuration PHP
2. Rechargez la configuration PHP (redémarrez Apache/Nginx/PHP-FPM)

## Résolution des problèmes

### La protection ne s'active pas

1. Vérifiez les permissions du fichier `auto_prepend_file.php`
2. Vérifiez que le chemin est absolu dans la configuration
3. Rechargez la configuration PHP
4. Vérifiez les logs d'erreur PHP

### Erreur 500 après activation

Si vous obtenez une erreur 500 après avoir activé Auto Prepend :

1. Vérifiez les logs d'erreur PHP : `/var/log/apache2/error.log`
2. Vérifiez que le chemin vers `auto_prepend_file.php` est correct
3. Vérifiez les permissions du répertoire `/var/logs`

### Logs non créés

Si les logs ne sont pas créés :

1. Vérifiez les permissions du répertoire `/var/logs`
2. Créez le répertoire si nécessaire : `mkdir -p /var/logs && chmod 755 /var/logs`
3. Vérifiez que PHP peut écrire dans ce répertoire

---

**Suivant :** [Logs de sécurité](./security-logs.md)

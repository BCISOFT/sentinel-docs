---
sidebar_position: 5
---

# Protection Auto Prepend File

:::tip Fonctionnalité Pro
La protection Auto Prepend File est disponible avec la **licence Pro**. [Obtenez votre licence Pro](https://bcisoft.fr/securite) pour accéder à cette fonctionnalité.
:::

La protection **Auto Prepend File** est une couche de sécurité supplémentaire qui couvre les requêtes atteignant un fichier PHP sans passer par PrestaShop. Chacun de ces accès est enregistré, et celui qui porte une attaque connue est refusé par un 403.

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
Attaquant → auto_prepend_file.php → Journalisé, et refusé s'il porte une attaque connue ✓
```

## Ce que fait auto_prepend_file.php

Le fichier `auto_prepend_file.php` :

1. **Enregistre toutes les requêtes** vers des fichiers PHP directs
2. **Log les requêtes POST/PUT/PATCH/DELETE** avec leur payload
3. **Log les fichiers uploadés** (nom, taille, type)
4. **Ajoute un header HTTP** `X-Sentinel-Protected: 1` pour confirmer l'activation
5. **Refuse une requête correspondant à une signature de menace**, par un 403 nu

### Détection par signatures sur les accès directs

La détection de menaces s'exécute normalement depuis un hook PrestaShop : elle ne voit donc que les requêtes qui démarrent PrestaShop. Une requête visant directement `modules/un-module/vulnerable.php` n'est dispatchée par rien, et n'était donc inspectée par rien.

L'étage Auto Prepend File comble ce trou : le même jeu de signatures est appliqué, avant le démarrage de PrestaShop, à toute requête atteignant directement un fichier PHP.

- **Seuls les accès directs sont inspectés.** Les requêtes passant par `index.php` sont déjà couvertes par le hook, et une page normale ne paie rien pour cet étage.
- **Le refus est un 403 nu**, sans page ni mention de Sentinel. L'appelant est ici un scanner ou un exploit, pas un client à informer, et une page brandée confirmerait à la fois que le fichier s'exécute et ce qui protège la boutique.
- **Il suit l'interrupteur de détection de menaces.** Désactiver la détection sur la page de configuration désactive aussi cet étage.
- **Une boutique Free ne bloque rien.** Le fichier de signatures est alimenté par l'API Sentinel, et une boutique sans abonnement en reçoit un vide : il n'y a rien à comparer.
- **Tout imprévu laisse passer la requête.** Un fichier de signatures absent ou illisible, ou n'importe quelle erreur pendant la détection, ne transforme jamais une page en erreur.

Les tentatives bloquées apparaissent dans les Journaux de sécurité, onglet des logs fichiers, marquées *Bloqué* avec la signature qui a déclenché.

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
2. Cliquez sur **Tenter l'installation automatique**

Sentinel déroule les étapes suivantes :

1. **Il recherche un `auto_prepend_file` existant.** La valeur PHP effective est consultée en premier, ce qui couvre aussi un `php.ini` système, un pool PHP-FPM et un `.htaccess` parent. Les fichiers à la racine de la boutique sont ensuite analysés. Si un autre prepend est déjà déclaré, **Sentinel s'arrête là et n'écrit rien** : le remplacer désactiverait la protection à laquelle il appartient.
2. **Il retient la seule méthode qui peut fonctionner sur votre serveur**, selon la façon dont PHP est exécuté :
   - PHP en module Apache (`mod_php`) → `.htaccess`, car `.user.ini` y est ignoré
   - PHP-FPM, CGI, LiteSpeed et autres → `.user.ini`
3. **Il écrit un bloc balisé** dans ce seul fichier. Rien d'autre n'est touché.
4. **Il vérifie le résultat** en requêtant un script jetable en HTTP et en cherchant l'en-tête `X-Sentinel-Protected`.

:::info
Il n'y a pas de repli d'une méthode sur l'autre, et c'est délibéré. Un `.user.ini` est ignoré par `mod_php`, et une directive `php_value` dans un `.htaccess` est une directive inconnue pour un serveur sans `mod_php` — ce qui répondrait 500 sur toutes les pages de votre boutique.
:::

### États d'installation

La page de configuration indique l'un des états suivants :

| État | Signification | Que faire |
| --- | --- | --- |
| **Active** | Le prepend s'exécute, confirmé en HTTP | Rien |
| **Activation en cours** | La configuration est écrite mais PHP ne l'a pas encore lue | Attendre, puis cliquer sur **Vérifier maintenant** |
| **Installation impossible** | Un autre `auto_prepend_file` est déjà configuré | Voir [Conflit avec un prepend existant](#conflit-avec-un-prepend-existant) |
| **Non active** | L'installation automatique n'a pas abouti | Suivre les instructions manuelles |

#### Pourquoi « Activation en cours » ?

PHP met les fichiers `.user.ini` en cache pendant la durée de `user_ini.cache_ttl`, cinq minutes par défaut. Un fichier écrit à l'instant n'est donc généralement pas encore actif, et la vérification ne peut pas le confirmer.

Dans ce cas, Sentinel **conserve la configuration en place** plutôt que de conclure à un échec, et indique le délai restant. Recharger la page de configuration relance la vérification, et l'état passe de lui-même à *Active* dès que PHP prend le fichier en compte.

Avec la méthode `.htaccess`, ce délai n'existe pas : la vérification est immédiatement concluante, et un échec conduit Sentinel à retirer ce qu'il vient d'écrire.

### Conflit avec un prepend existant

Lorsqu'un autre `auto_prepend_file` est déjà configuré, la page de configuration affiche sa valeur actuelle et l'endroit où il est déclaré. Sentinel n'y touche pas.

Deux solutions :

- **Contacter votre hébergeur** pour que les deux fichiers prepend soient chaînés.
- **Inclure Sentinel depuis le prepend existant**, en y ajoutant cette ligne :

  ```php
  require_once '/chemin/absolu/vers/prestashop/modules/sentinel/auto_prepend_file.php';
  ```

Une fois l'autre `auto_prepend_file` retiré, rechargez la page de configuration : l'installation automatique est de nouveau proposée.

### Installation manuelle

La page de configuration présente les méthodes dans l'ordre qui convient à votre serveur, la plus susceptible de fonctionner en premier. Le chemin doit toujours être **absolu**.

#### Fichier `.user.ini` (PHP-FPM, CGI, LiteSpeed)

Créez un fichier `.user.ini` à la racine de votre installation PrestaShop :

```ini
; BEGIN Sentinel Security Module
auto_prepend_file = "/chemin/absolu/vers/prestashop/modules/sentinel/auto_prepend_file.php"
; END Sentinel Security Module
```

:::caution
Ignoré lorsque PHP est exécuté en module Apache. Comptez jusqu'à cinq minutes avant que PHP ne lise le fichier.
:::

#### Fichier `.htaccess` (Apache avec mod_php)

Ajoutez ce bloc au fichier `.htaccess` à la racine de votre installation PrestaShop, **avant le commentaire `# ~~start~~`** :

```apache
# BEGIN Sentinel Security Module
<IfModule mod_php.c>
    php_value auto_prepend_file "/chemin/absolu/vers/prestashop/modules/sentinel/auto_prepend_file.php"
</IfModule>
<IfModule mod_php7.c>
    php_value auto_prepend_file "/chemin/absolu/vers/prestashop/modules/sentinel/auto_prepend_file.php"
</IfModule>
# END Sentinel Security Module
```

:::caution
Les deux points ci-dessus comptent autant l'un que l'autre.

**Avant `# ~~start~~`** : PrestaShop réécrit tout ce qui se trouve entre ses marqueurs `# ~~start~~` et `# ~~end~~` chaque fois qu'il régénère le `.htaccess` — lors d'une reconstruction des URL simplifiées, par exemple. Seul ce qui est en dehors de ces marqueurs est conservé.

**Dans un `<IfModule>`** : un `php_value` non gardé est une directive fatale pour un serveur sans `mod_php`, qui répondrait alors 500 à toutes les requêtes.
:::

#### Fichier `php.ini`

Ajoutez cette ligne à votre fichier `php.ini` :

```ini
; BEGIN Sentinel Security Module
auto_prepend_file = "/chemin/absolu/vers/prestashop/modules/sentinel/auto_prepend_file.php"
; END Sentinel Security Module
```

:::warning
Le chemin doit être **absolu**, pas relatif. Exemple :

- ✓ Correct : `/var/www/html/prestashop/modules/sentinel/auto_prepend_file.php`
- ✗ Incorrect : `modules/sentinel/auto_prepend_file.php`
  :::

Après une configuration manuelle de `auto_prepend_file`, rechargez la page de configuration : Sentinel relance sa vérification à chaque affichage et prend le changement en compte.

## Vérification

Pour vérifier que l'Auto Prepend File est actif :

### Méthode 1 : Via l'interface Sentinel

Allez dans **Modules > Sentinel > Configuration** et vérifiez le statut :

- ✓ **Protection contre l'accès direct aux fichiers PHP** : Activée
- ✗ **Protection contre l'accès direct aux fichiers PHP** : Désactivée

### Méthode 2 : Test manuel

Créez un fichier `test.php` à la racine de PrestaShop :

```php
<?php
echo 'Test';
```

Accédez à `https://votreboutique.com/test.php` et inspectez les en-têtes HTTP :

```bash
curl -I https://votreboutique.com/test.php
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

Désinstaller Sentinel retire le bloc balisé de chacun des fichiers de configuration dans lesquels il a pu écrire, et supprime un fichier qui s'en retrouve vide. Le contenu appartenant à un tiers dans un fichier partagé est préservé.

Le fichier `auto_prepend_file.php` lui-même est livré avec le module et reste en place ; sans directive `auto_prepend_file` qui le désigne, il n'est jamais exécuté.

Si vous souhaitez désactiver la protection manuellement :

1. Supprimez les lignes situées entre `BEGIN Sentinel Security Module` et `END Sentinel Security Module` dans votre fichier de configuration PHP
2. Rechargez la configuration PHP (redémarrez Apache/Nginx/PHP-FPM)

## Résolution des problèmes

### Bloqué sur « Activation en cours »

Attendu pendant cinq minutes au maximum avec la méthode `.user.ini`, le temps que PHP rafraîchisse son cache. Au-delà, Sentinel bascule de lui-même sur *Non active*.

Si l'état persiste :

1. Vérifiez que PHP n'est pas exécuté en module Apache, cas dans lequel `.user.ini` est ignoré — utilisez alors la méthode `.htaccess`
2. Vérifiez les valeurs de `user_ini.cache_ttl` et `user_ini.filename` dans votre configuration PHP
3. Vérifiez que le fichier `.user.ini` est lisible par le serveur web

### « Installation impossible »

Un autre `auto_prepend_file` est déjà configuré sur le serveur. Voir [Conflit avec un prepend existant](#conflit-avec-un-prepend-existant). Sentinel n'écrit délibérément rien dans cette situation.

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

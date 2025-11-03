---
sidebar_position: 1
---

# Détection des menaces

Sentinel détecte et bloque automatiquement les requêtes malveillantes en utilisant une correspondance de motifs basée sur des signatures.

## Comment ça fonctionne

1. **Analyse des requêtes** : Chaque requête HTTP est analysée avant d'atteindre PrestaShop
2. **Correspondance de motifs** : La requête est comparée à de nombreuses signatures de menaces préconfigurées
3. **Blocage instantané** : Si un motif malveillant est détecté, la requête est bloquée avec HTTP 403
4. **Journalisation** : Toutes les attaques détectées sont enregistrées avec les détails (IP, URI, motif correspondant)

## Menaces protégées

### Injection SQL

Détecte les tentatives de manipulation de votre base de données :

```
Exemple : /index.php?id=1' AND SELECT SLEEP(5)--
```

Sentinel bloque les motifs comme :

- `SELECT ... SLEEP ...`
- `UNION SELECT ...`
- Mots-clés SQL dans des contextes suspects

### Opérations sur les fichiers

Détecte les tentatives d'écriture de fichiers malveillants :

```
Exemple : file_put_contents('shell.php', '<?php ...')
```

Bloque les tentatives de :

- Écrire des fichiers avec `file_put_contents`
- Télécharger du code distant avec `wget`
- Modifier la configuration PHP avec `ini_set`

### Exécution de commandes

Empêche l'exécution de commandes système :

```
Exemple : system('rm -rf /')
```

### Exploits de modules

Détecte les vulnérabilités connues dans les modules PrestaShop populaires :

- Module Product Search
- Modules de blog (CSBlog, SmartBlog, etc.)
- Modules de paiement

## Quand une attaque est détectée

1. **La requête est bloquée** avec HTTP 403 Forbidden
2. **Une page personnalisée est affichée** à l'attaquant
3. **L'attaque est enregistrée** dans `/var/logs/sentinel-AAAA-MM-JJ.log`
4. **Le contexte est enregistré** : adresse IP, URI, motif correspondant, données de la requête

## Exemple de requête bloquée

Quand quelqu'un essaie :

```
https://votreboutique.com/index.php?search=SELECT SLEEP(10)
```

Il voit :

```
HTTP 403 Forbidden
Accès refusé
Votre requête a été bloquée pour des raisons de sécurité.
```

Et Sentinel enregistre :

```json
{
  "ip": "192.168.1.100",
  "uri": "/index.php?search=SELECT SLEEP(10)",
  "pattern": "(.*)select(.*)sleep(.*)",
  "method": "GET"
}
```

---

**Suivant :** [Journaux de sécurité](./security-logs.md)

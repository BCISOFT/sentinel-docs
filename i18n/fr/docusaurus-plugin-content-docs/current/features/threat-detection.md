---
sidebar_position: 1
---

# Détection des menaces

:::tip Fonctionnalité Pro
La détection de menaces et le blocage automatique sont disponibles avec la **licence Pro**. [Obtenez votre licence Pro](https://bcisoft.fr/securite) pour accéder à cette fonctionnalité.
:::

Sentinel détecte et bloque automatiquement les requêtes malveillantes en utilisant une correspondance de motifs basée sur des signatures.

## Comment ça fonctionne

1. **Analyse des requêtes** : Chaque requête HTTP est analysée avant d'atteindre PrestaShop
2. **Correspondance de motifs** : La requête est comparée aux signatures de menaces connues téléchargées depuis l'API Sentinel
3. **Blocage instantané** : Si un motif malveillant est détecté, la requête est bloquée avec HTTP 403
4. **Journalisation** : Toutes les attaques détectées sont enregistrées avec les détails (IP, URI, motif correspondant)

## Mise à jour des signatures

Les signatures de détection sont gérées à distance sur l'API Sentinel et synchronisées automatiquement :

- **À l'installation** : Les signatures sont téléchargées lors de l'installation du module
- **Synchronisation quotidienne** : Le back-office vérifie automatiquement les signatures mises à jour toutes les 24 heures
- **Téléchargement manuel** : Si les signatures sont absentes, la page de configuration du module affiche un avertissement avec un bouton pour les télécharger manuellement

Cette approche garantit que votre boutique est toujours protégée avec les dernières signatures de menaces sans nécessiter de mise à jour du module.

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

### En-têtes HTTP suspects

Détecte les en-têtes HTTP malveillants ou suspects :

- **Scanners de sécurité** : Bloque les requêtes provenant d'outils de scan connus (sqlmap, nikto, nmap, dirbuster, etc.)
- **User-Agent vide** : Bloque les requêtes sans en-tête User-Agent (fréquent dans les attaques automatisées)
- **Log4Shell** : Détecte les tentatives d'injection JNDI dans les en-têtes HTTP

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

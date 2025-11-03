---
sidebar_position: 2
---

# Journaux de sécurité

Sentinel enregistre tous les événements de sécurité pour vous aider à surveiller les menaces contre votre boutique.

## Emplacement des journaux

Les journaux sont stockés dans : `/var/logs/sentinel-AAAA-MM-JJ.log`

Exemple : `/var/logs/sentinel-2025-10-29.log`

## Format des journaux

Chaque attaque est enregistrée avec :

```
[2025-10-29 14:35:22] [WARNING] ATTACK DETECTED - Pattern: (.*)select(.*)sleep(.*)
{
  "ip": "192.168.1.100",
  "uri": "/index.php?id=1 AND SELECT SLEEP(5)",
  "method": "GET",
  "signature_pattern": "(.*)select(.*)sleep(.*)",
  "request_body_sample": "SELECT SLEEP(5)",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-10-29 14:35:22"
}
```

## Rotation des journaux

- **Fréquence** : Quotidienne (nouveau fichier chaque jour)
- **Rétention** : 7 jours (les fichiers plus anciens sont automatiquement supprimés)
- **Nommage** : `sentinel-AAAA-MM-JJ.log`

## Consultation des journaux

### Via ligne de commande

**Voir les attaques d'aujourd'hui :**

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

**Motifs d'attaque les plus courants :**

```bash
grep "ATTACK DETECTED" /var/logs/sentinel-*.log | \
  grep -oP 'Pattern: [^"]*' | \
  sort | uniq -c | sort -rn | head -10
```

## Protection des données sensibles

Sentinel rédige automatiquement les informations sensibles dans les journaux :

**Champs protégés :**

- `password`, `passwd`, `pwd`
- `secret`, `token`, `api_key`

**Exemple :**

```json
Requête : username=admin&password=secret123
Enregistré comme : username=admin&password=***REDACTED***
```

## Que faire avec les journaux

### Surveillance quotidienne

1. Vérifier les augmentations d'attaques
2. Identifier les IP attaquantes récurrentes
3. Repérer les motifs dans les types d'attaques

### Quand des attaques sont détectées

1. **Identifier la menace** : Quel motif a été détecté ?
2. **Vérifier l'IP** : Est-ce un récidiviste ?
3. **Prendre des mesures** :
   - Bloquer l'IP au niveau du pare-feu
   - Signaler au fournisseur d'hébergement
   - Surveiller les motifs similaires

### Archiver les journaux importants

Avant que les journaux ne soient rotés (après 7 jours), archivez-les si nécessaire :

```bash
cp /var/logs/sentinel-2025-10-22.log /chemin/vers/archive/
```

## Dépannage

### Aucun journal créé

Vérifier les permissions :

```bash
chmod 755 /var/logs
ls -la /var/logs
```

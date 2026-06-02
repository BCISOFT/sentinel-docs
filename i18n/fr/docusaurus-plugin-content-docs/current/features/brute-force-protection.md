---
sidebar_position: 3
---

# Protection brute-force

:::tip Fonctionnalité Pro
La protection brute-force et le bannissement automatique d'IP sont disponibles avec la **licence Pro**. [Obtenez votre licence Pro](https://bcisoft.fr/securite) pour accéder à cette fonctionnalité.
:::

Sentinel détecte les tentatives de connexion échouées répétées sur le back-office PrestaShop et bannit automatiquement les adresses IP fautives pour une durée configurable.

## Fonctionnement

1. **Suivi des tentatives** : chaque connexion échouée au back-office est enregistrée par adresse IP.
2. **Détection du seuil** : lorsqu'une IP dépasse le nombre de tentatives configuré dans la fenêtre de temps, elle est bannie automatiquement.
3. **Blocage du back-office** : une IP bannie reçoit une réponse HTTP 403 sur tout accès au back-office jusqu'à l'expiration du bannissement. Le front-office (boutique) reste entièrement accessible.
4. **Levée automatique** : les bannissements temporaires expirent d'eux-mêmes — aucune action manuelle ni cron n'est nécessaire.

Seul l'accès au back-office est bloqué : les clients légitimes partageant la même IP (par exemple derrière un NAT) peuvent toujours naviguer et commander sur la boutique.

## Paramètres

Les paramètres sont disponibles dans le back-office sous **Sentinel → Protection brute-force** :

| Paramètre | Valeur par défaut | Description |
| --- | --- | --- |
| Activer la protection brute-force | Activé | Interrupteur général |
| Nombre maximum de tentatives | 5 | Nombre de connexions échouées avant un bannissement |
| Fenêtre de temps | 900 s (15 min) | Période sur laquelle les tentatives sont comptées |
| Durée du bannissement | 3600 s (1 h) | Durée d'un bannissement automatique |
| Liste blanche d'IP | vide | Adresses IP jamais bannies |
| Inclure les IP de maintenance | Activé | Protège aussi les IP de maintenance PrestaShop (`PS_MAINTENANCE_IP`) |
| Faire confiance à X-Forwarded-For | Désactivé | Utilise l'en-tête `X-Forwarded-For` pour déterminer l'IP cliente (uniquement derrière un proxy de confiance) |

## Liste blanche et liste noire

- **Liste blanche** : combine les IP de maintenance PrestaShop avec les IP ajoutées manuellement. Une IP en liste blanche n'est jamais comptée, bannie ni bloquée — c'est le garde-fou qui évite qu'un administrateur se bloque lui-même. Veillez à ajouter votre propre IP à la liste blanche.
- **Liste noire manuelle** : vous pouvez bannir définitivement une IP depuis la page du back-office. Les bannissements permanents n'expirent jamais et doivent être retirés manuellement.

## Gestion des bannissements

La page Protection brute-force liste tous les bannissements actifs (IP, type, raison, date de bannissement, expiration, nombre de tentatives) et permet de débannir une IP en un clic. Cliquer sur le nombre de tentatives ouvre une fenêtre listant les adresses email essayées depuis cette IP (issues des journaux de connexions échouées).

## Vue d'ensemble dans le dashboard

Le dashboard Sentinel et le widget du tableau de bord PrestaShop affichent un résumé brute-force : nombre de bans actifs, total d'IP bannies, tentatives échouées sur les dernières 24 h, et les bannissements les plus récents. Ce résumé n'est affiché qu'avec un abonnement Pro ; sinon une invitation à passer à Pro est affichée. Le dashboard affiche aussi, à côté, le top des adresses email essayées lors des connexions échouées au back-office.

## Ligne de commande

Les bannissements peuvent aussi être gérés en CLI :

```bash
# Bannir une IP pour la durée configurée
php bin/console sentinel:brute-force ban 203.0.113.10

# Bannir une IP pour une durée personnalisée (secondes)
php bin/console sentinel:brute-force ban 203.0.113.10 --duration=7200 --reason="Activité suspecte"

# Mettre une IP en liste noire permanente
php bin/console sentinel:brute-force ban 203.0.113.10 --permanent

# Débannir une IP
php bin/console sentinel:brute-force unban 203.0.113.10

# Lister tous les bannissements (ajoutez --json pour une sortie machine)
php bin/console sentinel:brute-force list

# Purger les bannissements expirés et les tentatives obsolètes
php bin/console sentinel:brute-force purge
```

La commande `unban` est la solution de secours recommandée si un administrateur se retrouve bloqué hors du back-office.

## Remarques sur la résolution de l'IP

- Les adresses **IPv6** sont prises en charge et normalisées avant stockage et comparaison.
- **Proxies** : par défaut, l'IP cliente est lue depuis `REMOTE_ADDR`. L'en-tête `X-Forwarded-For` est falsifiable ; il n'est donc utilisé que si vous activez explicitement le paramètre correspondant et que votre boutique est derrière un reverse proxy maîtrisé.
- Les entrées de la liste blanche sont comparées par adresse IP exacte (les plages CIDR ne sont pas prises en charge).

---

**Suivant :** [Journaux de sécurité](./security-logs.md)

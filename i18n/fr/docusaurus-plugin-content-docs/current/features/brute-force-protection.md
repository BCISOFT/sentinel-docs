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

## IP de confiance

La carte **IP de confiance** gère la liste blanche partagée par toutes les protections (brute-force et DDoS) : une adresse de confiance n'est jamais comptée, bannie ni bloquée. Chaque entrée peut porter un commentaire libre (« Bureau », « Sonde de monitoring », …) pour que la liste reste compréhensible dans le temps, et un bouton **Ajouter mon IP actuelle** ajoute en un clic l'adresse depuis laquelle vous naviguez — le garde-fou qui évite qu'un administrateur se bloque lui-même. Les entrées acceptent des adresses exactes et des plages CIDR. Un interrupteur fait aussi confiance aux IP de maintenance PrestaShop (`PS_MAINTENANCE_IP`).

La même carte apparaît sur la page Protection DDoS et modifie la même liste.

## Derrière un proxy ou un CDN

La carte **Derrière un proxy ou un CDN ?** configure la façon dont Sentinel résout la véritable IP des visiteurs. Sans cela, une boutique derrière Cloudflare ou un reverse proxy voit tous ses visiteurs sous l'adresse du proxy, et les protections ne peuvent pas les distinguer.

- Sentinel inspecte la requête que vous effectuez depuis le back-office et, lorsqu'il détecte Cloudflare ou un reverse proxy non déclaré, propose une correction **en un clic**.
- L'interrupteur **Cloudflare** fait confiance aux plages publiées par Cloudflare sans avoir à saisir le moindre CIDR.
- **Autres reverse proxies** accepte les adresses ou plages CIDR de vos propres proxies.

Les en-têtes transmis ne sont pris en compte que lorsque la requête provient réellement d'un proxy déclaré : un visiteur ne peut pas falsifier son IP.

## Liste noire

Le formulaire **Liste noire manuelle** bannit définitivement une IP, avec un commentaire facultatif enregistré comme raison du bannissement pour vous rappeler pourquoi il est là. Les bannissements permanents n'expirent jamais et doivent être retirés manuellement.

## Gestion des bannissements

La page Protection brute-force liste tous les bannissements actifs (IP, type, raison, date de bannissement, expiration, nombre de tentatives) et permet de débannir une IP en un clic. Cliquer sur le nombre de tentatives ouvre une fenêtre listant les adresses email essayées depuis cette IP (issues des journaux de connexions échouées). Un bannissement dont l'adresse figure aussi dans les IP de confiance est signalé par un badge **De confiance** : cette adresse n'est plus bloquée.

## Vue d'ensemble dans le dashboard

Le dashboard Sentinel affiche un résumé brute-force : nombre de bans actifs, total d'IP bannies, tentatives échouées sur les dernières 24 h, et les bannissements les plus récents. Ce résumé n'est affiché qu'avec un abonnement Pro ; sinon une invitation à passer à Pro est affichée. Le dashboard affiche aussi, à côté, le top des adresses email essayées lors des connexions échouées au back-office.

Le widget du tableau de bord PrestaShop affiche une section **Protection active** avec une carte par protection sous licence (brute force et DDoS), chacune affichant les bans actifs avec le nombre des dernières 24 h entre parenthèses — par ex. « 15 (3) ». Chaque carte renvoie vers sa page de gestion.

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
- **Proxies** : par défaut, l'IP cliente est lue depuis `REMOTE_ADDR`. Les en-têtes transmis étant falsifiables, `X-Forwarded-For` n'est lu que si la requête vous parvient d'un proxy déclaré (préréglage Cloudflare ou **Autres reverse proxies**), et la chaîne est parcourue de droite à gauche afin d'ignorer les entrées ajoutées par un attaquant. `CF-Connecting-IP` n'est en outre accepté que si la requête provient d'une plage Cloudflare publiée.
- C'est la déclaration d'un proxy qui active ce comportement durci. Tant que vous n'en déclarez pas, les installations mises à jour depuis une version antérieure conservent le traitement précédent du réglage hérité *Faire confiance à X-Forwarded-For* : les bans et les logs restent indexés sur la même adresse qu'avant.
- **Les entrées d'IP de confiance** acceptent les adresses exactes et les plages CIDR (`203.0.113.0/24`, `2001:db8::/32`). Les adresses IPv6 mappées en IPv4 correspondent à leur forme IPv4.

---

**Suivant :** [Journaux de sécurité](./security-logs.md)

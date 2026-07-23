---
sidebar_position: 5
---

# Contrôle d'accès

Sentinel peut restreindre l'accès au back office à une liste blanche d'adresses IP. Lorsque la liste blanche est activée, tout visiteur dont l'adresse ne figure pas dans la liste est redirigé vers la page 404 de la boutique — le panneau d'administration semble tout simplement ne pas exister.

Cette fonctionnalité est **gratuite** et disponible pour tous les utilisateurs de Sentinel.

## Fonctionnement

1. **Vérification de la liste blanche** : à chaque requête vers le back office, Sentinel résout l'adresse IP réelle du visiteur (compatible proxy et CDN, partagé avec les autres protections) et la compare à la liste blanche.
2. **Blocage furtif** : si l'adresse ne correspond à aucune entrée, le visiteur est redirigé vers la page 404 de la boutique. Pas de formulaire de connexion, pas de message d'erreur — rien ne révèle qu'un back office existe à cette URL.
3. **Journalisation** : chaque tentative bloquée est enregistrée dans les [journaux de sécurité](./security-logs.md) avec le type d'événement *Accès au back office bloqué*, incluant l'adresse IP, l'URI demandée et le user agent.

Le front office n'est jamais affecté : les clients peuvent naviguer et commander normalement, quelle que soit la liste blanche.

## Configuration

Ouvrez **Sentinel > Contrôle d'accès** dans le back office.

- **Activer la liste blanche d'IP du back office** : active ou désactive la protection.
- **Liste d'IP** : ajoutez une adresse par entrée, avec un commentaire facultatif (ex. « Bureau », « VPN maison »). IPv4 et IPv6 sont supportés, ainsi que les plages CIDR comme `203.0.113.0/24` ou `2001:db8::/32`.
- **Ajouter mon IP actuelle** : raccourci en un clic qui ajoute l'adresse depuis laquelle vous naviguez actuellement.

Les modifications sont enregistrées automatiquement à chaque ajout ou suppression d'entrée.

## Derrière un proxy ou un CDN

Si votre boutique est derrière Cloudflare, un CDN, un load balancer ou un reverse proxy, **déclarez-le dans la carte « Derrière un proxy ou un CDN ? » sur la même page** avant d'activer la liste blanche. Sans cela, tous les visiteurs atteignent votre serveur avec l'adresse du proxy :

- mettre « votre IP actuelle » en liste blanche reviendrait en réalité à whitelister le proxy, laissant passer **tout le monde** ;
- derrière Cloudflare, l'adresse edge change même d'une requête à l'autre, ce qui pourrait vous bloquer juste après l'activation.

Sentinel détecte les configurations les plus courantes (Cloudflare, reverse proxy local) et propose un bouton « Faire confiance » en un clic quand quelque chose semble mal configuré. Cette configuration proxy est partagée avec les autres protections (brute-force, DDoS) et est disponible pour tous les utilisateurs, gratuits comme Pro.

Le bouton « Ajouter mon IP actuelle (x.x.x.x) » affiche toujours l'adresse **telle que le serveur la résout** — si ce n'est pas celle que vous attendez, corrigez d'abord la configuration proxy.

## Protection anti-verrouillage

Se bloquer soi-même l'accès à son propre back office est le principal risque de ce type de fonctionnalité. Sentinel s'en prémunit de plusieurs façons :

- La liste blanche ne peut pas être activée si votre adresse IP actuelle ne correspond à aucune entrée.
- Supprimer votre propre adresse de la liste alors que la liste blanche est activée est refusé.
- Une **liste vide ne bloque jamais** : la liste blanche ne prend effet qu'à partir du moment où elle contient au moins une adresse.
- L'accès en ligne de commande (`bin/console`) n'est jamais restreint.

Si vous vous retrouvez malgré tout bloqué (par exemple, votre FAI a changé votre adresse IP), supprimez la valeur `SENTINEL_BO_WHITELIST_ENABLED` de la table `ps_configuration`, ou demandez à votre hébergeur de le faire :

```sql
DELETE FROM ps_configuration WHERE name = 'SENTINEL_BO_WHITELIST_ENABLED';
```

## Bonnes pratiques

- Préférez les **plages CIDR** aux adresses uniques si votre FAI ne fournit pas d'IP fixe.
- Ajoutez un **commentaire** à chaque entrée pour savoir plus tard pourquoi elle a été ajoutée.
- Si votre équipe travaille à distance, envisagez de faire passer l'accès au back office par un **VPN** avec une IP de sortie fixe et de ne mettre en liste blanche que cette adresse.

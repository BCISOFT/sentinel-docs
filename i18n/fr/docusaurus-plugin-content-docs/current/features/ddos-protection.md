---
sidebar_position: 4
---

# Protection DDoS

:::tip Fonctionnalité Pro
La protection DDoS est disponible avec la **licence Pro**. [Obtenez votre licence Pro](https://bcisoft.fr/securite) pour y accéder.
:::

Sentinel compte les requêtes de chaque adresse IP, ralentit puis bloque celles qui dépassent largement une navigation normale.

Les réglages se trouvent dans le back-office sous **Sentinel → Protection DDoS**. Les cartes **IP de confiance** et **Derrière un proxy ou un CDN ?** apparaissent à la fois sur cette page et sur la page Protection Brute-force et modifient la même configuration partagée : une seule liste d'IP de confiance couvre les deux.

## Fonctionnement

1. **Comptage** : chaque requête est comptée par adresse IP sur une fenêtre glissante.
2. **Ralentissement** : au-delà du seuil de ralentissement, les requêtes reçoivent une réponse HTTP `429 Too Many Requests` avec un en-tête `Retry-After`. L'adresse n'est pas bannie.
3. **Bannissement** : au-delà du seuil de bannissement, l'adresse est bannie pour la durée configurée et apparaît dans la liste des bans.
4. **Libération automatique** : les bans expirent d'eux-mêmes. En cas de récidive, la durée augmente progressivement, plafonnée à 24 heures.

Le code `429` est utilisé plutôt que `403` car il signifie « temporaire » : les moteurs de recherche réessaient plus tard au lieu de retirer vos pages de leur index.

## Réglages

Deux contrôles couvrent le cas courant :

- **Protection** — `Désactivé`, `Surveillance` ou `Activé`.
- **Sensibilité** — `Souple`, `Équilibré` (défaut) ou `Strict`. C'est le seul curseur dont la plupart des boutiques ont besoin : il règle pour vous les seuils de requêtes et la durée de ban. `Souple` tolère plus de trafic avant d'agir ; `Strict` réagit plus tôt.

Tout le reste se trouve sous **Avancé** et n'a pas besoin d'être touché pour une configuration normale : les seuils exacts par fenêtre, la durée de ban, les URLs exclues, le seuil de sécurité, les options robots vérifiés / récidive, et les options par réseau / par chemin / pic / Redis décrites plus bas. Modifier un seuil à la main bascule la sensibilité sur `Personnalisé`.

### Mode surveillance

En mode **Surveillance**, Sentinel compte et rapporte sans rien bloquer. Les statistiques montrent ce qui *aurait* été bloqué. Utilisez-le quelques jours pour valider les seuils sur votre propre trafic avant de passer la protection sur `Activé`.

## Ce qui n'est jamais limité

- **Les IP de confiance**, y compris les IP de maintenance PrestaShop (la liste est partagée avec la protection brute-force).
- **Les employés connectés** : le travail en back-office génère des rafales pour lesquelles les seuils du front-office ne sont pas dimensionnés.
- **Les robots d'indexation vérifiés** : Googlebot, Bingbot et d'autres sont confirmés par résolution DNS inverse *puis* directe, de sorte qu'un user-agent falsifié n'obtient pas l'exemption.
- **Les URLs exclues**, pré-remplies avec les chemins habituels de callback de paiement. Conservez-y vos URLs de notification de paiement : une notification rejetée ne devient jamais une commande.
- **Les ressources statiques** et l'exécution en ligne de commande.

## Le seuil de sécurité

Si plus que la part configurée de votre trafic est bloquée sur une heure, Sentinel **suspend le blocage de lui-même**, affiche un avertissement dans le back-office et continue de compter.

Ce garde-fou existe pour un scénario précis : un reverse proxy non déclaré dans la carte **Derrière un proxy ou un CDN ?**. Tous les visiteurs sont alors vus sous la même adresse, cette unique adresse dépasse tous les seuils, et la boutique entière se bannirait elle-même. Plutôt que de laisser cela arriver, Sentinel cesse de bloquer et vous prévient.

Une fois la configuration corrigée, cliquez sur **Reprendre le blocage** (ou lancez `sentinel:rate-limit resume`). Le blocage reprend également seul au bout d'une heure.

:::caution Derrière un reverse proxy ou un CDN
Déclarez votre infrastructure dans la carte **Derrière un proxy ou un CDN ?** sur la même page — Sentinel détecte Cloudflare ou un reverse proxy devant votre boutique et propose une correction en un clic. Sans cela, Sentinel ignore délibérément les en-têtes transmis et voit l'adresse de votre proxy au lieu de celle de vos visiteurs.
:::

## Statistiques

La page affiche, sur les dernières 24 heures : les requêtes analysées, les requêtes ralenties, les bans par limitation et la part du trafic bloquée. Les chiffres sont agrégés à l'heure plutôt que journalisés à chaque requête, afin que la protection ne devienne pas elle-même un problème de charge.

Le dashboard Sentinel met aussi la protection en avant : un KPI avec les requêtes bloquées sur les dernières 24 heures, et une carte dédiée affichant les bans actifs, les IP bannies sur les dernières 24 heures, les requêtes bloquées et les bannissements les plus récents. Sans abonnement Pro, une invitation à passer à Pro est affichée à la place.

## Couverture

Un bandeau indique la couverture active :

- **Étendue** — la [protection Auto Prepend](./auto-prepend-protection.md) est activée : les requêtes sont filtrées avant le démarrage de PrestaShop.
- **Limitée** — seules les requêtes routées par PrestaShop sont filtrées. La protection fonctionne, mais chaque requête bloquée coûte encore un démarrage complet de PrestaShop.

La couverture étendue mérite d'être activée partout où votre hébergement le permet, pour deux raisons :

- **Le coût.** Prendre la décision avant le démarrage de PrestaShop prend environ 0,2 ms, contre à peu près 130 ms pour démarrer PrestaShop et ouvrir ses connexions à la base. Sous un flood, c'est la différence entre absorber le trafic et s'y noyer.
- **La portée.** Les fichiers PHP qui ne font pas partie de PrestaShop — un script déposé dans un répertoire d'upload, un installeur oublié — n'atteignent jamais le routeur : aucun hook PrestaShop ne peut les voir. Seul cet étage le peut.

Les réglages sont lus dans un petit fichier que Sentinel exporte à chaque sauvegarde, de sorte que cet étage n'a besoin ni de la base de données ni de PrestaShop. Si ce fichier est absent ou illisible, les requêtes passent simplement : la protection peut cesser de fonctionner, mais elle ne peut pas mettre la boutique à terre.

## Réglages avancés

Ces réglages se trouvent dans la section **Avancé** et sont tous désactivés, ou vides, par défaut.

### Limite par réseau

Compte les requêtes par réseau — un `/24` en IPv4, un `/64` en IPv6 — en plus du comptage par adresse. Cela attrape un attaquant réparti sur une plage, où chaque adresse prise isolément reste sous son propre plafond.

Un réseau est **seulement ralenti, jamais banni** : un `/24` peut être tout un pool opérateur ou un bureau, et le bannir couperait tous les visiteurs légitimes derrière lui.

### Limites par chemin

Une règle par ligne, un chemin puis sa limite propre :

```
/connexion 20
/recherche 40
/module/*/pay 5
```

La correspondance se fait par préfixe, ou avec des jokers `*`, et la première règle qui correspond l'emporte. Chaque chemin dispose de **son propre quota** : naviguer dans le catalogue ne consomme jamais le quota de connexion, et une limite stricte sur la connexion ne pénalise pas la navigation normale.

C'est ce qu'un seuil global unique ne peut pas exprimer : réglez-le assez bas pour protéger le formulaire de connexion et la navigation ordinaire casse.

### Resserrement automatique lors d'un pic

Lorsque le trafic total sur une fenêtre dépasse le seuil de pic, toutes les limites sont **divisées par quatre pendant dix minutes**, puis réévaluées.

Cela répond à ce que les limites par adresse ne peuvent structurellement pas voir : un flood réparti sur des milliers d'adresses, chacune restant sous son propre plafond. Rien ne paraît anormal individuellement, et pourtant la boutique sature.

Le back-office et `sentinel:rate-limit status` indiquent tous deux quand le régime est engagé, et **Reprendre le blocage** le relâche par anticipation.

### Redis

Par défaut, les compteurs vivent dans des fichiers, locaux à un serveur. Si plusieurs serveurs font tourner la même boutique, un attaquant dispose d'un quota complet sur chacun.

Renseigner un DSN Redis (`redis://127.0.0.1:6379/0`, éventuellement avec mot de passe : `redis://:secret@host:6379/0`) donne à tous les serveurs une vue partagée unique. Laissez vide sur une boutique mono-serveur : cela n'apporte rien. Si Redis devient injoignable, le limiteur bascule sur le backend local plutôt que d'échouer.

## Ligne de commande

```bash
# Mode, seuils, backend et chiffres de trafic actuels
php bin/console sentinel:rate-limit status
php bin/console sentinel:rate-limit status --json

# Ce que le limiteur pense d'une adresse (ne compte rien)
php bin/console sentinel:rate-limit test 203.0.113.10

# Réinitialiser une adresse : compteurs et ban éventuel
php bin/console sentinel:rate-limit reset 203.0.113.10

# Reprendre le blocage après suspension par le seuil de sécurité
php bin/console sentinel:rate-limit resume

# Écrire les compteurs courants dans la table de statistiques
php bin/console sentinel:rate-limit flush

# Supprimer les anciennes statistiques et les compteurs expirés
php bin/console sentinel:rate-limit purge
```

`reset` est la procédure de récupération si un visiteur légitime est pris au piège.

## Prérequis

Aucun. La protection fonctionne avec PHP tel quel : aucune extension à installer, aucun paquet à ajouter, aucune configuration serveur à modifier.

Les compteurs sont stockés dans des fichiers, ce qui fonctionne sur tous les hébergements. Redis est utilisé si vous le configurez explicitement, mais il n'est jamais requis. Les fonctionnalités ci-dessus se comportent de façon identique dans tous les cas ; seul le stockage change.

## Remarques et limites

- **Adresses partagées** : le comptage se fait par IP, donc les visiteurs derrière un NAT d'entreprise, un CGNAT mobile ou un réseau scolaire partagent un même compteur. C'est pourquoi les seuils par défaut sont larges.
- **Stockage des compteurs** : les compteurs sont conservés dans des fichiers (ou dans Redis si configuré). Ils peuvent être réinitialisés au redémarrage du serveur ; les bans sont stockés en base et ne sont pas affectés.
- **Portée** : cette protection couvre les floods applicatifs, le scraping agressif et le trafic de robots. Une attaque volumétrique au niveau réseau sature le serveur avant que le moindre code PHP ne s'exécute, et aucun module PHP ne peut y répondre.

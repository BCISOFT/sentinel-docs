---
sidebar_position: 6
---

# Double authentification

La double authentification demande une seconde preuve d'identité à la connexion au back-office : votre mot de passe, puis un code temporaire fourni par une application d'authentification installée sur votre téléphone (Google Authenticator, Authy, 1Password, et d'autres).

Même si quelqu'un vole ou devine votre mot de passe, il ne peut pas entrer sans votre téléphone.

Cette fonctionnalité est **gratuite**. Chaque employé l'active pour son propre compte, et peut la désactiver. Vous pouvez aussi la **rendre obligatoire** pour les employés d'un profil, depuis l'onglet **Politique** — voir [L'imposer à un profil](#limposer-à-un-profil).

## L'activer

Rendez-vous dans **Sentinel > Double authentification > Mes méthodes** et lancez l'assistant.

1. **Scannez le QR code.** Ouvrez votre application d'authentification, choisissez d'ajouter un compte, et visez le QR code affiché à l'écran avec l'appareil photo. Si vous préférez saisir les informations à la main, la même clé est aussi affichée sous forme de texte, prête à être copiée.
2. **Confirmez.** Votre application affiche maintenant un nombre à six chiffres qui change toutes les trente secondes. Saisissez celui du moment dans l'assistant. Cette dernière étape vérifie que votre application et la boutique sont bien d'accord avant que quoi que ce soit ne soit activé.

C'est tout. Votre compte est protégé dès la prochaine connexion.

:::info Votre secret ne quitte pas votre boutique
Le QR code est dessiné par votre propre navigateur, et rien n'est envoyé à un service extérieur pendant la configuration. Votre boutique conserve le secret sous forme chiffrée et ne l'affiche plus jamais ensuite.
:::

## Codes de secours : retrouver l'accès sans votre téléphone

Dès que votre application est confirmée, Sentinel génère **dix codes de secours** et les affiche une seule fois, sur l'écran qui suit la confirmation. Chaque code permet de se connecter une fois, sans l'application d'authentification.

- **Téléchargez-les.** Un bouton « Télécharger en .txt » enregistre les dix codes dans un fichier que vous pouvez imprimer ou ranger en lieu sûr. Conservez-les comme vous conserveriez un double de clé — pas dans une boîte mail que votre compte professionnel peut lire.
- **Confirmez que vous les avez conservés.** Vous ne pouvez pas quitter cet écran sans cocher « J'ai conservé ces codes ». Une fois cette case cochée, c'est la dernière fois que vous les voyez : Sentinel les stocke sous une forme qu'il ne peut plus relire, tout comme il ne stocke jamais votre mot de passe en clair.

### Utiliser un code de secours

Si vous perdez votre téléphone, l'écran de connexion qui demande votre code à six chiffres propose aussi « Utiliser un code de secours ». Saisissez l'un de vos dix codes à la place, et vous entrez exactement comme avec un code de votre application.

Chaque code ne sert **qu'une fois** — celui que vous venez d'utiliser cesse immédiatement de fonctionner, les neuf autres restent valides. Comme pour les codes habituels, six codes de secours erronés d'affilée bloquent l'adresse qui tente de se connecter.

### Suivre le nombre de codes restants

**Mes méthodes** indique toujours combien de codes de secours il vous reste, sans jamais réafficher les codes eux-mêmes — aucun écran, nulle part, ne montre un code une seconde fois. En dessous de trois codes restants, un avertissement apparaît avec une proposition d'en régénérer un nouveau jeu.

### Régénérer un jeu

La régénération demande d'abord un code frais de votre application d'authentification — la même preuve que pour vous connecter. Une fois ce code fourni, dix nouveaux codes s'affichent une fois, exactement comme à l'enrôlement, et chaque code de l'ancien jeu — utilisé ou non — cesse immédiatement de fonctionner. Il n'existe jamais plus d'un jeu valide à la fois.

## Se connecter ensuite

Une fois votre compte protégé, la connexion comporte une étape de plus : après votre mot de passe, Sentinel demande le code à six chiffres de votre application. Rien d'autre ne s'ouvre dans le back-office tant que vous n'en avez pas saisi un valide.

Ensuite, la question ne vous est plus posée pendant un certain temps. À la fin de cette période, la connexion suivante redemande un code.

Quelques règles rendent ce code sûr à utiliser :

- Un code ne sert **qu'une fois**. Même pendant les trente secondes où il reste affiché, il ne peut pas être réutilisé.
- Un petit décalage entre l'horloge de votre téléphone et celle de la boutique est toléré, pour ne pas vous bloquer pour quelques secondes d'écart.
- Après six codes erronés d'affilée, l'adresse qui tente de se connecter est bloquée, et la tentative est enregistrée.

## L'imposer à un profil

Tant que rien n'est imposé, la protection dépend de la bonne volonté de chacun. L'onglet **Politique** de **Sentinel > Double authentification** permet de rendre la double authentification obligatoire pour les employés d'un profil, en leur laissant un délai pour la mettre en place avant qu'elle ne s'impose. Comme le reste de la fonctionnalité, c'est gratuit.

### La matrice des profils

Un interrupteur, **Imposer la double authentification sur cette boutique**, arme l'ensemble. En dessous, chaque profil d'employé reçoit une exigence :

| Exigence | Ce que voient les employés du profil |
| --- | --- |
| **Non requise** | Rien du tout : ni bandeau, ni écran d'enrôlement, jamais — même après l'échéance des autres. |
| **Optionnelle** | Rien ne leur est demandé. Ils peuvent toujours s'enrôler d'eux-mêmes. |
| **Obligatoire** | Ils sont prévenus, puis relancés, puis contraints de s'enrôler. |

Une colonne indique combien d'employés compte chaque profil : vous savez à qui vous vous apprêtez à imposer quoi. À l'enregistrement, une boîte de confirmation annonce le nombre d'employés concernés et la date la plus proche à laquelle l'obligation peut tomber.

Quatre réglages complètent la matrice :

- **Rappel après (jours)** — le délai avant l'apparition de l'écran de rappel. Par défaut : 7 jours.
- **Échéance après (jours)** — le délai avant que l'enrôlement ne devienne obligatoire. Par défaut : 30 jours. **0** l'impose dès la première connexion ; **-1** ne l'impose jamais, et n'affiche que le bandeau.
- **Durée de validité d'une session 2FA (secondes)** — combien de temps un second facteur vérifié reste valable avant qu'un nouveau code soit demandé. 0 le limite à la session du back-office.
- **Tentatives maximales** — le nombre d'essais autorisés sur un code avant que la demande soit refusée.

Modifier une durée après coup atteint les employés déjà comptés, mais uniquement dans le sens du durcissement : une échéance rapprochée s'applique à eux dès la page suivante, une échéance repoussée ne rallonge le délai de personne.

### Chaque employé a son propre compte à rebours

Le compte à rebours ne démarre pas quand vous enregistrez la politique. Il démarre **par employé**, à sa première requête dans le back-office une fois que l'obligation le concerne.

Trois conséquences à connaître :

- Un employé créé après l'enregistrement de la politique dispose de son propre délai complet, à partir de sa première connexion — il n'atterrit pas directement en phase « obligatoire ».
- Un employé qui ne se connecte jamais ne démarre jamais son compteur, et n'est jamais mis dehors en son absence.
- La date affichée sous la matrice est donc la date la **plus proche** que quelqu'un puisse atteindre, pas une date vraie pour tout le monde.

### Ce que voit l'employé

1. **Période de grâce.** Il se connecte normalement et voit un bandeau bleu : le nombre de jours restants, et un lien direct vers la page d'enrôlement. Le bandeau peut être refermé.
2. **Rappel**, une fois le délai « Rappel après » écoulé. À la connexion, un écran d'enrôlement apparaît, avec un compte à rebours et un bouton **Plus tard**. **Plus tard** le laisse entrer immédiatement et ne revient pas avant 24 h. À partir de là, le bandeau passe à l'orange et ne peut plus être refermé — le dernier avertissement avant la fermeture de la porte n'est pas de ceux qu'on écarte d'un geste.
3. **Échéance dépassée.** Le même écran, sans **Plus tard**. Il configure son application sur place, dans le même assistant qu'un enrôlement volontaire, et poursuit dans le back-office **au cours de la même session** — sans se reconnecter, sans appeler personne. L'enrôlement vaut vérification : aucun code ne lui est redemandé dans la foulée. Les dix [codes de secours](#codes-de-secours--retrouver-laccès-sans-votre-téléphone) lui sont remis exactement comme d'habitude, avec la même case « J'ai conservé ces codes » à cocher.

Le bandeau n'apparaît jamais sur la page de connexion elle-même.

:::warning La période de grâce prévient ; elle ne protège pas
Pendant la grâce et le rappel, un employé concerné se connecte toujours **avec son seul mot de passe**. Le compte à rebours lui annonce l'obligation à venir ; il ne protège pas son compte pendant ce temps. Une période de grâce est un préavis, pas une protection.

Si vous avez besoin que la protection s'applique maintenant plutôt que dans un mois, réglez **Échéance après (jours)** sur `0` : l'enrôlement est alors exigé dès la première connexion concernée.
:::

### S'enrôler sans accès à Sentinel

L'employé à qui vous imposez la 2FA n'a peut-être aucun droit de lecture sur le menu Sentinel. La page d'enrôlement est donc servie à sa propre adresse, `sentinel/account/two-factor`, à **tout employé connecté** — sans aucune permission Sentinel. Un lien depuis la page de son compte employé l'y mène, ce qui lui permet aussi de s'enrôler de sa propre initiative, avant que quoi que ce soit ne lui soit imposé.

Cette page n'affiche jamais que les méthodes de l'employé connecté. Elle ne prend aucun identifiant d'employé dans l'URL : elle ne peut donc pas être pointée sur le compte d'un autre.

### Si rien ne peut être enrôlé ici

Si la boutique se trouve dans un état où aucune méthode ne peut être enrôlée, l'obligation se suspend d'elle-même plutôt que de mettre quelqu'un dehors : rien n'est demandé, personne n'est bloqué, et un avertissement est consigné dans le [Journal de sécurité](./security-logs.md) une fois par jour jusqu'à ce que la situation soit réglée. La politique que vous avez enregistrée n'est pas touchée : il n'y a rien à rétablir ensuite.

### Les étapes journalisées

Le [Journal de sécurité](./security-logs.md) conserve les étapes de l'obligation : obligation démarrée pour un employé, passage en rappel, échéance dépassée, et dérogation accordée.

### Dispenser un employé

Un employé en déplacement, un téléphone en cours de remplacement, une échéance qui tombe au plus mauvais moment : `sentinel:2fa:exempt` (voir [plus bas](#pour-les-administrateurs--retrouver-laccès)) dispense un employé de l'obligation pour un nombre de jours donné. C'est temporaire — les jours écoulés, l'obligation s'applique à nouveau à lui — et cela ne change rien à l'onglet Politique, qui continue de s'appliquer à tous les autres.

## La désactiver

Depuis **Mes méthodes**, supprimez votre application d'authentification et confirmez. Votre mot de passe seul suffira à la prochaine connexion.

Si votre profil est réglé sur **Obligatoire**, supprimer votre application ne vous en dispense pas : l'obligation s'applique à nouveau, et l'écran d'enrôlement revient — immédiatement si votre échéance est déjà passée.

## Ce qui est enregistré

Sentinel note chaque activation, chaque code saisi — juste ou faux —, chaque suppression, et chaque usage ou régénération de codes de secours dans le [Journal de sécurité](./security-logs.md), avec l'adresse d'où venait la demande et, pour les codes de secours, le nombre de codes restants ensuite.

## En cas de problème

Sentinel est conçu pour qu'une panne du contrôle du second facteur ne verrouille jamais toute la boutique. Si ce contrôle échoue pour une raison quelconque, le back-office reste accessible et l'incident est enregistré. La double authentification protège votre boutique ; elle ne deviendra pas la raison pour laquelle vous n'y accédez plus.

## Pour les administrateurs : retrouver l'accès

Si un employé perd son téléphone — ou si plus personne ne parvient à passer l'écran du code — des commandes lancées depuis le serveur rétablissent l'accès. Le code ne leur est jamais demandé, ce qui en fait un recours fiable.

```bash
# Voir qui est protégé, avec quelle application, depuis quand, et combien de codes de secours restent
bin/console sentinel:2fa:status

# Désactiver pour un employé
bin/console sentinel:2fa:disable --employee=employe@exemple.com

# Désactiver pour tout le monde
bin/console sentinel:2fa:disable --all

# Dispenser un employé de la politique d'enrôlement, sans toucher à la politique
bin/console sentinel:2fa:exempt --employee=employe@exemple.com --days=30
```

`sentinel:2fa:status` n'affiche jamais de secret, ni de code — pas même un code de secours. Si un employé a aussi perdu ses codes de secours, désactiver depuis le serveur reste le chemin pour rentrer.

`sentinel:2fa:exempt` suspend la [politique d'enrôlement](#limposer-à-un-profil) pour ce seul employé, pendant le nombre de jours indiqué. Une fois ces jours écoulés, l'obligation s'applique à nouveau à lui, toute seule — il n'y a rien à défaire. L'onglet Politique reste exactement tel qu'il était, et tous les autres employés y restent soumis. Ajoutez `--json` pour lire le résultat depuis un script.

## Ce qui est couvert

La double authentification ne concerne que les connexions au back-office. Vos clients ne sont jamais affectés, et les tâches planifiées ou lancées en ligne de commande continuent de fonctionner normalement.

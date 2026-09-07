---
sidebar_position: 6
---

# Double authentification

La double authentification demande une seconde preuve d'identité à la connexion au back-office : votre mot de passe, puis un code temporaire fourni par une application d'authentification installée sur votre téléphone (Google Authenticator, Authy, 1Password, et d'autres).

Même si quelqu'un vole ou devine votre mot de passe, il ne peut pas entrer sans votre téléphone.

Cette fonctionnalité est **gratuite**. Chaque employé l'active pour son propre compte, et peut la désactiver — il n'existe pas encore de réglage valable pour toute la boutique.

## L'activer

Rendez-vous dans **Sentinel > Double authentification > Mes méthodes** et lancez l'assistant.

1. **Scannez le QR code.** Ouvrez votre application d'authentification, choisissez d'ajouter un compte, et visez le QR code affiché à l'écran avec l'appareil photo. Si vous préférez saisir les informations à la main, la même clé est aussi affichée sous forme de texte, prête à être copiée.
2. **Confirmez.** Votre application affiche maintenant un nombre à six chiffres qui change toutes les trente secondes. Saisissez celui du moment dans l'assistant. Cette dernière étape vérifie que votre application et la boutique sont bien d'accord avant que quoi que ce soit ne soit activé.

C'est tout. Votre compte est protégé dès la prochaine connexion.

:::info Votre secret ne quitte pas votre boutique
Le QR code est dessiné par votre propre navigateur, et rien n'est envoyé à un service extérieur pendant la configuration. Votre boutique conserve le secret sous forme chiffrée et ne l'affiche plus jamais ensuite.
:::

## Se connecter ensuite

Une fois votre compte protégé, la connexion comporte une étape de plus : après votre mot de passe, Sentinel demande le code à six chiffres de votre application. Rien d'autre ne s'ouvre dans le back-office tant que vous n'en avez pas saisi un valide.

Ensuite, la question ne vous est plus posée pendant un certain temps. À la fin de cette période, la connexion suivante redemande un code.

Quelques règles rendent ce code sûr à utiliser :

- Un code ne sert **qu'une fois**. Même pendant les trente secondes où il reste affiché, il ne peut pas être réutilisé.
- Un petit décalage entre l'horloge de votre téléphone et celle de la boutique est toléré, pour ne pas vous bloquer pour quelques secondes d'écart.
- Après six codes erronés d'affilée, l'adresse qui tente de se connecter est bloquée, et la tentative est enregistrée.

## La désactiver

Depuis **Mes méthodes**, supprimez votre application d'authentification et confirmez. Votre mot de passe seul suffira à la prochaine connexion.

## Ce qui est enregistré

Sentinel note chaque activation, chaque code saisi — juste ou faux — et chaque suppression dans le [Journal de sécurité](./security-logs.md), avec l'adresse d'où venait la demande.

## En cas de problème

Sentinel est conçu pour qu'une panne du contrôle du second facteur ne verrouille jamais toute la boutique. Si ce contrôle échoue pour une raison quelconque, le back-office reste accessible et l'incident est enregistré. La double authentification protège votre boutique ; elle ne deviendra pas la raison pour laquelle vous n'y accédez plus.

## Pour les administrateurs : retrouver l'accès

Si un employé perd son téléphone — ou si plus personne ne parvient à passer l'écran du code — deux commandes lancées depuis le serveur rétablissent l'accès. Le code ne leur est jamais demandé, ce qui en fait un recours fiable.

```bash
# Voir qui est protégé, avec quelle application, et depuis quand
bin/console sentinel:2fa:status

# Désactiver pour un employé
bin/console sentinel:2fa:disable --employee=employe@exemple.com

# Désactiver pour tout le monde
bin/console sentinel:2fa:disable --all
```

`sentinel:2fa:status` n'affiche jamais de secret ni de code.

## Ce qui est couvert

La double authentification ne concerne que les connexions au back-office. Vos clients ne sont jamais affectés, et les tâches planifiées ou lancées en ligne de commande continuent de fonctionner normalement.

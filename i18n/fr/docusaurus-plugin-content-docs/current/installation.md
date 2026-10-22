---
sidebar_position: 2
---

# Installation

Ce guide vous accompagnera dans le processus d'installation de Sentinel sur votre boutique PrestaShop.

## Prérequis

Avant d'installer Sentinel, assurez-vous que votre système répond à ces exigences :

- PrestaShop 1.7.7.0 - 9.1.x
- PHP 7.2 - 8.5
- Permissions d'écriture pour les répertoires `/modules` et `/var/logs`

## Télécharger le module

Parcourez toutes les versions sur la [page des releases](https://github.com/bcisoft/sentinel-docs/releases).

## Méthodes d'installation

### Méthode 1 : Installation depuis le back-office (Recommandé)

1. **Télécharger le module**

   Téléchargez la dernière version en utilisant le lien ci-dessus.

2. **Installer le module**

   Connectez-vous à votre panneau d'administration PrestaShop et naviguez vers :

   **Modules > Gestionnaire de modules**

   Cliquez sur le bouton **Installer un module**

   Sélectionnez le fichier zip du module sentinel

### Méthode 2 : Installation manuelle

1. **Télécharger le module**

   Téléchargez la dernière version en utilisant le lien ci-dessus.

2. **Extraire l'archive**

   Extrayez le fichier ZIP dans votre répertoire PrestaShop `/modules` :

   ```bash
   cd /chemin/vers/prestashop/modules
   unzip sentinel-1.0.0.zip
   ```

3. **Activer le module**

   Connectez-vous à votre panneau d'administration PrestaShop et naviguez vers :

   **Modules > Gestionnaire de modules**

   Recherchez "Sentinel" et cliquez sur **Installer**.

## Post-installation

### Vérifier l'installation

Après l'installation, vérifiez que Sentinel fonctionne correctement :

1. Vérifiez que le module apparaît dans **Modules > Gestionnaire de modules**
2. Assurez-vous que le statut du module est "Activé"

### Vérifier les permissions

Assurez-vous que le répertoire des logs a les permissions d'écriture :

```bash
chmod 755 /chemin/vers/prestashop/var/logs
```

### Tester la protection

Vous pouvez tester que Sentinel protège votre boutique en tentant un modèle d'injection SQL bénin dans votre navigateur :

```
https://votreboutique.com/index.php?test=SELECT+SLEEP(1)
```

Vous devriez voir une page bloquée par Sentinel avec une erreur 403.

:::warning
Testez uniquement avec des modèles bénins et sur votre propre boutique. Ne tentez jamais de vraies attaques.
:::

## Mettre à jour Sentinel

### Notifications de mise à jour

Sentinel vous prévient lorsqu'une nouvelle version est publiée. Chaque appel du module à l'API Sentinel répond avec la dernière version publiée : la vérification ne coûte aucune requête supplémentaire et ne demande aucune configuration.

Lorsque votre version installée est en retard, un bandeau apparaît en haut de chaque page Sentinel avec :

- le numéro de la version publiée et celui de la version que vous utilisez
- un lien vers la page de release pour télécharger la mise à jour
- un lien vers le journal des modifications, lorsqu'il est disponible

Le widget Sentinel du tableau de bord PrestaShop reprend la même information sur une ligne, qui renvoie vers la release.

Masquer le bandeau le cache jusqu'à la publication de la version suivante ; la ligne du widget, elle, reste affichée, pour qu'une mise à jour en attente ne disparaisse jamais complètement.

:::note
Le bandeau dépend de la capacité du module à joindre l'API Sentinel. Une boutique dont les appels sortants sont bloqués ne le verra jamais : consultez alors régulièrement la [page des releases](https://github.com/bcisoft/sentinel-docs/releases).
:::

### Appliquer la mise à jour

1. Téléchargez la nouvelle version sur la [page des releases](https://github.com/bcisoft/sentinel-docs/releases)
2. Allez dans **Modules > Gestionnaire de modules**
3. Cliquez sur **Charger un module** et sélectionnez le nouveau fichier ZIP

Vos réglages, journaux et listes blanches sont conservés.

## Dépannage

### Erreurs de permissions

Si vous rencontrez des erreurs de permissions pendant l'installation :

```bash
# Définir la propriété correcte (remplacez www-data par votre utilisateur de serveur web)
sudo chown -R www-data:www-data /chemin/vers/prestashop/modules/sentinel

# Définir les permissions correctes
sudo chmod -R 755 /chemin/vers/prestashop/modules/sentinel
```

### Le module ne s'active pas

Si le module ne parvient pas à s'activer :

1. Vérifiez les logs d'erreurs PHP : `/var/log/apache2/error.log` ou `/var/log/php-fpm/error.log`
2. Vérifiez la compatibilité de la version PrestaShop
3. Vérifiez les permissions des fichiers

## Configuration post-installation

### 1. Activer la protection Auto Prepend File (Recommandé)

Pour une protection complète, activez la protection Auto Prepend File :

1. Allez dans **Modules > Sentinel > Configuration**
2. Cliquez sur **Tenter l'installation automatique**
3. Si l'installation automatique échoue, suivez les [instructions manuelles](./features/auto-prepend-protection.md)

### 2. Lancer un scan de vulnérabilités

Vérifiez si votre installation contient des vulnérabilités connues :

1. Allez dans **Modules > Sentinel > Scanner de sécurité**
2. Cliquez sur **Lancer un scan**
3. Consultez le rapport et corrigez les vulnérabilités détectées

### 3. Surveiller les logs

Les logs sont automatiquement créés dans `/var/logs/sentinel-YYYY-MM-DD.log`

Consultez le guide [Logs de sécurité](./features/security-logs.md) pour apprendre à les analyser.

## Qui peut modifier les réglages {#who-can-change-the-settings}

Seul un employé qui peut configurer le module Sentinel modifie les réglages de sa page de configuration (**Modules > Gestionnaire de modules > Sentinel > Configurer**) : un SuperAdmin, ou un profil qui a le droit **Modifier** sur **Gestionnaire de modules** et le droit **Configurer** sur le module Sentinel, tous deux réglés dans **Paramètres avancés > Équipe > Permissions**. Sous PrestaShop 1.7 et 8, PrestaShop exige déjà ces droits avant d'ouvrir la page. Sous PrestaShop 9, un employé qui n'a que la lecture sur **Gestionnaire de modules** peut ouvrir la page, mais la voit en lecture seule.

Les réglages concernés sont :

- l'association d'une licence
- l'installation automatique d'Auto Prepend
- les exclusions de la Vérification d'intégrité
- le téléchargement des signatures de détection des menaces
- le rafraîchissement de l'abonnement
- l'activation ou la désactivation de la détection des menaces

La page en lecture seule affiche toujours l'offre, la licence, l'état des protections, les instructions Auto Prepend et les exclusions de la Vérification d'intégrité, sans aucun bouton, lien, interrupteur ni formulaire pour les modifier, et avec la mention **Vous devez avoir le droit de configurer ce module pour modifier ces réglages.** Si cet employé envoie quand même une modification, rien n'est changé et la page indique **Votre compte n'est pas autorisé à modifier ces réglages. Rien n'a été modifié : demandez à l'administrateur de la boutique.** Pour une association de licence, le message est **Votre compte n'est pas autorisé à associer une licence à cette boutique. Rien n'a été enregistré : demandez à l'administrateur de la boutique de refaire l'association de la licence depuis cette page.**

La déclaration des proxys de confiance et les cartes [Analyses automatiques](./features/vulnerability-scanner.md#automatic-scans) et [Destinataires des alertes](./features/vulnerability-scanner.md#alert-recipients) suivaient déjà la même règle.

## Prochaines étapes

Maintenant que Sentinel est installé, apprenez-en plus sur :

- [Détection de menaces](./features/threat-detection.md)
- [Scanner de vulnérabilités](./features/vulnerability-scanner.md)
- [Protection Auto Prepend File](./features/auto-prepend-protection.md)
- [Logs de sécurité](./features/security-logs.md)

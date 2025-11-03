---
sidebar_position: 2
---

# Installation

Ce guide vous accompagnera dans le processus d'installation de Sentinel sur votre boutique PrestaShop.

## Prérequis

Avant d'installer Sentinel, assurez-vous que votre système répond à ces exigences :

- PrestaShop 1.7.7.x - 8.2.3
- PHP >= 7.2
- Permissions d'écriture pour les répertoires `/modules` et `/var/logs`

## Méthodes d'installation

### Méthode 1 : Installation depuis le back-office (Recommandé)

1. **Télécharger le module**

   Téléchargez la dernière version depuis le [dépôt GitHub](https://github.com/your-username/sentinel/releases).

2. **Installer le module**

   Connectez-vous à votre panneau d'administration PrestaShop et naviguez vers :

   **Modules > Gestionnaire de modules**

   Cliquez sur le bouton **Installer un module**

   Sélectionnez le zip du module sentinel

### Méthode 2 : Installation manuelle

1. **Télécharger le module**

   Téléchargez la dernière version depuis le [dépôt GitHub](https://github.com/your-username/sentinel/releases).

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

Assurez-vous que le répertoire des journaux a les permissions d'écriture :

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

1. Vérifiez les journaux d'erreurs PHP : `/var/log/apache2/error.log` ou `/var/log/php-fpm/error.log`
2. Vérifiez la compatibilité de la version PrestaShop
3. Vérifiez les permissions des fichiers

## Prochaines étapes

Maintenant que Sentinel est installé, découvrez :

- [Détection des menaces](./features/threat-detection.md)
- [Journaux de sécurité](./features/security-logs.md)

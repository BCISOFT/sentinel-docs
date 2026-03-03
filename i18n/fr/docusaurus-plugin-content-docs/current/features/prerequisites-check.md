---
sidebar_position: 6
---

# Vérification des prérequis

La vérification des prérequis de Sentinel vérifie que votre serveur PrestaShop respecte la configuration PHP requise et recommandée, ainsi que les permissions des répertoires.

## Fonctionnement

1. **Intégration au tableau de bord** : La vérification des prérequis est affichée sous forme de bloc dans le tableau de bord Sentinel
2. **Piloté par l'API** : Les définitions des prérequis (version PHP, extensions, configuration, répertoires) sont récupérées depuis l'API Sentinel en fonction de votre version PrestaShop
3. **Vérification locale** : Le module vérifie la configuration PHP de votre serveur, les extensions chargées et les permissions des répertoires par rapport aux exigences fournies par l'API
4. **Chargement AJAX** : La vérification s'exécute de manière asynchrone au chargement du tableau de bord, sans ralentir l'affichage de la page

## Ce qui est vérifié

### Configuration PHP

- **Version PHP** : Comparée aux versions requise et recommandée pour votre version PrestaShop
- **Extensions PHP** : Vérifie que les extensions requises (curl, dom, gd, intl, json, mbstring, openssl, pdo_mysql, etc.) sont chargées
- **Directives PHP** : Vérifie les paramètres ini comme `memory_limit`, `max_input_vars`, `post_max_size`, `upload_max_filesize`, `allow_url_fopen`, etc.

### Répertoires

- **Existence** : Vérifie que les répertoires essentiels de PrestaShop existent (var/cache, var/logs, img, modules, translations, etc.)
- **Écriture** : Vérifie que ces répertoires disposent des permissions d'écriture appropriées

## Indicateurs de statut

Chaque catégorie (Configuration PHP et Répertoires) affiche une icône de statut :

- **Coche verte** (check_circle) : Tous les prérequis sont remplis
- **Avertissement orange** (warning) : Certains paramètres recommandés ne sont pas respectés, mais les requis sont satisfaits
- **Erreur rouge** (error) : Des prérequis obligatoires ne sont pas respectés

## Consultation des détails

Lorsqu'une catégorie présente des avertissements ou des erreurs, un clic sur la ligne ouvre une fenêtre modale avec un tableau détaillé affichant :

### Tableau des détails PHP

| Colonne | Description |
|---------|-------------|
| Élément | Nom de la directive ou de l'extension PHP |
| Requis | Valeur minimale requise |
| Recommandé | Valeur recommandée pour des performances optimales |
| Actuel | Valeur actuelle sur votre serveur |
| Statut | Indicateur visuel de statut |

### Tableau des détails des répertoires

| Colonne | Description |
|---------|-------------|
| Chemin | Chemin du répertoire relatif à la racine PrestaShop |
| Existe | Si le répertoire existe |
| Accessible en écriture | Si le répertoire est accessible en écriture |
| Statut | Indicateur visuel de statut |

## Endpoint API

Les définitions des prérequis sont récupérées depuis :

```
GET /prerequisites?ps_version=X.Y.Z
```

Cela permet d'adapter les exigences en fonction de la version PrestaShop installée et de les mettre à jour côté serveur sans nécessiter de nouvelle release du module.

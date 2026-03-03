---
sidebar_position: 1
slug: /
---

# Introduction à Sentinel

Bienvenue dans **Sentinel**, un module de sécurité complet pour PrestaShop qui surveille et sécurise votre site e-commerce contre les menaces et vulnérabilités.

## Qu'est-ce que Sentinel ?

Sentinel est un outil de surveillance, détection et analyse des menaces et vulnérabilités spécialement conçu pour PrestaShop 1.7.7 à 8.2.3. Il surveille en continu l'activité de votre boutique, détecte les requêtes malveillantes par analyse de signatures, et vous aide à identifier les vulnérabilités avant qu'elles ne puissent être exploitées.

## Fonctionnalités principales

- **Détection de menaces en temps réel** : Identifie les patterns malveillants dans les requêtes HTTP via détection par signatures
- **Blocage automatique** : Stoppe immédiatement les menaces avec des réponses HTTP 403
- **Logs complets** : Enregistre tous les événements de sécurité avec contexte détaillé pour analyse forensique
- **Scanner de vulnérabilités** : Analyse manuelle des vulnérabilités connues dans les modules et le core PrestaShop
- **Vérification d'intégrité des fichiers** : Vérifie que les fichiers du core PrestaShop et des modules n'ont pas été altérés
- **Protection Auto Prepend File** : Protège contre les accès directs aux fichiers PHP contournant PrestaShop
- **Log des échecs de connexion** : Détecte les tentatives de connexion échouées au back-office
- **Log des requêtes POST/PUT/PATCH/DELETE** : Enregistre toutes les requêtes de modification avec leur payload
- **Vérification des prérequis** : Vérifie la configuration PHP, les extensions et les permissions des répertoires selon les exigences spécifiques à la version
- **Zéro configuration** : Fonctionne immédiatement après installation avec des signatures pré-configurées
- **Intégration PrestaShop** : S'intègre de manière transparente avec PrestaShop

## Quelles menaces Sentinel détecte-t-il ?

Sentinel protège contre un large éventail d'attaques web courantes :

- **Injection SQL** : Y compris les techniques d'injection aveugle utilisant les fonctions SLEEP
- **Opérations sur fichiers** : Tentatives d'écriture de fichiers malveillants ou de téléchargement de code distant
- **Exécution de commandes** : Empêche les tentatives d'exécution de commandes à distance
- **Exploits de modules** : Détecte les vulnérabilités dans les modules PrestaShop populaires
- **Manipulation de paramètres** : Identifie la manipulation suspecte de paramètres

## Comment ça fonctionne

### Protection en temps réel

1. **Interception précoce** : Sentinel se greffe au cycle de vie des requêtes PrestaShop avant le dispatcher
2. **Pattern matching** : Chaque requête est analysée contre des signatures de menaces pré-configurées
3. **Réponse immédiate** : Les requêtes malveillantes sont bloquées instantanément avec une page d'erreur professionnelle
4. **Logs détaillés** : Tous les événements de sécurité sont enregistrés avec contexte complet (IP, URI, méthode, payload)
5. **Rotation automatique** : Les logs sont rotationnés quotidiennement et conservés pendant 7 jours

### Scanner de vulnérabilités

1. **Collecte d'informations** : Sentinel collecte les informations de votre installation (version PS, modules installés)
2. **Analyse via API** : Les données sont envoyées à l'API Sentinel qui compare avec sa base de vulnérabilités
3. **Rapport détaillé** : Un rapport est généré avec les vulnérabilités trouvées, classées par criticité
4. **Historique** : Tous les scans sont conservés pour suivre l'évolution de la sécurité

### Vérification d'intégrité des fichiers

1. **Scan des fichiers** : Tous les fichiers du core et des modules sont scannés et hashés
2. **Comparaison officielle** : Les empreintes sont comparées aux versions officielles PrestaShop et des modules
3. **Détection des modifications** : Tout fichier altéré, ajouté ou manquant est signalé

### Protection Auto Prepend File

1. **Configuration PHP** : Un fichier Sentinel est exécuté avant tout autre fichier PHP
2. **Log complet** : Tous les accès directs aux fichiers PHP sont enregistrés
3. **Détection d'exploitation** : Les tentatives d'accès à des fichiers vulnérables sont loguées
4. **Analyse forensique** : En cas d'incident, les logs permettent de reconstituer l'attaque

## Prérequis système

- PrestaShop 1.7.7.x - 8.2.3
- PHP >= 7.2
- Permissions d'écriture pour le répertoire `/var/logs`

## Démarrage rapide

Commencez avec Sentinel en quelques étapes :

1. [Installez le module](./installation.md)
2. Activez-le depuis votre panneau d'administration PrestaShop
3. Votre boutique est maintenant protégée !
4. (Optionnel mais recommandé) [Activez la protection Auto Prepend File](./features/auto-prepend-protection.md)
5. (Recommandé) [Lancez un scan de vulnérabilités](./features/vulnerability-scanner.md)

Aucune configuration supplémentaire requise - Sentinel fonctionne immédiatement après installation.

## Couches de protection

Sentinel offre plusieurs couches de protection complémentaires :

| Couche                                                        | Protection                                         | Activation            |
| ------------------------------------------------------------- | -------------------------------------------------- | --------------------- |
| **Détection de signatures URI**                               | Bloque les patterns malveillants dans les requêtes | ✓ Automatique         |
| **Log des échecs de connexion**                               | Détecte les tentatives de force brute              | ✓ Automatique         |
| **Log des requêtes POST/PUT/PATCH/DELETE**                    | Enregistre toutes les modifications                | ✓ Automatique         |
| **Scanner de vulnérabilités**                                 | Détecte les modules/core vulnérables               | Manuel via BO         |
| **[Vérification d'intégrité](./features/integrity-check.md)** | Détecte les fichiers altérés                       | Manuel via BO (Pro)   |
| **Protection Auto Prepend File**                              | Protège contre accès directs aux fichiers PHP      | Configuration requise |

---

Prêt à protéger votre boutique PrestaShop ? Continuez vers le [Guide d'installation](./installation.md).

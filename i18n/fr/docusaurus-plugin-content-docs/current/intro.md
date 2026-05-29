---
sidebar_position: 1
slug: /
---

# Introduction à Sentinel

Bienvenue dans **Sentinel**, un module de sécurité complet pour PrestaShop qui surveille et sécurise votre site e-commerce contre les menaces et vulnérabilités.

## Qu'est-ce que Sentinel ?

Sentinel est un outil de surveillance, détection et analyse des menaces et vulnérabilités spécialement conçu pour PrestaShop 1.7.7 à 9.0.x. Il surveille en continu l'activité de votre boutique, détecte les requêtes malveillantes par analyse de signatures, et vous aide à identifier les vulnérabilités avant qu'elles ne puissent être exploitées.

## Fonctionnalités principales

- **Détection de menaces en temps réel** *(Pro)* : Identifie les patterns malveillants dans les requêtes HTTP via détection par signatures
- **Blocage automatique** *(Pro)* : Stoppe immédiatement les menaces avec des réponses HTTP 403
- **Logs complets** : Enregistre tous les événements de sécurité avec contexte détaillé pour analyse forensique
- **Scanner de vulnérabilités** : Analyse manuelle des vulnérabilités connues dans les modules et le core PrestaShop
- **Vérification d'intégrité des fichiers** *(Pro)* : Vérifie que les fichiers du core PrestaShop et des modules n'ont pas été altérés
- **Protection Auto Prepend File** *(Pro)* : Protège contre les accès directs aux fichiers PHP contournant PrestaShop
- **Log des échecs de connexion** : Détecte les tentatives de connexion échouées au back-office
- **Log des requêtes POST/PUT/PATCH/DELETE** : Enregistre toutes les requêtes de modification avec leur payload
- **Vérification des prérequis** : Vérifie la configuration PHP, les extensions et les permissions des répertoires selon les exigences spécifiques à la version
- **Zéro configuration** : Fonctionne immédiatement après installation
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

### Résilience : aucun impact sur le back-office

Sentinel s'appuie sur une API distante pour certaines données, mais l'API n'est
jamais sur le chemin critique du rendu du back-office :

1. **Requêtes bornées** : les appels en arrière-plan effectués pendant le chargement d'une page utilisent des délais courts, de sorte qu'une API lente ne peut jamais bloquer une page.
2. **Disjoncteur (circuit breaker)** : après une panne réseau, Sentinel cesse d'appeler l'API pendant une courte période et sert instantanément des données en cache ou dégradées — les pages suivantes se chargent sans aucun délai.
3. **Widget asynchrone** : le widget du tableau de bord d'accueil s'affiche immédiatement et charge ses données issues de l'API en arrière-plan.

Si l'API Sentinel est lente ou injoignable, le back-office PrestaShop continue de
fonctionner normalement ; seules les sections alimentées par l'API affichent un état
temporairement dégradé.

## Prérequis système

- PrestaShop 1.7.7 - 9.0.x
- PHP >= 7.2
- Permissions d'écriture pour le répertoire `/var/logs`

## Démarrage rapide

Commencez avec Sentinel en quelques étapes :

1. [Installez le module](./installation.md)
2. Activez-le depuis votre panneau d'administration PrestaShop
3. Votre boutique est maintenant protégée !
4. (Pro) [Activez la protection Auto Prepend File](./features/auto-prepend-protection.md)
5. (Recommandé) [Lancez un scan de vulnérabilités](./features/vulnerability-scanner.md)

Aucune configuration supplémentaire requise - Sentinel fonctionne immédiatement après installation.

## Couches de protection

Sentinel offre plusieurs couches de protection complémentaires :

| Couche                                                        | Protection                                         | Activation            |
| ------------------------------------------------------------- | -------------------------------------------------- | --------------------- |
| **[Log des échecs de connexion](./features/security-logs.md)** | Détecte les tentatives de force brute            | ✓ Automatique         |
| **[Log des requêtes POST/PUT/PATCH/DELETE](./features/security-logs.md)** | Enregistre toutes les modifications   | ✓ Automatique         |
| **[Scanner de vulnérabilités](./features/vulnerability-scanner.md)** | Détecte les modules/core vulnérables        | Manuel via BO         |
| **[Détection de signatures URI](./features/threat-detection.md)** | Bloque les patterns malveillants dans les requêtes | Automatique (Pro) |
| **[Vérification d'intégrité](./features/integrity-check.md)** | Détecte les fichiers altérés                       | Manuel via BO (Pro)   |
| **[Protection Auto Prepend File](./features/auto-prepend-protection.md)** | Protège contre accès directs aux fichiers PHP | Configuration (Pro) |

---

Prêt à protéger votre boutique PrestaShop ? Continuez vers le [Guide d'installation](./installation.md).

---
sidebar_position: 1
slug: /
---

# Introduction à Sentinel

Bienvenue dans **Sentinel**, un module de sécurité complet pour PrestaShop qui protège votre site e-commerce contre les attaques malveillantes.

## Qu'est-ce que Sentinel ?

Sentinel est un pare-feu applicatif web (WAF) spécialement conçu pour PrestaShop 1.7.7 à 8.2.3. Il agit comme un bouclier protecteur entre votre boutique et les attaquants potentiels en détectant et bloquant les requêtes malveillantes avant qu'elles n'atteignent votre application principale.

## Fonctionnalités clés

- **Détection des menaces en temps réel** : Identifie les schémas malveillants dans les requêtes HTTP grâce à la détection par signatures
- **Blocage automatique des requêtes** : Arrête immédiatement les menaces avec des réponses HTTP 403
- **Journalisation complète** : Enregistre tous les événements de sécurité avec un contexte détaillé pour l'analyse forensique
- **Configuration zéro** : Fonctionne immédiatement avec un grand nombre signatures de menaces préconfigurées
- **Intégration PrestaShop** : S'intègre parfaitement et de manière transparante à PrestaShop

## Quelles menaces Sentinel détecte-t-il ?

Sentinel protège contre un large éventail d'attaques web courantes :

- **Injection SQL** : Y compris les techniques d'injection aveugle utilisant les fonctions SLEEP
- **Opérations sur les fichiers** : Tentatives d'écriture de fichiers malveillants ou de téléchargement de code distant
- **Exécution de commandes** : Empêche les tentatives d'exécution de commandes à distance
- **Exploits de modules** : Détecte les vulnérabilités dans les modules PrestaShop populaires
- **Manipulation de paramètres** : Identifie la manipulation suspecte de paramètres

## Comment ça fonctionne

1. **Interception précoce** : Sentinel s'accroche au cycle de vie des requêtes PrestaShop avant que le dispatcher ne traite les requêtes
2. **Correspondance de motifs** : Chaque requête est analysée par rapport aux signatures de menaces préconfigurées
3. **Réponse immédiate** : Les requêtes malveillantes sont bloquées instantanément avec une page d'erreur professionnelle
4. **Journalisation détaillée** : Tous les événements de sécurité sont enregistrés avec le contexte complet (IP, URI, méthode, charge utile)
5. **Rotation automatique** : Les journaux ont une rotation quotidienne et conservés pendant 7 jours

## Configuration requise

- PrestaShop 1.7.7.x - 8.2.3
- PHP >= 7.2
- Permissions d'écriture pour le répertoire `/var/logs`

## Démarrage rapide

Commencez avec Sentinel en quelques étapes :

1. [Installez le module](./installation.md)
2. Activez-le depuis votre panneau d'administration PrestaShop
3. Votre boutique est maintenant protégée !

Aucune configuration supplémentaire n'est requise - Sentinel fonctionne immédiatement après l'installation.

---

Prêt à protéger votre boutique PrestaShop ? Continuez vers le [Guide d'installation](./installation.md).

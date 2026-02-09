---
sidebar_position: 5
---

# Vérification d'intégrité des fichiers

:::tip Fonctionnalité Pro
La vérification d'intégrité des fichiers est disponible avec la **licence Pro**. [Obtenez votre licence Pro](https://bcisoft.fr/securite) pour accéder à cette fonctionnalité.
:::

La vérification d'intégrité de Sentinel vérifie que vos fichiers PrestaShop et vos fichiers de modules n'ont pas été modifiés ou compromis.

## Comment ça fonctionne

1. **Scan des fichiers** : Sentinel analyse tous les fichiers de votre installation PrestaShop et des modules installés
2. **Comparaison des hash** : Les empreintes des fichiers sont comparées aux versions officielles via l'API Sentinel
3. **Détection des différences** : Tout fichier modifié, ajouté ou supprimé est identifié
4. **Rapport détaillé** : Un rapport affiche toutes les anomalies avec leur niveau de criticité

## Pourquoi c'est important ?

Les attaquants modifient souvent des fichiers PHP existants pour injecter du code malveillant. Cette technique leur permet de :

- Cacher des backdoors dans des fichiers légitimes
- Voler les données clients (cartes bancaires, mots de passe)
- Rediriger les paiements vers leurs comptes
- Envoyer du spam depuis votre serveur

Des vérifications d'intégrité régulières permettent de détecter ces compromissions avant qu'elles ne causent des dégâts.

## Accéder à la vérification d'intégrité

### Via le Back-Office

Pour lancer une vérification d'intégrité depuis le back-office :

1. Connectez-vous à votre back-office PrestaShop
2. Allez dans **Modules > Sentinel > Vérification d'intégrité**
3. Cliquez sur le bouton **Lancer la vérification**

### Via la ligne de commande

Vous pouvez également lancer des vérifications d'intégrité depuis la ligne de commande, ce qui est utile pour l'automatisation ou lorsque le back-office n'est pas disponible.

**Vérifier tous les fichiers (core + modules) :**

```bash
php bin/console sentinel:integrity
```

**Vérifier uniquement les fichiers du core :**

```bash
php bin/console sentinel:integrity --type=core
```

**Vérifier uniquement les modules :**

```bash
php bin/console sentinel:integrity --type=modules
```

**Sortie en JSON (pour l'automatisation) :**

```bash
php bin/console sentinel:integrity --json
```

La commande affiche les résultats dans un format similaire au back-office :

- **Core Files** : Affiche les problèmes avec les fichiers du core PrestaShop
- **Modules Files** : Affiche les problèmes avec les fichiers des modules
- **Unchecked Modules** : Liste les modules tiers qui ne peuvent pas être vérifiés

## Ce qui est vérifié

### Fichiers du core PrestaShop

Sentinel vérifie tous les fichiers du core PrestaShop par rapport à la distribution officielle de votre version.

### Fichiers des modules

Pour chaque module installé, Sentinel vérifie :

- Les fichiers du module par rapport à la version officielle Addons (si disponible)
- Les patterns de fichiers vulnérables connus
- Les patterns de code suspects

:::info Modules sans version
Les modules sans numéro de version dans leur configuration sont également vérifiés. Sentinel utilise des signatures de fichiers pour identifier les modifications potentielles.
:::

## Comprendre les résultats

### Statut des fichiers

| Statut          | Description                                        | Action                     |
| --------------- | -------------------------------------------------- | -------------------------- |
| ⚠️ **Modifié**  | Le contenu du fichier diffère de l'original        | Examiner les modifications |
| 🆕 **Inconnu**  | Le fichier n'existe pas dans la version officielle | Vérifier si légitime       |
| ❌ **Manquant** | Un fichier officiel est manquant                   | Réinstaller le fichier     |

## Résolution des problèmes

### La vérification prend trop de temps

Les grandes installations peuvent prendre plusieurs minutes. Facteurs affectant la vitesse :

- Nombre de modules installés
- Performance du serveur
- Vitesse réseau vers l'API Sentinel

### Certains modules affichent "Inconnu"

Les modules non disponibles sur PrestaShop Addons ne peuvent pas être vérifiés par rapport à une version officielle. Sentinel vérifiera quand même les patterns suspects.

---

**Suivant :** [Logs de sécurité](./security-logs.md)

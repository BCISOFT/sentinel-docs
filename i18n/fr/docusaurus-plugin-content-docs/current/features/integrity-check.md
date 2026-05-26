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
2. **Normalisation du contenu** : Avant le calcul du hash, le contenu de chaque fichier est normalisé pour éliminer les différences de whitespace non significatives (BOM UTF-8, fins de ligne, indentation). Cela évite les faux positifs causés par des différences entre vos fichiers installés et les sources de référence.
3. **Comparaison des hash** : Les empreintes normalisées des fichiers (MD5) sont comparées aux versions officielles via l'API Sentinel
4. **Détection des différences** : Tout fichier modifié, ajouté ou supprimé est identifié
5. **Rapport détaillé** : Un rapport affiche toutes les anomalies avec leur niveau de criticité

### Normalisation du contenu

Pour éviter les faux positifs liés à des différences de whitespace inoffensives, Sentinel normalise le contenu des **fichiers texte** avant de calculer les hash. Les étapes de normalisation sont :

1. **Suppression du BOM UTF-8** : Supprime les octets BOM (`\xEF\xBB\xBF`) s'ils sont présents au début du fichier
2. **Normalisation des fins de ligne** : Convertit tous les `\r\n` (Windows) et `\r` (ancien Mac) en `\n` (Unix)
3. **Trim de chaque ligne** : Supprime le whitespace en début et en fin de chaque ligne

Cela garantit que les fichiers texte avec différents styles d'indentation (tabulations vs espaces), différentes fins de ligne, ou un BOM UTF-8 produiront le même hash que les fichiers de référence. L'API Sentinel applique exactement la même normalisation lors de la génération des manifestes de référence.

#### Détection texte vs binaire

La normalisation n'est appliquée qu'aux **fichiers texte** (détectés par extension de fichier). Les fichiers binaires (images, polices, archives, etc.) sont hashés tels quels sans aucune modification pour éviter de corrompre leur contenu.

**Extensions texte** (normalisées) : `php`, `inc`, `tpl`, `html`, `htm`, `xml`, `xsd`, `js`, `ts`, `jsx`, `tsx`, `mjs`, `cjs`, `css`, `scss`, `sass`, `less`, `json`, `yml`, `yaml`, `toml`, `ini`, `cfg`, `conf`, `sql`, `md`, `txt`, `csv`, `tsv`, `log`, `sh`, `bash`, `zsh`, `twig`, `smarty`, `mustache`, `htaccess`, `env`, `lock`, `map`, `svg`.

**Fichiers sans extension** (ex : `Makefile`, `Dockerfile`) sont également traités comme du texte.

**Toutes les autres extensions** (ex : `png`, `jpg`, `gif`, `woff`, `pdf`, `zip`) sont traitées comme binaires et hashées sans normalisation.

:::note Sécurité
Cette normalisation ne touche qu'aux caractères de whitespace des fichiers texte. Toute injection de code réel (mots-clés PHP, variables, opérateurs) ajoute des caractères non-whitespace et sera toujours détectée. Les fichiers binaires ne sont jamais modifiés.
:::

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

## Visualiseur de diff

Lorsque les résultats de la vérification d'intégrité affichent des fichiers modifiés, manquants ou inconnus, vous pouvez visualiser les différences directement depuis les résultats.

### Visualiser les différences

Chaque fichier dans les résultats dispose d'un bouton **Voir le diff** ou **Voir le fichier** :

- **Fichiers modifiés** (Voir le diff) : Affiche un diff unifié comparant le fichier original avec votre version locale, avec les lignes ajoutées surlignées en vert et les lignes supprimées en rouge — similaire à la vue diff de GitHub.
- **Fichiers manquants** (Voir le fichier) : Affiche le contenu du fichier original depuis les sources officielles, avec toutes les lignes surlignées en rouge (fichier supprimé).
- **Fichiers inconnus** (Voir le fichier) : Affiche le contenu de votre fichier local, avec toutes les lignes surlignées en vert (nouveau fichier).

### Comment ça fonctionne

1. Cliquez sur le bouton **Voir le diff** / **Voir le fichier** sur n'importe quelle ligne de résultat
2. Sentinel récupère le fichier original depuis l'API Sentinel (pour les fichiers modifiés et manquants) et lit le fichier local (pour les fichiers modifiés et inconnus)
3. Pour les fichiers modifiés, un diff est calculé et affiché avec un surlignage de lignes style GitHub
4. Le visualiseur de diff affiche les numéros de ligne, les en-têtes de hunk (`@@ ... @@`), et les statistiques (lignes ajoutées/supprimées)

:::note
Le visualiseur de diff ne fonctionne que pour les fichiers texte. Les fichiers binaires (images, polices, etc.) afficheront un message "Fichier binaire" au lieu d'un diff.
:::

### Fallback ZIP pour les modules

Lorsque vous consultez le diff d'un fichier de module et que l'API Sentinel ne dispose pas des sources originales (par exemple, modules payants ou tiers dont seuls les hash sont disponibles), le visualiseur de diff affiche un message d'erreur accompagné d'une **zone d'upload ZIP intégrée**.

Vous pouvez uploader le ZIP officiel du module directement dans le visualiseur de diff :

1. Cliquez sur **Voir le Diff** sur un fichier de module avec une différence
2. Si les sources ne sont pas disponibles, le message d'erreur s'affiche avec une zone "Comparer à partir d'un fichier ZIP"
3. Déposez ou sélectionnez le ZIP officiel du module
4. Sentinel extrait le fichier du ZIP, lit votre fichier local, et affiche le diff

Cela vous permet de visualiser les diffs pour **n'importe quel module** — qu'il soit vérifié par Sentinel (hash connus, mais pas de sources) ou non vérifié (absent du référentiel).

## Comparer avec un ZIP

Pour les modules tiers ou payants dont Sentinel ne dispose pas des fichiers sources originaux, vous pouvez comparer votre module installé avec une archive ZIP officielle.

### Comment utiliser

1. Lancez une vérification d'intégrité — les modules non référencés apparaissent dans la section **Modules non vérifiés**
2. Cliquez sur le bouton **Comparer avec un ZIP** à côté du module à vérifier
3. Une modale s'ouvre affichant le nom du module et la version attendue
4. Uploadez (ou glissez-déposez) le fichier ZIP officiel du module
5. Sentinel extrait le ZIP, calcule les hash de tous les fichiers, et les compare avec votre version installée
6. Les résultats affichent les différences (fichiers modifiés, manquants ou inconnus)
7. Cliquez sur **Voir le diff** sur n'importe quelle différence pour voir les modifications ligne par ligne

:::tip
Le JavaScript garde une référence au fichier ZIP uploadé en mémoire, vous n'avez donc pas besoin de re-uploader lors de la consultation des diffs fichier par fichier.
:::

## Exporter les résultats

Vous pouvez exporter les résultats d'une vérification d'intégrité dans trois formats : **CSV**, **JSON** et **TXT**.

### Depuis le Back-Office

Après avoir effectué une vérification d'intégrité ou consulté une vérification depuis l'historique, un bouton déroulant **Exporter les résultats** apparaît dans la zone des résultats. Cliquez dessus et sélectionnez le format souhaité :

- **CSV** : Fichier séparé par des points-virgules avec les colonnes Section, Chemin, Statut et Détails. Inclut les anomalies core, les anomalies modules et les modules non vérifiés.
- **JSON** : Données structurées incluant les métadonnées de la vérification, les résultats core et les résultats modules avec toutes les anomalies et les modules non vérifiés.
- **TXT** : Rapport texte lisible organisé par section (Fichiers Core, Fichiers Modules, Modules non vérifiés).

Le fichier est téléchargé immédiatement par votre navigateur.

### Depuis la ligne de commande

Utilisez l'option `--json` pour obtenir les résultats au format JSON, que vous pouvez rediriger vers un fichier :

```bash
php bin/console sentinel:integrity --json > integrity-report.json
```

## Exclure des fichiers avec `.sentinelignore`

Certains répertoires de votre installation PrestaShop ne font pas partie de la distribution officielle et ne devraient pas être vérifiés — par exemple les dossiers de contrôle de version (`.git/`, `.svn/`), les métadonnées d'éditeur (`.idea/`, `.vscode/`) ou l'outillage local (`node_modules/`). Sans exclusions, ils apparaissent dans le rapport comme fichiers **Inconnus**.

Sentinel utilise un fichier `.sentinelignore` situé à la **racine du module** (`modules/sentinel/.sentinelignore`) pour vous permettre de définir vos propres règles d'exclusion.

### Modifier les règles

Vous pouvez éditer `.sentinelignore` de deux façons :

- **Depuis le back-office** : allez dans **Modules > Sentinel**, repérez la carte **Vérification d'intégrité — Exclusions**, modifiez la zone de texte et cliquez sur **Enregistrer les règles d'exclusion**.
- **Directement sur le serveur** : ouvrez `modules/sentinel/.sentinelignore` en SSH/FTP et éditez-le comme un fichier texte classique.

### Syntaxe (de type gitignore)

Le fichier respecte les mêmes conventions que `.gitignore` :

- Les lignes vides et celles commençant par `#` sont ignorées
- `.git/` — ignore un répertoire nommé `.git` à n'importe quelle profondeur
- `*.log` — ignore tout fichier se terminant par `.log`
- `**/cache` — ignore tout répertoire `cache` à n'importe quelle profondeur
- `/foo` — ancré à la racine du scan (ne matche que le `foo` de premier niveau)
- `!keep.log` — réintègre un fichier précédemment ignoré
- Un `/` final restreint la règle aux répertoires

Les règles sont évaluées dans l'ordre ; la dernière règle correspondante l'emporte. Les règles de `.sentinelignore` s'appliquent aux scans **core** ET **modules**.

### Règles par défaut

Lors de l'installation du module, Sentinel crée un `.sentinelignore` par défaut qui exclut déjà les répertoires non-PrestaShop les plus courants (`.git/`, `.svn/`, `.idea/`, `.vscode/`, `node_modules/`, …).

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

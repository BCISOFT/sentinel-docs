---
sidebar_position: 5
---

# Vérification d'intégrité des fichiers

:::tip Fonctionnalité Pro
La vérification d'intégrité des fichiers est disponible avec la **licence Pro**. [Obtenez votre licence Pro](https://bcisoft.fr/securite) pour accéder à cette fonctionnalité.
:::

La vérification d'intégrité de Sentinel vérifie que vos fichiers PrestaShop, vos fichiers de modules et vos fichiers de thèmes n'ont pas été modifiés ou compromis. Ses résultats sont regroupés en trois sections : **Core**, **Modules** et **Thèmes**.

## Comment ça fonctionne

1. **Scan des fichiers** : Sentinel analyse tous les fichiers de votre installation PrestaShop, de ses thèmes et des modules installés
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
3. Cliquez sur le bouton **Vérifier l'intégrité**

Pour exécuter la vérification d'intégrité chaque jour, planifiez-la dans la carte **Analyses automatiques** de la page de configuration du module Sentinel (**Modules > Gestionnaire de modules > Sentinel > Configurer** ; voir [Analyses automatiques](./vulnerability-scanner.md#automatic-scans)). Seul un employé qui peut configurer le module Sentinel voit et modifie cette planification : un SuperAdmin, ou un profil qui a le droit **Modifier** sur **Gestionnaire de modules** et le droit **Configurer** sur le module Sentinel. Son rapport est envoyé aux [Destinataires des alertes](./vulnerability-scanner.md#alert-recipients) choisis dans la carte suivante.

### Via la ligne de commande

Vous pouvez également lancer des vérifications d'intégrité depuis la ligne de commande, ce qui est utile pour l'automatisation ou lorsque le back-office n'est pas disponible.

**Vérifier tous les fichiers (core + thèmes + modules) :**

```bash
php bin/console sentinel:integrity
```

**Vérifier uniquement les fichiers du core :**

```bash
php bin/console sentinel:integrity --type=core
```

Avec `--type=core`, les dossiers de thèmes restent dans les fichiers du core et sont vérifiés avec eux.

**Vérifier uniquement les thèmes :**

```bash
php bin/console sentinel:integrity --type=themes
```

Votre thème PrestaShop est vérifié et vos thèmes personnalisés sont listés comme non vérifiés. Comme les autres vérifications, elle consomme un passage de votre quota.

**Vérifier uniquement les modules :**

```bash
php bin/console sentinel:integrity --type=modules
```

**Sortie en JSON (pour l'automatisation) :**

```bash
php bin/console sentinel:integrity --json
```

**Afficher l'historique des vérifications :**

```bash
php bin/console sentinel:integrity --history
```

L'historique donne le nombre de problèmes de chaque vérification dans les colonnes **Core Issues**, **Module Issues** et **Theme Issues**. Quand des dossiers ou des thèmes d'une section n'ont pas pu être contrôlés, sa colonne le dit au lieu d'un `0` vert : `2 not checked`, ou `3 (2 not checked)` quand la section a aussi des problèmes ; la colonne **Total** passe alors en jaune, tout en ne comptant que les problèmes. Avec `--history --json`, chaque vérification porte aussi un objet `failures` qui liste ces noms par section (`core`, `modules`, `themes`).

**Afficher le détail d'une vérification de l'historique :**

```bash
php bin/console sentinel:integrity --details=<check_id>
```

`<check_id>` est une valeur de la colonne **Check ID** de l'historique. Dans chaque section, le détail nomme les dossiers et les thèmes qui n'ont pas pu être contrôlés (voir **N'a pas pu être contrôlé** plus bas).

La commande affiche les résultats dans un format similaire au back-office :

- **Core Files** : Affiche les problèmes avec les fichiers du core PrestaShop
- **Modules Files** : Affiche les problèmes avec les fichiers des modules
- **Unchecked Modules** : Liste les modules tiers qui ne peuvent pas être vérifiés
- **Themes Files** : Affiche les thèmes contrôlés, ou **Themes not checked**, et les problèmes avec leurs fichiers
- **Unchecked Themes** : Liste les thèmes personnalisés, qui ne sont pas vérifiés

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

### Fichiers Thèmes

Un thème est un dossier de `themes/` qui contient un fichier `config/theme.yml`. Sa version est lue sur la ligne `version:` de ce fichier.

- **Thème de PrestaShop** : `classic`, ainsi que `hummingbird` à partir de PrestaShop 9, est vérifié avec les fichiers officiels de votre version de PrestaShop dans la section **Thèmes**. Ses fichiers ne comptent plus dans Core.
- **Thème personnalisé** : tout autre thème, y compris un thème enfant de `classic`, n'est pas dans le dépôt Sentinel et n'est pas vérifié. Il figure dans **Thèmes non vérifiés** avec la raison **Thème personnalisé**, et aucun de ses fichiers n'apparaît dans Core. Pour le faire vérifier, soumettez-le à Sentinel (voir **Soumettre un thème personnalisé** plus bas).
- **Pas un thème** : `themes/_libraries`, un dossier dont le nom contient un point et un dossier sans `config/theme.yml` ne sont pas des thèmes : leurs fichiers restent dans Core.
- **Cache** : le dossier `assets/cache` de chaque thème est ignoré.

:::info Thèmes non contrôlés et Thèmes non vérifiés
**Thèmes non contrôlés** signifie qu'aucun thème n'a été contrôlé dans la section Thèmes : par exemple un ancien contrôle ouvert depuis l'historique, une boutique dont tous les thèmes sont personnalisés et pas encore soumis, ou des thèmes qui n'ont pas pu être contrôlés (voir **N'a pas pu être contrôlé** plus bas). **Thèmes non vérifiés** liste les thèmes personnalisés trouvés par le contrôle : les deux peuvent donc s'afficher ensemble. **Thèmes non contrôlés** s'affiche dans les résultats du contrôle et dans le détail d'un contrôle rouvert depuis l'historique ; la ligne de commande et les trois exports le disent en anglais (**Themes not checked**, ou `not checked` dans le JSON).
:::

:::warning N'a pas pu être contrôlé
Dans le back-office, un dossier de Core ou de Modules, ou un thème, qui n'a pas pu être contrôlé — par exemple après une erreur pendant sa lecture ou son envoi au service Sentinel — est listé sous **N'a pas pu être contrôlé** dans sa section : le chemin du dossier (`/` pour la racine de la boutique), `modules/<nom>` ou l'un de ses dossiers pour un module, ou le nom du thème. Dans les résultats, cette section ne dit jamais que ses fichiers sont intacts, même quand elle ne compte aucun problème. Un thème qui n'a pas pu être contrôlé ne figure pas parmi les **Thèmes contrôlés :**. Quand les modules n'ont pas pu être contrôlés du tout, la section Modules du contrôle que vous venez de lancer indique **Modules non contrôlés**.

Les mêmes dossiers et thèmes sont listés dans le détail d'un contrôle rouvert depuis l'historique — les modules qui n'ont pas pu être contrôlés du tout y apparaissent comme `modules` sous **N'a pas pu être contrôlé** — et par `php bin/console sentinel:integrity --details=<check_id>`. Sentinel conserve cette liste pour les 100 derniers contrôles qui en ont une ; un contrôle lancé avant que le module ne la conserve n'en affiche aucune. Dans la liste **Historique des vérifications** du back-office, une section qui a de tels dossiers ou thèmes n'affiche jamais **OK** : elle affiche un badge **N non contrôlé(s)**, après le badge **N problème(s)** quand la section a aussi des problèmes ; survolez-le pour lire leurs noms, dix au plus. La carte **Dernière vérification d'intégrité** du tableau de bord de Sentinel marque la section de la même façon, et affiche aussi, avec **Non contrôlé**, une section Core ou Modules qui n'a pas été enregistrée mais a de tels dossiers. Le widget Sentinel du tableau de bord de PrestaShop ajoute une ligne **N'a pas pu être contrôlé** avec leur nombre. Les exports CSV, JSON et TXT les nomment sous leur section (voir **Exporter les résultats** plus bas).
:::

## Comprendre les résultats

### Statut des fichiers

| Statut          | Description                                        | Action                     |
| --------------- | -------------------------------------------------- | -------------------------- |
| ⚠️ **Modifié**  | Le contenu du fichier diffère de l'original        | Examiner les modifications |
| 🆕 **Inconnu**  | Le fichier n'existe pas dans la version officielle | Vérifier si légitime       |
| ❌ **Manquant** | Un fichier officiel est manquant                   | Réinstaller le fichier     |

Ces statuts valent aussi bien pour les fichiers des sections Core, Modules et Thèmes.

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
Le visualiseur de diff n'affiche un diff que pour les fichiers texte. Dans le visualiseur, un fichier est binaire quand ses 8 premiers Ko contiennent un octet nul, quelle que soit son extension : un fichier SVG, HTML ou XML est en général du texte et s'affiche en source. Pour un fichier binaire, le visualiseur montre les panneaux **Fichier original** et **Fichier local**, selon ce qui existe, avec la **Taille**, le **Type** et les 256 premiers octets en hexadécimal. Seules les images PNG, JPEG, GIF et WebP sont prévisualisées, avec un bouton **Ouvrir dans un nouvel onglet** ; tout autre fichier binaire est téléchargé à la place, avec un bouton **Télécharger** et la note **Ce type de fichier est téléchargé au lieu d'être affiché.** Dans la comparaison avec un ZIP, un fichier binaire montre sa taille, son type et ses premiers octets, sans aperçu ni téléchargement.
:::

:::warning Restrictions d'accès
La consultation du contenu des fichiers exige la permission **Voir** sur l'onglet Integrity Check de Sentinel ainsi qu'un abonnement actif incluant Integrity Check.

Le visualiseur ne peut atteindre que des fichiers situés dans le répertoire de votre boutique. Tout chemin qui se résout en dehors est rejeté, y compris via un lien symbolique : la vérification porte sur le chemin réel sur le disque et non sur le chemin demandé, de sorte qu'un lien au nom anodin ne permet pas de sortir.

Les fichiers contenant des identifiants ou des secrets ne sont jamais servis non plus, quel que soit le résultat du contrôle d'intégrité — ni leur source dans le visualiseur, ni leur contenu brut : les fichiers `.env` et `.env.*`, `app/config/` et `var/` à la racine de la boutique, `config/settings*.php` (y compris dans une copie de la boutique ou dans le dossier `config/` d'un module), un fichier dont le nom contient `settings.inc` dans un dossier `config/` ou l'un de ses sous-dossiers, comme `config/old_settings.inc.php` ou `config/sav/settings.inc.php`, `parameters.php`, `parameters.yml` et `parameters.yaml`, `appParameters.php`, tout dossier `var/cache/`, les dossiers `backup/` et `backups/`, `.git/`, les fichiers `.htpasswd`, les fichiers `.sql`, `.mysql` et `.log`, ainsi que les archives laissées à la racine de la boutique (par exemple `.zip`, `.tar`, `.tar.gz`, `.tgz`, `.7z` ou `.rar`).

Ils sont refusés quelle que soit l'écriture du chemin demandé (`./`, `/` doublé), à travers un lien symbolique placé dans la boutique — le fichier est jugé sur sa place réelle dans la boutique, et non sur le nom du lien —, de même que les copies de sauvegarde et les dumps de base de données dont Sentinel reconnaît le nom, compressés ou non, par exemple `config/settings.inc.php.bak`, `parameters.yml~`, `parameters_old.php`, `dump.sql`, `dump.sql.gz`, `db.mysql` ou `error.log.old`. Le visualiseur affiche alors **Impossible de charger le contenu du fichier**. Quand vous comparez un fichier de module avec un ZIP, le fichier est jugé comme un fichier de la boutique (`modules/<nom>/<chemin>`) et refusé de même, pour sa version du ZIP comme pour votre fichier local. Ne gardez aucune autre copie de ces fichiers ni aucun dump de base de données dans le répertoire de votre boutique. N'y gardez pas non plus d'archive de la boutique : les archives ne sont refusées qu'à la racine de la boutique, et une archive rangée dans un autre dossier, comme `preprod/` ou le dossier d'un module ou d'un thème, reste lisible.
:::

### Fallback ZIP pour les modules

Lorsque vous consultez le diff d'un fichier de module et que l'API Sentinel ne dispose pas des sources originales (par exemple, modules payants ou tiers dont seuls les hash sont disponibles), le visualiseur de diff affiche un message d'erreur accompagné d'une **zone d'upload ZIP intégrée**.

Vous pouvez uploader le ZIP officiel du module directement dans le visualiseur de diff :

1. Cliquez sur **Voir le diff** sur un fichier de module avec une différence
2. Si les sources ne sont pas disponibles, le message d'erreur s'affiche avec une zone "Comparer à partir d'un fichier ZIP"
3. Déposez ou sélectionnez le ZIP officiel du module
4. Sentinel extrait le fichier du ZIP, lit votre fichier local, et affiche le diff

Cela vous permet de visualiser les diffs pour **n'importe quel module** — qu'il soit vérifié par Sentinel (hash connus, mais pas de sources) ou non vérifié (absent du référentiel).

Le fallback ZIP ne s'applique pas aux thèmes. Pour un fichier d'un thème que vous avez soumis, le visualiseur de diff affiche **Source officielle non disponible** : Sentinel ne conserve que les empreintes de ses fichiers.

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

## Soumettre un thème personnalisé

Un thème personnalisé n'est pas dans le dépôt Sentinel : ses fichiers ne sont donc pas vérifiés. Vous pouvez soumettre son état actuel à Sentinel : il devient la référence de votre boutique pour ce thème, et ses fichiers sont vérifiés à partir du contrôle suivant.

### Comment soumettre

1. Lancez une vérification d'intégrité — vos thèmes personnalisés apparaissent dans la section **Thèmes non vérifiés**, avec leur version et la raison **Thème personnalisé**
2. Cliquez sur le bouton **Soumettre à Sentinel** sur la ligne du thème. Le bouton n'apparaît pas pour un thème de PrestaShop, que Sentinel vérifie déjà
3. La modale **Soumettre un thème à Sentinel** s'ouvre avec le nom du thème et sa **Version installée**
4. Si besoin, choisissez les **Répertoires à exclure** et les **Extensions à exclure** : rien n'est coché d'avance
5. Lisez l'avertissement, puis cliquez sur **Soumettre à Sentinel** pour envoyer les empreintes des fichiers du thème
6. La ligne affiche alors **Soumis, vérifié au prochain contrôle**. Aucun contrôle n'est lancé automatiquement : le thème reste dans la liste jusqu'à ce que vous en lanciez un
7. Au contrôle suivant, le thème est vérifié dans la section **Thèmes**, et un fichier modifié depuis la soumission y est signalé

:::warning Ne soumettez qu'un thème de confiance
L'état actuel de ce thème devient la référence de vos prochaines vérifications. Si ses fichiers ont déjà été modifiés par un tiers, un thème déjà compromis serait accepté tel quel : ne le soumettez que si vous avez confiance dans ses fichiers actuels.
:::

### Portée

- La référence est privée à votre boutique : une autre boutique qui a le même thème le voit toujours non vérifié.
- Une soumission ne consomme pas de passage de votre quota.
- Soumettre un thème demande l'offre Pro et la permission **Modifier** sur l'onglet **Vérification d'intégrité** de Sentinel. Un employé qui n'a que la permission **Voir** voit le bouton, mais sa soumission est refusée.
- Un thème se soumet depuis le back-office : la ligne de commande ne le propose pas.

### Si la soumission est refusée

À l'ouverture de la modale, Sentinel vérifie d'abord que le thème peut être soumis. Sinon, la modale affiche le message sans exclusions ni bouton d'envoi :

- **`nom` est un thème de PrestaShop : Sentinel le vérifie déjà avec les fichiers officiels.** — ce thème n'a pas besoin d'être soumis.
- **Ce thème n'a pas de version : ajoutez une ligne version: à son fichier config/theme.yml, puis soumettez-le à nouveau.** — ajoutez une ligne `version:` au fichier `config/theme.yml` du thème, puis fermez la modale et rouvrez-la.

Quand vous cliquez sur **Soumettre à Sentinel**, la soumission peut encore être refusée. La modale reste alors ouverte avec vos exclusions, pour que vous puissiez les corriger et réessayer :

- **Tous les fichiers de ce thème sont exclus : il n'y a rien à soumettre.** — retirez des exclusions.
- **Le thème est trop volumineux pour être soumis à Sentinel.** — exclure les répertoires ou extensions que vous n'avez pas besoin de contrôler réduit ce qui est envoyé.

## Exporter les résultats

Vous pouvez exporter les résultats d'une vérification d'intégrité dans trois formats : **CSV**, **JSON** et **TXT**.

### Depuis le Back-Office

Après avoir effectué une vérification d'intégrité ou consulté une vérification depuis l'historique, un bouton déroulant **Exporter les résultats** apparaît dans la zone des résultats. Cliquez dessus et sélectionnez le format souhaité :

- **CSV** : Fichier séparé par des points-virgules, avec les colonnes nommées en anglais comme dans l'export : Section, Path, Status et Details. Inclut les anomalies core, les anomalies modules, les modules non vérifiés, les anomalies thèmes en lignes `themes` et les thèmes personnalisés en lignes `unchecked theme`. Quand les thèmes n'ont pas été contrôlés, une ligne `themes` indique **Themes not checked**. Chaque dossier ou thème qui n'a pas pu être contrôlé forme une ligne de sa section avec le statut `not checked` et **Could not be checked** dans la colonne Details.
- **JSON** : Données structurées incluant les métadonnées de la vérification, les résultats core, modules et thèmes avec toutes les anomalies, les modules non vérifiés et les thèmes non vérifiés. `themes_status` vaut `checked` ou `not checked`. Quand au moins un dossier ou un thème n'a pas pu être contrôlé, un objet `failures` les liste par section (`core`, `modules`, `themes`).
- **TXT** : Rapport texte lisible organisé par section, sous les titres anglais de l'export (Core Files, Modules Files, Unchecked Modules, Themes Files, Unchecked Themes). Quand les thèmes n'ont pas été contrôlés, la section Themes Files indique `Themes not checked.` et, si aucun problème n'est trouvé, le rapport se termine par `No issues found in the checked files.` Chaque dossier ou thème qui n'a pas pu être contrôlé est listé `Could not be checked: <nom>` dans sa section, qui ne dit alors jamais que ses fichiers sont intacts, et le rapport se termine aussi par `No issues found in the checked files.` si aucun problème n'est trouvé.

Les exports nomment les dossiers et thèmes qui n'ont pas pu être contrôlés pour les contrôles dont Sentinel a conservé la liste (voir **N'a pas pu être contrôlé** plus haut).

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

Les règles sont évaluées dans l'ordre ; la dernière règle correspondante l'emporte. Les règles de `.sentinelignore` s'appliquent aux contrôles **core**, **modules** et **thèmes**.

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

### Un thème apparaît comme non vérifié

Un thème listé dans **Thèmes non vérifiés** est un thème personnalisé : Sentinel n'en a aucune référence. Soumettez-le (voir **Soumettre un thème personnalisé**) pour que ses fichiers soient vérifiés à partir du contrôle suivant. Si son fichier `config/theme.yml` n'a pas de ligne `version:`, ajoutez-en une avant de le soumettre.

### Un dossier ou un thème n'a pas pu être contrôlé

Un nom listé sous **N'a pas pu être contrôlé**, ou une section Modules qui indique **Modules non contrôlés**, n'a pas été entièrement vérifié par ce contrôle : un fichier modifié peut ne pas être signalé. Relancez le contrôle. Quand vous le lancez en ligne de commande, un thème qui n'a pas pu être contrôlé est nommé avec la raison.

---

**Suivant :** [Logs de sécurité](./security-logs.md)

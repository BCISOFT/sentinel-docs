import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const englishDir = join(root, 'docs');
const frenchDir = join(root, 'i18n/fr/docusaurus-plugin-content-docs/current');

function docIds(dir) {
  return readdirSync(dir, { recursive: true })
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => file.replace(/\.mdx?$/, ''))
    .sort();
}

function sidebarIds() {
  const source = readFileSync(join(root, 'sidebars.ts'), 'utf8');
  const explicit = [...source.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
  const bare = [...source.matchAll(/^\s*'([^']+)',?\s*$/gm)].map((m) => m[1]);
  return [...explicit, ...bare];
}

test('every English doc has a French translation', () => {
  const missing = docIds(englishDir).filter((id) => !docIds(frenchDir).includes(id));
  assert.deepEqual(missing, []);
});

test('every French doc translates an English doc', () => {
  const orphans = docIds(frenchDir).filter((id) => !docIds(englishDir).includes(id));
  assert.deepEqual(orphans, []);
});

test('every doc the sidebar lists exists', () => {
  const ids = sidebarIds();
  assert.ok(ids.length > 0, 'no doc id read from sidebars.ts');
  assert.deepEqual(ids.filter((id) => !docIds(englishDir).includes(id)), []);
});

test('the French docs never say "force brute"', () => {
  const offending = readdirSync(frenchDir, { recursive: true })
    .filter((file) => /\.mdx?$/.test(file))
    .filter((file) => /force brute/i.test(readFileSync(join(frenchDir, file), 'utf8')));
  assert.deepEqual(offending, []);
});

function paragraphWith(file, marker) {
  return readFileSync(file, 'utf8').split(/\n\s*\n|\n(?=\d+\. )/).find((block) => block.includes(marker)) ?? '';
}

test('the DDoS pages say Auto Prepend bans keep the base duration on repeat offences', () => {
  const english = paragraphWith(join(englishDir, 'features/ddos-protection.md'), 'progressively longer');
  const french = paragraphWith(join(frenchDir, 'features/ddos-protection.md'), 'augmente progressivement');
  assert.match(english, /\[Auto Prepend[^\]]*\]\(\.\/auto-prepend-protection\.md\)/);
  assert.match(english, /base duration[^.]*even[^.]*repeat/i);
  assert.match(french, /\[protection Auto Prepend\]\(\.\/auto-prepend-protection\.md\)/);
  assert.match(french, /durée de base[^.]*même en cas de récidive/i);
  assert.match(english, /does not count/);
  assert.match(french, /ne compte pas/);
});

test('the DDoS pages say the Redis DSN has no effect and counters stay local to each server', () => {
  const englishPage = readFileSync(join(englishDir, 'features/ddos-protection.md'), 'utf8');
  const frenchPage = readFileSync(join(frenchDir, 'features/ddos-protection.md'), 'utf8');
  const english = paragraphWith(join(englishDir, 'features/ddos-protection.md'), '**Redis DSN**');
  const french = paragraphWith(join(frenchDir, 'features/ddos-protection.md'), '**DSN Redis**');
  assert.match(english, /no effect[^.]*local files/);
  assert.match(french, /n'a pas d'effet[^.]*fichiers locaux/);
  assert.doesNotMatch(englishPage, /shared view|or Redis when|Redis is used|With Redis/);
  assert.doesNotMatch(frenchPage, /vue partagée|ou dans Redis|Redis est utilisé|Avec Redis/);
});

test('the Brute force pages keep the unban command and never mention Redis', () => {
  const english = readFileSync(join(englishDir, 'features/brute-force-protection.md'), 'utf8');
  const french = readFileSync(join(frenchDir, 'features/brute-force-protection.md'), 'utf8');
  assert.match(english, /# Unban an IP\nphp bin\/console sentinel:brute-force unban 203\.0\.113\.10/);
  assert.match(french, /# Débannir une IP\nphp bin\/console sentinel:brute-force unban 203\.0\.113\.10/);
  assert.doesNotMatch(english, /Redis/i);
  assert.doesNotMatch(french, /Redis/i);
});

function sectionOf(file, heading) {
  const page = readFileSync(file, 'utf8');
  const start = page.indexOf(heading);
  if (start < 0) return '';
  const end = page.indexOf('\n## ', start + heading.length);
  return page.slice(start, end < 0 ? undefined : end);
}

test('the scanner pages describe the automatic scans in both languages', () => {
  const englishPage = readFileSync(join(englishDir, 'features/vulnerability-scanner.md'), 'utf8');
  const frenchPage = readFileSync(join(frenchDir, 'features/vulnerability-scanner.md'), 'utf8');
  const english = sectionOf(join(englishDir, 'features/vulnerability-scanner.md'), '## Automatic scans {#automatic-scans}');
  const french = sectionOf(join(frenchDir, 'features/vulnerability-scanner.md'), '## Analyses automatiques {#automatic-scans}');
  assert.ok(englishPage.indexOf('{#automatic-scans}') > 0 && englishPage.indexOf('{#automatic-scans}') < englishPage.indexOf('## Scan History'), 'EN: {#automatic-scans} is missing or not before ## Scan History');
  assert.ok(frenchPage.indexOf('{#automatic-scans}') > 0 && frenchPage.indexOf('{#automatic-scans}') < frenchPage.indexOf('## Historique des scans'), 'FR: {#automatic-scans} is missing or not before ## Historique des scans');
  assert.match(english, /Europe\/Paris/);
  assert.match(french, /Europe\/Paris/);
  assert.match(english, /once a day|every day|daily/i);
  assert.match(french, /une fois par jour|chaque jour|quotidien/i);
  assert.match(english, /card sits on the Sentinel module's configuration page \(\*\*Modules > Module Manager > Sentinel > Configure\*\*\)/);
  assert.match(french, /se trouve sur la page de configuration du module Sentinel \(\*\*Modules > Gestionnaire de modules > Sentinel > Configurer\*\*\)/);
  assert.doesNotMatch(english, /\*\*View\*\* permission|Security Scanner\*\* (page|tab)|Security Scanner tab|below the scan results/);
  assert.doesNotMatch(french, /droit \*\*Voir\*\*|page \*\*Scanner de sécurité\*\*|onglet (\*\*)?Scanner de sécurité|sous les résultats du scan/);
  assert.match(english, /\*\*Enable\*\*[^.]*without (deleting|erasing)/);
  assert.match(french, /\*\*Activer\*\*[^.]*sans l'effacer/);
  assert.match(english, /[Mm]ake sure \*\*Enable\*\* is switched on/);
  assert.match(french, /[Vv]érifiez que l'interrupteur \*\*Activer\*\* est activé/);
  assert.match(english, /badge \*\*Enabled\*\* or \*\*Disabled\*\*/);
  assert.match(french, /badge \*\*Activé\*\* ou \*\*Désactivé\*\*/);
  assert.doesNotMatch(english, /Run automatically|\b(un)?tick(s|ed|ing)?\b/i);
  assert.doesNotMatch(french, /Exécuter automatiquement|coch/i);
  assert.match(english, /between 0 and 23[^.]*between 0 and 59/);
  assert.match(french, /entre 0 et 23 ou si la minute n'est pas comprise entre 0 et 59/);
  assert.match(english, /[Oo]nly an employee who can configure the Sentinel module/);
  assert.match(french, /[Ss]eul un employé qui peut configurer le module Sentinel/);
  assert.match(english, /\*\*Integrity Check\*\* schedule/);
  assert.match(french, /planification de la \*\*Vérification d'intégrité\*\*/);
  assert.match(english, /SuperAdmin/);
  assert.match(french, /SuperAdmin/);
  assert.match(english, /\*\*Edit\*\* permission on \*\*Module Manager\*\* and the \*\*Configure\*\* permission on the Sentinel module/);
  assert.match(french, /droit \*\*Modifier\*\* sur \*\*Gestionnaire de modules\*\* et le droit \*\*Configurer\*\* sur le module Sentinel/);
  assert.match(english, /\*\*Advanced Parameters > Team > Permissions\*\*/);
  assert.match(french, /\*\*Paramètres avancés > Équipe > Permissions\*\*/);
  assert.match(english, /PrestaShop 1\.7 and 8, no other employee can open the configuration page/);
  assert.match(french, /PrestaShop 1\.7 et 8, aucun autre employé ne peut ouvrir la page de configuration/);
  assert.match(english, /PrestaShop 9, only an employee with at least one permission on \*\*Module Manager\*\*, even read-only, can open the page/);
  assert.match(french, /PrestaShop 9, seul un employé qui a au moins un droit sur \*\*Gestionnaire de modules\*\*, même en lecture seule, peut ouvrir la page/);
  assert.match(english, /PrestaShop 9[^.]*cannot configure the module[^.]*cards only show \*\*You need the permission to configure this module to see these settings\.\*\*/);
  assert.match(french, /PrestaShop 9[^.]*ne peut pas configurer le module[^.]*affichent seulement \*\*Vous devez avoir le droit de configurer ce module pour voir ces réglages\.\*\*/);
  assert.match(english, /both rows with a padlock, \*\*Available with Sentinel Pro\*\* and an \*\*Upgrade to Pro\*\* button/);
  assert.match(french, /deux lignes avec un cadenas, \*\*Disponible avec Sentinel Pro\*\* et un bouton \*\*Passer à Pro\*\*/);
  assert.doesNotMatch(french, /Passer en Pro/);
  assert.doesNotMatch(english, /conver/i);
  assert.doesNotMatch(french, /conver/i);
});

test('the scanner pages describe the alert recipients in both languages', () => {
  const englishPage = readFileSync(join(englishDir, 'features/vulnerability-scanner.md'), 'utf8');
  const frenchPage = readFileSync(join(frenchDir, 'features/vulnerability-scanner.md'), 'utf8');
  const english = sectionOf(join(englishDir, 'features/vulnerability-scanner.md'), '## Alert recipients {#alert-recipients}');
  const french = sectionOf(join(frenchDir, 'features/vulnerability-scanner.md'), '## Destinataires des alertes {#alert-recipients}');
  assert.ok(englishPage.indexOf('{#automatic-scans}') < englishPage.indexOf('{#alert-recipients}') && englishPage.indexOf('{#alert-recipients}') < englishPage.indexOf('## Scan History'), 'EN: {#alert-recipients} is not between {#automatic-scans} and ## Scan History');
  assert.ok(frenchPage.indexOf('{#automatic-scans}') < frenchPage.indexOf('{#alert-recipients}') && frenchPage.indexOf('{#alert-recipients}') < frenchPage.indexOf('## Historique des scans'), 'FR: {#alert-recipients} is not between {#automatic-scans} and ## Historique des scans');
  assert.match(english, /card follows the \*\*Automatic scans\*\* card on the Sentinel module's configuration page/);
  assert.match(french, /suit la carte \*\*Analyses automatiques\*\* sur la page de configuration du module Sentinel/);
  assert.match(english, /report of each/);
  assert.match(french, /rapport de chaque analyse/);
  assert.match(english, /separated by commas/);
  assert.match(french, /séparées par des virgules/);
  assert.match(english, /cleaned list must not exceed 1000 characters/);
  assert.match(french, /liste nettoyée ne doit pas dépasser 1000 caractères/);
  assert.match(english, /not valid[^.]*nothing is saved|nothing is saved[^.]*not valid/i);
  assert.match(french, /pas valides?[^.]*rien n'est enregistré|rien n'est enregistré[^.]*pas valides?/i);
  assert.match(english, /[Ee]mpty the field[^.]*remove/);
  assert.match(french, /[Vv]idez le champ[^.]*retir/);
  assert.match(english, /recipients could not be loaded[^.]*no form/);
  assert.match(french, /destinataires n'ont pas pu être chargés[^.]*aucun formulaire/);
  assert.match(english, /also the case when the automatic scans could not be loaded/);
  assert.match(french, /aussi le cas quand les analyses automatiques n'ont pas pu être chargées/);
  assert.match(english, /same employees as the \[automatic scans\]\(#automatic-scans\)[^.]*configure the Sentinel module/);
  assert.match(french, /mêmes employés que les \[analyses automatiques\]\(#automatic-scans\)[^.]*configurer le module Sentinel/);
  assert.match(english, /\*\*Available with Sentinel Pro\*\* and an \*\*Upgrade to Pro\*\* button/);
  assert.match(french, /\*\*Disponible avec Sentinel Pro\*\* et un bouton \*\*Passer à Pro\*\*/);
  assert.doesNotMatch(english, /padlock|\btab\b/i);
  assert.doesNotMatch(french, /cadenas|onglet/i);
  assert.doesNotMatch(english, /manual/i);
  assert.doesNotMatch(french, /manuel/i);
});

test('the Integrity Check and intro pages point to the automatic scans', () => {
  const englishCheck = readFileSync(join(englishDir, 'features/integrity-check.md'), 'utf8');
  const frenchCheck = readFileSync(join(frenchDir, 'features/integrity-check.md'), 'utf8');
  const englishIntro = readFileSync(join(englishDir, 'intro.md'), 'utf8');
  const frenchIntro = readFileSync(join(frenchDir, 'intro.md'), 'utf8');
  assert.match(englishCheck, /\]\(\.\/vulnerability-scanner\.md#automatic-scans\)/);
  assert.match(frenchCheck, /\]\(\.\/vulnerability-scanner\.md#automatic-scans\)/);
  assert.match(englishCheck, /\]\(\.\/vulnerability-scanner\.md#alert-recipients\)/);
  assert.match(frenchCheck, /\]\(\.\/vulnerability-scanner\.md#alert-recipients\)/);
  assert.match(englishCheck, /\*\*Automatic scans\*\* card of the Sentinel module's configuration page \(\*\*Modules > Module Manager > Sentinel > Configure\*\*/);
  assert.match(frenchCheck, /carte \*\*Analyses automatiques\*\* de la page de configuration du module Sentinel \(\*\*Modules > Gestionnaire de modules > Sentinel > Configurer\*\*/);
  assert.match(englishCheck, /SuperAdmin/);
  assert.match(frenchCheck, /SuperAdmin/);
  assert.match(englishCheck, /\*\*Edit\*\* permission on \*\*Module Manager\*\* and the \*\*Configure\*\* permission on the Sentinel module/);
  assert.match(frenchCheck, /droit \*\*Modifier\*\* sur \*\*Gestionnaire de modules\*\* et le droit \*\*Configurer\*\* sur le module Sentinel/);
  assert.doesNotMatch(englishCheck, /Security Scanner\*\* page|Security Scanner tab|on the same page/);
  assert.doesNotMatch(frenchCheck, /page \*\*Scanner de sécurité\*\*|onglet Scanner de sécurité|sur la même page/);
  assert.doesNotMatch(englishIntro, /Manual scanning|\| Manual via BO +\||Manual via BO \(Pro\)/);
  assert.doesNotMatch(frenchIntro, /Analyse manuelle des|\| Manuel via BO +\||Manuel via BO \(Pro\)/);
  assert.doesNotMatch(englishCheck + englishIntro + readFileSync(join(englishDir, 'features/vulnerability-scanner.md'), 'utf8'), /(?<!Module )manager/i);
  assert.doesNotMatch(frenchCheck + frenchIntro + readFileSync(join(frenchDir, 'features/vulnerability-scanner.md'), 'utf8'), /(?<!Module )manager/i);
});

function pagesMatching(dir, pattern) {
  return readdirSync(dir, { recursive: true })
    .filter((file) => /\.mdx?$/.test(file))
    .filter((file) => pattern.test(readFileSync(join(dir, file), 'utf8')));
}

test('no page says the scan schedule or alert recipients are set only elsewhere', () => {
  assert.deepEqual(pagesMatching(englishDir, /only (in|from|through) (the )?(manager|Sentinel (account|dashboard|space))/i), []);
  assert.deepEqual(pagesMatching(frenchDir, /(seulement|uniquement) (dans|depuis|via) (le |l['’]|votre )?(manager|espace|compte|tableau de bord)/i), []);
});

test('no page places the automatic scans or alert recipients on the Security Scanner page', () => {
  assert.deepEqual(pagesMatching(englishDir, /\*\*Security Scanner\*\* page|Security Scanner tab|\*\*Run automatically\*\*/), []);
  assert.deepEqual(pagesMatching(frenchDir, /page \*\*Scanner de sécurité\*\*|onglet (\*\*)?Scanner de sécurité|\*\*Exécuter automatiquement\*\*/), []);
});

test('the French pages name the tab Scanner de sécurité in the scanner menu path', () => {
  const scanner = readFileSync(join(frenchDir, 'features/vulnerability-scanner.md'), 'utf8');
  const installation = readFileSync(join(frenchDir, 'installation.md'), 'utf8');
  assert.match(scanner, /\*\*Modules > Sentinel > Scanner de sécurité\*\*/);
  assert.match(installation, /\*\*Modules > Sentinel > Scanner de sécurité\*\*/);
  assert.doesNotMatch(scanner, /Sentinel > Security Scanner/);
  assert.doesNotMatch(installation, /Sentinel > Security Scanner/);
});

const englishCheckFile = join(englishDir, 'features/integrity-check.md');
const frenchCheckFile = join(frenchDir, 'features/integrity-check.md');

test('the Integrity Check pages describe the Themes section in both languages', () => {
  const englishPage = readFileSync(englishCheckFile, 'utf8');
  const frenchPage = readFileSync(frenchCheckFile, 'utf8');
  const englishThemes = sectionOf(englishCheckFile, '### Theme Files');
  const frenchThemes = sectionOf(frenchCheckFile, '### Fichiers Thèmes');
  const englishCli = sectionOf(englishCheckFile, '### Via Command Line');
  const frenchCli = sectionOf(frenchCheckFile, '### Via la ligne de commande');
  assert.match(englishPage, /three sections: \*\*Core\*\*, \*\*Modules\*\* and \*\*Themes\*\*/);
  assert.match(frenchPage, /trois sections : \*\*Core\*\*, \*\*Modules\*\* et \*\*Thèmes\*\*/);
  assert.match(paragraphWith(englishCheckFile, '**File scanning**'), /installation, its themes and installed modules/);
  assert.match(paragraphWith(frenchCheckFile, '**Scan des fichiers**'), /installation PrestaShop, de ses thèmes et des modules installés/);
  assert.match(readFileSync(join(englishDir, 'intro.md'), 'utf8'), /PrestaShop core, theme and module files have not been tampered with[\s\S]*All core, theme and module files are scanned/);
  assert.match(readFileSync(join(frenchDir, 'intro.md'), 'utf8'), /fichiers du core PrestaShop, des thèmes et des modules n'ont pas été altérés[\s\S]*Tous les fichiers du core, des thèmes et des modules sont scannés/);
  assert.ok(englishPage.indexOf('### Theme Files') > englishPage.indexOf('## What is checked') && englishPage.indexOf('### Theme Files') < englishPage.indexOf('## Understanding Results'), 'EN: ### Theme Files is missing or not under ## What is checked');
  assert.ok(frenchPage.indexOf('### Fichiers Thèmes') > frenchPage.indexOf('## Ce qui est vérifié') && frenchPage.indexOf('### Fichiers Thèmes') < frenchPage.indexOf('## Comprendre les résultats'), 'FR: ### Fichiers Thèmes is missing or not under ## Ce qui est vérifié');
  assert.match(englishThemes, /`classic`, and also `hummingbird` from PrestaShop 9, is verified against the official files[^.]*\*\*Themes\*\* section\. Its files no longer count in Core/);
  assert.match(frenchThemes, /`classic`, ainsi que `hummingbird` à partir de PrestaShop 9, est vérifié avec les fichiers officiels[^.]*\*\*Thèmes\*\*\. Ses fichiers ne comptent plus dans Core/);
  assert.match(englishThemes, /including a child theme of `classic`[^.]*not verified\. It is listed under \*\*Unchecked Themes\*\* with the reason \*\*Custom theme\*\*/);
  assert.match(frenchThemes, /y compris un thème enfant de `classic`[^.]*pas vérifié\. Il figure dans \*\*Thèmes non vérifiés\*\* avec la raison \*\*Thème personnalisé\*\*/);
  assert.match(englishThemes, /`themes\/_libraries`, a directory whose name contains a dot and a directory without `config\/theme\.yml`[^.]*stay in Core/);
  assert.match(frenchThemes, /`themes\/_libraries`, un dossier dont le nom contient un point et un dossier sans `config\/theme\.yml`[^.]*restent dans Core/);
  assert.match(englishThemes, /`assets\/cache` directory of each theme is ignored/);
  assert.match(frenchThemes, /dossier `assets\/cache` de chaque thème est ignoré/);
  assert.match(englishThemes, /\*\*Themes not checked\*\* means that no theme was checked in the Themes section/);
  assert.match(frenchThemes, /\*\*Thèmes non contrôlés\*\* signifie qu'aucun thème n'a été contrôlé dans la section Thèmes/);
  assert.match(englishThemes, /\*\*Unchecked Themes\*\* lists the custom themes found by the check: both can therefore appear together/);
  assert.match(frenchThemes, /\*\*Thèmes non vérifiés\*\* liste les thèmes personnalisés trouvés par le contrôle : les deux peuvent donc s'afficher ensemble/);
  assert.doesNotMatch(englishPage + frenchPage, /\b(?!classic\b|hummingbird\b)\w+` is (also )?a (native|PrestaShop) theme/);
  assert.match(englishCli, /--type=themes\n/);
  assert.match(frenchCli, /--type=themes\n/);
  assert.match(englishCli, /\*\*Check all files \(core \+ themes \+ modules\):\*\*/);
  assert.match(frenchCli, /\*\*Vérifier tous les fichiers \(core \+ thèmes \+ modules\) :\*\*/);
  assert.match(englishCli, /With `--type=core`, the theme directories stay in the core files and are checked with them/);
  assert.match(frenchCli, /Avec `--type=core`, les dossiers de thèmes restent dans les fichiers du core et sont vérifiés avec eux/);
  assert.match(englishCli, /uses one check of your quota/);
  assert.match(frenchCli, /consomme un passage de votre quota/);
  assert.match(englishCli, /- \*\*Themes Files\*\*[^\n]*\n- \*\*Unchecked Themes\*\*/);
  assert.match(frenchCli, /- \*\*Themes Files\*\*[^\n]*\n- \*\*Unchecked Themes\*\*/);
  assert.match(englishCli, /\*\*Core Issues\*\*, \*\*Module Issues\*\* and \*\*Theme Issues\*\*/);
  assert.match(frenchCli, /\*\*Core Issues\*\*, \*\*Module Issues\*\* et \*\*Theme Issues\*\*/);
  assert.match(englishCli, /its column says so instead of a green `0`: `2 not checked`, or `3 \(2 not checked\)` when the section also has issues; the \*\*Total\*\* column then turns yellow, while still counting the issues only\. With `--history --json`, each check also carries a `failures` object/);
  assert.match(frenchCli, /sa colonne le dit au lieu d'un `0` vert : `2 not checked`, ou `3 \(2 not checked\)` quand la section a aussi des problèmes ; la colonne \*\*Total\*\* passe alors en jaune, tout en ne comptant que les problèmes\. Avec `--history --json`, chaque vérification porte aussi un objet `failures`/);
  assert.doesNotMatch(englishCli + frenchCli, /submi|soum/i);
  assert.match(englishPage, /These statuses apply to the files of the Core, Modules and Themes sections alike/);
  assert.match(frenchPage, /Ces statuts valent aussi bien pour les fichiers des sections Core, Modules et Thèmes/);
  assert.match(englishPage, /\*\*CSV\*\*[^\n]*`themes` rows[^\n]*`unchecked theme` rows/);
  assert.match(frenchPage, /\*\*CSV\*\*[^\n]*lignes `themes`[^\n]*lignes `unchecked theme`/);
  assert.match(englishPage, /\*\*JSON\*\*[^\n]*`themes_status`/);
  assert.match(frenchPage, /\*\*JSON\*\*[^\n]*`themes_status`/);
  assert.match(englishPage, /rules apply to the \*\*core\*\*, \*\*module\*\* and \*\*theme\*\* integrity checks/);
  assert.match(frenchPage, /s'appliquent aux contrôles \*\*core\*\*, \*\*modules\*\* et \*\*thèmes\*\*/);
  assert.match(sectionOf(englishCheckFile, '## Troubleshooting'), /### A theme shows as not verified/);
  assert.match(sectionOf(frenchCheckFile, '## Résolution des problèmes'), /### Un thème apparaît comme non vérifié/);
});

test('the Integrity Check pages describe the submission of a custom theme in both languages', () => {
  const englishPage = readFileSync(englishCheckFile, 'utf8');
  const frenchPage = readFileSync(frenchCheckFile, 'utf8');
  const english = sectionOf(englishCheckFile, '## Submit a custom theme');
  const french = sectionOf(frenchCheckFile, '## Soumettre un thème personnalisé');
  const englishWarning = 'The current state of this theme becomes the reference of your next checks. If its files were already altered by someone else, a theme already compromised would be accepted as it is: submit it only if you trust its current files.';
  const frenchWarning = "L'état actuel de ce thème devient la référence de vos prochaines vérifications. Si ses fichiers ont déjà été modifiés par un tiers, un thème déjà compromis serait accepté tel quel : ne le soumettez que si vous avez confiance dans ses fichiers actuels.";
  assert.ok(englishPage.indexOf('## Submit a custom theme') > englishPage.indexOf('## Compare with ZIP') && englishPage.indexOf('## Submit a custom theme') < englishPage.indexOf('## Export Results'), 'EN: ## Submit a custom theme is missing or not between ## Compare with ZIP and ## Export Results');
  assert.ok(frenchPage.indexOf('## Soumettre un thème personnalisé') > frenchPage.indexOf('## Comparer avec un ZIP') && frenchPage.indexOf('## Soumettre un thème personnalisé') < frenchPage.indexOf('## Exporter les résultats'), 'FR: ## Soumettre un thème personnalisé is missing or not between ## Comparer avec un ZIP and ## Exporter les résultats');
  assert.match(english, /\n2\. Click the \*\*Submit to Sentinel\*\* button on the row of the theme[^\n]*not shown for a PrestaShop theme/);
  assert.match(french, /\n2\. Cliquez sur le bouton \*\*Soumettre à Sentinel\*\* sur la ligne du thème[^\n]*n'apparaît pas pour un thème de PrestaShop/);
  assert.match(english, /\n3\. The \*\*Submit a theme to Sentinel\*\* modal opens[^\n]*\*\*Installed version\*\*/);
  assert.match(french, /\n3\. La modale \*\*Soumettre un thème à Sentinel\*\* s'ouvre[^\n]*\*\*Version installée\*\*/);
  assert.match(english, /\n4\.[^\n]*\*\*Directories to exclude\*\* and \*\*Extensions to exclude\*\*: nothing is selected beforehand/);
  assert.match(french, /\n4\.[^\n]*\*\*Répertoires à exclure\*\* et les \*\*Extensions à exclure\*\* : rien n'est coché d'avance/);
  assert.match(english, /\n6\. The row now shows \*\*Submitted, verified at the next check\*\*[^\n]*No check is started automatically/);
  assert.match(french, /\n6\. La ligne affiche alors \*\*Soumis, vérifié au prochain contrôle\*\*[^\n]*Aucun contrôle n'est lancé automatiquement/);
  assert.match(english, /\n7\. At the next check, the theme is verified in the \*\*Themes\*\* section/);
  assert.match(french, /\n7\. Au contrôle suivant, le thème est vérifié dans la section \*\*Thèmes\*\*/);
  assert.equal(english.match(/:::warning[^\n]*\n([\s\S]*?)\n:::/)?.[1], englishWarning);
  assert.equal(french.match(/:::warning[^\n]*\n([\s\S]*?)\n:::/)?.[1], frenchWarning);
  assert.match(english, /reference is private to your shop: another shop with the same theme still sees it as not verified/);
  assert.match(french, /référence est privée à votre boutique : une autre boutique qui a le même thème le voit toujours non vérifié/);
  assert.match(english, /does not use a check of your quota/);
  assert.match(french, /ne consomme pas de passage de votre quota/);
  assert.match(english, /requires the Pro plan and the \*\*Edit\*\* permission on the Sentinel \*\*Integrity Check\*\* tab/);
  assert.match(french, /demande l'offre Pro et la permission \*\*Modifier\*\* sur l'onglet \*\*Vérification d'intégrité\*\* de Sentinel/);
  assert.match(english, /\nWhen the modal opens[^\n]*without exclusions or submit button[^\n]*\n\n- \*\*`name` is a theme of PrestaShop[^\n]*\n- \*\*This theme has no version[^\n]*then close the modal and open it again\.\n/);
  assert.match(french, /\nÀ l'ouverture de la modale[^\n]*sans exclusions ni bouton d'envoi[^\n]*\n\n- \*\*`nom` est un thème de PrestaShop[^\n]*\n- \*\*Ce thème n'a pas de version[^\n]*puis fermez la modale et rouvrez-la\.\n/);
  assert.match(english, /\nWhen you click \*\*Submit to Sentinel\*\*[^\n]*The modal then stays open with your exclusions[^\n]*\n\n- \*\*Every file of this theme is excluded[^\n]*\n- \*\*The theme is too large/);
  assert.match(french, /\nQuand vous cliquez sur \*\*Soumettre à Sentinel\*\*[^\n]*La modale reste alors ouverte avec vos exclusions[^\n]*\n\n- \*\*Tous les fichiers de ce thème sont exclus[^\n]*\n- \*\*Le thème est trop volumineux/);
  assert.match(english, /\*\*`name` is a theme of PrestaShop: Sentinel already verifies it against the official files\.\*\*/);
  assert.match(french, /\*\*`nom` est un thème de PrestaShop : Sentinel le vérifie déjà avec les fichiers officiels\.\*\*/);
  assert.match(english, /\*\*This theme has no version: add a version: line to its config\/theme\.yml file, then submit it again\.\*\*/);
  assert.match(french, /\*\*Ce thème n'a pas de version : ajoutez une ligne version: à son fichier config\/theme\.yml, puis soumettez-le à nouveau\.\*\*/);
  assert.match(english, /\*\*Every file of this theme is excluded: there is nothing to submit\.\*\*/);
  assert.match(french, /\*\*Tous les fichiers de ce thème sont exclus : il n'y a rien à soumettre\.\*\*/);
  assert.match(english, /\*\*The theme is too large to be submitted to Sentinel\.\*\*/);
  assert.match(french, /\*\*Le thème est trop volumineux pour être soumis à Sentinel\.\*\*/);
  assert.doesNotMatch(english + french, /ZIP|bin\/console|UTF-8|outside the themes|hors du dossier|Submit Module|\]\(#|\{#/);
  assert.match(englishPage, /For a file of a theme you submitted, the diff viewer shows \*\*Official source not available\*\*/);
  assert.match(frenchPage, /Pour un fichier d'un thème que vous avez soumis, le visualiseur de diff affiche \*\*Source officielle non disponible\*\*/);
  assert.match(englishPage, /The ZIP fallback does not apply to themes/);
  assert.match(frenchPage, /Le fallback ZIP ne s'applique pas aux thèmes/);
});

test('the Integrity Check pages use the labels of the module', () => {
  const englishPage = readFileSync(englishCheckFile, 'utf8');
  const frenchPage = readFileSync(frenchCheckFile, 'utf8');
  assert.match(englishPage, /Click the \*\*Check Integrity\*\* button/);
  assert.match(frenchPage, /Cliquez sur le bouton \*\*Vérifier l'intégrité\*\*/);
  assert.doesNotMatch(englishPage, /Run Check/);
  assert.doesNotMatch(frenchPage, /Lancer la vérification|Voir le Diff/);
  assert.match(englishPage, /\*\*TXT\*\*[^\n]*\(Core Files, Modules Files, Unchecked Modules, Themes Files, Unchecked Themes\)/);
  assert.match(frenchPage, /\*\*TXT\*\*[^\n]*\(Core Files, Modules Files, Unchecked Modules, Themes Files, Unchecked Themes\)/);
  assert.doesNotMatch(frenchPage, /Fichiers Core|Fichiers Modules|Modules non vérifiés\)/);
});

function admonitionOf(file, opening) {
  const page = readFileSync(file, 'utf8');
  const start = page.indexOf(opening);
  if (start < 0) return '';
  const end = page.indexOf('\n:::', start + opening.length);
  return page.slice(start, end < 0 ? undefined : end);
}

test('the Integrity Check pages say secret files are never served, however they are reached', () => {
  const english = admonitionOf(englishCheckFile, ':::warning Access restrictions');
  const french = admonitionOf(frenchCheckFile, ":::warning Restrictions d'accès");
  assert.match(english, /never served either[^.]*neither their source in the viewer nor their raw content/);
  assert.match(french, /jamais servis non plus[^.]*ni leur source dans le visualiseur, ni leur contenu brut/);
  assert.match(english, /`\.env` and `\.env\.\*` files, `app\/config\/` and `var\/` at the root of the shop/);
  assert.match(french, /les fichiers `\.env` et `\.env\.\*`, `app\/config\/` et `var\/` à la racine de la boutique/);
  assert.match(english, /`config\/settings\*\.php` \(also in a copy of the shop or in the `config\/` directory of a module\)/);
  assert.match(french, /`config\/settings\*\.php` \(y compris dans une copie de la boutique ou dans le dossier `config\/` d'un module\)/);
  assert.match(english, /\), a file whose name contains `settings\.inc` in a `config\/` directory or one of its subdirectories, such as `config\/old_settings\.inc\.php` or `config\/sav\/settings\.inc\.php`, `parameters\.php`/);
  assert.match(french, /\), un fichier dont le nom contient `settings\.inc` dans un dossier `config\/` ou l'un de ses sous-dossiers, comme `config\/old_settings\.inc\.php` ou `config\/sav\/settings\.inc\.php`, `parameters\.php`/);
  assert.match(english, /`\.htpasswd` files, `\.sql`, `\.mysql` and `\.log` files, and the archives left at the root of the shop \(for example `\.zip`, `\.tar`, `\.tar\.gz`, `\.tgz`, `\.7z` or `\.rar`\)\./);
  assert.match(french, /les fichiers `\.htpasswd`, les fichiers `\.sql`, `\.mysql` et `\.log`, ainsi que les archives laissées à la racine de la boutique \(par exemple `\.zip`, `\.tar`, `\.tar\.gz`, `\.tgz`, `\.7z` ou `\.rar`\)\./);
  assert.match(english, /`parameters\.php`, `parameters\.yml` and `parameters\.yaml`, `appParameters\.php`, any `var\/cache\/` directory/);
  assert.match(french, /`parameters\.php`, `parameters\.yml` et `parameters\.yaml`, `appParameters\.php`, tout dossier `var\/cache\/`/);
  assert.match(english, /`\.git\/`, `\.htpasswd` files/);
  assert.match(french, /`\.git\/`, les fichiers `\.htpasswd`/);
  assert.match(english, /however the requested path is written \(`\.\/`, a doubled `\/`\), through a symbolic link placed in the shop[^.]*judged by its real place in the shop/);
  assert.match(french, /quelle que soit l'écriture du chemin demandé \(`\.\/`, `\/` doublé\), à travers un lien symbolique placé dans la boutique[^.]*jugé sur sa place réelle dans la boutique/);
  assert.match(english, /and so are the backup copies and database dumps whose names Sentinel recognises, compressed or not, for example `config\/settings\.inc\.php\.bak`, `parameters\.yml~`, `parameters_old\.php`, `dump\.sql`, `dump\.sql\.gz`, `db\.mysql` or `error\.log\.old`\. The viewer then shows/);
  assert.match(french, /de même que les copies de sauvegarde et les dumps de base de données dont Sentinel reconnaît le nom, compressés ou non, par exemple `config\/settings\.inc\.php\.bak`, `parameters\.yml~`, `parameters_old\.php`, `dump\.sql`, `dump\.sql\.gz`, `db\.mysql` ou `error\.log\.old`\. Le visualiseur affiche alors/);
  assert.match(english, /Keep no other copy of these files and no database dump in your shop directory\./);
  assert.match(french, /Ne gardez aucune autre copie de ces fichiers ni aucun dump de base de données dans le répertoire de votre boutique\./);
  assert.match(english, /Keep no archive of the shop there either: archives are only refused at the root of the shop, and one stored in another folder, such as `preprod\/` or the folder of a module or a theme, stays readable\./);
  assert.match(french, /N'y gardez pas non plus d'archive de la boutique : les archives ne sont refusées qu'à la racine de la boutique, et une archive rangée dans un autre dossier, comme `preprod\/` ou le dossier d'un module ou d'un thème, reste lisible\./);
  assert.doesNotMatch(english, /\btheir backup copies|backup copies and database dumps(?! whose names Sentinel recognises)|(?<!config\/)settings\.inc\.php\.bak/);
  assert.doesNotMatch(french, /\bleurs copies de sauvegarde|copies de sauvegarde et les dumps de base de données(?! dont Sentinel reconnaît le nom)|(?<!config\/)settings\.inc\.php\.bak/);
  assert.match(english, /The viewer then shows \*\*Failed to load file content\*\*/);
  assert.match(french, /Le visualiseur affiche alors \*\*Impossible de charger le contenu du fichier\*\*/);
  assert.match(english, /compare a module file with a ZIP, the file is judged as a file of the shop \(`modules\/<name>\/<path>`\) and refused the same way, both its version in the ZIP and your local file/);
  assert.match(french, /comparez un fichier de module avec un ZIP, le fichier est jugé comme un fichier de la boutique \(`modules\/<nom>\/<chemin>`\) et refusé de même, pour sa version du ZIP comme pour votre fichier local/);
  assert.doesNotMatch(english, /backslash|\b(any|every|all) (backup|cop(y|ies)|archives?|dumps?)\b/i);
  assert.doesNotMatch(french, /antislash|barre oblique inverse|\b(toute?s?|chaque) (les )?(sauvegardes?|copies?|archives?|dumps?)\b/i);
});

test('the Integrity Check pages say which binary files are previewed and which are downloaded', () => {
  const english = paragraphWith(englishCheckFile, ':::note\nThe diff viewer');
  const french = paragraphWith(frenchCheckFile, ':::note\nLe visualiseur de diff');
  assert.match(english, /a file is binary when its first 8 KB hold a null byte, whatever its extension: an SVG, HTML or XML file is usually text and is shown as source/);
  assert.match(french, /un fichier est binaire quand ses 8 premiers Ko contiennent un octet nul, quelle que soit son extension : un fichier SVG, HTML ou XML est en général du texte et s'affiche en source/);
  assert.match(english, /the \*\*Original File\*\* and \*\*Local File\*\* panels[^.]*the \*\*Size\*\*, the \*\*Type\*\* and the first 256 bytes in hexadecimal/);
  assert.match(french, /les panneaux \*\*Fichier original\*\* et \*\*Fichier local\*\*[^.]*la \*\*Taille\*\*, le \*\*Type\*\* et les 256 premiers octets en hexadécimal/);
  assert.match(english, /Only PNG, JPEG, GIF and WebP images are previewed, with an \*\*Open in new tab\*\* button/);
  assert.match(french, /Seules les images PNG, JPEG, GIF et WebP sont prévisualisées, avec un bouton \*\*Ouvrir dans un nouvel onglet\*\*/);
  assert.match(english, /any other binary file is downloaded instead, with a \*\*Download\*\* button and the note \*\*This type of file is downloaded instead of being displayed\.\*\*/);
  assert.match(french, /tout autre fichier binaire est téléchargé à la place, avec un bouton \*\*Télécharger\*\* et la note \*\*Ce type de fichier est téléchargé au lieu d'être affiché\.\*\*/);
  assert.match(english, /compare with a ZIP, a binary file shows its size, type and first bytes, without preview or download/);
  assert.match(french, /comparaison avec un ZIP, un fichier binaire montre sa taille, son type et ses premiers octets, sans aperçu ni téléchargement/);
  assert.doesNotMatch(english, /SVG[^.]*download/i);
  assert.doesNotMatch(french, /SVG[^.]*télécharg/i);
  assert.doesNotMatch(readFileSync(englishCheckFile, 'utf8'), /"Binary file"|\*\*Binary file\*\*/);
  assert.doesNotMatch(readFileSync(frenchCheckFile, 'utf8'), /"Fichier binaire"|\*\*Fichier binaire\*\*/);
});

test('the Integrity Check pages name the folders and themes that could not be checked', () => {
  const englishPage = readFileSync(englishCheckFile, 'utf8');
  const frenchPage = readFileSync(frenchCheckFile, 'utf8');
  const english = admonitionOf(englishCheckFile, ':::warning Could not be checked');
  const french = admonitionOf(frenchCheckFile, ":::warning N'a pas pu être contrôlé");
  const englishCli = sectionOf(englishCheckFile, '### Via Command Line');
  const frenchCli = sectionOf(frenchCheckFile, '### Via la ligne de commande');
  const englishHelp = sectionOf(englishCheckFile, '## Troubleshooting');
  const frenchHelp = sectionOf(frenchCheckFile, '## Résolution des problèmes');
  assert.ok(sectionOf(englishCheckFile, '### Theme Files').includes(':::warning Could not be checked'), 'EN: the Could not be checked box is not in ### Theme Files');
  assert.ok(sectionOf(frenchCheckFile, '### Fichiers Thèmes').includes(":::warning N'a pas pu être contrôlé"), "FR: the N'a pas pu être contrôlé box is not in ### Fichiers Thèmes");
  assert.match(english, /a folder of Core or Modules, or a theme, that could not be checked[^.]*is listed under \*\*Could not be checked\*\* in its section: the path of the folder \(`\/` for the root of the shop\), `modules\/<name>` or one of its folders for a module, or the name of the theme/);
  assert.match(french, /un dossier de Core ou de Modules, ou un thème, qui n'a pas pu être contrôlé[^.]*est listé sous \*\*N'a pas pu être contrôlé\*\* dans sa section : le chemin du dossier \(`\/` pour la racine de la boutique\), `modules\/<nom>` ou l'un de ses dossiers pour un module, ou le nom du thème/);
  assert.match(english, /never says its files are intact, even when it counts no issue/);
  assert.match(french, /ne dit jamais que ses fichiers sont intacts, même quand elle ne compte aucun problème/);
  assert.match(english, /not counted among the \*\*Themes checked:\*\*/);
  assert.match(french, /ne figure pas parmi les \*\*Thèmes contrôlés :\*\*/);
  assert.match(english, /Modules section of the check you have just run says \*\*Modules not checked\*\*/);
  assert.match(french, /section Modules du contrôle que vous venez de lancer indique \*\*Modules non contrôlés\*\*/);
  assert.match(english, /listed in the details of a check reopened from the history[^.]*appear as `modules` under \*\*Could not be checked\*\*[^.]*`php bin\/console sentinel:integrity --details=<check_id>`/);
  assert.match(french, /listés dans le détail d'un contrôle rouvert depuis l'historique[^.]*apparaissent comme `modules` sous \*\*N'a pas pu être contrôlé\*\*[^.]*`php bin\/console sentinel:integrity --details=<check_id>`/);
  assert.match(english, /last 100 checks that have one/);
  assert.match(french, /100 derniers contrôles qui en ont une/);
  assert.doesNotMatch(english, /exports do not contain it|before relying on an export/);
  assert.doesNotMatch(french, /exports CSV, JSON et TXT ne la contiennent pas|avant de vous fier à un export/);
  assert.match(english, /In the \*\*Check History\*\* list of the back office, a section with such folders or themes never shows \*\*OK\*\*: it shows a \*\*N not checked\*\* badge, after the \*\*N issue\(s\)\*\* badge when the section also has issues; hover it to read their names, up to ten\./);
  assert.match(french, /Dans la liste \*\*Historique des vérifications\*\* du back-office, une section qui a de tels dossiers ou thèmes n'affiche jamais \*\*OK\*\* : elle affiche un badge \*\*N non contrôlé\(s\)\*\*, après le badge \*\*N problème\(s\)\*\* quand la section a aussi des problèmes ; survolez-le pour lire leurs noms, dix au plus\./);
  assert.match(english, /The \*\*Last Integrity Check\*\* card of the Sentinel dashboard marks the section the same way, and also shows, with \*\*Not checked\*\*, a Core or Modules section that was not recorded but has such folders\./);
  assert.match(french, /La carte \*\*Dernière vérification d'intégrité\*\* du tableau de bord de Sentinel marque la section de la même façon, et affiche aussi, avec \*\*Non contrôlé\*\*, une section Core ou Modules qui n'a pas été enregistrée mais a de tels dossiers\./);
  assert.match(english, /The Sentinel widget of the PrestaShop dashboard adds a \*\*Could not be checked\*\* line with their number\. The CSV, JSON and TXT exports name them under their section \(see \*\*Export Results\*\* below\)\./);
  assert.match(french, /Le widget Sentinel du tableau de bord de PrestaShop ajoute une ligne \*\*N'a pas pu être contrôlé\*\* avec leur nombre\. Les exports CSV, JSON et TXT les nomment sous leur section \(voir \*\*Exporter les résultats\*\* plus bas\)\./);
  assert.doesNotMatch(english, /first ten/);
  assert.doesNotMatch(french, /dix premiers/);
  assert.doesNotMatch(english, /reopened[^.]*\*\*Modules not checked\*\*|OK column|No issues found/);
  assert.doesNotMatch(french, /rouvert[^.]*\*\*Modules non contrôlés\*\*|colonne OK|No issues found/);
  assert.match(englishPage, /- \*\*CSV\*\*[^\n]*Each folder or theme that could not be checked is a row of its section with the status `not checked` and \*\*Could not be checked\*\* in Details\.\n/);
  assert.match(frenchPage, /- \*\*CSV\*\* : Fichier séparé par des points-virgules, avec les colonnes nommées en anglais comme dans l'export : Section, Path, Status et Details\.[^\n]*Chaque dossier ou thème qui n'a pas pu être contrôlé forme une ligne de sa section avec le statut `not checked` et \*\*Could not be checked\*\* dans la colonne Details\.\n/);
  assert.doesNotMatch(frenchPage, /Chemin, Statut et Détails/);
  assert.match(englishPage, /- \*\*JSON\*\*[^\n]*When at least one folder or theme could not be checked, a `failures` object lists them by section \(`core`, `modules`, `themes`\)\.\n/);
  assert.match(frenchPage, /- \*\*JSON\*\*[^\n]*Quand au moins un dossier ou un thème n'a pas pu être contrôlé, un objet `failures` les liste par section \(`core`, `modules`, `themes`\)\.\n/);
  assert.match(englishPage, /- \*\*TXT\*\*[^\n]*Each folder or theme that could not be checked is listed as `Could not be checked: <name>` in its section, which then never says its files are intact, and the report also ends with `No issues found in the checked files\.` when no issue is found\.\n/);
  assert.match(frenchPage, /- \*\*TXT\*\*[^\n]*Chaque dossier ou thème qui n'a pas pu être contrôlé est listé `Could not be checked: <nom>` dans sa section, qui ne dit alors jamais que ses fichiers sont intacts, et le rapport se termine aussi par `No issues found in the checked files\.` si aucun problème n'est trouvé\.\n/);
  assert.match(englishPage, /\n\nThe exports name the folders and themes that could not be checked for the checks whose list Sentinel kept \(see \*\*Could not be checked\*\* above\)\.\n/);
  assert.match(frenchPage, /\n\nLes exports nomment les dossiers et thèmes qui n'ont pas pu être contrôlés pour les contrôles dont Sentinel a conservé la liste \(voir \*\*N'a pas pu être contrôlé\*\* plus haut\)\.\n/);
  assert.match(englishCli, /sentinel:integrity --details=<check_id>\n```\n\n`<check_id>` is a value of the \*\*Check ID\*\* column of the history\. In each section, the details name the folders and themes that could not be checked/);
  assert.match(frenchCli, /sentinel:integrity --details=<check_id>\n```\n\n`<check_id>` est une valeur de la colonne \*\*Check ID\*\* de l'historique\. Dans chaque section, le détail nomme les dossiers et les thèmes qui n'ont pas pu être contrôlés/);
  assert.doesNotMatch(englishCli + frenchCli, /No issues found|Integrity check complete/);
  assert.match(englishHelp, /### A folder or a theme could not be checked\n\n[^\n]*\*\*Could not be checked\*\*[^\n]*\*\*Modules not checked\*\*[^\n]*Run the check again/);
  assert.match(frenchHelp, /### Un dossier ou un thème n'a pas pu être contrôlé\n\n[^\n]*\*\*N'a pas pu être contrôlé\*\*[^\n]*\*\*Modules non contrôlés\*\*[^\n]*Relancez le contrôle/);
  assert.match(englishHelp, /from the command line, a theme that could not be checked is named with the reason/);
  assert.match(frenchHelp, /en ligne de commande, un thème qui n'a pas pu être contrôlé est nommé avec la raison/);
});

test('the Integrity Check pages say where Themes not checked is shown', () => {
  const englishPage = readFileSync(englishCheckFile, 'utf8');
  const frenchPage = readFileSync(frenchCheckFile, 'utf8');
  const englishThemes = sectionOf(englishCheckFile, '### Theme Files');
  const frenchThemes = sectionOf(frenchCheckFile, '### Fichiers Thèmes');
  const englishCli = sectionOf(englishCheckFile, '### Via Command Line');
  const frenchCli = sectionOf(frenchCheckFile, '### Via la ligne de commande');
  assert.match(englishThemes, /or themes that could not be checked \(see \*\*Could not be checked\*\* below\)/);
  assert.match(frenchThemes, /ou des thèmes qui n'ont pas pu être contrôlés \(voir \*\*N'a pas pu être contrôlé\*\* plus bas\)/);
  assert.match(englishThemes, /\*\*Themes not checked\*\* is shown in the results of the check, in the details of a check reopened from the history, by the command line and in the three exports/);
  assert.match(frenchThemes, /\*\*Thèmes non contrôlés\*\* s'affiche dans les résultats du contrôle et dans le détail d'un contrôle rouvert depuis l'historique ; la ligne de commande et les trois exports le disent en anglais \(\*\*Themes not checked\*\*, ou `not checked` dans le JSON\)/);
  assert.match(englishCli, /- \*\*Themes Files\*\*: Shows the themes checked, or \*\*Themes not checked\*\*, and the issues with their files\n/);
  assert.match(frenchCli, /- \*\*Themes Files\*\* : Affiche les thèmes contrôlés, ou \*\*Themes not checked\*\*, et les problèmes avec leurs fichiers\n/);
  assert.match(englishPage, /\*\*TXT\*\*[^\n]*When the themes were not checked, the Themes Files section says `Themes not checked\.`[^\n]*ends with `No issues found in the checked files\.`/);
  assert.match(frenchPage, /\*\*TXT\*\*[^\n]*Quand les thèmes n'ont pas été contrôlés, la section Themes Files indique `Themes not checked\.`[^\n]*se termine par `No issues found in the checked files\.`/);
});

test('the Threat Detection pages say the security tokens of PrestaShop are not compared with the signatures', () => {
  const englishFile = join(englishDir, 'features/threat-detection.md');
  const frenchFile = join(frenchDir, 'features/threat-detection.md');
  const english = paragraphWith(englishFile, '**Request Analysis**');
  const french = paragraphWith(frenchFile, '**Analyse des requêtes**');
  assert.match(english, /The security tokens that PrestaShop adds to its links and forms are not compared with the signatures when they have exactly the shape PrestaShop gives them, so that a random token no longer gets a page or a form refused by chance/);
  assert.match(french, /Les jetons de sécurité que PrestaShop ajoute à ses liens et à ses formulaires ne sont pas comparés aux signatures lorsqu'ils ont exactement la forme que PrestaShop leur donne, afin qu'un jeton tiré au hasard ne fasse plus refuser une page ou un formulaire/);
  assert.match(english, /any other value of these parameters is analyzed as usual, and the signatures that target them still apply\.$/);
  assert.match(french, /toute autre valeur de ces paramètres est analysée comme d'habitude, et les signatures qui les visent s'appliquent toujours\.$/);
  assert.doesNotMatch(english, /back-office links|can no longer/);
  assert.doesNotMatch(french, /liens du back-office|ne peut plus/);
  assert.doesNotMatch(readFileSync(englishFile, 'utf8') + readFileSync(frenchFile, 'utf8'), /_token|`token`|base64|randomi|\b4[23]\b|\[A-Za-z/i);
});

test('the installation pages say who can change the settings of the configuration page', () => {
  const english = sectionOf(join(englishDir, 'installation.md'), '## Who Can Change the Settings {#who-can-change-the-settings}');
  const french = sectionOf(join(frenchDir, 'installation.md'), '## Qui peut modifier les réglages {#who-can-change-the-settings}');
  const englishPrepend = paragraphWith(join(englishDir, 'features/auto-prepend-protection.md'), 'sees this button');
  const frenchPrepend = paragraphWith(join(frenchDir, 'features/auto-prepend-protection.md'), 'voit ce bouton');
  assert.match(english, /SuperAdmin, or a profile with the \*\*Edit\*\* permission on \*\*Module Manager\*\* and the \*\*Configure\*\* permission on the Sentinel module, both set in \*\*Advanced Parameters > Team > Permissions\*\*/);
  assert.match(french, /SuperAdmin, ou un profil qui a le droit \*\*Modifier\*\* sur \*\*Gestionnaire de modules\*\* et le droit \*\*Configurer\*\* sur le module Sentinel, tous deux réglés dans \*\*Paramètres avancés > Équipe > Permissions\*\*/);
  assert.match(english, /PrestaShop 1\.7 and 8, PrestaShop already requires these permissions before opening the page/);
  assert.match(french, /PrestaShop 1\.7 et 8, PrestaShop exige déjà ces droits avant d'ouvrir la page/);
  assert.match(english, /PrestaShop 9, an employee who only has read access to \*\*Module Manager\*\* can open the page, but sees it read-only/);
  assert.match(french, /PrestaShop 9, un employé qui n'a que la lecture sur \*\*Gestionnaire de modules\*\* peut ouvrir la page, mais la voit en lecture seule/);
  assert.match(english, /licence\n- the Auto Prepend automatic installation\n- the Integrity Check exclusions\n- downloading the threat detection signatures\n- refreshing the subscription\n- turning threat detection on or off\n/);
  assert.match(french, /licence\n- l'installation automatique d'Auto Prepend\n- les exclusions de la Vérification d'intégrité\n- le téléchargement des signatures de détection des menaces\n- le rafraîchissement de l'abonnement\n- l'activation ou la désactivation de la détection des menaces\n/);
  assert.match(english, /without any button, link, switch or form to change them, and with the notice \*\*You need the permission to configure this module to change these settings\.\*\*/);
  assert.match(french, /sans aucun bouton, lien, interrupteur ni formulaire pour les modifier, et avec la mention \*\*Vous devez avoir le droit de configurer ce module pour modifier ces réglages\.\*\*/);
  assert.match(english, /nothing is changed and the page says \*\*Your account is not allowed to change these settings\. Nothing was changed: ask the shop administrator\.\*\*/);
  assert.match(french, /rien n'est changé et la page indique \*\*Votre compte n'est pas autorisé à modifier ces réglages\. Rien n'a été modifié : demandez à l'administrateur de la boutique\.\*\*/);
  assert.match(english, /\*\*Your account is not allowed to associate a licence with this shop\. Nothing was saved: ask the shop administrator to associate the licence again from this page\.\*\*/);
  assert.match(french, /\*\*Votre compte n'est pas autorisé à associer une licence à cette boutique\. Rien n'a été enregistré : demandez à l'administrateur de la boutique de refaire l'association de la licence depuis cette page\.\*\*/);
  assert.match(englishPrepend, /PrestaShop 9, the other employees see the page read-only\. See \[Who Can Change the Settings\]\(\.\.\/installation\.md#who-can-change-the-settings\)/);
  assert.match(frenchPrepend, /PrestaShop 9, les autres employés voient la page en lecture seule\. Voir \[Qui peut modifier les réglages\]\(\.\.\/installation\.md#who-can-change-the-settings\)/);
  assert.doesNotMatch(english + french + englishPrepend + frenchPrepend, /sentinelignore|ADMINMODULESSF|SENTINEL_|can_configure|getContent/);
});

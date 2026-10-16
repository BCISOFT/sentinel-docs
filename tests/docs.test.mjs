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
  assert.doesNotMatch(english, /Run automatically|\btick(ed|ing)?\b/i);
  assert.doesNotMatch(french, /Exécuter automatiquement|coch/i);
  assert.match(english, /between 0 and 23[^.]*between 0 and 59/);
  assert.match(french, /entre 0 et 23 ou si la minute n'est pas comprise entre 0 et 59/);
  assert.match(english, /[Oo]nly an employee who can configure the Sentinel module/);
  assert.match(french, /[Ss]eul un employé qui peut configurer le module Sentinel/);
  assert.match(english, /\*\*Integrity Check\*\* schedule/);
  assert.match(french, /planification de la \*\*Vérification d'intégrité\*\*/);
  assert.match(english, /SuperAdmin/);
  assert.match(french, /SuperAdmin/);
  assert.match(english, /\*\*Edit\*\* permission on \*\*Module Manager\*\*/);
  assert.match(french, /droit \*\*Modifier\*\* sur \*\*Gestionnaire de modules\*\*/);
  assert.match(english, /\*\*Configure\*\* permission on the Sentinel module/);
  assert.match(french, /droit \*\*Configurer\*\* sur le module Sentinel/);
  assert.match(english, /\*\*Advanced Parameters > Team > Permissions\*\*/);
  assert.match(french, /\*\*Paramètres avancés > Équipe > Permissions\*\*/);
  assert.match(english, /PrestaShop 1\.7 and 8, no other employee can open the configuration page/);
  assert.match(french, /PrestaShop 1\.7 et 8, aucun autre employé ne peut ouvrir la page de configuration/);
  assert.match(english, /PrestaShop 9[^.]*at least one permission on \*\*Module Manager\*\*[^.]*read-only/);
  assert.match(french, /PrestaShop 9[^.]*au moins un droit sur \*\*Gestionnaire de modules\*\*[^.]*lecture seule/);
  assert.match(english, /PrestaShop 9[^.]*cannot configure the module[^.]*cards only show \*\*You need the permission to configure this module to see these settings\.\*\*/);
  assert.match(french, /PrestaShop 9[^.]*ne peut pas configurer le module[^.]*affichent seulement \*\*Vous devez avoir le droit de configurer ce module pour voir ces réglages\.\*\*/);
  assert.match(english, /PrestaShop 9.*[Nn]o other employee can open it/);
  assert.match(french, /PrestaShop 9.*[Aa]ucun autre employé ne peut l'ouvrir/);
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
  assert.match(englishCheck, /\*\*Edit\*\* permission on \*\*Module Manager\*\*/);
  assert.match(frenchCheck, /droit \*\*Modifier\*\* sur \*\*Gestionnaire de modules\*\*/);
  assert.match(englishCheck, /\*\*Configure\*\* permission on the Sentinel module/);
  assert.match(frenchCheck, /droit \*\*Configurer\*\* sur le module Sentinel/);
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

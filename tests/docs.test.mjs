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

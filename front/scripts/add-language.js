#!/usr/bin/env node
/**
 * Scaffold a new locale directory for i18n.
 * Usage: node scripts/add-language.js <code> [name]
 * Example: node scripts/add-language.js de "Deutsch"
 *
 * Copies fr/translation.json structure with empty string values,
 * then rebuild the frontend to pick up the new locale.
 */

const fs   = require('fs');
const path = require('path');

const code = process.argv[2];
const name = process.argv[3] || '';

if (!code) {
    console.error('Usage: node scripts/add-language.js <code> [name]');
    console.error('Example: node scripts/add-language.js de "Deutsch"');
    process.exit(1);
}

if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(code)) {
    console.error(`Invalid language code: "${code}". Use ISO 639-1 format (e.g. "de", "es", "pt-BR").`);
    process.exit(1);
}

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const targetDir  = path.join(localesDir, code);
const sourcePath = path.join(localesDir, 'fr', 'translation.json');
const targetPath = path.join(targetDir, 'translation.json');

if (fs.existsSync(targetDir)) {
    console.error(`Language "${code}" already exists at ${targetDir}`);
    process.exit(1);
}

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

function emptyValues(obj) {
    if (typeof obj !== 'object' || obj === null) return '';
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, emptyValues(v)]));
}

const template = emptyValues(source);

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetPath, JSON.stringify(template, null, 2) + '\n', 'utf8');

const displayName = name || new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code;
console.log(`✓ Created locale "${code}" (${displayName}) at ${targetPath}`);
console.log(`  Fill in the translation values, then rebuild: npm run build`);

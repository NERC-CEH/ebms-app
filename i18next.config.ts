import { defineConfig, type Plugin } from 'i18next-cli';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import en from './src/common/translations/interface/en.json';

const interfaceTranslationsDirectory = 'src/common/translations/interface';
const locales = readdirSync(interfaceTranslationsDirectory)
  .filter(file => file.endsWith('.json'))
  .map(file => file.slice(0, -'.json'.length))
  .sort();

function flatten(
  value: Record<string, unknown>,
  prefix = ''
): [string, string][] {
  return Object.entries(value).flatMap(([key, child]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    return child && typeof child === 'object'
      ? flatten(child as Record<string, unknown>, fullKey)
      : [[fullKey, child as string]];
  });
}

function readSource(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .map(entry => {
      const file = path.join(directory, entry.name);

      if (entry.isDirectory()) return readSource(file);
      if (!/\.(?:js|jsx|ts|tsx)$/.test(entry.name)) return '';

      return readFileSync(file, 'utf8');
    })
    .join('\n');
}

const implicitKeys: Plugin = {
  name: 'implicit-keys',
  onEnd(keys) {
    const source = readSource('src');

    flatten(en).forEach(([key, defaultValue]) => {
      if (!source.includes(key) || keys.has(`false:${key}`)) return;

      keys.set(`false:${key}`, {
        key,
        ns: 'translation',
        nsIsImplicit: true,
        defaultValue,
        locations: [],
      });
    });
  },
};

export default defineConfig({
  locales,
  extract: {
    input: 'src/**/*.{js,jsx,ts,tsx}',
    output: `${interfaceTranslationsDirectory}/{{language}}.json`,
    defaultNS: false,
    keySeparator: '.',
    nsSeparator: false,
    transComponents: ['Trans', 'T'],
    primaryLanguage: 'en',
    removeUnusedKeys: true,
    extractFromComments: false,
  },
  plugins: [implicitKeys],
});

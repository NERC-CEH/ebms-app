/* eslint-disable @typescript-eslint/naming-convention */
export type Language = { name: string; ISO_639_2?: string };

const languages = {
  'sq-AL': { name: 'Shqip', ISO_639_2: 'sqi' },
  'bg-BG': { name: 'Български', ISO_639_2: 'bul' },
  'ca-ES': { name: 'Català', ISO_639_2: 'cat' },
  'gl-ES': { name: 'Galego', ISO_639_2: 'glg' },
  'cs-CZ': { name: 'Čeština', ISO_639_2: 'ces' },
  'da-DK': { name: 'Dansk', ISO_639_2: 'dan' },
  'de-DE': { name: 'Deutsch', ISO_639_2: 'deu' },
  'el-GR': { name: 'Ελληνικά', ISO_639_2: '' },
  'es-ES': { name: 'Español', ISO_639_2: '' },
  'fi-FI': { name: 'Suomi', ISO_639_2: 'fin' },
  'fr-FR': { name: 'Français', ISO_639_2: 'fra' },
  'hr-HR': { name: 'Hrvatski', ISO_639_2: 'hrv' },
  'hu-HU': { name: 'Magyar', ISO_639_2: 'hun' },
  'it-IT': { name: 'Italiano', ISO_639_2: 'ita' },
  'ja-JP': { name: '日本語', ISO_639_2: 'jpn' },
  'lt-LT': { name: 'Lietuvių', ISO_639_2: 'lit' },
  'mi-NZ': { name: 'Māori', ISO_639_2: 'mri' },
  'nl-NL': { name: 'Nederlands', ISO_639_2: 'nld' },
  'pl-PL': { name: 'Polski', ISO_639_2: 'pol' },
  'pt-PT': { name: 'Português', ISO_639_2: '' },
  'ro-RO': { name: 'Română', ISO_639_2: '' },
  'ru-RU': { name: 'Pусский', ISO_639_2: 'rus' },
  'sk-SK': { name: 'Slovensky', ISO_639_2: 'slk' },
  'sl-SI': { name: 'Slovenščina', ISO_639_2: 'slv' },
  'sr-RS': { name: 'Cрпски', ISO_639_2: 'srb' },
  'sv-SE': { name: 'Svenska', ISO_639_2: 'swe' },
  'tr-TR': { name: 'Türkçe', ISO_639_2: 'tur' },
  en: { name: 'English', ISO_639_2: 'eng' },
} as const satisfies Record<string, Language>;
/* eslint-enable @typescript-eslint/naming-convention */

const isDemo =
  typeof window !== 'undefined' && (window as any)?.Capacitor?.isNative;
if (isDemo) {
  Object.assign(languages, {
    // only demo
  });
}

export type LanguageCode = keyof typeof languages;

export const getLanguageIso = (languageCode?: LanguageCode | null): string => {
  const DEFAULT_LANGUAGE_ISO = 'eng';

  if (!languageCode) return DEFAULT_LANGUAGE_ISO;

  const directMatch = languages[languageCode];
  if (directMatch?.ISO_639_2) return directMatch.ISO_639_2;

  return DEFAULT_LANGUAGE_ISO;
};

export default languages as Record<LanguageCode, Language>;

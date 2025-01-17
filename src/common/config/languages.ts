const languages = {
  'sq-AL': { name: 'Shqip', ISO_639_2: 'sqi' },
  'bg-BG': { name: 'Български', ISO_639_2: 'bul' },
  'ca-ES': { name: 'Català', ISO_639_2: 'cat' },
  'gl-ES': { name: 'Galego', ISO_639_2: 'glg' },
  'cs-CZ': { name: 'Čeština', ISO_639_2: 'ces' },
  'da-DK': { name: 'Dansk', ISO_639_2: 'dan' },
  'de-DE': { name: 'Deutsch', ISO_639_2: 'deu' },
  'el-GR': { name: 'Ελληνικά' },
  'es-ES': { name: 'Español' },
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
  'pt-PT': { name: 'Português' },
  'ro-RO': { name: 'Română' },
  'ru-RU': { name: 'Pусский', ISO_639_2: 'rus' },
  'sk-SK': { name: 'Slovensky', ISO_639_2: 'slk' },
  'sl-SI': { name: 'Slovenščina', ISO_639_2: 'slv' },
  'sr-RS': { name: 'Cрпски' },
  'sv-SE': { name: 'Svenska', ISO_639_2: 'swe' },
  'tr-TR': { name: 'Türkçe', ISO_639_2: 'tur' },
  en: { name: 'English', ISO_639_2: 'eng' },
};

const isDemo =
  typeof window !== 'undefined' && (window as any)?.Capacitor?.isNative;
if (isDemo) {
  Object.assign(languages, {
    // only demo
  });
}

export type Language = { name: string; ISO_639_2?: string };

export type LanguageCode = keyof typeof languages;

export default languages as Record<LanguageCode, Language>;

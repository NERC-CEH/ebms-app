import { isPlatform } from '@ionic/react';

const languages = {
  // disabled - under-translated (< 80%)
  'bg-BG': 'Български',
  'el-GR': 'Ελληνικά',
  'sr-RS': 'Cрпски',
  'cs-CZ': 'Čeština',
  'de-DE': 'Deutsch',
  en: 'English',
  'es-ES': 'Español',
  'hr-HR': 'Hrvatski',
  'it-IT': 'Italiano',
  'lt-LT': 'Lietuvių',
  'nl-NL': 'Nederlands',
  'pt-PT': 'Português',
  'ru-RU': 'Pусский',
  'sl-SI': 'Slovenščina',
  'fi-FI': 'Suomi',
  'sv-SE': 'Svenska',
  'tr-TR': 'Türkçe',
  'pl-PL': 'Polski',
  'ro-RO': 'Română',
  'ca-ES': 'Català',
  'da-DK': 'Dansk',
  'ja-JP': '日本語',
  'hu-HU': 'Magyar',
  'fr-FR': 'Français',
  'sk-SK': 'Slovensky',
  'mi-NZ': 'Māori',
};

const isDemo = !isPlatform('hybrid');
if (isDemo) {
  Object.assign(languages, {
    // only demo
  });
}

export default languages;

import { observe } from 'mobx';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import appModel from 'models/app';
import resources from './loader';

const DEFAULT_LANGUAGE = 'en';

declare global {
  // Browser-console helpers used while auditing missing translations.
  // Module augmentation requires an interface.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    dic?: string[];
    getNewTerms: () => void;
  }
}

const translationWindow = window;

translationWindow.getNewTerms = function getNewTermsWrap() {
  translationWindow.dic ||= [];
  const missing = Object.fromEntries(
    translationWindow.dic.sort().map(key => [key, ''])
  );
  console.log(JSON.stringify(missing, null, 2));
};

function saveMissingKey(key: string) {
  translationWindow.dic ||= [];

  if (translationWindow.dic.includes(key)) return;

  if (!key.trim()) return;

  if (Number.isFinite(Number.parseInt(key, 10))) return;

  if (key === '<0></0><1></1>') return;

  if (key === '<0></0>') return;

  console.warn(`🇬🇧: ${key}`);
  translationWindow.dic.push(key);
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    defaultNS: 'interface',
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    returnEmptyString: false,

    keySeparator: '.',
    nsSeparator: false, // no namespace use in keys

    interpolation: {
      escapeValue: false, // React already escapes values.
    },

    saveMissing: true,
    missingKeyHandler: (_, ns, key) => {
      if (ns === 'interface') {
        saveMissingKey(key);
      }
    },
  });

const newValueWrap = ({ newValue }: { newValue: string | null }) => {
  if (!newValue) {
    return;
  }

  const newLanguageCode = newValue.replace('_', '-'); // backwards compatible
  i18n.changeLanguage(newLanguageCode);
};
observe(appModel.data, 'language', newValueWrap);

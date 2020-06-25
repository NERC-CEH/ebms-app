import appModel from 'app_model';
import i18n from 'i18next';
import { observe } from 'mobx';
import { initReactI18next } from 'react-i18next';
import resources from './loader';

const DEFAULT_LANGUAGE = 'en';

window.getNewTerms = () => {
  window.dic = window.dic || [];
  let all = '';
  window.dic.forEach(word => {
    all += `\n# Context term \nmsgid "${word}"\nmsgstr "${word}"\n`;
  });
  console.log(all);
};

// console command to extract into .po file
// all='';dic.forEach(word => {all+=`\nmsgid "${word}"\nmsgstr "${word}"\n`})
function saveMissingKey(key) {
  window.dic = window.dic || [];

  if (window.dic.includes(key)) {
    return;
  }

  console.warn(`🇬🇧: ${key}`);
  window.dic.push(key);
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    defaultNS: 'interface',
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,

    keySeparator: false, // we do not use keys in form messages.welcome
    nsSeparator: false, // no namespace use in keys

    interpolation: {
      escapeValue: false, // react already safes from xss
    },

    saveMissing: true,
    missingKeyHandler: (_, ns, key) => {
      if (ns === 'interface') {
        saveMissingKey(key);
      }
    },
  });

observe(appModel.attrs, 'language', ({ newValue }) => {
  if (!newValue) {
    return;
  }

  const newLanguageCode = newValue.replace('_', '-'); // backwards compatible
  i18n.changeLanguage(newLanguageCode);
});

// backwards compatible: START
function translate(key, isSpeciesDescription, isSpeciesName) {
  if (isSpeciesName) {
    return i18n.t(key, {
      ns: 'names',
      lngs: [i18n.language], // don't revert to english if no local species name
      defaultValue: '', // don't return anything if no local species name
    });
  }

  if (isSpeciesDescription) {
    // revert to English descriptions
    let translation = i18n.t(key, { ns: 'species' });
    if (!translation) {
      translation = i18n.t(key, { ns: 'species', lng: 'en' });
    }
    return translation !== key ? translation : null;
  }

  return i18n.t(key);
}

window.t = translate;
// backwards compatible: END

export default translate;

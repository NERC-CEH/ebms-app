/* eslint-disable camelcase */
import appModel from 'app_model';
import i18n from 'i18next';
import { observe } from 'mobx';
import { initReactI18next } from 'react-i18next';

import en from './interface/en.pot';
import species_en from './species/en.pot';
import names_en from './names/en.pot';

import lt_LT from './interface/lt_LT.po';
import species_lt_LT from './species/lt_LT.po';
import names_lt_LT from './names/lt_LT.po';

import es_ES from './interface/es_ES.po';
import species_es_ES from './species/es_ES.po';
import names_es_ES from './names/es_ES.po';

import sv_SE from './interface/sv_SE.po';
import species_sv_SE from './species/sv_SE.po';
import names_sv_SE from './names/sv_SE.po';

import fi_FI from './interface/fi_FI.po';
import species_fi_FI from './species/fi_FI.po';
import names_fi_FI from './names/fi_FI.po';

import hr_HR from './interface/hr_HR.po';
import species_hr_HR from './species/hr_HR.po';
import names_hr_HR from './names/hr_HR.po';

import nl_NL from './interface/nl_NL.po';
import species_nl_NL from './species/nl_NL.po';
import names_nl_NL from './names/nl_NL.po';

import fr_FR from './interface/fr_FR.po';
import species_fr_FR from './species/fr_FR.po';
import names_fr_FR from './names/fr_FR.po';

import ru_RU from './interface/ru_RU.po';
import species_ru_RU from './species/ru_RU.po';
import names_ru_RU from './names/ru_RU.po';

import pt_PT from './interface/pt_PT.po';
import species_pt_PT from './species/pt_PT.po';
import names_pt_PT from './names/pt_PT.po';

import de_DE from './interface/de_DE.po';
import species_de_DE from './species/de_DE.po';
import names_de_DE from './names/de_DE.po';

import it_IT from './interface/it_IT.po';
import species_it_IT from './species/it_IT.po';
import names_it_IT from './names/it_IT.po';

import cs_CZ from './interface/cs_CZ.po';
import species_cs_CZ from './species/cs_CZ.po';
import names_cs_CZ from './names/cs_CZ.po';

// Adding some context, reference and other in po files:

// #: Some reference!!
// msgctxt "this is my context!!!!"
// msgid "Select your country"
// msgid_plural "plural!!!"
// msgstr[0] "Selecciona tu pais"
// msgstr[1] ""

const rawToKeyVal = lang =>
  Object.entries(lang).reduce((agg, pair) => {
    const [key, translation] = pair;
    if (!key) {
      return agg;
    }

    const [, val] = translation;
    if (!val) {
      return agg;
    }

    agg[key] = val;
    return agg;
  }, {});

const resources = {
  en: {
    interface: rawToKeyVal(en),
    species: rawToKeyVal(species_en),
    names: rawToKeyVal(names_en),
  },
  lt_LT: {
    interface: rawToKeyVal(lt_LT),
    species: rawToKeyVal(species_lt_LT),
    names: rawToKeyVal(names_lt_LT),
  },
  es_ES: {
    interface: rawToKeyVal(es_ES),
    species: rawToKeyVal(species_es_ES),
    names: rawToKeyVal(names_es_ES),
  },
  sv_SE: {
    interface: rawToKeyVal(sv_SE),
    species: rawToKeyVal(species_sv_SE),
    names: rawToKeyVal(names_sv_SE),
  },
  fi_FI: {
    interface: rawToKeyVal(fi_FI),
    species: rawToKeyVal(species_fi_FI),
    names: rawToKeyVal(names_fi_FI),
  },
  hr_HR: {
    interface: rawToKeyVal(hr_HR),
    species: rawToKeyVal(species_hr_HR),
    names: rawToKeyVal(names_hr_HR),
  },
  nl_NL: {
    interface: rawToKeyVal(nl_NL),
    species: rawToKeyVal(species_nl_NL),
    names: rawToKeyVal(names_nl_NL),
  },
  fr_FR: {
    interface: rawToKeyVal(fr_FR),
    species: rawToKeyVal(species_fr_FR),
    names: rawToKeyVal(names_fr_FR),
  },
  ru_RU: {
    interface: rawToKeyVal(ru_RU),
    species: rawToKeyVal(species_ru_RU),
    names: rawToKeyVal(names_ru_RU),
  },
  pt_PT: {
    interface: rawToKeyVal(pt_PT),
    species: rawToKeyVal(species_pt_PT),
    names: rawToKeyVal(names_pt_PT),
  },
  de_DE: {
    interface: rawToKeyVal(de_DE),
    species: rawToKeyVal(species_de_DE),
    names: rawToKeyVal(names_de_DE),
  },
  it_IT: {
    interface: rawToKeyVal(it_IT),
    species: rawToKeyVal(species_it_IT),
    names: rawToKeyVal(names_it_IT),
  },
  cs_CZ: {
    interface: rawToKeyVal(cs_CZ),
    species: rawToKeyVal(species_cs_CZ),
    names: rawToKeyVal(names_cs_CZ),
  },
};

const DEFAULT_LANGUAGE = 'en';

// console command to extract into .po file
// all='';dic.forEach(word => {all+=`\nmsgid "${word}"\nmsgstr "${word}"\n`})
function saveMissingKey(key) {
  window.dic = window.dic || [];

  if (window.dic.includes(key)) {
    return;
  }

  console.warn(`!new key: ${key}`);
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
  i18n.changeLanguage(newValue);
});

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

// backwards compatible
window.t = translate;

export default translate;

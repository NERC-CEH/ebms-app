/* eslint-disable camelcase */
import appModel from 'app_model';
import en from '../translations/interface/en.pot';
import lt_LT from '../translations/interface/lt_LT.po';
import es_ES from '../translations/interface/es_ES.po';
import sv_SE from '../translations/interface/sv_SE.po';
import fi_FI from '../translations/interface/fi_FI.po';
import fr_FR from '../translations/interface/fr_FR.po';
import ru_RU from '../translations/interface/ru_RU.po';

import species_en from '../translations/species/en.pot';
import species_lt_LT from '../translations/species/lt_LT.po';
import species_es_ES from '../translations/species/es_ES.po';
import species_sv_SE from '../translations/species/sv_SE.po';
import species_fi_FI from '../translations/species/fi_FI.po';
import species_fr_FR from '../translations/species/fr_FR.po';
import species_ru_RU from '../translations/species/ru_RU.po';

// Adding some context, reference and other in po files:

// #: Some reference!!
// msgctxt "this is my context!!!!"
// msgid "Select your country"
// msgid_plural "plural!!!"
// msgstr[0] "Selecciona tu pais"
// msgstr[1] ""

const dictionary = {
  en,
  lt_LT,
  es_ES,
  sv_SE,
  fi_FI,
  fr_FR,
  ru_RU,
};

const species = {
  en: species_en,
  lt_LT: species_lt_LT,
  es_ES: species_es_ES,
  sv_SE: species_sv_SE,
  fi_FI: species_fi_FI,
  fr_FR: species_fr_FR,
  ru_RU: species_ru_RU,
};

export const languages = {
  en: 'English',
  lt_LT: 'Lietuvių',
  es_ES: 'Español',
  sv_SE: 'Svenska',
  fi_FI: 'Suomi',
  fr_FR: 'Français',
  ru_RU: 'Pусский',
};

export const countries = {
  UK: 'United Kingdom',
  LT: 'Lithuania',
  ES: 'Spain',
  SE: 'Sweden',
  AD: 'Andorra',
  AL: 'Albania',
  AT: 'Austria',
  BA: 'Bosnia and Herzegovina',
  BE: 'Belgium',
  BG: 'Bulgaria',
  BY: 'Belarus',
  CH: 'Switzerland',
  CY: 'Cyprus',
  CZ: 'Czechia',
  DE: 'Germany',
  DK: 'Denmark',
  EE: 'Estonia',
  ES_CA: 'Spain: Canary Islands',
  FI: 'Finland',
  FR: 'France',
  GR: 'Greece',
  HR: 'Croatia',
  HU: 'Hungary',
  IE: 'Ireland',
  IS: 'Iceland',
  IT: 'Italy',
  LI: 'Liechtenstein',
  LU: 'Luxembourg',
  LV: 'Latvia',
  MD: 'Moldova',
  ME: 'Montenegro',
  MK: 'North Macedonia',
  MT: 'Malta',
  NL: 'Netherlands',
  NO: 'Norway',
  PL: 'Poland',
  PT: 'Portugal',
  PT_AZ: 'Portugal: Azores',
  PT_MA: 'Portugal: Madeira Islands',
  RO: 'Romania',
  RS: 'Serbia',
  RU: 'Russian Federation',
  SI: 'Slovenia',
  SK: 'Slovakia',
  TR: 'Turkey',
  UA: 'Ukraine',

  // special option
  ELSEWHERE: 'Elsewhere',
};

window.dic = window.dic || [];

function translate(key, isSpeciesDescription) {
  const language = appModel.get('language');

  if (isSpeciesDescription) {
    // revert to English descriptions
    const description = species[language][key] || species.en[key];
    return description !== key ? description : null;
  }

  const translation = dictionary[language][key];
  if (!translation) {
    if (!window.dic.includes(key)) {
      console.warn(`!new key: ${key}`);
      window.dic.push(key);
      // console command to extract into .po file
      // all='';dic.forEach(word => {all+=`\nmsgid "${word}"\nmsgstr "${word}"\n`})
    }
    return key;
  }

  return translation;
}

window.t = translate;

export default translate;

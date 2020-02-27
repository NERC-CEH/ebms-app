/* eslint-disable camelcase */
import appModel from 'app_model';
import en from '../translations/interface/en.pot';
import lt_LT from '../translations/interface/lt_LT.po';
import es_ES from '../translations/interface/es_ES.po';
import sv_SE from '../translations/interface/sv_SE.po';
import fi_FI from '../translations/interface/fi_FI.po';
import hr_HR from '../translations/interface/hr_HR.po';
import nl_NL from '../translations/interface/nl_NL.po';
import fr_FR from '../translations/interface/fr_FR.po';
import ru_RU from '../translations/interface/ru_RU.po';
import pt_PT from '../translations/interface/pt_PT.po';
import de_DE from '../translations/interface/de_DE.po';
import it_IT from '../translations/interface/it_IT.po';
import cs_CZ from '../translations/interface/cs_CZ.po';

import species_en from '../translations/species/en.pot';
import species_lt_LT from '../translations/species/lt_LT.po';
import species_es_ES from '../translations/species/es_ES.po';
import species_sv_SE from '../translations/species/sv_SE.po';
import species_fi_FI from '../translations/species/fi_FI.po';
import species_hr_HR from '../translations/species/hr_HR.po';
import species_nl_NL from '../translations/species/nl_NL.po';
import species_fr_FR from '../translations/species/fr_FR.po';
import species_ru_RU from '../translations/species/ru_RU.po';
import species_pt_PT from '../translations/species/pt_PT.po';
import species_de_DE from '../translations/species/de_DE.po';
import species_it_IT from '../translations/species/it_IT.po';
import species_cs_CZ from '../translations/species/cs_CZ.po';

import names_en from '../translations/names/en.pot';
import names_lt_LT from '../translations/names/lt_LT.po';
import names_es_ES from '../translations/names/es_ES.po';
import names_sv_SE from '../translations/names/sv_SE.po';
import names_fi_FI from '../translations/names/fi_FI.po';
import names_hr_HR from '../translations/names/hr_HR.po';
import names_nl_NL from '../translations/names/nl_NL.po';
import names_fr_FR from '../translations/names/fr_FR.po';
import names_ru_RU from '../translations/names/ru_RU.po';
import names_pt_PT from '../translations/names/pt_PT.po';
import names_de_DE from '../translations/names/de_DE.po';
import names_it_IT from '../translations/names/it_IT.po';
import names_cs_CZ from '../translations/names/cs_CZ.po';

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
  hr_HR,
  nl_NL,
  fr_FR,
  ru_RU,
  pt_PT,
  de_DE,
  it_IT,
  cs_CZ,
};

const species = {
  en: species_en,
  lt_LT: species_lt_LT,
  es_ES: species_es_ES,
  sv_SE: species_sv_SE,
  fi_FI: species_fi_FI,
  hr_HR: species_hr_HR,
  nl_NL: species_nl_NL,
  fr_FR: species_fr_FR,
  ru_RU: species_ru_RU,
  pt_PT: species_pt_PT,
  de_DE: species_de_DE,
  it_IT: species_it_IT,
  cs_CZ: species_cs_CZ,
};

const names = {
  en: names_en,
  lt_LT: names_lt_LT,
  es_ES: names_es_ES,
  sv_SE: names_sv_SE,
  fi_FI: names_fi_FI,
  hr_HR: names_hr_HR,
  nl_NL: names_nl_NL,
  fr_FR: names_fr_FR,
  ru_RU: names_ru_RU,
  pt_PT: names_pt_PT,
  de_DE: names_de_DE,
  it_IT: names_it_IT,
  cs_CZ: names_cs_CZ,
};

export const languages = {
  en: 'English',
  lt_LT: 'Lietuvių',
  es_ES: 'Español',
  sv_SE: 'Svenska',
  hr_HR: 'Hrvatski',
  nl_NL: 'Nederlands',
  fi_FI: 'Suomi',
  fr_FR: 'Français',
  ru_RU: 'Pусский',
  pt_PT: 'Português',
  de_DE: 'Deutsch',
  it_IT: 'Italiano',
  cs_CZ: 'Čeština',
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

function translate(key, isSpeciesDescription, isSpeciesName) {
  const language = appModel.get('language');

  if (isSpeciesName) {
    // revert to English names
    const description = names[language][key];
    return description !== key ? description : null;
  }

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

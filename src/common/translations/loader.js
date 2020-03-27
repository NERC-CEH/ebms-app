/* eslint-disable camelcase */
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

    const [, val, ...pluralVals] = translation;
    if (!val) {
      return agg;
    }

    if (pluralVals.length) {
      pluralVals.forEach((plural, index) => {
        agg[`${key}_${index + 1}`] = plural; // eslint-disable-line no-param-reassign
      });
    }

    agg[key] = val; // eslint-disable-line no-param-reassign
    return agg;
  }, {});

export default {
  en: {
    interface: rawToKeyVal(en),
    species: rawToKeyVal(species_en),
    names: rawToKeyVal(names_en),
  },
  'lt-LT': {
    interface: rawToKeyVal(lt_LT),
    species: rawToKeyVal(species_lt_LT),
    names: rawToKeyVal(names_lt_LT),
  },
  'es-ES': {
    interface: rawToKeyVal(es_ES),
    species: rawToKeyVal(species_es_ES),
    names: rawToKeyVal(names_es_ES),
  },
  'sv-SE': {
    interface: rawToKeyVal(sv_SE),
    species: rawToKeyVal(species_sv_SE),
    names: rawToKeyVal(names_sv_SE),
  },
  'fi-FI': {
    interface: rawToKeyVal(fi_FI),
    species: rawToKeyVal(species_fi_FI),
    names: rawToKeyVal(names_fi_FI),
  },
  'hr-HR': {
    interface: rawToKeyVal(hr_HR),
    species: rawToKeyVal(species_hr_HR),
    names: rawToKeyVal(names_hr_HR),
  },
  'nl-NL': {
    interface: rawToKeyVal(nl_NL),
    species: rawToKeyVal(species_nl_NL),
    names: rawToKeyVal(names_nl_NL),
  },
  'fr-FR': {
    interface: rawToKeyVal(fr_FR),
    species: rawToKeyVal(species_fr_FR),
    names: rawToKeyVal(names_fr_FR),
  },
  'ru-RU': {
    interface: rawToKeyVal(ru_RU),
    species: rawToKeyVal(species_ru_RU),
    names: rawToKeyVal(names_ru_RU),
  },
  'pt-PT': {
    interface: rawToKeyVal(pt_PT),
    species: rawToKeyVal(species_pt_PT),
    names: rawToKeyVal(names_pt_PT),
  },
  'de-DE': {
    interface: rawToKeyVal(de_DE),
    species: rawToKeyVal(species_de_DE),
    names: rawToKeyVal(names_de_DE),
  },
  'it-IT': {
    interface: rawToKeyVal(it_IT),
    species: rawToKeyVal(species_it_IT),
    names: rawToKeyVal(names_it_IT),
  },
  'cs-CZ': {
    interface: rawToKeyVal(cs_CZ),
    species: rawToKeyVal(species_cs_CZ),
    names: rawToKeyVal(names_cs_CZ),
  },
};

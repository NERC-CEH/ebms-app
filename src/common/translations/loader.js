/* eslint-disable camelcase */
import names from 'common/data/names.data';
import en from './interface/en.pot';
import species_en from './species/en.pot';

import lt_LT from './interface/lt_LT.po';
import species_lt_LT from './species/lt_LT.po';

import es_ES from './interface/es_ES.po';
import species_es_ES from './species/es_ES.po';

import sv_SE from './interface/sv_SE.po';
import species_sv_SE from './species/sv_SE.po';

import fi_FI from './interface/fi_FI.po';
import species_fi_FI from './species/fi_FI.po';

import hr_HR from './interface/hr_HR.po';
import species_hr_HR from './species/hr_HR.po';

import nl_NL from './interface/nl_NL.po';
import species_nl_NL from './species/nl_NL.po';

import fr_FR from './interface/fr_FR.po';
import species_fr_FR from './species/fr_FR.po';

import ru_RU from './interface/ru_RU.po';
import species_ru_RU from './species/ru_RU.po';

import pt_PT from './interface/pt_PT.po';
import species_pt_PT from './species/pt_PT.po';

import de_DE from './interface/de_DE.po';
import species_de_DE from './species/de_DE.po';

import it_IT from './interface/it_IT.po';
import species_it_IT from './species/it_IT.po';

import cs_CZ from './interface/cs_CZ.po';
import species_cs_CZ from './species/cs_CZ.po';

const flatNames = { ...names };
Object.keys(flatNames).forEach(lang => {
  flatNames[lang] = flatNames[lang].reduce((agg, term) => {
    const { scientific_name, common_name } = term;
    agg[scientific_name] = common_name; // eslint-disable-line
    
    return agg;
  }, {});
});

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
    names: flatNames.en,
  },
  'lt-LT': {
    interface: rawToKeyVal(lt_LT),
    species: rawToKeyVal(species_lt_LT),
    names: flatNames['lt-LT'],
  },
  'es-ES': {
    interface: rawToKeyVal(es_ES),
    species: rawToKeyVal(species_es_ES),
    names: flatNames['es-ES'],
  },
  'sv-SE': {
    interface: rawToKeyVal(sv_SE),
    species: rawToKeyVal(species_sv_SE),
    names: flatNames['sv-SE'],
  },
  'fi-FI': {
    interface: rawToKeyVal(fi_FI),
    species: rawToKeyVal(species_fi_FI),
    names: flatNames['fi-FI'],
  },
  'hr-HR': {
    interface: rawToKeyVal(hr_HR),
    species: rawToKeyVal(species_hr_HR),
    names: flatNames['hr-HR'],
  },
  'nl-NL': {
    interface: rawToKeyVal(nl_NL),
    species: rawToKeyVal(species_nl_NL),
    names: flatNames['nl-NL'],
  },
  'fr-FR': {
    interface: rawToKeyVal(fr_FR),
    species: rawToKeyVal(species_fr_FR),
    names: flatNames['fr-FR'],
  },
  'ru-RU': {
    interface: rawToKeyVal(ru_RU),
    species: rawToKeyVal(species_ru_RU),
    names: flatNames['ru-RU'],
  },
  'pt-PT': {
    interface: rawToKeyVal(pt_PT),
    species: rawToKeyVal(species_pt_PT),
    names: flatNames['pt-PT'],
  },
  'de-DE': {
    interface: rawToKeyVal(de_DE),
    species: rawToKeyVal(species_de_DE),
    names: flatNames['de-DE'],
  },
  'it-IT': {
    interface: rawToKeyVal(it_IT),
    species: rawToKeyVal(species_it_IT),
    names: flatNames['it-IT'],
  },
  'cs-CZ': {
    interface: rawToKeyVal(cs_CZ),
    species: rawToKeyVal(species_cs_CZ),
    names: flatNames['cs-CZ'],
  },
};

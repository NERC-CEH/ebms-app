/* eslint-disable camelcase */
/* eslint-disable @getify/proper-arrows/name */
import names from 'common/data/commonNames/index.json';
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

import bg_BG from './interface/bg_BG.po';
import species_bg_BG from './species/bg_BG.po';

import sr_RS from './interface/sr.po';
import species_sr_RS from './species/sr.po';

import sl_SI from './interface/sl_SI.po';
import species_sl_SI from './species/sl_SI.po';

import tr_TR from './interface/tr_TR.po';
import species_tr_TR from './species/tr_TR.po';

import pl_PL from './interface/pl_PL.po';
import species_pl_PL from './species/pl_PL.po';

import ro_RO from './interface/ro_RO.po';
import species_ro_RO from './species/ro_RO.po';

import ca_ES from './interface/ca_ES.po';
import species_ca_ES from './species/ca_ES.po';

import da_DK from './interface/da_DK.po';
import species_da_DK from './species/da_DK.po';

import ja_JP from './interface/ja_JP.po';
import species_ja_JP from './species/ja_JP.po';

import hu_HU from './interface/hu_HU.po';
import species_hu_HU from './species/hu_HU.po';

import sk_SK from './interface/sk_SK.po';
import species_sk_SK from './species/sk_SK.po';

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
  'bg-BG': {
    interface: rawToKeyVal(bg_BG),
    species: rawToKeyVal(species_bg_BG),
    names: flatNames['bg-BG'],
  },
  'sr-RS': {
    interface: rawToKeyVal(sr_RS),
    species: rawToKeyVal(species_sr_RS),
    names: flatNames['sr-RS'],
  },
  'sl-SI': {
    interface: rawToKeyVal(sl_SI),
    species: rawToKeyVal(species_sl_SI),
    names: flatNames['sl-SI'],
  },
  'tr-TR': {
    interface: rawToKeyVal(tr_TR),
    species: rawToKeyVal(species_tr_TR),
    names: flatNames['tr-TR'],
  },
  'pl-PL': {
    interface: rawToKeyVal(pl_PL),
    species: rawToKeyVal(species_pl_PL),
    names: flatNames['pl-PL'],
  },
  'ro-RO': {
    interface: rawToKeyVal(ro_RO),
    species: rawToKeyVal(species_ro_RO),
    names: flatNames['ro-RO'],
  },
  'ca-ES': {
    interface: rawToKeyVal(ca_ES),
    species: rawToKeyVal(species_ca_ES),
    names: flatNames['ca-ES'],
  },
  'da-DK': {
    interface: rawToKeyVal(da_DK),
    species: rawToKeyVal(species_da_DK),
    names: flatNames['da-DK'],
  },
  'ja-JP': {
    interface: rawToKeyVal(ja_JP),
    species: rawToKeyVal(species_ja_JP),
    names: flatNames['ja-JP'],
  },
  'hu-HU': {
    interface: rawToKeyVal(hu_HU),
    species: rawToKeyVal(species_hu_HU),
    names: flatNames['hu-HU'],
  },
  'sk-SK': {
    interface: rawToKeyVal(sk_SK),
    species: rawToKeyVal(species_sk_SK),
    names: flatNames['sk-SK'],
  },
};

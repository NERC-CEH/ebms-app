require('dotenv').config({ silent: true, path: '../../../../.env' }); // eslint-disable-line

const axios = require('axios'); // eslint-disable-line
const fs = require('fs');
const btoa = require('btoa'); // eslint-disable-line
const groups = require('../species/groups.json');
const { getAttrs } = require('../helpers');

const LANGUAGE_ISO_MAPPING = {
  nld: 'nl-NL',
  hrv: 'hr-HR',
  deu: 'de-DE',
  lit: 'lt-LT',
  eng: 'en',
  hun: 'hu-HU',
  swe: 'sv-SE',
  fin: 'fi-FI',
  ces: 'cs-CZ',
  rus: 'ru-RU',
  bul: 'bg-BG',
  slv: 'sl-SL',
  pol: 'pl-PL',
  cat: 'ca-ES',
  dan: 'da-DK',
};

const UNKNOWN_SPECIES = {
  taxa_taxon_list_id: '538737',
  preferred_taxa_taxon_list_id: '538737',
  taxon_meaning_id: '243426',
  taxon_id: '488903',
  external_key: null,
  taxon: 'Unknown',
  preferred_taxon: 'Unknown',
  attributes: null,
  language_iso: 'eng',
  taxon_group: 260,
};

const COUNTRIES_WITH_MOTH_COMMON_NAMES = {
  swe: 'sv-SE',
  eng: 'en',
  nld: 'nl-NL',
};

const { APP_INDICIA_API_KEY, REPORT_USER_EMAIL, REPORT_USER_PASS } =
  process.env;

if (!APP_INDICIA_API_KEY && !REPORT_USER_EMAIL && REPORT_USER_PASS) {
  throw new Error(
    'APP_INDICIA_API_KEY and REPORT_USER_EMAIL and REPORT_USER_PASS is missing from env.'
  );
}

async function fetch(listID) {
  const userAuth = btoa(`${REPORT_USER_EMAIL}:${REPORT_USER_PASS}`);

  const { data } = await axios({
    method: 'GET',
    url: `https://butterfly-monitoring.net/api/v1/reports/projects/ebms/ebms_app_species_list.xml?taxon_list_id=${listID}`,
    headers: {
      'x-api-key': APP_INDICIA_API_KEY,
      Authorization: `Basic ${userAuth}`,
    },
  });

  const attachGroupID = s => ({ ...s, taxon_group: listID });
  return data.data.map(attachGroupID);
}

function turnNamesArrayIntoLangObject(array) {
  const capitalizeFirstLetter = word =>
    word.charAt(0).toUpperCase() + word.slice(1);
  const capitalize = str =>
    str.toLowerCase().split(' ').map(capitalizeFirstLetter).join(' ');

  const taxonWithLanguageMapping = (agg, term) => {
    const {
      language_iso: languageCode,
      taxa_taxon_list_id: id,
      taxon: name,
      preferred_taxon: taxon,
      taxon_group: group,
      preferred_taxa_taxon_list_id: preferredId,
    } = term;

    if (languageCode === 'lat') {
      // no need for latin - see data/species/index.json file
      return agg;
    }

    const language = LANGUAGE_ISO_MAPPING[languageCode];
    if (!language)
      throw new Error(`${language} is missing from LANGUAGE_ISO_MAPPING`);

    agg[language] || (agg[language] = []); // eslint-disable-line

    const species = {
      warehouse_id: parseInt(id, 10),
      common_name: capitalize(name),
      scientific_name: taxon,
      taxon_group: group,
      preferredId: parseInt(preferredId, 10),
    };

    const attributes = getAttrs(term.attributes);
    Object.assign(species, attributes);

    agg[language].push(species);
    return agg;
  };
  return array.reduce(taxonWithLanguageMapping, {});
}

function saveFile(data) {
  const names = JSON.stringify(data, null, 2);
  fs.writeFileSync('./index.json', names, 'utf8');
}

function sortAlphabetically(species) {
  const alphabetically = (sp1, sp2) => {
    if (sp1.taxon === sp2.taxon)
      return sp1.preferred_taxon.localeCompare(sp2.preferred_taxon);
    return sp1.taxon.localeCompare(sp2.taxon);
  };
  return species.sort(alphabetically);
}

const make = async () => {
  const butterflies = await fetch(groups.butterflies.id);
  const mothsOnly = ({ taxon_group: group }) => group === groups.moths.id;
  const specificCountryOnly = ({ language_iso: lang }) =>
    COUNTRIES_WITH_MOTH_COMMON_NAMES[lang];
  const moths = (await fetch(groups.moths.id))
    .filter(mothsOnly)
    .filter(specificCountryOnly);

  const hasUnknownSpeciesMatch = moth =>
    JSON.stringify(moth) === JSON.stringify(UNKNOWN_SPECIES);
  const UNKNOWN_MOTH_SPECIES = moths.find(hasUnknownSpeciesMatch);

  if (!UNKNOWN_MOTH_SPECIES) {
    console.error('FAILED!  ⛔️ UNKNOW_SPECIES dont match');
    return;
  }

  const species = [...butterflies, ...moths];
  const sortedSpecies = sortAlphabetically(species);

  const structuredNames = turnNamesArrayIntoLangObject(sortedSpecies);

  saveFile(structuredNames);

  console.log('Success! 🚀');
};
make();

require('dotenv').config({ silent: true, path: '../../../../.env' }); // eslint-disable-line

const axios = require('axios'); // eslint-disable-line
const fs = require('fs');
const groups = require('../species/groups');

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
};

const { APP_INDICIA_API_KEY, APP_INDICIA_API_USER_AUTH } = process.env;

if (!APP_INDICIA_API_KEY || !APP_INDICIA_API_USER_AUTH) {
  throw new Error(
    'APP_INDICIA_API_KEY or APP_INDICIA_API_USER_AUTH is missing from env.'
  );
}

async function fetch(listID) {
  const { data } = await axios({
    method: 'GET',
    url: `https://butterfly-monitoring.net/api/v1/reports/projects/ebms/taxa_list_for_app.xml?taxon_list_id=${listID}`,
    headers: {
      'x-api-key': APP_INDICIA_API_KEY,
      Authorization: `Basic ${APP_INDICIA_API_USER_AUTH}`,
    },
  });

  const attachGroupID = s => ({ ...s, taxon_group: listID });
  return data.data.map(attachGroupID);
}

function turnNamesArrayIntoLangObject(array) {
  const capitalize = str =>
    str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return array.reduce((agg, term) => {
    const {
      language_iso: languageCode,
      id,
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
    agg[language] || (agg[language] = []); // eslint-disable-line

    const species = {
      warehouse_id: parseInt(id, 10),
      common_name: capitalize(name),
      scientific_name: taxon,
      taxon_group: group,
      preferredId: parseInt(preferredId, 10),
    };

    agg[language].push(species);
    return agg;
  }, {});
}

function saveFile(data) {
  const names = JSON.stringify(data, null, 2);
  fs.writeFileSync('./index.json', names, 'utf8');
}

function sortAlphabetically(species) {
  return species.sort((sp1, sp2) => sp1.taxon.localeCompare(sp2.taxon));
}

(async () => {
  const butterflies = await fetch(groups.butterflies.id);
  const mothsOnly = ({ taxon_group: group }) => group === groups.moths.id;
  const swedishOnly = ({ language_iso: lang }) => lang === 'swe';
  const moths = (await fetch(groups.moths.id))
    .filter(mothsOnly)
    .filter(swedishOnly);

  const species = [...butterflies, ...moths];
  const sortedSpecies = sortAlphabetically(species);

  const structuredNames = turnNamesArrayIntoLangObject(sortedSpecies);

  saveFile(structuredNames);

  console.log('Success! 🚀');
})();

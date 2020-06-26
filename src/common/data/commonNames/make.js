require('dotenv').config({ silent: true, path: '../../../../.env' }); // eslint-disable-line

const request = require('request'); // eslint-disable-line
const fs = require('fs');

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

function fetch(listID) {
  return new Promise(resolve => {
    const options = {
      method: 'GET',
      url: `https://butterfly-monitoring.net/api/v1/reports/projects/ebms/taxa_list_for_app.xml?taxon_list_id=${listID}`,
      headers: {
        'x-api-key': APP_INDICIA_API_KEY,
        Authorization: `Basic ${APP_INDICIA_API_USER_AUTH}`,
      },
    };

    request(options, (error, response) => {
      if (error) throw new Error(error);

      const namesArray = JSON.parse(response.body).data;
      resolve(namesArray);
    });
  });
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

// function sortAlphabetically(species) {
//   return species.sort((sp1, sp2) => sp1.taxon.localeCompare(sp2.taxon));
// }

(async () => {
  const butterflies = await fetch(251);
  // const mothsOnly = ({ taxon_group: group }) => group === 'insect - moth';
  // const moths = (await fetch(260)).filter(mothsOnly);

  // const species = [...butterflies, ...moths];
  // const sortedSpecies = sortAlphabetically(species);

  const structuredNames = turnNamesArrayIntoLangObject(butterflies);

  saveFile(structuredNames);

  console.log('Success! 🚀');
})();

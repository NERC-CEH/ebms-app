require('dotenv').config({ silent: true, path: '../../../.env' }); // eslint-disable-line

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

const options = {
  method: 'GET',
  url:
    'https://butterfly-monitoring.net/api/v1/reports/projects/ebms/taxa_list_for_app.xml?taxon_list_id=251',
  headers: {
    'x-api-key': APP_INDICIA_API_KEY,
    Authorization: `Basic ${APP_INDICIA_API_USER_AUTH}`,
  },
};

const capitalize = str =>
  str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const turnNamesArrayIntoLangObject = array =>
  array.reduce((agg, term) => {
    const {
      language_iso: languageCode,
      id,
      taxon: name,
      preferred_taxon: taxon,
    } = term;
    
    if (languageCode === 'lat') {
      // no need for latin - see species.data.json file
      return agg;
    }

    const language = LANGUAGE_ISO_MAPPING[languageCode];
    agg[language] || (agg[language] = []); // eslint-disable-line

    const species = {
      warehouse_id: id,
      common_name: capitalize(name),
      scientific_name: taxon,
    };

    agg[language].push(species);
    return agg;
  }, {});

request(options, (error, response) => {
  if (error) throw new Error(error);

  const namesArray = JSON.parse(response.body).data;
  const structuredNames = turnNamesArrayIntoLangObject(namesArray);

  const names = JSON.stringify(structuredNames, null, 2);
  fs.writeFileSync('./names.data.json', names, 'utf8');

  console.log('Success!');
});

// get local environment variables from .env
require('dotenv').config({ silent: true, path: '../../../../.env' }); // eslint-disable-line
const fs = require('fs');
const request = require('request'); // eslint-disable-line
const csv = require('csvtojson'); // eslint-disable-line

const { APP_INDICIA_API_KEY, APP_INDICIA_API_USER_AUTH } = process.env;

if (!APP_INDICIA_API_KEY || !APP_INDICIA_API_USER_AUTH) {
  throw new Error(
    'APP_INDICIA_API_KEY or APP_INDICIA_API_USER_AUTH is missing from env.'
  );
}

async function fetch() {
  return csv({ checkType: true }).fromFile('./cache/species.profiles.csv');
}

async function fetchAbundance(listID) {
  return new Promise(resolve => {
    const options = {
      method: 'GET',
      url: `https://butterfly-monitoring.net/api/v1/reports/projects/ebms/ebms_app_species_list.xml?taxon_list_id=${listID}`,
      headers: {
        'x-api-key': APP_INDICIA_API_KEY,
        Authorization: `Basic ${APP_INDICIA_API_USER_AUTH}`,
      },
    };

    request(options, (error, response) => {
      if (error) throw new Error(error);

      const { data } = JSON.parse(response.body);

      const latinData = data.filter(
        s => s.language_iso === 'lat' && !s.taxon.includes('Unterfamilie')
      );

      resolve(latinData);
    });
  });
}

function save(species) {
  return new Promise((resolve, reject) => {
    fs.writeFile('./index.json', JSON.stringify(species), err => {
      if (err) {
        reject(err);
        return;
      }

      resolve(species);
    });
  });
}

async function transformAbundance(species) {
  const abundance = await fetchAbundance(251);

  function getCountryMap(string) {
    const map = {};
    if (string === null) return map;

    string.split(' | ').forEach(country => {
      const [key, val] = country.split('=');
      const normKey = key.replace(': ', '_');
      const normVal = val.replace('?', '');
      map[normKey] = normVal;
    });
    return map;
  }

  return species.map(sp => {
    const { attributes: countriesStr } = abundance.find(
      s => s.external_key === sp.external_key && s.attributes !== null
    );

    return {
      ...sp,
      abundance: {
        ...getCountryMap(countriesStr),
      },
    };
  });
}

fetch()
  .then(transformAbundance)
  .then(save)
  .then(() => console.log('All done! 🚀'));

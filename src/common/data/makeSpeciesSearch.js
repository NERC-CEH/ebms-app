// get local environment variables from .env
require('dotenv').config({ silent: true, path: '../../../.env' }); // eslint-disable-line
const request = require('request'); // eslint-disable-line

const { APP_INDICIA_API_KEY, APP_INDICIA_API_USER_AUTH } = process.env;

const fs = require('fs');
const optimise = require('./speciesOptimise');

async function fetch() {
  return new Promise(resolve => {
    const options = {
      method: 'GET',
      url:
        'https://butterfly-monitoring.net/api/v1/reports/projects/ebms/taxa_list_for_app.xml?taxon_list_id=260',
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

function saveSpeciesToFile(species) {
  return new Promise((resolve, reject) => {
    fs.writeFile('./species.data.json', JSON.stringify(species), err => {
      if (err) {
        reject(err);
        return;
      }

      resolve(species);
    });
  });
}

// ideally the warehouse report should return only the latin names
function sortAlphabetically(species) {
  return species.sort((sp1, sp2) => sp1.taxon.localeCompare(sp2.taxon));
}

fetch()
  .then(sortAlphabetically)
  .then(optimise)
  .then(saveSpeciesToFile)
  .then(() => console.log('All done!'));

// get local environment variables from .env
require('dotenv').config({ silent: true, path: '../../../../.env' }); // eslint-disable-line
const request = require('request'); // eslint-disable-line

const { APP_INDICIA_API_KEY, APP_INDICIA_API_USER_AUTH } = process.env;

const fs = require('fs');
const optimise = require('./speciesOptimise');

async function fetch(listID) {
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
    fs.writeFile('./index.json', JSON.stringify(species, null, 2), err => {
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

(async () => {
  const butterflies = await fetch(251);
  const mothsOnly = ({ taxon_group: group }) => group === 'insect - moth';
  const moths = (await fetch(260)).filter(mothsOnly);
  const bumblebees = await fetch(261);
  const dragonflies = await fetch(265);

  const species = [...butterflies, ...moths, ...bumblebees, ...dragonflies];

  const sortedSpecies = await sortAlphabetically(species);
  const searchOptimisedList = await optimise(sortedSpecies);
  await saveSpeciesToFile(searchOptimisedList);

  console.log('All done! 🚀');
})();

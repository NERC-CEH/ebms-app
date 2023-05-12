// get local environment variables from .env
require('dotenv').config({ silent: true, path: '../../../../.env' }); // eslint-disable-line
const axios = require('axios'); // eslint-disable-line
const fs = require('fs');
const btoa = require('btoa'); // eslint-disable-line
const optimise = require('./makeOptimise');
const groups = require('./groups');

const { APP_INDICIA_API_KEY, REPORT_USER_EMAIL, REPORT_USER_PASS } =
  process.env;

if (!APP_INDICIA_API_KEY && !REPORT_USER_EMAIL && REPORT_USER_PASS) {
  throw new Error(
    'APP_INDICIA_API_KEY and REPORT_USER_EMAIL and REPORT_USER_PASS is missing from env.'
  );
}

// filtering out butterflies needed as the moths report currently also returns
// butterflies - TODO: remove once the report is fixed
const currentTaxons = [];
const uniqueOnly = ({ taxon }) => !currentTaxons.includes(taxon);

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

  const onlyLatin = s =>
    s.language_iso === 'lat' && !s.taxon.includes('Unterfamilie');
  const attachGroupID = s => ({ ...s, taxon_group: listID });
  return data.data.filter(onlyLatin).map(attachGroupID);
}

function saveSpeciesToFile(species) {
  const saveSpeciesToFileWrap = (resolve, reject) => {
    const options = err => {
      if (err) {
        reject(err);
        return;
      }

      resolve(species);
    };
    fs.writeFile('./index.json', JSON.stringify(species, null, 2), options);
  };
  return new Promise(saveSpeciesToFileWrap);
}

// ideally the warehouse report should return only the latin names
function sortAlphabetically(species) {
  const alphabetically = (sp1, sp2) => sp1.taxon.localeCompare(sp2.taxon);
  return species.sort(alphabetically);
}

// eslint-disable-next-line @getify/proper-arrows/name
(async () => {
  const butterflies = await fetch(groups.butterflies.id);
  currentTaxons.push(...butterflies.map(sp => sp.taxon));

  const moths = (await fetch(groups.moths.id)).filter(uniqueOnly);
  const bumblebees = (await fetch(groups.bumblebees.id)).filter(uniqueOnly);
  const dragonflies = (await fetch(groups.dragonflies.id)).filter(uniqueOnly);
  const species = [...butterflies, ...moths, ...bumblebees, ...dragonflies];

  const sortedSpecies = await sortAlphabetically(species);
  const searchOptimisedList = await optimise(sortedSpecies);
  await saveSpeciesToFile(searchOptimisedList);

  console.log('All done! 🚀');
})();

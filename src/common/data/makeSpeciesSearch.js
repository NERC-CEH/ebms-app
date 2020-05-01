// get local environment variables from .env
require('dotenv').config({ silent: true, path: '../../../.env' }); // eslint-disable-line
const fs = require('fs');
const optimise = require('./speciesOptimise');
const csv = require('csvtojson'); // eslint-disable-line

async function fetch() {
  return csv().fromFile('./species.csv');
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

// ideally the warehouse report should sort
function filterOutCommonNames(species) {
  return species.filter((sp, index) => {
    const isGenus = sp.string_agg === 'NULL';
    return !(index > 145 && isGenus);
  });
}

fetch()
  .then(filterOutCommonNames)
  .then(sortAlphabetically)
  .then(species => optimise(species))
  .then(saveSpeciesToFile)
  .then(() => console.log('All done!'));

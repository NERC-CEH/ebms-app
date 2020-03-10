// get local environment variables from .env
require('dotenv').config({ silent: true, path: '../../../.env' }); // eslint-disable-line
const fs = require('fs');
const csv = require('csvtojson'); // eslint-disable-line

async function fetch() {
  return csv({ checkType: true }).fromFile('./species.profiles.csv');
}
async function fetchAbundance() {
  return csv().fromFile('./species.csv');
}

function save(species) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      './species.profiles.data.json',
      JSON.stringify(species),
      err => {
        if (err) {
          reject(err);
          return;
        }

        resolve(species);
      }
    );
  });
}

async function transformAbundance(species) {
  const abundance = await fetchAbundance();

  function getCountryMap(string) {
    const map = {};
    if (string === 'NULL') return map;

    string.split(' | ').forEach(country => {
      const [key, val] = country.split('=');
      const normKey = key.replace(': ', '_');
      const normVal = val.replace('?', '');
      map[normKey] = normVal;
    });
    return map;
  }

  return species.map(sp => {
    const { string_agg: countriesStr } = abundance.find(
      s => s.external_key === sp.external_key
    );

    return {
      ...sp,
      ...getCountryMap(countriesStr),
    };
  });
}

fetch()
  .then(transformAbundance)
  .then(save)
  .then(() => console.log('All done!'));

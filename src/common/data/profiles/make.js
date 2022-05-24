// get local environment variables from .env
require('dotenv').config({ silent: true, path: '../../../../.env' }); // eslint-disable-line
const fs = require('fs');
const request = require('request'); // eslint-disable-line
const csv = require('csvtojson'); // eslint-disable-line
const btoa = require('btoa'); // eslint-disable-line

const { APP_INDICIA_API_KEY, REPORT_USER_EMAIL, REPORT_USER_PASS } =
  process.env;

if (!APP_INDICIA_API_KEY && !REPORT_USER_EMAIL && REPORT_USER_PASS) {
  throw new Error(
    'APP_INDICIA_API_KEY and REPORT_USER_EMAIL and REPORT_USER_PASS is missing from env.'
  );
}

async function fetch() {
  return csv({ checkType: true }).fromFile('./cache/species.profiles.csv');
}

async function fetchAbundance(listID) {
  const userAuth = btoa(`${REPORT_USER_EMAIL}:${REPORT_USER_PASS}`);
  const fetchAbundanceWrap = resolve => {
    const options = {
      method: 'GET',
      url: `https://butterfly-monitoring.net/api/v1/reports/projects/ebms/ebms_app_species_list.xml?taxon_list_id=${listID}`,
      headers: {
        'x-api-key': APP_INDICIA_API_KEY,
        Authorization: `Basic ${userAuth}`,
      },
    };

    const callback = (error, response) => {
      if (error) throw new Error(error);

      const { data } = JSON.parse(response.body);

      const byLatinLanguageWithoutSpecificTaxon = s =>
        s.language_iso === 'lat' && !s.taxon.includes('Unterfamilie');
      const latinData = data.filter(byLatinLanguageWithoutSpecificTaxon);

      resolve(latinData);
    };
    request(options, callback);
  };
  return new Promise(fetchAbundanceWrap);
}

function save(species) {
  const saveWrap = (resolve, reject) => {
    const dataOption = err => {
      if (err) {
        reject(err);
        return;
      }

      resolve(species);
    };
    fs.writeFile('./index.json', JSON.stringify(species), dataOption);
  };
  return new Promise(saveWrap);
}

async function transformAbundance(species) {
  const abundance = await fetchAbundance(251);

  function getCountryMap(string) {
    const map = {};
    if (string === null) return map;

    const transformCountryFormat = country => {
      const [key, val] = country.split('=');
      const normKey = key.replace(': ', '_');
      const normVal = val.replace('?', '');
      map[normKey] = normVal;
    };
    string.split(' | ').forEach(transformCountryFormat);
    return map;
  }

  const getSpeciesEntry = sp => {
    const byExternalKeyWithAttributes = s =>
      s.external_key === sp.external_key && s.attributes !== null;
    const { attributes: countriesStr } = abundance.find(
      byExternalKeyWithAttributes
    );

    return {
      ...sp,
      abundance: {
        ...getCountryMap(countriesStr),
      },
    };
  };
  return species.map(getSpeciesEntry);
}

fetch()
  .then(transformAbundance)
  .then(save)
  // eslint-disable-next-line @getify/proper-arrows/name
  .then(() => console.log('All done! 🚀'));

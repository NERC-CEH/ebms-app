import axios from 'axios';
// eslint-disable-next-line
import * as dotenv from 'dotenv';
import fs from 'fs';
import groups from './groups.json';
import optimise from './makeOptimise';

dotenv.config({ path: '../../../../.env' }); // eslint-disable-line

const warehouseURL = 'https://warehouse1.indicia.org.uk';

const { ANON_WAREHOUSE_TOKEN } = process.env;
if (!ANON_WAREHOUSE_TOKEN) {
  throw new Error('ANON_WAREHOUSE_TOKEN is missing from env.');
}

// filtering out butterflies needed as the moths report currently also returns
// butterflies - TODO: remove once the report is fixed
const currentTaxons: any = [];
const uniqueOnly = ({ taxon }: any) => !currentTaxons.includes(taxon);

async function fetch(listID: any) {
  const { data } = await axios({
    method: 'GET',
    url: `${warehouseURL}/index.php/services/rest/reports/projects/ebms/ebms_app_species_list.xml?taxon_list_id=${listID}&limit=10000000`,
    headers: {
      Authorization: `Bearer ${ANON_WAREHOUSE_TOKEN}`,
    },
  });

  const onlyLatin = (s: any) =>
    s.language_iso === 'lat' && !s.taxon.includes('Unterfamilie');
  const attachGroupID = (s: any) => ({ ...s, taxon_group: listID });
  return data.data.filter(onlyLatin).map(attachGroupID);
}

function saveSpeciesToFile(species: any) {
  const saveSpeciesToFileWrap = (resolve: any, reject: any) => {
    const options = (err: any) => {
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
function sortAlphabetically(species: any) {
  const alphabetically = (sp1: any, sp2: any) =>
    sp1.taxon.localeCompare(sp2.taxon);
  return species.sort(alphabetically);
}

// eslint-disable-next-line @getify/proper-arrows/name
(async () => {
  const butterflies = await fetch(groups.butterflies.id);
  currentTaxons.push(...butterflies.map((sp: any) => sp.taxon));

  const moths = (await fetch(groups.moths.id)).filter(uniqueOnly);
  const bumblebees = (await fetch(groups.bumblebees.id)).filter(uniqueOnly);
  const dragonflies = (await fetch(groups.dragonflies.id)).filter(uniqueOnly);
  const species = [...butterflies, ...moths, ...bumblebees, ...dragonflies];

  const sortedSpecies = await sortAlphabetically(species);
  const searchOptimisedList = await optimise(sortedSpecies);
  await saveSpeciesToFile(searchOptimisedList);

  console.log('All done! 🚀');
})();

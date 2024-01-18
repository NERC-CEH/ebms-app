import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as dotenv from 'dotenv';
import fs from 'fs';
// eslint-disable-next-line
import fetchSheet from '@flumens/fetch-onedrive-excel';

dotenv.config({ path: '../../../../.env' }); // eslint-disable-line

const warehouseURL = 'https://warehouse1.indicia.org.uk';

const { ANON_WAREHOUSE_TOKEN } = process.env;
if (!ANON_WAREHOUSE_TOKEN) {
  throw new Error('ANON_WAREHOUSE_TOKEN is missing from env.');
}

const drive =
  'sites/flumensio.sharepoint.com,6230bb4b-9d52-4589-a065-9bebfdb9ce63,21520adc-6195-4b5f-91f6-7af0b129ff5c/drive';

const file = '01UPL42ZUY3DX66DOFLNCJNHYIP24BVJCL';

function getCountryMap(string: any) {
  const map: any = {};
  if (string === null) return map;

  const transformCountryFormat = (country: any) => {
    const [key, val] = country.split('=');
    const normKey = key.replace(': ', '_');
    const normVal = val.replace('?', '');
    map[normKey] = normVal;
  };
  string.split(' | ').forEach(transformCountryFormat);
  return map;
}

async function fetchSpecies(listID: any) {
  const { data } = await axios({
    method: 'GET',
    url: `${warehouseURL}/index.php/services/rest/reports/projects/ebms/ebms_app_species_list.xml?taxon_list_id=${listID}&limit=10000000`,
    headers: {
      Authorization: `Bearer ${ANON_WAREHOUSE_TOKEN}`,
    },
  });

  const parseAttributes = ({ attributes, ...sp }: any) => ({
    ...sp,
    abundance: getCountryMap(attributes),
  });

  const byLatinLanguageWithoutSpecificTaxon = (s: any) =>
    s.language_iso === 'lat' && !s.taxon.includes('Unterfamilie');
  const hasAttributes = (s: any) => !!s.attributes;
  const isPreferred = (s: any) => s.preferred_taxon === s.taxon;
  const latinData = data.data
    .filter(byLatinLanguageWithoutSpecificTaxon)
    .filter(hasAttributes)
    .filter(isPreferred)
    .map(parseAttributes);

  return latinData;
}

function save(species: any) {
  const saveWrap = (resolve: any, reject: any) => {
    const dataOption = (err: any) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(species);
    };
    fs.writeFile('./data.json', JSON.stringify(species), dataOption);
  };
  return new Promise(saveWrap);
}

function saveToFile(data: any, name: any) {
  const saveSpeciesToFileWrap = (resolve: any, reject: any) => {
    const fileName = `./cache/${name}.json`;
    console.log(`Writing ${fileName}`);

    const dataOption = (err: any) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    };

    fs.writeFile(fileName, JSON.stringify(data, null, 2), dataOption);
  };
  return new Promise(saveSpeciesToFileWrap);
}

const fetchAndSave = async (sheet: any) => {
  const sheetData = await fetchSheet({ drive, file, sheet });
  saveToFile(sheetData, sheet);
  return sheetData;
};

async function attachProfileInfo(species: any, speciesInfoList: any) {
  const getSpeciesWithInfo = (sp: any) => {
    const byTaxon = (spInfo: any) =>
      spInfo.taxon === sp.taxon || spInfo.taxon === sp.preferred_taxon;

    const speciesInfo = speciesInfoList.find(byTaxon);

    return {
      ...speciesInfo,
      warehouse_id: parseInt(sp.taxa_taxon_list_id, 10),
      external_key: sp.external_key,
      taxon: sp.taxon,
      abundance: sp.abundance,
    };
  };

  const hasValue = (sp: any) => !!sp;
  const byId = (s1: any, s2: any) =>
    s1.id - s2.id || s1.warehouse_id - s2.warehouse_id;

  return species.map(getSpeciesWithInfo).filter(hasValue).sort(byId);
}

const getData = async () => {
  const speciesInfoList = await fetchAndSave('species');

  await fetchSpecies(251)
    .then(sp => attachProfileInfo(sp, speciesInfoList))
    .then(save)
    // eslint-disable-next-line @getify/proper-arrows/name
    .then(() => console.log('All done! 🚀'));
};

getData();

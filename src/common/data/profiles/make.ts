import axios from 'axios';
// eslint-disable-next-line import-x/no-extraneous-dependencies
import dotenv from 'dotenv';
import fs from 'fs';
// eslint-disable-next-line
import fetchSheet from '@flumens/fetch-onedrive-excel';
import { getCamelCaseObj } from '@flumens/utils/dist/cases.js';

dotenv.config({ path: '../../../../.env' });

const warehouseURL = 'https://warehouse1.indicia.org.uk';

const { APP_WAREHOUSE_ANON_TOKEN } = process.env;
if (!APP_WAREHOUSE_ANON_TOKEN) {
  throw new Error('APP_WAREHOUSE_ANON_TOKEN is missing from env.');
}

const drive =
  'sites/flumensio.sharepoint.com,6230bb4b-9d52-4589-a065-9bebfdb9ce63,21520adc-6195-4b5f-91f6-7af0b129ff5c/drive';

const file = '01UPL42ZUY3DX66DOFLNCJNHYIP24BVJCL';

type CountryMap = Record<string, string>;

/* eslint-disable @typescript-eslint/naming-convention */
type WarehouseSpecies = {
  taxa_taxon_list_id: string;
  external_key: string;
  language_iso: string;
  taxon: string;
  preferred_taxon: string;
  attributes?: string;
  abundance?: CountryMap;
};
/* eslint-enable @typescript-eslint/naming-convention */

type SpeciesInfo = Record<string, unknown> & {
  id: number;
  taxon: string;
};

function getCountryMap(value: string | null) {
  if (value === null) return {};

  return Object.entries(
    JSON.parse(value) as Record<string, string>
  ).reduce<CountryMap>((result, [key, countryValue]) => {
    result[key.replace(': ', '_')] = countryValue.replace('?', '');
    return result;
  }, {});
}

async function fetchWarehouseSpecies(listID: number) {
  const { data } = await axios.get<{ data: WarehouseSpecies[] }>(
    `${warehouseURL}/index.php/services/rest/reports/projects/ebms/ebms_app_species_list.xml`,
    {
      params: { id: listID, type: 'list', limit: 10000000 },
      headers: { Authorization: `Bearer ${APP_WAREHOUSE_ANON_TOKEN}` },
    }
  );

  return data.data
    .filter(
      species =>
        species.language_iso === 'lat' &&
        !species.taxon.includes('Unterfamilie')
    )
    .filter(species => !!species.attributes)
    .filter(species => species.preferred_taxon === species.taxon)
    .map(({ attributes, ...species }) => ({
      ...species,
      abundance: getCountryMap(attributes || null),
    }));
}

async function save<Value>(value: Value) {
  await fs.promises.writeFile('./data.json', JSON.stringify(value));
  return value;
}

async function saveToFile<Value>(data: Value, name: string) {
  const fileName = `./cache/${name}.json`;
  console.log(`Writing ${fileName}`);
  await fs.promises.writeFile(fileName, JSON.stringify(data, null, 2));
  return data;
}

const fetchDatasheetAndSave = async (sheet: string) => {
  const sheetData = (await fetchSheet({ drive, file, sheet })) as SpeciesInfo[];
  await saveToFile(sheetData, sheet);
  return sheetData;
};

function attachProfileInfo(
  warehouseSpecies: WarehouseSpecies[],
  speciesInfoList: SpeciesInfo[]
) {
  return warehouseSpecies
    .map(species => {
      const speciesInfo = speciesInfoList.find(
        info =>
          info.taxon === species.taxon || info.taxon === species.preferred_taxon
      );
      if (!speciesInfo) return null;

      return {
        ...getCamelCaseObj(speciesInfo),
        warehouseId: Number.parseInt(species.taxa_taxon_list_id, 10),
        externalKey: species.external_key,
        taxon: species.taxon,
        abundance: species.abundance,
      };
    })
    .filter(species => species !== null)
    .sort(
      (first, second) =>
        first.id - second.id || first.warehouseId - second.warehouseId
    );
}

const getData = async () => {
  const speciesInfoList = await fetchDatasheetAndSave('species');

  await fetchWarehouseSpecies(251)
    .then(species => attachProfileInfo(species, speciesInfoList))
    .then(save)
    .then(() => console.log('All done! 🚀'));
};

getData();

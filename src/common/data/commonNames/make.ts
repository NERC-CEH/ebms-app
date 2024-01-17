// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as dotenv from 'dotenv';
import fs from 'fs';
import languages from '../../config/languages';
import getAttrs from '../helpers';
import groups from '../species/groups.json';

dotenv.config({ path: '../../../../.env' }); // eslint-disable-line

const warehouseURL = 'https://warehouse1.indicia.org.uk';

const { ANON_WAREHOUSE_TOKEN } = process.env;
if (!ANON_WAREHOUSE_TOKEN) {
  throw new Error('ANON_WAREHOUSE_TOKEN is missing from env.');
}

const LANGUAGE_ISO_MAPPING = Object.entries(languages).reduce(
  (agg: any, [key, lang]: any) => {
    if (lang.ISO_639_2) {
      agg[lang.ISO_639_2] = key; // eslint-disable-line no-param-reassign
    }
    return agg;
  },
  {}
);

const UNKNOWN_SPECIES = {
  taxa_taxon_list_id: '538737',
  preferred_taxa_taxon_list_id: '538737',
  taxon_meaning_id: '243426',
  taxon_id: '488903',
  external_key: null,
  taxon: 'Unknown',
  preferred_taxon: 'Unknown',
  attributes: null,
  language_iso: 'eng',
  taxon_group: 260,
};

const COUNTRIES_WITH_MOTH_COMMON_NAMES: any = {
  swe: 'sv-SE',
  eng: 'en',
  nld: 'nl-NL',
};

const showedWarnings: any = {};

async function fetch(listID: any) {
  const { data } = await axios({
    method: 'GET',
    url: `${warehouseURL}/index.php/services/rest/reports/projects/ebms/ebms_app_species_list.xml?taxon_list_id=${listID}&limit=10000000`,
    headers: {
      Authorization: `Bearer ${ANON_WAREHOUSE_TOKEN}`,
    },
  });

  const attachGroupID = (s: any) => ({ ...s, taxon_group: listID });
  return data.data.map(attachGroupID);
}

function turnNamesArrayIntoLangObject(array: any) {
  // Force first letter capitalization as other languages has lowercase as first letter
  const capitalize = (str: any) => str.charAt(0).toUpperCase() + str.slice(1);

  const taxonWithLanguageMapping = (agg: any, term: any) => {
    const {
      language_iso: languageCode,
      taxa_taxon_list_id: id,
      taxon: name,
      preferred_taxon: taxon,
      taxon_group: group,
      preferred_taxa_taxon_list_id: preferredId,
    } = term;

    if (languageCode === 'lat') {
      // no need for latin - see data/species/index.json file
      return agg;
    }

    const language: any = LANGUAGE_ISO_MAPPING[languageCode];
    if (!language) {
      if (showedWarnings[languageCode]) return agg;

      showedWarnings[languageCode] = true;
      console.warn(
        `❗️ "${languageCode}" is missing from LANGUAGE_ISO_MAPPING\n`
      );

      return agg;
    }

    agg[language] || (agg[language] = []); // eslint-disable-line

    const species = {
      warehouse_id: parseInt(id, 10),
      common_name: capitalize(name),
      scientific_name: taxon,
      taxon_group: group,
      preferredId: parseInt(preferredId, 10),
    };

    const attributes: any = getAttrs(term.attributes);
    if (attributes['Day-active']) {
      delete attributes['Day-active'];
      attributes.isDayFlying = true;
    }
    Object.assign(species, attributes);

    agg[language].push(species);
    return agg;
  };
  return array.reduce(taxonWithLanguageMapping, {});
}

function saveFile(data: any) {
  const names = JSON.stringify(data, null, 2);
  fs.writeFileSync('./index.json', names, 'utf8');
}

function sortAlphabetically(species: any) {
  const alphabetically = (sp1: any, sp2: any) => {
    if (sp1.taxon === sp2.taxon)
      return sp1.preferred_taxon.localeCompare(sp2.preferred_taxon);
    return sp1.taxon.localeCompare(sp2.taxon);
  };
  return species.sort(alphabetically);
}

const make = async () => {
  const butterflies = await fetch(groups.butterflies.id);
  const dragonflies = await fetch(groups.dragonflies.id);
  const mothsOnly = ({ taxon_group: group }: any) => group === groups.moths.id;
  const specificCountryOnly = ({ language_iso: lang }: any) =>
    COUNTRIES_WITH_MOTH_COMMON_NAMES[lang];
  const moths = (await fetch(groups.moths.id))
    .filter(mothsOnly)
    .filter(specificCountryOnly);

  const hasUnknownSpeciesMatch = (moth: any) =>
    moth.taxa_taxon_list_id === UNKNOWN_SPECIES.taxa_taxon_list_id;
  const UNKNOWN_MOTH_SPECIES = moths.find(hasUnknownSpeciesMatch);

  if (!UNKNOWN_MOTH_SPECIES) {
    console.error('FAILED!  ⛔️ UNKNOW_SPECIES dont match');
    return;
  }

  const species = [...butterflies, ...moths, ...dragonflies];
  const sortedSpecies = sortAlphabetically(species);

  const structuredNames = turnNamesArrayIntoLangObject(sortedSpecies);

  saveFile(structuredNames);

  console.log('Success! 🚀');
};
make();

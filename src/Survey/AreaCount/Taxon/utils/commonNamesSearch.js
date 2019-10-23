import appModel from 'app_model';

const WAREHOUSE_INDEX = 0;
const SCI_NAME_INDEX = 1;
const SPECIES_SCI_NAME_INDEX = 1;

export default (genera, normSearchPhrase, results, maxResults) => {
  const language = appModel.get('language');

  let commonNames = [];
  genera.forEach((genus, generaArrayIndex) => {
    genus[2].forEach((species, speciesIndex) => {
      const ENGLISH = 0;
      const SWEDISH = 1;
      const nameIndex = language === 'sv_SE' ? SWEDISH : ENGLISH;
      const name = species[3][nameIndex];

      const matches = name.match(new RegExp(normSearchPhrase, 'i'));
      if (matches && results.length + commonNames.length <= maxResults) {
        commonNames.push({
          array_id: generaArrayIndex,
          species_id: speciesIndex,
          found_in_name: 'common_name',
          warehouse_id: species[WAREHOUSE_INDEX],
          common_name: name,
          scientific_name: `${genus[SCI_NAME_INDEX]} ${species[SPECIES_SCI_NAME_INDEX]}`,
        });
      }
    });
  });

  commonNames = commonNames.sort((sp1, sp2) =>
    sp1.common_name.localeCompare(sp2.common_name)
  );

  results.push(...commonNames);
  return results;
};

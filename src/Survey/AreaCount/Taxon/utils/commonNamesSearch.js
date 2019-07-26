import appModel from 'app_model';

const WAREHOUSE_INDEX = 0;
const SCI_NAME_INDEX = 1;
const SPECIES_SCI_NAME_INDEX = 1;

export default (genera, normSearchPhrase, results, maxResults) => {
  const country = appModel.get('country');

  if (!['UK', 'SE'].includes(country)) {
    return results;
  }

  let commonNames = [];
  genera.forEach((genus, generaArrayIndex) => {
    genus[2].forEach((species, speciesIndex) => {
      const name = species[3][country === 'UK' ? 0 : 1];

      const matches = name.match(new RegExp(normSearchPhrase, 'i'));
      if (matches && results.length + commonNames.length <= maxResults) {
        commonNames.push({
          array_id: generaArrayIndex,
          species_id: speciesIndex,
          found_in_name: 'common_name',
          warehouse_id: species[WAREHOUSE_INDEX],
          common_name: name,
          scientific_name: `${genus[SCI_NAME_INDEX]} ${
            species[SPECIES_SCI_NAME_INDEX]
          }`,
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

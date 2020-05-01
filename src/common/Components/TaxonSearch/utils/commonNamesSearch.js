import appModel from 'app_model';
import speciesNames from 'common/data/names.data.json';

export default (normSearchPhrase, results, maxResults) => {
  const { language } = appModel.attrs;
  const languageSpeciesNames = speciesNames[language];
  if (!languageSpeciesNames) {
    return results;
  }

  let commonNames = [];
  languageSpeciesNames.forEach(
    // eslint-disable-next-line
    ({ warehouse_id, scientific_name, common_name, preferredId }) => {
      const matches = common_name.match(new RegExp(normSearchPhrase, 'i'));
      if (matches && results.length + commonNames.length <= maxResults) {
        commonNames.push({
          found_in_name: 'common_name',
          warehouse_id,
          common_name,
          scientific_name,
          preferredId,
        });
      }
    }
  );

  commonNames = commonNames.sort((sp1, sp2) =>
    sp1.common_name.localeCompare(sp2.common_name)
  );

  results.push(...commonNames);
  return results;
};

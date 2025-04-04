import speciesNames from 'common/data/commonNames/index.json';
import appModel from 'models/app';

const MAX_RESULTS = 200;

export default (normSearchPhrase, results, informalGroups = [], attrFilter) => {
  const { language } = appModel.data;
  const languageSpeciesNames = speciesNames[language];
  if (!languageSpeciesNames) {
    return results;
  }

  let commonNames = [];

  const searchName = ({
    warehouse_id, // eslint-disable-line
    scientific_name, // eslint-disable-line
    common_name, // eslint-disable-line
    preferredId,
    taxon_group, // eslint-disable-line
    ...extraAttrs
  }) => {
    const matches = common_name.match(new RegExp(normSearchPhrase, 'i'));
    const informalGroupMatches = informalGroups.includes(taxon_group);

    if (
      matches &&
      results.length + commonNames.length <= MAX_RESULTS &&
      informalGroupMatches
    ) {
      // check if species matches attr filters
      if (attrFilter) {
        const hasMatchingAttrs = attrFilter({
          group: taxon_group,
          ...extraAttrs,
        });
        if (!hasMatchingAttrs) return;
      }

      commonNames.push({
        found_in_name: 'common_name',
        warehouse_id,
        common_name,
        scientific_name,
        group: taxon_group,
        preferredId,
      });
    }
  };

  languageSpeciesNames.forEach(searchName);

  const firstWordRegex = new RegExp(`^${normSearchPhrase}.*`, 'i');
  const alphabetically = (sp1, sp2) =>
    sp1.common_name.localeCompare(sp2.common_name);
  const byWordOccurrence = (sp1, sp2) =>
    (sp2.common_name.match(firstWordRegex) ? 1 : 0) -
    (sp1.common_name.match(firstWordRegex) ? 1 : 0);
  commonNames = commonNames.sort(alphabetically).sort(byWordOccurrence);

  results.push(...commonNames);
  return results;
};

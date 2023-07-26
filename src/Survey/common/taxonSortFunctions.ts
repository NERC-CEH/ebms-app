export const speciesOccAddedTimeSort = ([, occ1]: any, [, occ2]: any) => {
  if (occ1.createdOn !== 0 || occ2.createdOn !== 0)
    return occ2.createdOn - occ1.createdOn;

  const taxon1 = occ1.taxon;
  const taxonName1 = taxon1[taxon1.found_in_name];

  const taxon2 = occ2.taxon;
  const taxonName2 = taxon2[taxon2.found_in_name];

  return taxonName1.localeCompare(taxonName2);
};

const compareAlphabetical = (taxon1: any, taxon2: any) => {
  const foundInName1 = taxon1.found_in_name;
  const foundInName2 = taxon2.found_in_name;
  const taxonName1 = taxon1[foundInName1];
  const taxonName2 = taxon2[foundInName2];
  return taxonName1.localeCompare(taxonName2);
};

export const speciesNameSort = ([, occ1]: any, [, occ2]: any) =>
  compareAlphabetical(occ1.taxon, occ2.taxon);

export const speciesCount = ([, occ1]: any, [, occ2]: any) => {
  if (occ2.count === occ1.count)
    return compareAlphabetical(occ1.taxon, occ2.taxon);

  return occ2.count - occ1.count;
};

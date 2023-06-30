export const speciesOccAddedTimeSort = ([, occ1]: any, [, occ2]: any) => {
  if (occ1.createdOn !== 0 || occ2.createdOn !== 0)
    return occ2.createdOn - occ1.createdOn;

  const taxon1 = occ1.taxon;
  const taxonName1 = taxon1[taxon1.found_in_name];

  const taxon2 = occ2.taxon;
  const taxonName2 = taxon2[taxon2.found_in_name];

  return taxonName1.localeCompare(taxonName2);
};

export const speciesNameSort = ([, occ1]: any, [, occ2]: any) => {
  const foundInName1 = occ1.taxon.found_in_name;
  const foundInName2 = occ2.taxon.found_in_name;
  const taxon1 = occ1.taxon[foundInName1];
  const taxon2 = occ2.taxon[foundInName2];
  return taxon1.localeCompare(taxon2);
};

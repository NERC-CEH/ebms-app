import { Taxon } from 'models/occurrence';

export type SpeciesSummary = {
  taxon: Taxon;
  count: number;
  createdAt?: number;
  updatedAt?: number;
  isDisabled?: boolean;
  isGeolocating?: boolean;
  hasLocationMissing?: boolean;
};

type SpeciesEntry = [string, SpeciesSummary];

const getTaxonName = (taxon: Taxon) =>
  taxon.foundInName
    ? taxon[taxon.foundInName] || taxon.scientificName
    : taxon.scientificName;

const compareAlphabetical = (first: Taxon, second: Taxon) =>
  getTaxonName(first).localeCompare(getTaxonName(second));

export const speciesOccAddedTimeSort = (
  [, first]: SpeciesEntry,
  [, second]: SpeciesEntry
) => {
  if (first.createdAt !== 0 || second.createdAt !== 0)
    return second.createdAt! - first.createdAt!;

  return compareAlphabetical(first.taxon, second.taxon);
};

export const speciesOccUpdatedTimeSort = (
  [, first]: SpeciesEntry,
  [, second]: SpeciesEntry
) => second.updatedAt! - first.updatedAt!;

export const speciesNameSort = (
  [, first]: SpeciesEntry,
  [, second]: SpeciesEntry
) => compareAlphabetical(first.taxon, second.taxon);

export const speciesCount = (
  [, first]: SpeciesEntry,
  [, second]: SpeciesEntry
) =>
  second.count === first.count
    ? compareAlphabetical(first.taxon, second.taxon)
    : second.count - first.count;

export const getDefaultTaxonCount = (
  taxon: Taxon,
  createdAt?: number,
  updatedAt?: number
) => ({
  count: 0,
  taxon,
  createdAt,
  updatedAt,
  isDisabled: false, // for remote occurrences without samples, don't let open any pages
});

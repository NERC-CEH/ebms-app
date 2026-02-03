import type { SearchResult } from 'common/helpers/taxonSearch';

export type SuggestionResult = SearchResult & {
  isFavourite?: boolean;
  isRecorded?: boolean;
};

export const getTaxonName = (taxon: SuggestionResult) =>
  taxon.foundInName === 'commonName'
    ? (taxon.commonName ?? '')
    : (taxon.scientificName ?? '');

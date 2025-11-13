import type { SearchResult } from 'common/helpers/taxonSearch';

export type SuggestionResult = SearchResult & {
  isFavourite?: boolean;
  isRecorded?: boolean;
};

export const getTaxonName = (taxon: SuggestionResult): string => {
  if (taxon.found_in_name === 'common_name') {
    return taxon.common_name ?? '';
  }

  return taxon.scientific_name ?? '';
};

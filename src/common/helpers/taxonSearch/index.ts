import { SQL } from 'drizzle-orm';
import searchCommonNames from './commonNamesSearch';
import searchSciNames from './scientificNamesSearch';

export type SpeciesColumns = {
  data: any;
  id: number;
  taxon_list_id: number;
  taxon_group_id: number;
  preferred_taxa_taxon_list_id: number | null;
  parent_id: number | null;
  external_key: string | null;
  language_iso: string;
  taxon: string;
};

export type SearchResult = {
  found_in_name: string;
  warehouse_id: number;
  scientific_name: string;
  common_name?: string;
  group: number;
  preferredId?: number;
};

type Args = {
  store: { table: any; db: any };
  searchPhrase: string;
  language: string;
  maxResults?: number;
  where?: (table: any) => SQL;
};

export default async function search({
  store,
  searchPhrase,
  language,
  where,
}: Args): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  if (!searchPhrase) return results;
  // TODO: Accent Folding: https://alistapart.com/article/accent-folding-for-auto-complete

  if (!language) return [];

  // normalize the search phrase
  const normSearchPhrase = searchPhrase.toLowerCase();

  const commonNameResults = await searchCommonNames(
    store,
    normSearchPhrase,
    language,
    where
  );

  results.push(...commonNameResults);

  const MAX_RESULTS = 20;
  if (results.length < MAX_RESULTS) {
    const scientificNameResults = await searchSciNames(
      store,
      normSearchPhrase,
      language,
      where,
      MAX_RESULTS - results.length
    );

    results.push(...scientificNameResults);
  }

  // sort results by the order of appearance of the search phrase in the name
  results.sort((a, b) => {
    const aIndex = (a as any)[a.found_in_name]
      ?.toLowerCase()
      .indexOf(normSearchPhrase);
    const bIndex = (b as any)[b.found_in_name]
      ?.toLowerCase()
      .indexOf(normSearchPhrase);

    // results not containing the search phrase should be at the end
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });

  return results;
}

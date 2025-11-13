/** ****************************************************************************
 * Scientific name search.
 **************************************************************************** */
import { and, eq, getTableColumns, like, or, SQL, sql } from 'drizzle-orm';
import { alias, QueryBuilder } from 'drizzle-orm/sqlite-core';
import { SearchResult, SpeciesColumns } from '.';

async function searchSciNames(
  speciesStore: any,
  searchPhrase: string,
  language: string,
  where?: (table: typeof speciesStore.table) => SQL,
  limit: number = 20
) {
  const { table } = speciesStore;
  const synonym: any = alias(table, 'synonym');

  const customWhere = where ? where(table) : sql`1`; // always true

  // update the search phrase to escape % and _ characters
  let searchPhraseNormalised = searchPhrase
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');

  // escape regex special characters to treat them as normal characters
  searchPhraseNormalised = searchPhraseNormalised.replace(
    /[-.*+?^${}()|[\]\\]/g,
    '_'
  );

  // update the search phrase to accept spaces as wildcards
  searchPhraseNormalised = searchPhraseNormalised.replace(/\s+/g, '%');

  // prepare the search patterns
  const searchPatterns = [`%${searchPhraseNormalised}%`];

  // if the search phrase is equal to 5 characters, add a shortcut pattern for genus + species
  const is5CharacterShortcut = searchPhrase.length === 5;
  if (is5CharacterShortcut) {
    const genus = searchPhraseNormalised.substr(0, 2);
    const name = searchPhraseNormalised.substr(2, 4);
    searchPatterns.push(`${genus}% ${name}%`);
  }

  const query: any = new QueryBuilder()
    .select({
      ...getTableColumns(table),
      common_name: sql`${synonym.taxon} as common_name`,
    })
    .from(table)
    .leftJoin(
      synonym,
      and(
        eq(synonym.preferred_taxa_taxon_list_id, table.id),
        eq(synonym.language_iso, language)
      )
    )
    .where(
      and(
        eq(table.language_iso, 'lat'),
        or(...searchPatterns.map(pattern => like(table.taxon, pattern))),
        customWhere
      )
    )
    .groupBy(table.id) // we only want one common name per species - a subquery would be more efficient, but usually we have only a few synonyms
    .limit(limit);

  const species: any = await speciesStore.db.query(query.toSQL());

  return species.map(
    (sp: SpeciesColumns & { common_name: string }): SearchResult => {
      return {
        found_in_name: 'scientific_name',
        warehouse_id: sp.id,
        scientific_name: sp.taxon,
        common_name: sp.common_name,
        group: sp.taxon_group_id,
        preferredId: sp.preferred_taxa_taxon_list_id!,
      };
    }
  );
}

export default searchSciNames;

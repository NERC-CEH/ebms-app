/* eslint-disable no-param-reassign */
import { and, eq, getTableColumns, like, SQL, sql } from 'drizzle-orm';
import { alias, QueryBuilder } from 'drizzle-orm/sqlite-core';
import { SearchResult, SpeciesColumns } from '.';

async function searchCommonNames(
  store: { table: any; db: any },
  searchPhrase: string,
  language: string,

  where?: (table: typeof store.table) => SQL
): Promise<SearchResult[]> {
  const { table } = store;
  const preferred: any = alias(table, 'preferred');

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

  const query: any = new QueryBuilder()
    .select({
      ...getTableColumns(table),
      scientific_name: sql`${preferred.taxon} as scientific_name`,
    })
    .from(table)
    .leftJoin(preferred, eq(preferred.id, table.preferred_taxa_taxon_list_id))
    .where(
      and(
        eq(table.language_iso, language),
        like(table.taxon, `%${searchPhraseNormalised}%`),
        customWhere
      )
    )
    .groupBy(table.id) // we only want one common name per species
    .limit(20);

  const species: any = await store.db.query(query.toSQL());

  return species.map(
    (sp: SpeciesColumns & { scientific_name: string }): SearchResult => {
      return {
        found_in_name: 'common_name',
        warehouse_id: sp.id,
        common_name: sp.taxon,
        scientific_name: sp.scientific_name,
        group: sp.taxon_group_id,
        preferredId: sp.preferred_taxa_taxon_list_id!,
      };
    }
  );
}

export default searchCommonNames;

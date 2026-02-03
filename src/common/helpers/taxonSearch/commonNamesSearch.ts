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
      scientificName: sql`${preferred.taxon} as scientificName`,
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
    (sp: SpeciesColumns & { scientificName: string }): SearchResult => ({
      foundInName: 'commonName',
      warehouseId: sp.id,
      commonName: sp.taxon,
      scientificName: sp.scientificName,
      taxonGroupId: sp.taxon_group_id,
      preferredId: sp.preferred_taxa_taxon_list_id!,
    })
  );
}

export async function getCommonNameById(
  store: { table: any; db: any },
  taxaTaxonListId: string | number,
  language = 'eng'
) {
  const query: any = new QueryBuilder()
    .select({ taxon: store.table.taxon })
    .from(store.table)
    .where(
      and(
        eq(
          store.table.preferred_taxa_taxon_list_id,
          parseInt(`${taxaTaxonListId}`, 10)
        ),
        eq(store.table.language_iso, language)
      )
    )
    .limit(1);

  const [taxon] = await store.db.query(query.toSQL());
  return taxon?.taxon || null;
}

export default searchCommonNames;

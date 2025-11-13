import { text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core';
import { Store } from '@flumens';
import SQLiteDatabase from '@flumens/models/dist/Stores/SQLiteDatabase';
import { jsonb } from '@flumens/models/dist/Stores/SQLiteStore';
import { isPlatform } from '@ionic/react';

const web = !isPlatform('hybrid');

export const db = new SQLiteDatabase({ name: 'indicia', web, debug: web });
export const mainStore = new Store({ name: 'main', db });
export const samplesStore = new Store({ name: 'samples', db });
export const locationsStore = new Store({ name: 'locations', db });
export const groupsStore = new Store({ name: 'groups', db });

export const speciesListsStore: any = new Store({ name: 'speciesLists', db });

export const speciesColumns: any = {
  /**
   * Warehouse taxa_taxon_list_id of the species. Not a unique ID on its own as multiple lists can contain the same taxon.
   */
  id: integer().notNull(),
  /**
   * Identifies the taxon list which this searchable name is from.
   */
  list_cid: text()
    .references(() => speciesListsStore.table.cid, { onDelete: 'cascade' })
    .notNull(),
  /**
   * Informal taxon group ID.
   */
  taxon_group_id: integer().notNull(),
  /**
   * ID of the preferred version of this term.
   */
  preferred_taxa_taxon_list_id: integer(),
  /**
   * Identifies the parent of the taxon in the hierarchy, if one exists.
   */
  parent_id: integer(),
  /**
   * Searchable identifier for the taxon. Includes taxon formal and vernacular names, simplified versions of these for searching and codes, abbreviations or other shortcuts used to lookup taxa.
   */
  external_key: text(),
  /**
   * The language associated with the search term, or null if not language specific.
   */
  language_iso: text().notNull(),
  /**
   * Provides the preferred taxon name for a taxon that has been looked up.
   */
  taxon: text().notNull(),
  /**
   * For storing additional species attributes, like country presence.
   */
  data: jsonb<any>('data').notNull().default({}),
} as const;

export const speciesStore: any = new Store<typeof speciesColumns>({
  name: 'species',
  db,
  columns: speciesColumns,
  extraConf: (table: any) => [
    primaryKey({ columns: [table.id, table.list_cid] }),
    index('taxon_idx').on(table.taxon),
    index('language_iso_taxon_group_id_idx').on(
      table.language_iso,
      table.taxon_group_id
    ),
  ],
});

if (web) {
  Object.assign(window, {
    mainStore,
    samplesStore,
    groupsStore,
    locationsStore,
    speciesListsStore,
    speciesStore,
    db,
  });
}

import { text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core';
import { Store } from '@flumens';
import SQLiteDatabase from '@flumens/models/dist/Stores/SQLiteDatabase';
import { jsonb } from '@flumens/models/dist/Stores/SQLiteStore';
import { isPlatform } from '@ionic/react';
import GroupsStore from './GroupsStore';
import LocationsStore from './LocationsStore';

const web = !isPlatform('hybrid');

export const db = new SQLiteDatabase({ name: 'indicia', web, debug: web });
export const mainStore = new Store({ name: 'main', db });
export const samplesStore = new Store({ name: 'samples', db });
export const taxonListsStore: any = new Store({ name: 'taxon_lists', db });
export const locationsStore: any = new LocationsStore({
  name: 'locations',
  db,
  taxonListsStore,
});
export const groupsStore = new GroupsStore({
  name: 'groups',
  db,
  locationsStore,
  taxonListsStore,
});

/* eslint-disable @typescript-eslint/naming-convention */
export const taxonColumns = {
  /**
   * Warehouse taxa_taxon_list_id of the taxon. Not a unique ID on its own as multiple lists can contain the same taxon.
   */
  id: integer().notNull(),
  /**
   * Identifies the taxon list which this searchable name is from.
   */
  list_cid: text()
    .references(() => taxonListsStore.table.cid, { onDelete: 'cascade' })
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
   * For storing additional taxon attributes, like country presence.
   */
  data: jsonb<any>('data').notNull().default({}),
} as const;
/* eslint-enable @typescript-eslint/naming-convention */

export const taxaStore: any = new Store<typeof taxonColumns>({
  name: 'taxa',
  db,
  columns: taxonColumns,
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
    taxonListsStore,
    taxaStore,
    db,
  });
}

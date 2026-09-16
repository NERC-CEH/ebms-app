import { eq, getTableColumns, sql } from 'drizzle-orm';
import {
  primaryKey,
  QueryBuilder,
  SQLiteSelect,
  text,
} from 'drizzle-orm/sqlite-core';
import { Store, type SelectQueryFn, type SQLiteStoreOptions } from '@flumens';
import {
  type ColumnMap,
  defaultCols,
  type InferQuery,
} from '@flumens/models/dist/Stores/SQLiteStore';
import { getCamelCaseObj } from '@flumens/utils';

const groupLocationsColumns = (groups: Store, locations: Store) => ({
  groupCid: text('group_cid')
    .notNull()
    .references(() => groups.table.cid, { onDelete: 'cascade' }),
  locationCid: text('location_cid')
    .notNull()
    .references(() => locations.table.cid, { onDelete: 'cascade' }),
});

const groupTaxonListsColumns = (groups: Store, taxonLists: Store) => ({
  groupCid: text('group_cid')
    .notNull()
    .references(() => groups.table.cid, { onDelete: 'cascade' }),
  taxonListCid: text('taxon_list_cid')
    .notNull()
    .references(() => taxonLists.table.cid, { onDelete: 'cascade' }),
});

type DefaultColumns = ReturnType<typeof defaultCols>;

export default class GroupsStore extends Store<
  DefaultColumns,
  ColumnMap<DefaultColumns>,
  'groups'
> {
  groupsLocations: Store<ReturnType<typeof groupLocationsColumns>>;

  groupsLists: Store<ReturnType<typeof groupTaxonListsColumns>>;

  constructor({
    locationsStore,
    taxonListsStore,
    ...options
  }: SQLiteStoreOptions<DefaultColumns, 'groups'> & {
    locationsStore: Store;
    taxonListsStore: Store;
  }) {
    super(options);

    this.groupsLocations = new Store({
      name: 'groups_locations',
      db: this.db,
      columns: groupLocationsColumns(this, locationsStore),
      extraConf: table => ({
        primaryKey: primaryKey({
          columns: [table.locationCid, table.groupCid],
        }),
      }),
    });

    this.groupsLists = new Store({
      name: 'groups_taxon_lists',
      db: this.db,
      columns: groupTaxonListsColumns(this, taxonListsStore),
      extraConf: table => ({
        primaryKey: primaryKey({
          columns: [table.groupCid, table.taxonListCid],
        }),
      }),
    });
  }

  async findAll(filter?: SelectQueryFn) {
    await this.ready;

    const baseQuery = new QueryBuilder()
      .select({
        ...getTableColumns(this.table),
        locationCids:
          sql<string>`json_group_array(${this.groupsLocations.table.locationCid})`.as(
            'locationCids'
          ),
        taxonListCids:
          sql<string>`json_group_array(${this.groupsLists.table.taxonListCid})`.as(
            'taxonListCids'
          ),
      })
      .from(this.table)
      .leftJoin(
        this.groupsLocations.table,
        eq(this.table.cid, this.groupsLocations.table.groupCid)
      )
      .leftJoin(
        this.groupsLists.table,
        eq(this.table.cid, this.groupsLists.table.groupCid)
      )
      .groupBy(this.table.cid);

    const query = filter
      ? filter(baseQuery as unknown as SQLiteSelect)
      : baseQuery;

    type Result = InferQuery<typeof baseQuery>;

    const values = await this.db.query<Result>(query.toSQL());

    const parseIds = (value: string) =>
      (JSON.parse(value) as (string | null)[]).filter(
        (id): id is string => id !== null
      );

    return values.map(({ data, locationCids, taxonListCids, ...value }) => ({
      ...getCamelCaseObj(value),
      data: JSON.parse(String(data)),
      locationCids: parseIds(locationCids),
      taxonListCids: parseIds(taxonListCids),
    }));
  }
}

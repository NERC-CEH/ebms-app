import { eq, getTableColumns, sql } from 'drizzle-orm';
import {
  primaryKey,
  QueryBuilder,
  SQLiteSelect,
  text,
} from 'drizzle-orm/sqlite-core';
import {
  getCamelCaseObj,
  Store,
  type SelectQueryFn,
  type SQLiteStoreOptions,
} from '@flumens';
import {
  type ColumnMap,
  defaultCols,
  type InferQuery,
} from '@flumens/models/dist/Stores/SQLiteStore';

const locationListColumns = (locations: Store, taxonLists: Store) => ({
  locationCid: text('location_cid')
    .notNull()
    .references(() => locations.table.cid, { onDelete: 'cascade' }),
  taxonListCid: text('taxon_list_cid')
    .notNull()
    .references(() => taxonLists.table.cid, { onDelete: 'cascade' }),
});

type DefaultColumns = ReturnType<typeof defaultCols>;

export default class LocationsStore extends Store<
  DefaultColumns,
  ColumnMap<DefaultColumns>,
  'locations'
> {
  locationLists: Store<ReturnType<typeof locationListColumns>>;

  constructor({
    taxonListsStore,
    ...options
  }: SQLiteStoreOptions<DefaultColumns, 'locations'> & {
    taxonListsStore: Store;
  }) {
    super(options);

    const columns = locationListColumns(this, taxonListsStore);
    this.locationLists = new Store({
      name: 'locations_lists',
      db: this.db,
      columns,
      extraConf: table => ({
        primaryKey: primaryKey({
          columns: [table.locationCid, table.taxonListCid],
        }),
      }),
    });
  }

  async findAll(filter?: SelectQueryFn) {
    await this.ready;

    const baseQuery = new QueryBuilder()
      .select({
        ...getTableColumns(this.table),
        taxonListCids:
          sql<string>`json_group_array(${this.locationLists.table.taxonListCid})`.as(
            'taxonListCids'
          ),
      })
      .from(this.table)
      .leftJoin(
        this.locationLists.table,
        eq(this.table.cid, this.locationLists.table.locationCid)
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

    return values.map(({ data, taxonListCids, ...value }) => ({
      ...getCamelCaseObj(value),
      data: JSON.parse(String(data)),
      taxonListCids: parseIds(taxonListCids),
    }));
  }
}

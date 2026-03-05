/* eslint-disable no-param-reassign */
import { getTableColumns, sql, eq } from 'drizzle-orm';
import { toCamelCase } from 'drizzle-orm/casing';
import {
  primaryKey,
  QueryBuilder,
  SQLiteSelect,
  text,
} from 'drizzle-orm/sqlite-core';
import { Store } from '@flumens';

type SelectQueryFn = (q: SQLiteSelect) => SQLiteSelect;

type Options = ConstructorParameters<typeof Store>[0] & {
  taxonListsStore: Store<any>;
};

export default class LocationsStore extends Store {
  locationLists!: Store<any>;

  constructor({ taxonListsStore, ...opts }: Options) {
    super(opts as any);

    this.addTaxonLists(taxonListsStore);
  }

  addTaxonLists(taxonListsStore: Store<any>) {
    const columns = {
      locationCid: text('location_cid')
        .notNull()
        .references(() => this.table.cid as any, { onDelete: 'cascade' }),
      taxonListCid: text('taxon_list_cid')
        .notNull()
        .references(() => taxonListsStore.table.cid, { onDelete: 'cascade' }),
    } as const;

    this.locationLists = new Store<typeof columns>({
      name: 'locations_lists',
      db: this.db,
      columns,
      extraConf: (table: any) => [
        primaryKey({ columns: [table.locationCid, table.taxonListCid] }),
      ],
    });
  }

  async findAll(q?: SelectQueryFn) {
    await this.ready;

    let query: SQLiteSelect = new QueryBuilder()
      .select({
        ...getTableColumns(this.table),

        taxonListCids:
          sql`json_group_array(${this.locationLists.table.taxonListCid})`.as(
            'taxonListCids'
          ),
      })
      .from(this.table)
      .leftJoin(
        this.locationLists.table,
        eq(this.table.cid, this.locationLists.table.locationCid)
      )
      .groupBy(this.table.cid) as any;

    if (q) query = q(query);

    const values = await this.db.query(query.toSQL());

    const getCamelCaseAndParseJSON = (val: any) =>
      Object.entries(val).reduce((agg: any, [key, v]: any) => {
        const isJSONType =
          (getTableColumns(this.table) as any)[key]?.sqlName === 'jsonb';

        if (key === 'taxonListCids') {
          const parsed = JSON.parse(v);

          // json_group_array returns [null] when there are no matching rows
          agg.taxonListCids = parsed.filter((id: string | null) => id !== null);
        } else if (isJSONType) {
          agg[toCamelCase(key)] = JSON.parse(v);
        } else {
          agg[toCamelCase(key)] = v;
        }

        return agg;
      }, {});

    return values.map(getCamelCaseAndParseJSON);
  }
}

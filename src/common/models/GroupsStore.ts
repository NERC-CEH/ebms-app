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
  locationsStore: Store<any>;
  taxonListsStore: Store<any>;
};

export default class GroupsStore extends Store {
  groupsLocations!: Store<any>;

  groupsLists!: Store<any>;

  constructor({ locationsStore, taxonListsStore, ...opts }: Options) {
    super(opts as any);

    this.addLocations(locationsStore);
    this.addTaxonLists(taxonListsStore);
  }

  addLocations(locationsStore: Store<any>) {
    const groupLocationsColumns = {
      groupCid: text('group_cid')
        .notNull()
        .references(() => this.table.cid as any, { onDelete: 'cascade' }),
      locationCid: text('location_cid')
        .notNull()
        .references(() => locationsStore.table.cid, { onDelete: 'cascade' }),
    } as const;

    this.groupsLocations = new Store<typeof groupLocationsColumns>({
      name: 'groups_locations',
      db: this.db,
      columns: groupLocationsColumns,
      extraConf: (table: any) => [
        primaryKey({ columns: [table.locationCid, table.groupCid] }),
      ],
    });
  }

  addTaxonLists(taxonListsStore: Store<any>) {
    const groupTaxonListsColumns = {
      groupCid: text('group_cid')
        .notNull()
        .references(() => this.table.cid as any, { onDelete: 'cascade' }),
      taxonListCid: text('taxon_list_cid')
        .notNull()
        .references(() => taxonListsStore.table.cid, { onDelete: 'cascade' }),
    } as const;

    this.groupsLists = new Store<typeof groupTaxonListsColumns>({
      name: 'groups_taxon_lists',
      db: this.db,
      columns: groupTaxonListsColumns,
      extraConf: (table: any) => [
        primaryKey({ columns: [table.groupCid, table.taxonListCid] }),
      ],
    });
  }

  async findAll(q?: SelectQueryFn) {
    await this.ready;

    let query: SQLiteSelect = new QueryBuilder()
      .select({
        ...getTableColumns(this.table),

        locationCids:
          sql`json_group_array(${this.groupsLocations.table.locationCid})`.as(
            'locationCids'
          ),

        taxonListCids:
          sql`json_group_array(${this.groupsLists.table.taxonListCid})`.as(
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
      .groupBy(this.table.cid) as any;

    if (q) query = q(query);

    const values = await this.db.query(query.toSQL());

    const getCamelCaseAndParseJSON = (val: any) =>
      Object.entries(val).reduce((agg: any, [key, v]: any) => {
        const isJSONType =
          (getTableColumns(this.table) as any)[key]?.sqlName === 'jsonb';

        if (key === 'locationCids') {
          const parsed = JSON.parse(v);
          agg.locationCids = parsed.filter((id: string | null) => id !== null); // json_group_array returns [null] when there are no matching rows
        } else if (key === 'taxonListCids') {
          const parsed = JSON.parse(v);
          agg.taxonListCids = parsed.filter((id: string | null) => id !== null); // json_group_array returns [null] when there are no matching rows
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

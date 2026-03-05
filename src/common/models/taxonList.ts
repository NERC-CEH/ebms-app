import { observable } from 'mobx';
import axios from 'axios';
import { and, eq, getTableColumns, SQL, sql } from 'drizzle-orm';
import { alias, QueryBuilder } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import { Model, ModelData } from '@flumens';
import config from 'common/config';
import type { SearchResult, SpeciesColumns } from 'common/helpers/taxonSearch';
import Group from './group';
import Location from './location';
import { db, taxonListsStore, taxaStore } from './store';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dtoSchema = z.object({
  id: z.number(),
  type: z.enum(['location', 'list', '"custom_list"']),
  title: z.string().optional(),
  description: z.string().optional(),
  locationCode: z.string().optional(),
  taxonGroups: z.number().array(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
  updatedOn: z.number().optional(),
  size: z.number().optional(),
});

export type DTO = z.infer<typeof dtoSchema>;

export type Data = ModelData & {
  id: number;
  type: 'list' | 'location' | 'custom_list';
  title: string;
  taxonGroups: number[];
  locationCode?: string;
  description?: string;
  coordinates?: number;
  size?: number;
};

export default class TaxonList extends Model<Data> {
  static fromDTO(
    dto: DTO,
    {
      skipStore,
      groupCids,
      locationCids,
    }: {
      skipStore?: boolean;
      groupCids?: string[];
      locationCids?: string[];
    } = {}
  ): TaxonList {
    return new TaxonList({
      // id: dto.id, // remote id is not unique
      cid: `${dto.id}_${dto.type}`, // unique client id
      data: {
        id: dto.id,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        taxonGroups: dto.taxonGroups,
        coordinates: dto.coordinates,
        locationCode: dto.locationCode,
        size: dto.size,
      },
      updatedAt: dto.updatedOn,
      syncedAt: dto.updatedOn,
      skipStore,
      groupCids,
      locationCids,
    });
  }

  protected remote: {
    synchronising: boolean;
    url: string;
    getAccessToken: () => Promise<string>;
  };

  private _groupCids: string[] = [];

  private _locationCids: string[] = [];

  constructor({ groupCids, locationCids, ...options }: any) {
    super({ ...options, store: options.skipStore ? null : taxonListsStore });

    this._groupCids = groupCids || [];
    this._locationCids = locationCids || [];

    this.remote = observable({
      synchronising: false,
      url: config.backend.indicia.url,
      getAccessToken: () =>
        Promise.resolve(process.env.APP_WAREHOUSE_ANON_TOKEN!),
    });
  }

  get groupCids() {
    return this._groupCids;
  }

  get locationCids() {
    return this._locationCids;
  }

  async linkGroup(group: Group) {
    if (!this._groupCids.includes(group.cid)) {
      this._groupCids.push(group.cid);
    }

    if (!group.taxonListCids.includes(this.cid)) {
      await group.linkTaxonList(this);
    }
  }

  async linkLocation(location: Location) {
    if (!this._locationCids.includes(location.cid)) {
      this._locationCids.push(location.cid);
    }

    if (!location.taxonListCids.includes(this.cid)) {
      await location.linkTaxonList(this);
    }
  }

  getSize(): number {
    return this.data.size || 0;
  }

  async save(force = false) {
    // add to store if not already present
    if (force && !this.store) {
      this.store = taxonListsStore;
    }

    await super.save();
  }

  /**
   * Fetches all species belonging to this list from the local species store.
   * Optionally accepts an additional where clause to further filter results.
   */
  async fetchSpecies(
    language: string,
    customWhere?: (table: typeof taxaStore.table) => SQL
  ): Promise<SearchResult[]> {
    const { table } = taxaStore;

    const additionalFilter = customWhere ? customWhere(table) : sql`1`;

    // restrict to this species list
    const listFilter = eq(table.list_cid, this.cid);

    // fetch species with common names
    const preferred: any = alias(table, 'preferred');

    const query: any = new QueryBuilder()
      .select({
        ...getTableColumns(table),
        commonName: sql`${preferred.taxon} as commonName`,
      })
      .from(table)
      .leftJoin(
        preferred,
        and(
          eq(preferred.preferred_taxa_taxon_list_id, table.id),
          eq(preferred.language_iso, language)
        )
      )
      .where(and(eq(table.language_iso, 'lat'), listFilter, additionalFilter))
      .groupBy(table.id)
      .orderBy(table.taxon);

    const species: any = await taxaStore.db.query(query.toSQL());

    return species
      .map(
        (sp: SpeciesColumns & { commonName: string }): SearchResult => ({
          foundInName: 'commonName',
          warehouseId: sp.id,
          scientificName: sp.taxon,
          commonName: sp.commonName,
          taxonGroupId: sp.taxon_group_id,
          preferredId: sp.preferred_taxa_taxon_list_id!,
        })
      )
      .filter((s: SearchResult) => !!s.commonName);
  }

  async fetchRemoteSpecies() {
    console.log(`📥 Model: Fetching species for list ${this.cid}`);

    const accessToken = await this.remote.getAccessToken();
    const warehouseURL = 'https://warehouse1.indicia.org.uk';
    const url = `${warehouseURL}/index.php/services/rest/reports/projects/ebms/ebms_app_species_list.xml`;
    const baseOptions = {
      params: {
        id: this.data.id,
        type: this.data.type,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 80000,
    };

    const LIMIT = 40000;
    const allSpecies: any[] = [];
    let offset = 0;

    // Fetch in chunks to avoid overwhelming the API and the device.
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const res = await axios.get(url, {
        ...baseOptions,
        params: { ...baseOptions.params, limit: LIMIT, offset },
      });

      const batch = res?.data?.data ?? [];
      allSpecies.push(...batch);

      if (batch.length < LIMIT) break;

      offset += LIMIT;
    }

    const fromDTO = (item: any) => ({
      taxaTaxonListId: parseInt(item.taxa_taxon_list_id, 10) || null,
      taxonGroupId: parseInt(item.taxon_group_id, 10) || null,
      preferredTaxaTaxonListId:
        parseInt(item.preferred_taxa_taxon_list_id, 10) || null,
      taxonMeaningId: parseInt(item.taxon_meaning_id, 10) || null,
      parentId: parseInt(item.parent_id, 10) || null,
      taxon: item.taxon,
      preferredTaxon: item.preferred_taxon || null,
      languageIso: item.language_iso,
      externalKey: item.external_key || null,
      data: item.attributes ? JSON.parse(item.attributes) : {},
    });
    const data = allSpecies.map(fromDTO);

    // batch insert species for better performance
    const BATCH_SIZE = 500;

    await db.query({ sql: 'BEGIN TRANSACTION' });

    try {
      await db.query({
        sql: `DELETE FROM taxa WHERE list_cid = "${this.cid}"`,
      });

      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);

        const placeholders = batch
          .map((_item: unknown, idx: number) => {
            const off = idx * 9;
            return `($${off + 1}, $${off + 2}, $${off + 3}, $${off + 4}, $${off + 5}, $${off + 6}, $${off + 7}, $${off + 8}, $${off + 9})`;
          })
          .join(',');

        const params = batch.flatMap((item: (typeof data)[0]) => [
          item.taxaTaxonListId,
          this.cid,
          item.taxonGroupId,
          item.preferredTaxaTaxonListId,
          item.parentId,
          item.externalKey,
          item.languageIso,
          item.taxon,
          JSON.stringify(item.data),
        ]);

        // eslint-disable-next-line no-await-in-loop
        await db.query({
          sql: `
            INSERT OR REPLACE INTO taxa (
              id,
              list_cid,
              taxon_group_id,
              preferred_taxa_taxon_list_id,
              parent_id,
              external_key,
              language_iso,
              taxon,
              data
            ) VALUES ${placeholders}
          `,
          params,
        });
      }

      await db.query({ sql: 'COMMIT' });
    } catch (error) {
      await db.query({ sql: 'ROLLBACK' });

      throw error;
    }

    console.log(`📥 Model: Fetching species for list ${this.cid} done`);
  }
}

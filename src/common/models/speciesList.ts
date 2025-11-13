import { observable } from 'mobx';
import axios from 'axios';
import { z } from 'zod';
import { Model, ModelAttrs } from '@flumens';
import config from 'common/config';
import { db, speciesListsStore } from './store';

const dtoSchema = z.object({
  id: z.number(),
  type: z.enum(['location', 'list']),
  title: z.string().optional(),
  description: z.string().optional(),
  locationCode: z.string().optional(),
  taxonGroups: z.number().array(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
  updatedOn: z.number().optional(),
  size: z.number().optional(),
});

export type DTO = z.infer<typeof dtoSchema>;

export type Data = ModelAttrs & {
  id: number;
  type: 'location' | 'list';
  title: string;
  taxonGroups: number[];
  description?: string;
  coordinates?: number;
  size?: number;
};

export default class SpeciesList extends Model<Data> {
  static fromDTO(
    dto: DTO,
    { skipStore }: { skipStore?: boolean } = {}
  ): SpeciesList {
    return new SpeciesList({
      // id: dto.id, // remote id is not unique
      cid: `${dto.id}_${dto.type}`, // unique client id
      data: {
        id: dto.id,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        taxonGroups: dto.taxonGroups,
        coordinates: dto.coordinates,
        size: dto.size,
      },
      updatedAt: dto.updatedOn,
      syncedAt: dto.updatedOn,
      skipStore,
    });
  }

  protected remote: {
    synchronising: boolean;
    url: string;
    getAccessToken: () => Promise<string>;
  };

  constructor(options: any) {
    super({ ...options, store: options.skipStore ? null : speciesListsStore });

    this.remote = observable({
      synchronising: false,
      url: config.backend.indicia.url,
      getAccessToken: () =>
        Promise.resolve(process.env.APP_WAREHOUSE_ANON_TOKEN!),
    });
  }

  getSize(): number {
    return this.data.size || 0;
  }

  async save(force = false) {
    // add to store if not already present
    if (force && !this.store) {
      this.store = speciesListsStore as any;
    }

    super.save();
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

    const parsedData = allSpecies.map((item: any) => ({
      taxa_taxon_list_id: parseInt(item.taxa_taxon_list_id, 10) || null,
      taxon_group_id: parseInt(item.taxon_group_id, 10) || null,
      preferred_taxa_taxon_list_id:
        parseInt(item.preferred_taxa_taxon_list_id, 10) || null,
      taxon_meaning_id: parseInt(item.taxon_meaning_id, 10) || null,
      parent_id: parseInt(item.parent_id, 10) || null,
      taxon: item.taxon,
      preferred_taxon: item.preferred_taxon || null,
      language_iso: item.language_iso,
      external_key: item.external_key || null,
      data: item.attributes ? JSON.parse(item.attributes) : {},
    }));

    await db.query({
      sql: `DELETE FROM species WHERE list_cid = "${this.cid}"`,
    });

    // batch insert species for better performance
    const BATCH_SIZE = 500;

    // begin transaction for better performance
    await db.query({ sql: 'BEGIN TRANSACTION' });

    try {
      // eslint-disable-next-line no-restricted-syntax
      for (let i = 0; i < parsedData.length; i += BATCH_SIZE) {
        const batch = parsedData.slice(i, i + BATCH_SIZE);

        const placeholders = batch
          .map((_item: unknown, idx: number) => {
            const off = idx * 9;
            return `($${off + 1}, $${off + 2}, $${off + 3}, $${off + 4}, $${off + 5}, $${off + 6}, $${off + 7}, $${off + 8}, $${off + 9})`;
          })
          .join(',');

        const params = batch.flatMap((item: (typeof parsedData)[0]) => [
          item.taxa_taxon_list_id,
          this.cid,
          item.taxon_group_id,
          item.preferred_taxa_taxon_list_id,
          item.parent_id,
          item.external_key,
          item.language_iso,
          item.taxon,
          JSON.stringify(item.data),
        ]);

        // eslint-disable-next-line no-await-in-loop
        await db.query({
          sql: `
            INSERT OR REPLACE INTO species (
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
      console.log('🇬🇧', error);

      await db.query({ sql: 'ROLLBACK' });

      throw error;
    }
  }
}

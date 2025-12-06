import { autorun, observable } from 'mobx';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { alias, QueryBuilder } from 'drizzle-orm/sqlite-core';
import { CountryCode } from 'common/config/countries';
import { getLanguageIso } from 'common/config/languages';
import appModel from 'common/models/app';
import speciesLists from 'common/models/collections/speciesLists';
import { speciesStore } from 'common/models/store';
import species from './data.json';

export const abundances = {
  A: 'Absent',
  P: 'Present',
  'P?': 'Possibly present',
  M: 'Regular migrant',
  I: 'Irregular vagrant',
  Ex: 'Regionally extinct',
} as const;

export type AbundanceCode = keyof typeof abundances;

export interface Species {
  id?: number;
  sort_id?: number;
  warehouse_id: number;
  external_key: string;
  taxon: string;
  commonName?: string;
  family?: string;
  descriptionKey?: string;
  image_copyright?: string[] | null;
  abundance: {
    [key in Exclude<CountryCode, 'UK' | 'ELSEWHERE'>]?: AbundanceCode;
  };
}

const speciesWithCommonNames = observable(species);

// attach commonName field for easier access
speciesLists.ready.then(async () => {
  autorun(async () => {
    try {
      // eslint-disable-next-line no-unused-expressions
      speciesLists.data.length; // track speciesLists changes

      const ids = species
        .filter(sp => !!sp.descriptionKey) // optimise by only looking for species with descriptionKey
        .map(sp => sp.warehouse_id);

      const synonym: any = alias(speciesStore.table, 'synonym');

      const query: any = new QueryBuilder()
        .select({
          id: speciesStore.table.id,
          commonName: sql`${synonym.taxon} as commonName`,
        })
        .from(speciesStore.table)
        .leftJoin(
          synonym,
          and(
            eq(synonym.preferred_taxa_taxon_list_id, speciesStore.table.id),
            eq(synonym.language_iso, getLanguageIso(appModel.data.language))
          )
        )
        .where(inArray(speciesStore.table.id, ids))
        .groupBy(speciesStore.table.id); // we only want one common name per species

      const res: any = await speciesStore.db.query(query.toSQL());

      // get id-name map for easy lookup
      const commonNameMap: { [id: number]: string } = {};
      res.forEach((r: { id: number; commonName: string }) => {
        commonNameMap[r.id] = r.commonName;
      });

      // assign common names to species
      speciesWithCommonNames.forEach(sp =>
        Object.assign(sp, { commonName: commonNameMap[sp.warehouse_id] })
      );
    } catch (error) {
      console.error('Error fetching common names for species:', error);
    }
  });
});

export default speciesWithCommonNames;

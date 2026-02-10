import { autorun, observable } from 'mobx';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { alias, QueryBuilder } from 'drizzle-orm/sqlite-core';
import { IonIcon } from '@ionic/react';
import { CountryCode } from 'common/config/countries';
import { getLanguageIso } from 'common/config/languages';
import bumblebeeIcon from 'common/images/bumblebee.svg';
import butterflyIcon from 'common/images/butterfly.svg';
import dragonflyIcon from 'common/images/dragonfly.svg';
import mothIcon from 'common/images/moth.svg';
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

export type Species = {
  id?: number;
  sortId?: number;
  warehouseId: number;
  externalKey: string;
  taxon: string;
  commonName?: string;
  family?: string;
  descriptionKey?: string;
  imageCopyright?: string[] | null;
  abundance: Partial<
    Record<Exclude<CountryCode, 'UK' | 'ELSEWHERE'>, AbundanceCode>
  >;
};

const speciesWithCommonNames = observable<Species>(species);

const scientificNameToSpeciesMap: Record<string, Species> = {};
speciesWithCommonNames.forEach(sp => {
  scientificNameToSpeciesMap[sp.taxon] = sp;
});

// attach commonName field for easier access
speciesLists.ready.then(async () => {
  autorun(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      speciesLists.data.length; // track speciesLists changes

      const ids = species
        .filter(sp => !!sp.descriptionKey) // optimise by only looking for species with descriptionKey
        .map(sp => sp.warehouseId);

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
      const commonNameMap: Record<number, string> = {};
      res.forEach((r: { id: number; commonName: string }) => {
        commonNameMap[r.id] = r.commonName;
      });

      // assign common names to species
      speciesWithCommonNames.forEach(sp =>
        Object.assign(sp, { commonName: commonNameMap[sp.warehouseId] })
      );
    } catch (error) {
      console.error('Error fetching common names for species:', error);
    }
  });
});

export const getSpeciesProfileByName = (scientificName: string) =>
  scientificNameToSpeciesMap[scientificName];

export const speciesGroupIcons = {
  104: butterflyIcon,
  114: mothIcon,
  107: dragonflyIcon,
  110: bumblebeeIcon,
};

export const getSpeciesProfileImage = ({
  scientificName,
  taxonGroupId,
}: {
  scientificName: string;
  taxonGroupId?: number;
}) => {
  const profile = getSpeciesProfileByName(scientificName);

  const hasImage = profile?.imageCopyright?.length;
  if (hasImage)
    return (
      <img
        src={`/images/${profile.id}_thumbnail.png`}
        className="h-full w-full object-cover p-1"
      />
    );

  return (
    <IonIcon
      icon={
        taxonGroupId ? (speciesGroupIcons as any)[taxonGroupId] : butterflyIcon
      }
      className="size-8 opacity-75"
    />
  );
};

export default speciesWithCommonNames;

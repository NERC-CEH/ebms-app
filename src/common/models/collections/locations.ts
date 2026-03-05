import { reaction } from 'mobx';
import axios from 'axios';
import { camelCase, mapKeys } from 'lodash';
import { z, ZodError } from 'zod';
import {
  device,
  LocationCollection as LocationCollectionBase,
  LocationCollectionOptions,
  byGroupMembershipStatus,
  GroupLocationData,
  byLocationType,
  LocationType,
  isAxiosNetworkError,
  HandledError,
} from '@flumens';
import config from 'common/config';
import userModel from 'models/user';
import Location, {
  dtoSchema,
  Data as RemoteLocationAttributes,
} from '../location';
import { locationsStore as store } from '../store';
import groups from './groups';
import taxonLists from './taxonLists';

export class LocationsCollection extends LocationCollectionBase<Location> {
  declare Model: typeof Location;

  constructor(options: LocationCollectionOptions<Location>) {
    super(options);

    const fetchFirstTime = () => {
      if (
        !this.data.length &&
        device.isOnline &&
        userModel.isLoggedIn() &&
        !this.isSynchronising
      ) {
        this.fetchRemote().catch();
      }
    };

    this.ready?.then(fetchFirstTime);

    const onLoginChange = async (newEmail: any) => {
      if (!newEmail) return;

      await this.ready;

      console.log(`📚 Collection: ${this.id} collection email has changed`);
      fetchFirstTime();
    };
    const getEmail = () => userModel.data.email;
    reaction(getEmail, onLoginChange);
  }

  async fetchRemote(
    params: { type?: 'sites' | 'transects' | 'mothTraps' } = {}
  ) {
    console.log(`📚 Collection: ${this.id} collection fetching`);
    this.remote.synchronising = true;

    const { type } = params;

    if (!type || type === 'transects') {
      const docs = await this.fetchTransects();
      const locationList = docs.map(({ id }) => id!);
      const sectionDocs = await this.fetchTransectSections(locationList);
      const newModels = [...docs, ...sectionDocs].map(doc =>
        this.Model.fromDTO(doc)
      );
      this.upsert(...newModels);
      await Promise.all(newModels.map(m => m.save()));
      await this.removeStaleLocalModels(newModels, [
        LocationType.Transect,
        LocationType.TransectSection,
      ]);
    }

    if (!type || type === 'mothTraps') {
      const docs = await this.fetchRemoteByType(LocationType.MothTrap);
      const newModels = docs.map(doc => this.Model.fromDTO(doc));
      this.upsert(...newModels);
      await Promise.all(newModels.map(m => m.save()));

      await this.removeStaleLocalModels(newModels, [LocationType.MothTrap]);
    }

    if (!type || type === 'sites') {
      const docs = await this.fetchRemoteByType(LocationType.Site);
      const newModels = docs.map(doc => this.Model.fromDTO(doc));

      const groupDocs = await this.fetchGroupLocations();
      const newGroupModels = groupDocs.map(([doc, metadata]) =>
        this.Model.fromDTO(doc, { metadata })
      );
      newModels.push(...newGroupModels);
      this.upsert(...newModels);
      await Promise.all(newModels.map(m => m.save()));

      // link groups to locations
      await Promise.all(
        newModels.map(async location => {
          const group = groups.idMap.get(location.metadata.groupId!);
          await group?.linkLocation(location);
        })
      );

      await this.fetchAndLinkTaxonLists(newModels);

      await this.removeStaleLocalModels(newModels, [LocationType.Site]);
    }

    this.remote.synchronising = false;

    console.log(`📚 Collection: ${this.id} collection fetching done`);
  }

  /**
   *  Download all species lists and link matching ones to locations
   * */
  private async fetchAndLinkTaxonLists(locations: Location[]) {
    // build a lookup from warehouse id to location model
    const locationIdMap = new Map(
      locations.filter(l => l.id).map(l => [String(l.id), l])
    );

    const allTaxonLists = await taxonLists.fetchRemoteWithLinks();

    // for each species list, find matching site locations and link them
    await Promise.all(
      allTaxonLists.map(async ({ model: taxonList, locationIds }) => {
        const matchingLocations = locationIds
          .map(id => locationIdMap.get(id))
          .filter(Boolean) as Location[];

        if (!matchingLocations.length) return; // list doesn't link to any locations

        // persist the species list to the local store
        await taxonList.save(true);

        taxonLists.upsert(taxonList);

        // link species list to each matching location bidirectionally
        await Promise.all(
          matchingLocations.map(l => taxonList.linkLocation(l))
        );

        // download the taxon list for this species list
        await taxonList.fetchRemoteSpecies();
      })
    );
  }

  private async removeStaleLocalModels(
    models: Location[],
    type: LocationType[]
  ) {
    const newExternalKeys = new Set(models.map(m => m.cid));

    // remove stale non-draft models that are no longer in the remote
    const stale = this.filter(model => {
      if (!type.includes(model.data.locationTypeId as any)) return false;

      const isLocalDuplicate = !model.id && newExternalKeys.has(model.cid); // can happen if uploaded but not reflected back in the app
      const modelIsStale = model.id && !newExternalKeys.has(model.cid); // once uploaded, but deleted from remote
      return modelIsStale || isLocalDuplicate;
    });
    await Promise.all(stale.map(m => m.destroy()));
  }

  private async fetchGroupLocations() {
    console.log(`📚 Collection: ${this.id} collection fetching locations`);

    const transformToLocation = (doc: GroupLocationData) => {
      const transformedDoc: RemoteLocationAttributes = {
        id: doc.locationId,
        createdOn: doc.locationCreatedOn,
        updatedOn: doc.locationUpdatedOn,
        lat: doc.locationLat,
        lon: doc.locationLon,
        name: doc.locationName,
        locationTypeId: LocationType.Site,
        parentId: null,
        boundaryGeom: doc.locationBoundaryGeom,
        code: doc.locationCode,
        centroidSref: doc.locationCentroidSref,
        centroidSrefSystem: doc.locationCentroidSrefSystem,
        createdById: doc.locationCreatedById,
        updatedById: doc.locationUpdatedById,
        externalKey: doc.locationExternalKey,
        public: 'f',
      } as any; // any - to fix Moth trap attrs

      const metadata = { groupId: doc.groupId } as any;
      return [transformedDoc, metadata];
    };

    const groupLocationDTOs = await Promise.all(
      groups
        .filter(byGroupMembershipStatus('member'))
        .map(group => group.fetchRemoteLocations())
    );

    const docs = groupLocationDTOs.flat().map(transformToLocation);

    console.log(
      `📚 Collection: ${this.id} collection fetching locations done ${docs.length} documents`
    );

    return docs;
  }

  private async fetchTransectSections(
    locationList: string[]
  ): Promise<RemoteLocationAttributes[]> {
    if (!locationList?.length) return [];

    const url = `${this.remote.url}/index.php/services/rest/reports/projects/ebms/ebms_app_sections_list_2.xml`;

    const token = await userModel.getAccessToken();

    /* eslint-disable @typescript-eslint/naming-convention */
    const options = {
      params: {
        website_id: 118,
        userID: userModel.id,
        location_list: locationList.join(','),
        limit: 10000,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 80000,
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    try {
      const res = await axios.get(url, options);

      const getValues = (doc: any) =>
        mapKeys(doc, (_, key) => (key.includes(':') ? key : camelCase(key)));

      const docs = res.data.data.map(getValues);
      const remoteSchema = dtoSchema.extend({
        // @ts-expect-error fix this once drizzle-orm supports zod v4
        parentId: z.string(), // this is required to join with transects
      });

      docs.forEach(remoteSchema.parse);

      return docs;
    } catch (error: any) {
      if (axios.isCancel(error)) return [];

      if (isAxiosNetworkError(error))
        throw new HandledError(
          'Request aborted because of a network issue (timeout or similar).'
        );

      if ('issues' in error) {
        const err: ZodError = error;
        throw new Error(
          err.issues.map(e => `${e.path.join(' ')} ${e.message}`).join(' ')
        );
      }

      throw error;
    }
  }

  private async fetchRemoteByType(
    locationTypeId: number | string
  ): Promise<RemoteLocationAttributes[]> {
    const url = `${this.remote.url}/index.php/services/rest/locations`;

    const token = await userModel.getAccessToken();

    /* eslint-disable @typescript-eslint/naming-convention */
    const options = {
      params: {
        location_type_id: locationTypeId,
        public: false,
        verbose: 1,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 80000,
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    try {
      const res = await axios.get(url, options);

      const getValues = (doc: any) =>
        mapKeys(doc.values, (_, key) =>
          key.includes(':') ? key : camelCase(key)
        );
      const docs = res.data.map(getValues);

      docs.forEach(dtoSchema.parse);

      return docs;
    } catch (error: any) {
      if (axios.isCancel(error)) return [];

      if (isAxiosNetworkError(error))
        throw new HandledError(
          'Request aborted because of a network issue (timeout or similar).'
        );

      if ('issues' in error) {
        const err: ZodError = error;
        throw new Error(
          err.issues.map(e => `${e.path.join(' ')} ${e.message}`).join(' ')
        );
      }

      throw error;
    }
  }

  private async fetchTransects(): Promise<RemoteLocationAttributes[]> {
    const url = `${this.remote.url}/index.php/services/rest/reports/projects/ebms/ebms_app_sites_list_2.xml`;

    const token = await userModel.getAccessToken();

    /* eslint-disable @typescript-eslint/naming-convention */
    const options = {
      params: {
        location_type_id: '',
        locattrs: '',
        website_id: 118,
        userID: userModel.id,
        limit: 10000,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 80000,
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    try {
      const res = await axios.get(url, options);

      const getValues = (doc: any) =>
        mapKeys(doc, (_, key) => (key.includes(':') ? key : camelCase(key)));

      const docs = res.data.data.map(getValues);
      docs.forEach(dtoSchema.parse);

      return docs;
    } catch (error: any) {
      if (axios.isCancel(error)) return [];

      if (isAxiosNetworkError(error))
        throw new HandledError(
          'Request aborted because of a network issue (timeout or similar).'
        );

      if ('issues' in error) {
        const err: ZodError = error;
        throw new Error(
          err.issues.map(e => `${e.path.join(' ')} ${e.message}`).join(' ')
        );
      }

      throw error;
    }
  }
}

const collection = new LocationsCollection({
  store,
  Model: Location,
  url: config.backend.indicia.url,
  getAccessToken: () => userModel.getAccessToken(),
});

// (window as any).locationCollection = collection;

export const byType = byLocationType;

export default collection;

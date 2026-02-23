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

  async fetchRemote() {
    console.log(`📚 Collection: ${this.id} collection fetching`);
    this.remote.synchronising = true;

    const mothTraps = await this.fetchRemoteByType(LocationType.MothTrap);
    const transects = await this.fetchTransects();
    const locationList = transects.map(({ id }) => id!);
    const transectSections = await this.fetchTransectSections(locationList);
    const groupSites = await this.fetchGroupLocations();
    const mySites = await this.fetchRemoteByType(LocationType.Site);

    const docs = [
      ...mySites,
      ...mothTraps,
      ...transects,
      ...transectSections,
      ...groupSites,
    ];

    const models = docs.map(doc =>
      Array.isArray(doc)
        ? this.Model.fromDTO(doc[0], { metadata: doc[1] }) // with metadata
        : this.Model.fromDTO(doc)
    );

    const newExternalKeys = new Set(models.map(m => m.cid));

    // replace existing models in-place or push new ones
    await Promise.all(
      models.map(async model => {
        const existingIndex = this.data.findIndex(
          (m: Location) => m.id === model.id
        );

        if (existingIndex !== -1) {
          const existingModel = this.data[existingIndex];
          this.data.spliceWithArray(existingIndex, 1, [model]);
          await existingModel.destroy(); // need to destroy for unique sql constraints to work when saving the new model with the same cid
        } else {
          this.push(model);
        }

        await model.save();
      })
    );

    // remove stale non-draft models that are no longer in the remote
    const stale = this.filter((model: Location) => {
      const isLocalDuplicate = !model.id && newExternalKeys.has(model.cid); // can happen if uploaded but not reflected back in the app
      const modelIsStale = model.id && !newExternalKeys.has(model.cid); // once uploaded, but deleted from remote
      return modelIsStale || isLocalDuplicate;
    });
    await Promise.all(stale.map(m => m.destroy()));

    this.remote.synchronising = false;

    console.log(`📚 Collection: ${this.id} collection fetching done`);
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
        .map(m => m.fetchRemoteLocations())
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

export const byType = byLocationType;

export default collection;

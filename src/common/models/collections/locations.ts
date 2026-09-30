import { reaction } from 'mobx';
import axios, { AxiosError } from 'axios';
import { camelCase, mapKeys } from 'lodash';
import { z, ZodError } from 'zod';
import {
  device,
  LocationCollection as LocationCollectionBase,
  LocationCollectionOptions,
  byGroupMembershipStatus,
  byLocationType,
  LocationType as LocType,
  LocationDTO,
  isAxiosNetworkError,
  HandledError,
} from '@flumens';
import config from 'common/config';
import userModel from 'models/user';
import Location, { dtoSchema, trapCountAttr } from '../location';
import { locationsStore as store } from '../store';
import groups from './groups';
import taxonLists from './taxonLists';

type UnknownRecord = Record<string, unknown>;

const normalizeKeys = (doc: UnknownRecord) =>
  mapKeys(doc, (_, key) => (key.includes(':') ? key : camelCase(key)));

const getUnique = (docs: LocationDTO[]) => [
  ...new Map(docs.map(doc => [doc.id, doc])).values(),
];

const validateDTO = (
  doc: UnknownRecord,
  schema: z.ZodSchema<LocationDTO> = dtoSchema
) => schema.parse(doc);

const throwFetchError = (error: unknown) => {
  if (isAxiosNetworkError(error as AxiosError))
    throw new HandledError(
      'Request aborted because of a network issue (timeout or similar).'
    );

  if (error instanceof ZodError) {
    throw new Error(
      error.issues.map(e => `${e.path.join(' ')} ${e.message}`).join(' ')
    );
  }

  throw error;
};

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

    const onLoginChange = async (newEmail?: string) => {
      if (!newEmail) return;

      await this.ready;

      console.log(`📚 Collection: ${this.id} collection email has changed`);
      fetchFirstTime();
    };
    const getEmail = () => userModel.data.email;
    reaction(getEmail, onLoginChange);
  }

  async fetchRemote(
    params: { type?: 'sites' | 'transects' | 'mothTraps' | 'baitTraps' } = {}
  ) {
    console.log(`📚 Collection: ${this.id} fetching`);
    this.remote.synchronising = true;

    const { type } = params;
    const groupDocs = await this.fetchGroupLocations();
    const refreshedModels: Location[] = [];

    if (!type || type === 'transects') {
      const docs = await this.fetchTransects();
      const transectGroupDocs = groupDocs
        .map(([doc]) => doc)
        .filter(doc => doc.locationTypeId === LocType.Transect);
      const uniqueDocs = getUnique([...transectGroupDocs, ...docs]);
      const locationList = uniqueDocs.map(({ id }) => id!);
      const sectionDocs = await this.fetchTransectSections(locationList);
      const newModels = [...uniqueDocs, ...sectionDocs].map(doc =>
        this.Model.fromDTO(doc)
      );
      this.upsert(...newModels);
      await Promise.all(newModels.map(m => m.save()));
      refreshedModels.push(...newModels);
      await this.removeStaleLocalModels(newModels, [
        LocType.Transect,
        LocType.TransectSection,
      ]);
    }

    if (!type || type === 'mothTraps') {
      const docs = await this.fetchRemoteByType(LocType.MothTrap);
      const trapGroupDocs = groupDocs
        .map(([doc]) => doc)
        .filter(doc => doc.locationTypeId === LocType.MothTrap);
      const uniqueDocs = getUnique([...trapGroupDocs, ...docs]);
      const newModels = uniqueDocs.map(doc => this.Model.fromDTO(doc));
      this.upsert(...newModels);
      await Promise.all(newModels.map(m => m.save()));
      refreshedModels.push(...newModels);

      await this.removeStaleLocalModels(newModels, [LocType.MothTrap]);
    }

    if (!type || type === 'baitTraps') {
      const siteDocs = await this.fetchBaitTrapSites();
      const trapGroupDocs = groupDocs
        .map(([doc]) => doc)
        .filter(doc => doc.locationTypeId === LocType.BaitTrapSite);
      const uniqueDocs = getUnique([...trapGroupDocs, ...siteDocs]);
      const newSiteModels = uniqueDocs.map(doc => this.Model.fromDTO(doc));
      this.upsert(...newSiteModels);
      await Promise.all(newSiteModels.map(m => m.save()));
      refreshedModels.push(...newSiteModels);

      await this.removeStaleLocalModels(newSiteModels, [LocType.BaitTrapSite]);

      const locationList = uniqueDocs.map(({ id }) => id!);
      const trapDocs = await this.fetchBaitTraps(locationList);
      const newTrapModels = trapDocs.map(doc => this.Model.fromDTO(doc));
      this.upsert(...newTrapModels);
      await Promise.all(newTrapModels.map(m => m.save()));
      refreshedModels.push(...newTrapModels);

      await this.removeStaleLocalModels(newTrapModels, [LocType.BaitTrap]);
    }

    if (!type || type === 'sites') {
      const docs = await this.fetchRemoteByType(LocType.Site);
      const siteGroupDocs = groupDocs
        .map(([doc]) => doc)
        .filter(doc => doc.locationTypeId === LocType.Site);
      const uniqueDocs = getUnique([...siteGroupDocs, ...docs]);
      const newModels = uniqueDocs.map(doc => this.Model.fromDTO(doc));
      this.upsert(...newModels);
      await Promise.all(newModels.map(m => m.save()));
      refreshedModels.push(...newModels);

      await this.removeStaleLocalModels(newModels, [LocType.Site]);
    }

    await this.linkGroupLocations(groupDocs, refreshedModels);
    await this.fetchAndLinkTaxonLists(refreshedModels);

    this.remote.synchronising = false;

    console.log(`📚 Collection: ${this.id} collection fetching done`);
  }

  private async linkGroupLocations(
    groupDocs: [LocationDTO, string][],
    locations: Location[]
  ) {
    const linking = groupDocs.map(async ([doc, groupId]) => {
      const location = locations.find(model => model.id === doc.id);
      if (location) await groups.idMap.get(groupId)?.linkLocation(location);
    });
    await Promise.all(linking);
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

  private async removeStaleLocalModels(models: Location[], type: LocType[]) {
    const newExternalKeys = new Set(models.map(m => m.cid));

    // remove stale non-draft models that are no longer in the remote
    const stale = this.filter(model => {
      if (!type.includes(model.data.locationTypeId as LocType)) return false;

      const isLocalDuplicate = !model.id && newExternalKeys.has(model.cid); // can happen if uploaded but not reflected back in the app
      const modelIsStale = model.id && !newExternalKeys.has(model.cid); // once uploaded, but deleted from remote
      return modelIsStale || isLocalDuplicate;
    });
    await Promise.all(stale.map(m => m.destroy()));
  }

  private async fetchGroupLocations() {
    //! use this once merged https://github.com/Indicia-Team/warehouse/pull/608

    //   const transformGroupLocation = (doc: GroupLocationData) => {
    //   const data = mapKeys(doc, (_, key) => {
    //     const locationKey =
    //       key === 'locationTypeId'
    //         ? key
    //         : camelCase(key.replace(/^location(?=[A-Z])/, ''));

    //     // fetchRemoteLocations camel-cases custom attribute keys too.
    //     return locationKey.replace(/^locAttr(\d+)$/, 'locAttr:$1');
    //   });

    //   // The unprefixed ID belongs to the group-location link, not the location.
    //   return validateDTO({ ...data, id: doc.locationId });
    // };

    // const memberGroups = groups.filter(byGroupMembershipStatus('member'));
    // const groupDocs = memberGroups.map(async group => {
    //   const docs = await group.fetchRemoteLocations();
    //   return docs.map<[LocationDTO, string]>(doc => [
    //     transformGroupLocation(doc),
    //     group.id!,
    //   ]);
    // });

    // return (await Promise.all(groupDocs)).flat();

    const memberGroups = groups.filter(byGroupMembershipStatus('member'));
    const groupLocationLinks = (
      await Promise.all(
        memberGroups.map(async group => {
          const docs = await group.fetchRemoteLocations();
          return docs.map(doc => ({
            locationId: doc.locationId,
            groupId: group.id!,
          }));
        })
      )
    ).flat();

    if (!groupLocationLinks.length) return [];

    const token = await userModel.getAccessToken();
    const ids = [...new Set(groupLocationLinks.map(link => link.locationId))];
    // The group endpoint omits location type, parent and trap attributes.
    // Fetch the full location rather than treating every project location as a count site.
    const docs = await Promise.all(
      ids.map(async id => {
        const url = `${this.remote.url}/index.php/services/rest/locations/${id}`;
        const response = await axios.get<{ values: UnknownRecord }>(url, {
          params: { verbose: 1 },
          headers: { Authorization: `Bearer ${token}` },
          timeout: 80000,
        });
        return validateDTO(
          normalizeKeys(response.data.values),
          dtoSchema.extend({ id: z.literal(id) })
        );
      })
    );
    const docsMap = new Map(docs.map(doc => [doc.id, doc]));
    return groupLocationLinks.map<[LocationDTO, string]>(
      ({ locationId, groupId }) => [docsMap.get(locationId)!, groupId]
    );
  }

  private async fetchTransectSections(locationList: string[]) {
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
      headers: { Authorization: `Bearer ${token}` },
      timeout: 80000,
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    try {
      const res = await axios.get<{ data: UnknownRecord[] }>(url, options);
      const remoteSchema = dtoSchema.extend({ parentId: z.string() }); // this is required to join with transects

      return res.data.data
        .map(normalizeKeys)
        .map(doc => validateDTO(doc, remoteSchema));
    } catch (error) {
      if (axios.isCancel(error)) return [];
      return throwFetchError(error);
    }
  }

  private async fetchRemoteByType(
    locationTypeId: number | string,
    publicLocations = false
  ) {
    const url = `${this.remote.url}/index.php/services/rest/locations`;
    const token = await userModel.getAccessToken();

    /* eslint-disable @typescript-eslint/naming-convention */
    const options = {
      params: {
        location_type_id: locationTypeId,
        public: publicLocations,
        verbose: 1,
      },
      headers: { Authorization: `Bearer ${token}` },
      timeout: 80000,
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    try {
      const res = await axios.get<{ values: UnknownRecord }[]>(url, options);
      return res.data
        .map(doc => normalizeKeys(doc.values))
        .map(doc => validateDTO(doc));
    } catch (error) {
      if (axios.isCancel(error)) return [];
      return throwFetchError(error);
    }
  }

  private async fetchBaitTrapSites() {
    const url = `${this.remote.url}/index.php/services/rest/reports/projects/ebms/ebms_shared_locations.xml`;
    const token = await userModel.getAccessToken();

    const options = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      params: { location_type_id: 24555, locattrs: '428', limit: 10000 },
      headers: { Authorization: `Bearer ${token}` },
      timeout: 80000,
    };

    try {
      const res = await axios.get<{ data: UnknownRecord[] }>(url, options);
      return res.data.data
        .map(normalizeKeys)
        .map(doc => ({ ...doc, [trapCountAttr.id]: doc.attrLocation428 }))
        .map(doc => validateDTO(doc));
    } catch (error) {
      if (axios.isCancel(error)) return [];
      return throwFetchError(error);
    }
  }

  private async fetchBaitTraps(locationList: string[]) {
    if (!locationList?.length) return [];

    const url = `${this.remote.url}/index.php/services/rest/reports/projects/ebms/ebms_shared_locations.xml`;
    const token = await userModel.getAccessToken();
    const options = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      params: { location_type_id: 24554, limit: 10000 },
      headers: { Authorization: `Bearer ${token}` },
      timeout: 80000,
    };

    try {
      const res = await axios.get<{ data: UnknownRecord[] }>(url, options);
      const remoteSchema = dtoSchema.extend({ parentId: z.string() });

      return res.data.data
        .map(normalizeKeys)
        .map(doc => validateDTO(doc, remoteSchema));
    } catch (error) {
      if (axios.isCancel(error)) return [];
      return throwFetchError(error);
    }
  }

  private async fetchTransects() {
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
      headers: { Authorization: `Bearer ${token}` },
      timeout: 80000,
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    try {
      const res = await axios.get<{ data: UnknownRecord[] }>(url, options);
      return res.data.data.map(normalizeKeys).map(doc => validateDTO(doc));
    } catch (error) {
      if (axios.isCancel(error)) return [];
      return throwFetchError(error);
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

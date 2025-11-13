import { observable } from 'mobx';
import axios from 'axios';
import {
  Collection,
  device,
  HandledError,
  isAxiosNetworkError,
} from '@flumens';
import config from 'common/config';
import appModel from '../app';
import SpeciesList, { DTO } from '../speciesList';
import { speciesListsStore } from '../store';

type RemoteFetchParams = {
  limit?: number;
  locationCode?: string;
  lat?: number;
  lon?: number;
  updatedOn?: number;
};

export type SpeciesData = {
  taxa_taxon_list_id: string;
  preferred_taxa_taxon_list_id: string;
  taxon_meaning_id: string;
  taxon: string;
  preferred_taxon: string;
  language_iso: string;
  taxon_group: number;
  external_key: string;
  parent_id?: string;
  attributes?: string;
};

class SpeciesListCollection extends Collection<SpeciesList> {
  protected remote: {
    synchronising: boolean;
    url: string;
    getAccessToken: () => Promise<string>;
  };

  constructor() {
    super({ id: 'speciesLists', store: speciesListsStore, Model: SpeciesList });

    this.remote = observable({
      synchronising: false,
      url: config.backend.indicia.url,
      getAccessToken: () =>
        Promise.resolve(process.env.APP_WAREHOUSE_ANON_TOKEN!),
    });

    // refresh installed species lists in the background
    this.ready.then(() => this.refreshInstalledLists());
  }

  async fetchRemote(params: RemoteFetchParams = {}) {
    console.log(`📚 Collection: ${this.id} collection fetching`);

    this.remote.synchronising = true;

    try {
      const {
        limit = 1000,
        locationCode = '',
        lat = '',
        lon = '',
        updatedOn,
      } = params;

      const accessToken = await this.remote.getAccessToken();

      const warehouseURL = 'https://warehouse1.indicia.org.uk';
      const url = `${warehouseURL}/index.php/services/rest/reports/projects/ebms/ebms_countries_and_other_ttl_attr_profiles_for_app.xml`;

      const requestParams = {
        updated_on_filter: updatedOn ? new Date(updatedOn).toISOString() : '',
        species_groups_filter: '',
        description_filter: '',
        lon,
        lat,
        location_code_filter: locationCode,
        name_filter: '',
        limit,
      };

      const options = {
        params: requestParams,
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 80000,
      };

      const res = await axios.get(url, options);

      const dtos: DTO[] = res.data.data.map(
        (item: any): DTO => ({
          id: item.id,
          type: item.type,
          title: item.name,
          description: item.description,
          taxonGroups: JSON.parse(item.species_groups || '[]'),
          updatedOn: new Date(item.updated_on).getTime(),
          coordinates: item.coordinates
            ?.replaceAll('{', '')
            .replaceAll('}', '')
            .split(',')
            .map(parseFloat),
          size: Number.parseInt(item.taxa_count, 10) || 0,
          locationCode: item.location_code,
        })
      );

      // create ephemeral models (not stored in local database)
      const models: SpeciesList[] = dtos.map((dto: DTO) =>
        SpeciesList.fromDTO(dto, { skipStore: true })
      );

      console.log(
        `📚 Collection: ${this.id} collection fetching done ${dtos.length} documents`
      );

      this.remote.synchronising = false;

      return models;
    } catch (error: any) {
      this.remote.synchronising = false;

      if (axios.isCancel(error)) {
        return [];
      }

      if (isAxiosNetworkError(error)) {
        throw new HandledError(
          'Request aborted because of a network issue (timeout or similar).'
        );
      }

      throw error;
    }
  }

  get isSynchronising(): boolean {
    return this.remote.synchronising;
  }

  async refreshInstalledLists() {
    if (!device.isOnline) return;

    try {
      // get last update date or default to yesterday
      const getYesterdayDate = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.getTime();
      };

      const lastUpdateDate =
        appModel.data.speciesListsUpdatedAt || getYesterdayDate();

      console.log(
        '📚 Collection: speciesLists fetching species lists updated since:',
        lastUpdateDate
      );

      // fetch latest species lists
      const latestLists = await this.fetchRemote({ updatedOn: lastUpdateDate });
      if (!latestLists.length) return;

      // filter lists that exist locally
      const listsToRefresh = latestLists.filter(list =>
        this.cidMap.has(list.cid)
      );
      if (!listsToRefresh.length) return;

      // refresh each list
      await Promise.all(listsToRefresh.map(list => list.fetchRemoteSpecies()));

      // update last refresh date
      appModel.data.speciesListsUpdatedAt = Date.now();
      await appModel.save();

      // eslint-disable-next-line no-console
      console.log('📚 Collection: speciesLists refresh completed');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error refreshing species lists:', error);
    }
  }
}

const speciesListsCollection = new SpeciesListCollection();

export default speciesListsCollection;

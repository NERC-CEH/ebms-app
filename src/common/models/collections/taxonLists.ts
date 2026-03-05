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
import { taxonListsStore } from '../store';
import TaxonList, { DTO } from '../taxonList';

type RemoteFetchParams = {
  limit?: number;
  locationCode?: string;
  lat?: number;
  lon?: number;
  updatedOn?: number;
};

class TaxonListCollection extends Collection<TaxonList> {
  protected remote: {
    synchronising: boolean;
    url: string;
    getAccessToken: () => Promise<string>;
  };

  constructor() {
    super({ id: 'taxonLists', store: taxonListsStore, Model: TaxonList });

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
    const models = await this.fetchRemoteWithLinks(params);
    return models.map(({ model }) => model);
  }

  async fetchRemoteWithLinks(params: RemoteFetchParams = {}) {
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

      /* eslint-disable @typescript-eslint/naming-convention */
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
      /* eslint-enable @typescript-eslint/naming-convention */

      const options = {
        params: requestParams,
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 80000,
      };

      const res = await axios.get(url, options);

      type Parsed = { doc: DTO; groupIds: string[]; locationIds: string[] };

      const parsed: Parsed[] = res.data.data.map((item: any) => ({
        doc: {
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
        },
        groupIds: JSON.parse(item.projects || '[]').map(String),
        locationIds: JSON.parse(item.locations || '[]').map(String),
      }));

      // create ephemeral models (not stored in local database)
      const full = parsed.map(({ doc, groupIds, locationIds }) => ({
        model: TaxonList.fromDTO(doc, { skipStore: true }),
        groupIds,
        locationIds,
      }));

      console.log(
        `📚 Collection: ${this.id} collection fetching done ${parsed.length} documents`
      );

      this.remote.synchronising = false;

      return full;
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
        appModel.data.taxonListsUpdatedAt || getYesterdayDate();

      console.log(
        '📚 Collection: taxonLists fetching species lists updated since:',
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
      appModel.data.taxonListsUpdatedAt = Date.now();
      await appModel.save();

      // eslint-disable-next-line no-console
      console.log('📚 Collection: taxonLists refresh completed');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error refreshing species lists:', error);
    }
  }

  async fetchDefaultCountryTaxonList(newCountry: string) {
    if (newCountry === 'ELSEWHERE') return;

    const newCountryNormalised =
      newCountry === 'UK' ? 'GB' : newCountry.replace('_', ': ');
    const lists = await this.fetchRemote({
      locationCode: newCountryNormalised,
    });

    const list = lists.find(l => l.data.locationCode === newCountryNormalised);
    if (!list) throw new Error('No default country species list found');

    this.upsert(list);

    await list.save(true);
    await list.fetchRemoteSpecies();
  }
}

const taxonListsCollection = new TaxonListCollection();

export default taxonListsCollection;

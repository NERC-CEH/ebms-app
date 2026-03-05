import { reaction } from 'mobx';
import { device, GroupCollection as GroupCollectionBase } from '@flumens';
import config from 'common/config';
import countries from 'common/config/countries';
import userModel from 'models/user';
import appModel from '../app';
import Group from '../group';
import { groupsStore as store } from '../store';
import locations from './locations';
import taxonLists from './taxonLists';

export class GroupCollection extends GroupCollectionBase<Group> {
  constructor(options: any) {
    super(options);

    const fetchFirstTime = () => {
      if (
        !this.data.length &&
        device.isOnline &&
        userModel.isLoggedIn() &&
        !this.isSynchronising
      ) {
        this.fetchRemote({ type: 'member' }).catch();
      }
    };

    this.ready?.then(fetchFirstTime);

    const onLoginChange = async (newEmail: any) => {
      if (!newEmail) return;

      await this.ready;

      console.log(`📚 Collection: ${this.id} collection email has changed`);
      fetchFirstTime();
    };
    reaction(() => userModel.data.email, onLoginChange);
  }

  async fetchRemote(
    params: Parameters<GroupCollectionBase<Group>['fetchRemote']>[0]
  ) {
    const countryCode = appModel.data.country!;
    const countryId = countries[countryCode]?.id;

    const useCountryFilter =
      params?.type !== 'member' && Number.isFinite(countryId);

    await super.fetchRemote({
      ...params,
      // we only want to show current country groups that are not the user's member groups
      location: useCountryFilter ? countryId : undefined,
    });

    if (params?.type === 'member') {
      // we need to fetch new group-locations and link them together
      await locations.fetchRemote({ type: 'sites' });
      await this.fetchAndLinkTaxonLists();
    }
  }

  /**
   * Fetch new group-species-lists and link them together.
   */
  private async fetchAndLinkTaxonLists() {
    const allTaxonLists = await taxonLists.fetchRemoteWithLinks();
    // for each member group, find matching species lists and install them
    await Promise.all(
      allTaxonLists.map(async ({ model: taxonList, groupIds }) => {
        const matchingGroups = groupIds
          .map(id => this.idMap.get(id))
          .filter(Boolean) as Group[];

        if (!matchingGroups.length) return;

        // persist the species list to the local store
        await taxonList.save(true);

        taxonLists.upsert(taxonList);

        // link species list to each matching group bidirectionally
        await Promise.all(
          matchingGroups.map(group => taxonList.linkGroup(group))
        );

        // download the taxon list for this species list
        await taxonList.fetchRemoteSpecies();
      })
    );
  }
}

const collection = new GroupCollection({
  store,
  Model: Group,
  url: config.backend.indicia.url,
  getAccessToken: () => userModel.getAccessToken(),
});

// (window as any).groupCollection = collection;

export default collection;

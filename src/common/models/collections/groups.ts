import { reaction } from 'mobx';
import { device, GroupCollection as GroupCollectionBase } from '@flumens';
import config from 'common/config';
import countries from 'common/config/countries';
import userModel from 'models/user';
import appModel from '../app';
import Group from '../group';
import { groupsStore as store } from '../store';

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

  async fetchRemote(params: any) {
    const countryCode = appModel.data.country!;
    const countryId = countries[countryCode]?.id;

    const useCountryFilter =
      params.type !== 'member' && Number.isFinite(countryId);

    return super.fetchRemote({
      ...params,
      // we only want to show current country groups that are not the user's member groups
      location: useCountryFilter ? countryId : undefined,
    });
  }
}

const collection = new GroupCollection({
  store,
  Model: Group,
  url: config.backend.indicia.url,
  getAccessToken: () => userModel.getAccessToken(),
});

export default collection;

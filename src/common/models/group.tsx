import { GroupModel, GroupData, GroupLocationData } from '@flumens';
import config from 'common/config';
import userModel from 'models/user';
import { groupsStore } from './store';

export { type GroupData, type GroupLocationData };

class Group extends GroupModel {
  constructor(options: any) {
    super({
      ...options,
      store: groupsStore,
      url: config.backend.indicia.url,
      getAccessToken: () => userModel.getAccessToken(),
      getIndiciaUserId: () => userModel.data.indiciaUserId,
    });
  }
}

export default Group;

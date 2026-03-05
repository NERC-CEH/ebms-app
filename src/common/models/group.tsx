import { observable, IObservableArray } from 'mobx';
import {
  SQLiteInsertBuilder,
  SQLiteSyncDialect,
} from 'drizzle-orm/sqlite-core';
import {
  GroupModel,
  GroupData,
  GroupLocationData,
  GroupOptions as GroupOptionsBase,
} from '@flumens';
import config from 'common/config';
import userModel from 'models/user';
import Location from './location';
import { groupsStore } from './store';
import TaxonList from './taxonList';

export { type GroupData, type GroupLocationData };

type GroupOptions = GroupOptionsBase & {
  locationCids?: string[];
  taxonListCids?: string[];
};

class Group extends GroupModel {
  private _locationCids: IObservableArray<string>;

  private _taxonListCids: IObservableArray<string>;

  constructor({ locationCids, taxonListCids, ...options }: GroupOptions) {
    super({
      ...options,
      store: groupsStore,
      url: config.backend.indicia.url,
      getAccessToken: () => userModel.getAccessToken(),
      getIndiciaUserId: async () => userModel.data.indiciaUserId!,
    });

    this._locationCids = observable([...new Set(locationCids || [])]);
    this._taxonListCids = observable([...new Set(taxonListCids || [])]);
  }

  get locationCids(): readonly string[] {
    return this._locationCids;
  }

  get taxonListCids(): readonly string[] {
    return this._taxonListCids;
  }

  async linkLocation(location: Location) {
    if (!this._locationCids.includes(location.cid)) {
      this._locationCids.push(location.cid);

      // persist the link to the groups_location join table
      const query = new SQLiteInsertBuilder(
        groupsStore.groupsLocations.table,
        {} as any,
        new SQLiteSyncDialect()
      )
        .values({ groupCid: this.cid, locationCid: location.cid })
        .onConflictDoNothing();

      await groupsStore.groupsLocations.db.query(query.toSQL());
    }

    if (!location.groupCids.includes(this.cid)) {
      await location.linkGroup(this);
    }
  }

  async linkTaxonList(taxonList: TaxonList) {
    if (!this._taxonListCids.includes(taxonList.cid)) {
      this._taxonListCids.push(taxonList.cid);

      // persist the link to the groups_lists join table
      const query = new SQLiteInsertBuilder(
        groupsStore.groupsLists.table,
        {} as any,
        new SQLiteSyncDialect()
      )
        .values({ groupCid: this.cid, taxonListCid: taxonList.cid })
        .onConflictDoNothing();

      await groupsStore.db.query(query.toSQL());
    }

    if (!taxonList.groupCids.includes(this.cid)) {
      await taxonList.linkGroup(this);
    }
  }
}

export default Group;

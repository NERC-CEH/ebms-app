import { reaction, observable, observe } from 'mobx';
import { device, Store, Collection } from '@flumens';
import {
  GROUP_SITE_TYPE,
  RemoteAttributes as RemoteLocationAttributes,
} from 'models/location';
import userModel from 'models/user';
import GroupModel from '../../group';
import { groupsStore as store } from '../../store';
import locations from '../locations';
import {
  fetch as fetchGroups,
  fetchLocations,
  RemoteLocationAttributes as RemoteGroupLocationAttributes,
} from './service';

type constructorOptions = {
  id: string;
  store: Store;
  Model: typeof GroupModel;
};

export class Groups extends Collection<GroupModel> {
  Model: typeof GroupModel;

  _fetchedFirstTime = false;

  fetching = observable({
    isFetching: false,
  });

  constructor(options: constructorOptions) {
    super(options);

    this.Model = options.Model;

    // eslint-disable-next-line @getify/proper-arrows/name
    observe(this, (change: any) => {
      if (change.addedCount) {
        const attachCollection = (model: GroupModel) => {
          model.collection = this; // eslint-disable-line no-param-reassign
        };
        change.added.forEach(attachCollection);
      }
    });

    this.ready && this.ready.then(this._fetchFirstTime);

    const onLoginChange = async (newEmail: any) => {
      if (!newEmail) return;

      await this.ready;

      console.log(`📚 Collection: ${this.id} collection email has changed`);
      this._fetchFirstTime();
    };
    const getEmail = () => userModel.data.email;
    reaction(getEmail, onLoginChange);

    const superReset = this.reset;
    // eslint-disable-next-line @getify/proper-arrows/name
    this.reset = async () => {
      // super.reset() doesn't exist, not in the prototype
      superReset.call(this);
      this._fetchedFirstTime = false;
    };
  }

  fetchRemote = async () => {
    const remoteDocs = await this._fetchDocs();

    const drafts: GroupModel[] = [];

    while (this.length) {
      const model = this.pop();
      model?.destroy();
    }

    const initModel = (doc: any) => new this.Model(doc) as GroupModel;
    const newModelsFromRemote = remoteDocs.map(initModel);

    this.push(...newModelsFromRemote, ...drafts);

    await locations.fetchRemote();
  };

  private _fetchFirstTime = async () => {
    if (!this.id) throw new Error('Collection fetching without id');

    const requiresSync = !this.length && !this._fetchedFirstTime;
    if (
      !requiresSync ||
      !device.isOnline ||
      !userModel.isLoggedIn() ||
      this.fetching.isFetching
    )
      return null;

    console.log(`📚 Collection: ${this.id} collection fetching first time`);

    try {
      const docs = await this._fetchDocs();
      const initModel = (doc: any) => new this.Model(doc) as GroupModel;
      const models = docs.map(initModel);

      this.push(...models);

      this._fetchedFirstTime = true;
    } catch (error: any) {
      if (error.isHandled) return this;
      throw error;
    }

    return this;
  };

  private _fetchDocs = async () => {
    console.log(`📚 Collection: ${this.id} collection fetching`);
    this.fetching.isFetching = true;

    const docs = await fetchGroups({ member: true });

    this.fetching.isFetching = false;

    console.log(
      `📚 Collection: ${this.id} collection fetching done ${docs.length} documents`
    );

    return docs.map(this.Model.dto);
  };

  fetchLocations = async () => {
    console.log(`📚 Collection: ${this.id} collection fetching locations`);
    this.fetching.isFetching = true;

    const transformToLocation = (
      doc: RemoteGroupLocationAttributes
    ): [RemoteLocationAttributes, { groupId: any }] => {
      const transformedDoc = {
        id: doc.locationId,
        createdOn: doc.locationCreatedOn,
        updatedOn: doc.locationUpdatedOn,
        lat: doc.locationLat,
        lon: doc.locationLon,
        name: doc.locationName,
        locationTypeId: GROUP_SITE_TYPE,
        parentId: null,
        boundaryGeom: doc.locationBoundaryGeom,
        code: doc.locationCode,
        centroidSref: doc.locationCentroidSref,
        centroidSrefSystem: doc.locationCentroidSrefSystem,
        createdById: doc.locationCreatedById,
        updatedById: doc.locationUpdatedById,
        externalKey: doc.locationExternalKey,
        public: 'f',
      };

      const metadata = { groupId: doc.groupId };
      return [transformedDoc, metadata];
    };

    const docs = await (
      await Promise.all(this.map(({ id }) => fetchLocations(id!)))
    )
      .flat()
      .map(transformToLocation);

    this.fetching.isFetching = false;

    console.log(
      `📚 Collection: ${this.id} collection fetching locations done ${docs.length} documents`
    );

    return docs;
  };

  resetDefaults = () => {
    const destroyLocation = (location: GroupModel) => location.destroy();
    const destroyAllLocations = this.map(destroyLocation);
    return Promise.all(destroyAllLocations);
  };
}

const collection = new Groups({
  id: 'groups',
  store,
  Model: GroupModel,
});

export default collection;

import { reaction, observable, observe } from 'mobx';
import { device, Store, Collection } from '@flumens';
import {
  PROJECT_SITE_TYPE,
  RemoteAttributes as RemoteLocationAttributes,
} from 'models/location';
import userModel from 'models/user';
import ProjectModel from '../../project';
import { projectsStore as store } from '../../store';
import locations from '../locations';
import {
  fetch as fetchProjects,
  fetchLocations,
  RemoteLocationAttributes as RemoteProjectLocationAttributes,
} from './service';

type constructorOptions = {
  id: string;
  store: Store;
  Model: typeof ProjectModel;
};

export class Projects extends Collection<ProjectModel> {
  Model: typeof ProjectModel;

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
        const attachCollection = (model: ProjectModel) => {
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
    const getEmail = () => userModel.attrs.email;
    reaction(getEmail, onLoginChange);

    const superReset = this.reset;
    // eslint-disable-next-line @getify/proper-arrows/name
    this.reset = async () => {
      // super.reset() doesn't exist, not in the prototype
      superReset.call(this);
      this._fetchedFirstTime = false;
    };
  }

  fetch = async () => {
    const remoteDocs = await this._fetchDocs();

    const drafts: ProjectModel[] = [];

    while (this.length) {
      const model = this.pop();
      model?.destroy();
    }

    const initModel = (doc: any) => new this.Model(doc) as ProjectModel;
    const newModelsFromRemote = remoteDocs.map(initModel);

    this.push(...newModelsFromRemote, ...drafts);

    await locations.fetch();
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
      const initModel = (doc: any) => new this.Model(doc) as ProjectModel;
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

    const docs = await fetchProjects({ member: true });

    this.fetching.isFetching = false;

    console.log(
      `📚 Collection: ${this.id} collection fetching done ${docs.length} documents`
    );

    return docs.map(this.Model.parseRemoteJSON);
  };

  fetchLocations = async () => {
    console.log(`📚 Collection: ${this.id} collection fetching locations`);
    this.fetching.isFetching = true;

    const transformToLocation = (
      doc: RemoteProjectLocationAttributes
    ): RemoteLocationAttributes => ({
      id: doc.locationId,
      projectId: doc.projectId,
      createdOn: doc.locationCreatedOn,
      updatedOn: doc.locationUpdatedOn,
      lat: doc.locationLat,
      lon: doc.locationLon,
      name: doc.locationName,
      locationTypeId: PROJECT_SITE_TYPE,
      parentId: null,
      boundaryGeom: doc.locationBoundaryGeom,
      code: doc.locationCode,
      centroidSref: doc.locationCentroidSref,
      centroidSrefSystem: doc.locationCentroidSrefSystem,
      createdById: doc.locationCreatedById,
      updatedById: doc.locationUpdatedById,
      externalKey: doc.locationExternalKey,
      public: 'f',
    });

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
    const destroyLocation = (location: ProjectModel) => location.destroy();
    const destroyAllLocations = this.map(destroyLocation);
    return Promise.all(destroyAllLocations);
  };
}

const collection = new Projects({
  id: 'projects',
  store,
  Model: ProjectModel,
});

export default collection;

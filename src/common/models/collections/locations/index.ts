import userModel from 'models/user';
import { reaction, observable, observe } from 'mobx';
import { device, Store, Collection } from '@flumens';
import { locationsStore as store } from '../../store';
import Location from '../../location';
import fetchLocations from './service';

type constructorOptions = {
  id: string;
  store: Store;
  Model: typeof Location;
};

export class Locations extends Collection<Location> {
  Model: typeof Location;

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
        const attachCollection = (model: Location) => {
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
    const newModelsFromRemote = await this._fetch();
    const drafts: Location[] = [];

    while (this.length) {
      const model = this.pop();
      if (!model) return;

      if (model.isDraft()) {
        drafts.push(model);
      } else {
        model.destroy();
      }
    }

    this.push(...newModelsFromRemote, ...drafts);
  };

  private _fetchFirstTime = async () => {
    if (!this.id) throw new Error('Collection fetching without id');

    const requiresSync = !this.length && !this._fetchedFirstTime;
    if (
      !requiresSync ||
      !device.isOnline ||
      !userModel.attrs.email ||
      this.fetching.isFetching
    )
      return null;

    console.log(`📚 Collection: ${this.id} collection fetching first time`);

    const models = await this._fetch();
    this.push(...models);

    this._fetchedFirstTime = true;

    return this;
  };

  private _fetch = async () => {
    console.log(`📚 Collection: ${this.id} collection fetching`);
    this.fetching.isFetching = true;

    const docs = await fetchLocations();

    const initModel = (doc: any) => {
      const { Model } = this;

      const parsedDoc = Model.parseRemoteJSON(doc);

      return new Model(parsedDoc) as Location;
    };
    const models = docs.map(initModel);

    this.fetching.isFetching = false;

    console.log(
      `📚 Collection: ${this.id} collection fetching done ${models.length} documents`
    );
    return models;
  };

  resetDefaults = () => {
    const destroyLocation = (location: Location): Promise<Location> =>
      location.destroy();
    const destroyAllLocations = this.map(destroyLocation);
    return Promise.all(destroyAllLocations);
  };
}

const collection = new Locations({
  id: 'locations',
  store,
  Model: Location,
});

export default collection;

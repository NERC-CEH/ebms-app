/* eslint-disable @getify/proper-arrows/name */
/* eslint-disable prefer-spread */
import { observable, toJS, set as setMobXAttrs } from 'mobx';
import { deepObserve } from 'mobx-utils';
import Store from '@bit/flumens.apps.models.store';

/**
 * Simple object clone.
 */
const clone = (obj: any) => JSON.parse(JSON.stringify(obj));

/**
 * Generate UUID.
 */
/* eslint-disable no-bitwise, import/prefer-default-export */
export function getNewUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}
/* eslint-enable no-bitwise, import/prefer-default-export */

export interface Metadata {
  createdOn: number;
  updatedOn: number;
  syncedOn: number | null;
}

const getDefaultMetadata = (date = Date.now()): Metadata => ({
  createdOn: date,
  updatedOn: date,
  syncedOn: null,
});

export interface Options<T = any> {
  id?: string;
  cid?: string;
  attrs?: T;
  metadata?: any;
  store?: Store;
}

export interface Attrs {
  /**
   * Flag whether the model was deleted. Global and persistent models might not need this.
   */
  deleted?: boolean;
}

export default class Model {
  /**
   * Extends observable attributes.
   */
  static extendAttrs = (obj1: any, obj2: any) => {
    setMobXAttrs(obj1, { ...obj2, ...obj1 });
    return obj1;
  };

  /**
   * Remote server document ID.
   */
  id?: string;

  /**
   * Key name of the model used to save and fetch the model from.
   */
  cid: string;

  /**
   * Model persistant metadata.
   */
  metadata: Metadata;

  /**
   * Model's persistant observable attributes.
   */
  attrs: Attrs;

  /**
   * The offline store used to save and fetch the model from.
   */
  protected _store?: Store;

  /**
   * A promise to flag if the model was initialised from the store.
   */
  ready?: Promise<boolean>;

  constructor({
    id = '',
    cid = '',
    attrs = {},
    metadata = {},
    store,
  }: Options) {
    this.id = id;
    this.cid = cid || id || getNewUUID();
    this.attrs = observable(
      clone({
        deleted: false,
        ...attrs,
      })
    );

    this.metadata = observable(clone({ ...getDefaultMetadata(), ...metadata }));

    this._store = store;

    this.ready = this._fromStore();

    let isDebouncing: any;
    const debouncedSync = (...args: any) => {
      clearTimeout(isDebouncing);
      isDebouncing = setTimeout(() => this.sync.apply(this, args), 3000);
    };

    const setUpdatedTimestamp = () => {
      this.metadata.updatedOn = Date.now();
      debouncedSync();
    };
    this.ready.then(() => deepObserve(this.attrs, setUpdatedTimestamp));
  }

  /**
   * Initialize the model from store.
   */
  private async _fromStore() {
    if (!this._store) return false;

    const document = await this._store.find(this.cid);
    if (!document) {
      await this.save(); // persisting for the first time
      return true;
    }

    if (document.id) this.id = document.id; // checking presence for backwards compatibility
    if (document.cid) this.cid = document.cid; // checking presence for backwards compatibility

    setMobXAttrs(this.attrs, document.attrs);
    setMobXAttrs(this.metadata, document.metadata);

    return true;
  }

  /**
   * Save the model to the offline store.
   */
  async save() {
    if (!this._store) {
      throw new Error('Trying to save locally without a store');
    }

    await this._store.save(this.cid, this.toJSON());
    return this;
  }

  /**
   * Destroy the model and remove from the offline store.
   */
  async destroy() {
    if (!this._store) {
      throw new Error('Trying to delete locally without a store');
    }

    await this._store.destroy(this.cid);
    return this;
  }

  async sync(..._: any): Promise<this> {
    if (this._store) await this.save(); // if extended then store might be initialised in a subclass later
    return this;
  }

  /**
   * Returns a clean (no observables) JSON representation of the model.
   */
  toJSON() {
    return {
      id: this.id,
      cid: this.cid,
      metadata: toJS(this.metadata),
      attrs: toJS(this.attrs),
    };
  }
}

import Store from '@bit/flumens.apps.models.store';
import Model from '../../model';

export default class Collection<T extends Model> extends Array<T> {
  /**
   * Remote server collection ID.
   */
  id?: string;

  /**
   * Key name of tdehe collection used to save and fetch the model from locally.
   */
  cid: string;

  /**
   * The offline store used to save and fetch the model from.
   */
  protected _store?: Store;

  /**
   * A promise to flag if all the models were initialised from the store.
   */
  ready?: Promise<boolean>;

  Model?: typeof Model;

  constructor(options: {
    models?: T[];
    id?: string;
    cid?: string;
    store?: Store;
    Model?: typeof Model;
  });

  private _fromStore(): Promise<boolean>;

  remove(model: T): any; // mobx

  /**
   * Reset whole collection to empty. Does delete the local cache from store.
   */
  reset(): Promise<void>;
}

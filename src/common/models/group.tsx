import { observable } from 'mobx';
import axios, { AxiosError } from 'axios';
import { z, object } from 'zod';
import {
  validateRemoteModel,
  Model,
  ModelAttrs,
  Collection,
  UUIDv7,
} from '@flumens';
import CONFIG from 'common/config';
import LocationModel from './location';
import { locationsStore, groupsStore } from './store';
import userModel from './user';

type Metadata = {
  saved?: boolean;
};

export type RemoteAttributes = z.infer<typeof GroupModel.remoteSchema>;

type Attrs = Omit<RemoteAttributes, 'id' | 'createdAt'> & ModelAttrs;

class GroupModel extends Model<Attrs> {
  static remoteSchema = object({
    id: z.string(),
    title: z.string(),
    createdOn: z.string(),
    description: z.string().optional(),
    groupType: z.string().optional(),
    joiningMethod: z.string().optional(),
    websiteId: z.string().optional(),
    groupTypeId: z.string().optional(),
    createdById: z.string().optional(),
    /**
     * Linked location ids.
     */
    indexedLocationIds: z.array(z.number()).optional(),
  });

  static parseRemoteJSON({ id, createdOn, ...data }: RemoteAttributes) {
    return {
      id,
      cid: UUIDv7(),

      data,

      createdAt: new Date(createdOn).getTime(),
    };
  }

  collection?: Collection<GroupModel>;

  validateRemote = validateRemoteModel;

  _store = groupsStore;

  remote = observable({ synchronising: false });

  // eslint-disable-next-line
  // @ts-ignore
  metadata: Metadata = this.metadata;

  constructor(options: any) {
    const defaults = { name: '' };
    super({
      ...options,
      data: { ...defaults, ...options.data },
      store: locationsStore,
    });
  }

  destroy() {
    if (this.collection) {
      this.collection.remove(this);
    }

    return super.destroy();
  }

  async addLocation(location: LocationModel) {
    console.log('Group location uploading');

    const submission = { values: { id: location.id } };

    const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/groups/${this.id}/locations`;

    try {
      this.remote.synchronising = true;

      const token = await userModel.getAccessToken();

      const options: any = {
        url,
        method: 'post',
        headers: { Authorization: `Bearer ${token}` },
        timeout: 80000,
        data: submission,
      };

      await axios(options);

      this.remote.synchronising = false;

      console.log('Group location uploading done');
      return this;
    } catch (e: any) {
      this.remote.synchronising = false;

      const err = e as AxiosError<any>;

      if (err.response?.status === 409) {
        console.log('Location uploading duplicate was found');
        return this;
      }

      const serverMessage = err.response?.data?.message;
      if (!serverMessage) {
        throw e;
      }

      if (typeof serverMessage === 'object') {
        const getErrorMessageFromObject = (errors: any) =>
          Object.entries(errors).reduce(
            (string, val: any) => `${string}${val[0]} ${val[1]}\n`,
            ''
          );

        throw new Error(getErrorMessageFromObject(serverMessage));
      }

      throw new Error(serverMessage);
    }
  }
}

export default GroupModel;

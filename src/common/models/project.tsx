import { observable } from 'mobx';
import axios, { AxiosError } from 'axios';
import { z, object } from 'zod';
import {
  validateRemoteModel,
  Model,
  ModelMetadata,
  ModelAttrs,
  Collection,
  UUID,
} from '@flumens';
import CONFIG from 'common/config';
import LocationModel from './location';
import { locationsStore, projectsStore } from './store';
import userModel from './user';

type Metadata = ModelMetadata & {
  saved?: boolean;
};

export type RemoteAttributes = z.infer<typeof ProjectModel.remoteSchema>;

type Attrs = Omit<RemoteAttributes, 'id' | 'createdOn'> & ModelAttrs;

class ProjectModel extends Model {
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

  static parseRemoteJSON({ id, createdOn, ...attrs }: RemoteAttributes) {
    return {
      id,
      cid: UUID(),

      attrs,

      metadata: {
        createdOn: new Date(createdOn).getTime(),
      },
    };
  }

  collection?: Collection<ProjectModel>;

  validateRemote = validateRemoteModel;

  _store = projectsStore;

  remote = observable({ synchronising: false });

  // eslint-disable-next-line
  // @ts-ignore
  metadata: Metadata = this.metadata;

  // eslint-disable-next-line
  // @ts-ignore
  attrs: Attrs = Model.extendAttrs(this.attrs, {
    name: '',
  });

  constructor(options: any) {
    super({ ...options, store: locationsStore });
  }

  destroy() {
    if (this.collection) {
      this.collection.remove(this);
    }

    return super.destroy();
  }

  async addLocation(location: LocationModel) {
    console.log('Project location uploading');

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

      console.log('Project location uploading done');
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

export default ProjectModel;

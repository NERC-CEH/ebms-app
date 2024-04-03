import { observable } from 'mobx';
import { z, object } from 'zod';
import {
  validateRemoteModel,
  Model,
  ModelMetadata,
  ModelAttrs,
  Collection,
  UUID,
} from '@flumens';
import { locationsStore, projectsStore } from './store';

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
}

export default ProjectModel;

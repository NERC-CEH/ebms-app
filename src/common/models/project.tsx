import { observable } from 'mobx';
import {
  validateRemoteModel,
  Model,
  ModelMetadata,
  ModelAttrs,
  Collection,
  UUID,
} from '@flumens';
import { RemoteProject } from './collections/projects/service';
import { locationsStore, projectsStore } from './store';

type Metadata = ModelMetadata & {
  saved?: boolean;
};

interface Attrs extends ModelAttrs {
  name: string;
}

class ProjectModel extends Model {
  static parseRemoteJSON(doc: RemoteProject) {
    return {
      id: doc.id,
      cid: UUID(),

      attrs: {
        name: doc.title,
      },

      metadata: {
        createdOn: new Date(doc.created_on).getTime(),
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

import { observable } from 'mobx';
import { Capacitor } from '@capacitor/core';
import {
  Filesystem,
  Directory as FilesystemDirectory,
} from '@capacitor/filesystem';
import { MediaModel, MediaAttrs } from '@flumens';
import { isPlatform } from '@ionic/react';
import config from 'common/config';
import identifyImage from 'common/services/waarneming';
import userModel from 'models/user';
import Occurrence from './occurrence';
import Sample from './sample';

export type URL = string;

type Attrs = MediaAttrs & { species: any };

export default class Media extends MediaModel<Attrs> {
  declare parent?: Sample | Occurrence;

  identification = observable({ identifying: false });

  constructor(options: any) {
    super({
      ...options,
      url: config.backend.indicia.url,
      getAccessToken: () => userModel.getAccessToken(),
    });
  }

  async destroy(silent?: boolean) {
    console.log('MediaModel: destroying.');

    // remove from internal storage
    if (!isPlatform('hybrid')) {
      if (!this.parent) return;

      this.parent.media.remove(this);

      if (silent) return;

      this.parent.save();
    }

    const URL = this.data.data;

    try {
      if (this.data.path) {
        // backwards compatible - don't delete old media
        await Filesystem.deleteFile({
          path: URL,
          directory: FilesystemDirectory.Data,
        });
      }

      if (!this.parent) return;

      this.parent.media.remove(this);

      if (silent) return;

      this.parent.save();
    } catch (err) {
      console.error(err);
    }
  }

  getURL() {
    const { data: name, path } = this.data;

    if (
      !isPlatform('hybrid') ||
      process.env.NODE_ENV === 'test' ||
      name?.includes('http')
    ) {
      return name;
    }

    const isURL = name.startsWith('https://');
    if (isURL) return name;

    let pathToFile = config.dataPath;

    // backwards compatible
    if (!path) {
      pathToFile = config.dataPath.replace('/Documents/', '/Library/NoCloud/');
    }

    return Capacitor.convertFileSrc(`${pathToFile}/${name}`);
  }

  validateRemote() {
    return null;
  }

  doesTaxonMatchParent = () => {
    const species = this.data?.species?.[0];
    if (!species) return false;

    if (this.parent instanceof Sample)
      throw new Error(
        'Cannot use doesTaxonMatchParent with media part of samples'
      );

    const speciesId = species.warehouse_id;
    const parentTaxon = this.parent!.data?.taxon;

    return (
      speciesId === parentTaxon?.warehouse_id ||
      speciesId === parentTaxon?.preferredId
    );
  };

  async identify() {
    const hasSpeciesBeenIdentified = !!this.data.species;
    if (hasSpeciesBeenIdentified) return this.data.species[0];

    this.identification.identifying = true;

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.uploadFile();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const url = this.getRemoteURL();

      const suggestions = await identifyImage(url);

      this.data.species = suggestions;

      this.parent!.save();
    } catch (error) {
      console.error(error);
    }

    this.identification.identifying = false;

    return this.data.species?.[0];
  }
}

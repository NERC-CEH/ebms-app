import { Media, MediaAttrs } from '@flumens';
import { observable } from 'mobx';
import CONFIG from 'common/config';
import { isPlatform } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import userModel from 'models/user';
import {
  Filesystem,
  Directory as FilesystemDirectory,
} from '@capacitor/filesystem';
import identifyImage from 'common/services/waarneming';

export type URL = string;

type Attrs = MediaAttrs & { species: any };

export default class AppMedia extends Media {
  attrs: Attrs = this.attrs;

  identification = observable({ identifying: false });

  // remote: any = this.remote;

  constructor(options: any) {
    super(options);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.remote.url = `${CONFIG.backend.indicia.url}/index.php/services/rest`;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.remote.headers = async () => ({
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
    });

    this.attrs = observable(this.attrs);
  }

  async destroy(silent?: boolean) {
    console.log('MediaModel: destroying.');

    // remove from internal storage
    if (!isPlatform('hybrid')) {
      if (!this.parent) {
        return null;
      }

      this.parent.media.remove(this);

      if (silent) {
        return null;
      }

      return this.parent.save();
    }

    const URL = this.attrs.data;

    try {
      if (this.attrs.path) {
        // backwards compatible - don't delete old media
        await Filesystem.deleteFile({
          path: URL,
          directory: FilesystemDirectory.Data,
        });
      }

      if (!this.parent) {
        return null;
      }

      this.parent.media.remove(this);

      if (silent) {
        return null;
      }

      return this.parent.save();
    } catch (err) {
      console.error(err);
    }

    return null;
  }

  getURL() {
    const { data: name, path } = this.attrs;

    if (!isPlatform('hybrid') || process.env.NODE_ENV === 'test') {
      return name;
    }

    let pathToFile = CONFIG.dataPath;

    // backwards compatible
    if (!path) {
      pathToFile = CONFIG.dataPath.replace('/Documents/', '/Library/NoCloud/');
    }

    return Capacitor.convertFileSrc(`${pathToFile}/${name}`);
  }

  // eslint-disable-next-line class-methods-use-this
  validateRemote() {
    return null;
  }

  doesTaxonMatchParent = () => {
    const species = this.attrs?.species?.[0];
    if (!species) return false;

    const speciesId = species.warehouse_id;
    const parentTaxon = this.parent.attrs?.taxon;

    return (
      speciesId === parentTaxon?.warehouse_id ||
      speciesId === parentTaxon?.preferredId
    );
  };

  async identify() {
    const hasSpeciesBeenIdentified = !!this.attrs.species;
    if (hasSpeciesBeenIdentified) return this.attrs.species[0];

    this.identification.identifying = true;

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.uploadFile();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const url = this.getRemoteURL();

      const suggestions = await identifyImage(url);

      this.attrs.species = suggestions;

      this.parent.save();
    } catch (error) {
      console.error(error);
    }

    this.identification.identifying = false;

    return this.attrs.species?.[0];
  }
}

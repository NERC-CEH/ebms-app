import { Media, MediaAttrs } from '@flumens';
import axios from 'axios';
import Log from 'helpers/log';
import { observable } from 'mobx';
import CONFIG from 'common/config';
import { isPlatform } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import userModel from 'models/user';
import {
  Filesystem,
  Directory as FilesystemDirectory,
} from '@capacitor/filesystem';

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
    Log('MediaModel: destroying.');

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
      Log(err, 'e');
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
    if (!this.attrs?.species || !this.attrs?.species.length) return false;

    return (
      parseInt(this.attrs?.species[0]?.taxa_taxon_list_id, 10) ===
        this.parent.attrs?.taxon?.warehouse_id ||
      parseInt(this.attrs?.species[0]?.taxa_taxon_list_id, 10) ===
        this.parent.attrs?.taxon?.preferredId
    );
  };

  async identify() {
    const hasSpeciesBeenIdentified = !!this.attrs.species;

    if (hasSpeciesBeenIdentified) return this.attrs.species[0];

    this.identification.identifying = true;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.uploadFile();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const url = this.getRemoteURL();

    const data = new URLSearchParams({ image: url });

    const params = new URLSearchParams({
      _api_proxy_uri: 'identify-proxy/v1/?app_name=uni-jena',
    });

    const options: any = {
      method: 'post',
      params,
      // url: `${CONFIG.backend.url}/api-proxy/waarneming`,
      url: 'https://butterfly-monitoring.net/api-proxy/waarneming',
      headers: {
        Authorization: `Bearer ${await userModel.getAccessToken()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
      timeout: 80000,
    };

    try {
      const species = await axios(options);
      const withValidData = (sp: any) => sp.taxa_taxon_list_id && sp.taxon;
      const normalizeName = (sp: any) => ({
        ...sp,
        found_in_name: 'scientific_name',
      });

      this.attrs.species = species.data
        .filter(withValidData)
        .map(normalizeName);

      this.parent.save();
    } catch (error) {
      console.error(error);
    }

    this.identification.identifying = false;

    return this.attrs.species[0];
  }
}
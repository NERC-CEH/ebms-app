import { Media } from '@apps';
import axios from 'axios';
import Log from 'helpers/log';
import { observable } from 'mobx';
import CONFIG from 'config';
import { isPlatform } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import userModel from 'models/userModel';
import {
  Filesystem,
  Directory as FilesystemDirectory,
} from '@capacitor/filesystem';

export default class AppMedia extends Media {
  constructor(...args) {
    super(...args);

    this.attrs = observable({
      species: null,
      ...this.attrs,
    });

    this.identification = observable({
      identifying: false,
    });
  }

  async destroy(silent) {
    Log('MediaModel: destroying.');

    // remove from internal storage
    if (!isPlatform('hybrid') || window.testing) {
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

  async getRemoteURL() {
    const dummyPromiseTimeout = resolve => setTimeout(resolve, 300);
    await new Promise(dummyPromiseTimeout);

    this.id =
      'https://inaturalist-open-data.s3.amazonaws.com/photos/156517600/original.jpeg';
    console.log('300ms pass', this.id);
  }

  async identify() {
    this.identification.identifying = true;

    await this.getRemoteURL();

    const data = new URLSearchParams({
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeQMqyFp1wBKJG70g_pSSV0tdEo5yRESV5Ag&usqp=CAU',
    });

    const params = new URLSearchParams({
      _api_proxy_uri: 'identify-proxy/v1/?app_name=uni-jena',
    });

    const options = {
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
      const withValidData = sp => sp.taxa_taxon_list_id && sp.taxon;
      const normalizeName = sp => ({
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

    return this;
  }
}

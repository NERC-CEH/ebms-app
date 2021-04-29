import { Media } from '@apps';
import Log from 'helpers/log';
import config from 'config';
import { isPlatform } from '@ionic/react';
import { Capacitor, Plugins, FilesystemDirectory } from '@capacitor/core';

const { Filesystem } = Plugins;

export default class AppMedia extends Media {
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

    let pathToFile = config.dataPath;

    // backwards compatible
    if (!path) {
      pathToFile = config.dataPath.replace('/Documents/', '/Library/NoCloud/');
    }

    return Capacitor.convertFileSrc(`${pathToFile}/${name}`);
  }

  // eslint-disable-next-line class-methods-use-this
  validateRemote() {
    return null;
  }
}

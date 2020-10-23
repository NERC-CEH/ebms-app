/** ********************************************************************
 * Manual testing functions.
 ******************************************************************** */
import GPS from 'mock-geolocation';
import { Plugins, FilesystemDirectory } from '@capacitor/core';
import track from './track.json';

window.FilesystemDirectory = FilesystemDirectory;

const testing = {
  files: {
    ls: async (path = '', directory = FilesystemDirectory.Data) => {
      const { files } = await Plugins.Filesystem.readdir({
        path,
        directory,
      });

      const filesWithInfo = [];
      files.forEach(async file => {
        const stats = await Plugins.Filesystem.stat({
          path: file,
          directory,
        });

        filesWithInfo.push(stats);
      });

      return filesWithInfo;
    },

    cp: async (path = '', directory = FilesystemDirectory.Data) => {
      await Plugins.Filesystem.copy({
        from: path,
        to: path.split('/').pop(),
        toDirectory: directory,
      });

      return Plugins.Filesystem.stat({
        path: path.split('/').pop(),
        directory,
      });
    },

    rm: async (path = '', directory = FilesystemDirectory.Data) => {
      await Plugins.Filesystem.deleteFile({
        path,
        directory,
      });
    },
  },
};

testing.GPS = {
  mock: GPS.use,

  /**
   * GPS.update({ latitude: 1, longitude: -1, accuracy: 12 })
   *
   * @param options
   * @returns {*}
   */
  update(location) {
    if (location instanceof Array) {
      this.interval = setInterval(() => {
        if (!location.length) {
          this.stop();
          return;
        }

        const [longitude, latitude] = location.shift();

        this.update({ latitude, longitude, accuracy: 1 });
      }, 2000);
      return;
    }

    GPS.change(location);
  },

  simulate() {
    this.mock();
    this.update(track.features[0].geometry.coordinates[0]);
  },

  stop() {
    if (this.interval || this.interval === 0) {
      clearInterval(this.interval);
    }
  },
};

window.testing = testing;

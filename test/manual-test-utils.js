/** ********************************************************************
 * Manual testing functions.
 ******************************************************************** */
import GPS from 'mock-geolocation';
import {
  Filesystem,
  Directory as FilesystemDirectory,
} from '@capacitor/filesystem';
import track from './track.json';

window.FilesystemDirectory = FilesystemDirectory;
window.Filesystem = Filesystem;

const testing = {
  files: {
    ls: async (
      path = '',
      directory = FilesystemDirectory.Data,
      recursive = false
    ) => {
      try {
        const { files } = await Filesystem.readdir({
          path,
          directory,
        });

        const filesWithInfo = [];
        files.forEach(async file => {
          try {
            const stats = await Filesystem.stat({
              path: file.name,
              directory,
            });

            const name = stats.uri.split('/');
            const entry = [
              name[name.length - 1]
                ? name[name.length - 1]
                : name[name.length - 2], // 'directories can have trailing slash /
              new Intl.NumberFormat('en-US', {
                style: 'decimal',
              }).format(stats.size),
              new Date(parseInt(stats.ctime, 10)).toLocaleString(),
            ];

            if (stats.type === 'directory') {
              entry.push('dir');

              if (recursive) {
                const directoryContents = await testing.files.ls(
                  entry[0],
                  directory,
                  recursive
                );
                entry.push(directoryContents);
              }
            }

            filesWithInfo.push(entry);
          } catch (error) {
            filesWithInfo.push(file.name, error.message);
          }
        });

        return filesWithInfo;
      } catch (error) {
        return error.message;
      }
    },

    cp: async (path = '', directory = FilesystemDirectory.Data) => {
      await Filesystem.copy({
        from: path,
        to: path.split('/').pop() || '',
        toDirectory: directory,
      });

      return Filesystem.stat({
        path: path.split('/').pop() || '',
        directory,
      });
    },

    rm: async (path = '', directory = FilesystemDirectory.Data) => {
      await Filesystem.deleteFile({
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

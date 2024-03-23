/** ********************************************************************
 * Manual testing functions.
 ******************************************************************** */
import GPS from 'mock-geolocation';
import {
  Filesystem,
  Directory as FilesystemDirectory,
} from '@capacitor/filesystem';
import defaultSurvey from '../src/Survey/AreaCount/config';
import savedRecords from '../src/common/models/collections/samples';
import Media from '../src/common/models/media';
import Occurrence from '../src/common/models/occurrence';
import Sample from '../src/common/models/sample/index';
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

testing.records = {
  /**
   * Reset All Records Status
   */
  resetRecordsStatus() {
    savedRecords.getAll((getError, recordsCollection) => {
      recordsCollection.forEach(record => {
        record.metadata.saved = false;
        record.metadata.server_on = null;
        record.metadata.synced_on = null;
        record.metadata.updated_on = null;
        record.save();
      });
    });
  },

  /**
   * Add a Dummy Record.
   */
  async addDummyRecord(count = 1, imageData, testID) {
    const allWait = [];

    for (let i = 0; i < count; i++) {
      console.log(`Adding ${i + 1}`);

      // eslint-disable-next-line no-await-in-loop
      await this._addDummyRecord(1, imageData, testID);
    }

    return allWait;
  },

  async _addDummyRecord(count, imageData, testID) {
    const image = await testing.records.generateImage(imageData, testID);

    const sampleTestID = `test ${testID} - ${count}`;

    const sample = await defaultSurvey.create({
      Sample,
      image,
    });

    const randDate = new Date();
    randDate.setDate(Math.floor(Math.random() * 31));

    // sample.metadata.syncedOn = randDate.getTime();

    sample.attrs.date = randDate;
    sample.attrs.location = {
      accuracy: 1,
      gridref: 'SD79735954',
      latitude: 54.0310862,
      longitude: -2.3106393,
      name: `${sampleTestID} location`,
      source: 'map',
    };

    await sample.save();

    savedRecords.push(sample);
  },

  generateImage(imageData, testID) {
    if (!imageData) {
      // create random image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const imgData = ctx.createImageData(1000, 1000); // px

      for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = (Math.random() * 100).toFixed(0);
        imgData.data[i + 1] = (Math.random() * 100).toFixed(0);
        imgData.data[i + 2] = (Math.random() * 100).toFixed(0);
        imgData.data[i + 3] = 105;
      }
      ctx.putImageData(imgData, 0, 0);
      imageData = canvas.toDataURL('jpeg');
    }

    if (!testID) {
      testID = (Math.random() * 10).toFixed(0);
    }

    const image = new Media({
      attrs: {
        data: imageData,
        type: 'image/png',
      },
    });

    return image;
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
      }, 4000);
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

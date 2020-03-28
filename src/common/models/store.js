import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import LocalForage from 'localforage';

// create local store
let defaultConfig = {
  driverOrder: ['indexeddb', 'websql', 'localstorage'],
};

// enable SQLite
if (window.cordova) {
  defaultConfig = {
    ...defaultConfig,
    ...{
      driverOrder: [CordovaSQLiteDriver, 'indexeddb', 'websql'],
    },
  };
}

export default class Store {
  constructor(options) {
    const config = { ...defaultConfig, ...options };

    // initialize db
    this.localForage = null;
    this.ready = new Promise((resolve, reject) => {
      // check custom drivers (eg. SQLite)
      const customDriversPromise = new Promise(_resolve => {
        if (config.driverOrder && typeof config.driverOrder[0] === 'object') {
          LocalForage.defineDriver(config.driverOrder[0]).then(_resolve);
        } else {
          _resolve();
        }
      });

      if (!config.storeName) {
        throw new Error('storeName prop is missing');
      }

      // config
      customDriversPromise.then(() => {
        const dbConfig = {
          name: config.name || 'indicia',
          storeName: config.storeName,
        };

        if (config.version) {
          dbConfig.version = config.version;
        }

        const driverOrder = config.driverOrder || [
          'indexeddb',
          'websql',
          'localstorage',
        ];
        const drivers = Store._getDriverOrder(driverOrder);
        const DB = config.LocalForage || LocalForage;

        // init
        this.localForage = DB.createInstance(dbConfig);
        this.localForage
          .setDriver(drivers)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  static _getDriverOrder(driverOrder) {
    return driverOrder.map(driver => {
      switch (driver) {
        case 'indexeddb':
          return LocalForage.INDEXEDDB;
        case 'websql':
          return LocalForage.WEBSQL;
        case 'localstorage':
          return LocalForage.LOCALSTORAGE;
        default:
          // custom
          if (typeof driver === 'object' && driver._driver) {
            return driver._driver;
          }
          return console.error('No such db driver!');
      }
    });
  }

  async save(key, val) {
    await this.ready;

    if (!key) {
      throw new Error('Invalid key passed to store');
    }

    // printDiff(this.localForage, key, val); // DEVELOPMENT ONLY

    return this.localForage.setItem(key, val);
  }

  async find(key) {
    await this.ready;

    if (!key) {
      throw new Error('Invalid key passed to store');
    }

    return this.localForage.getItem(key);
  }

  async findAll() {
    await this.ready;

    // build up samples
    const models = [];
    await this.localForage.iterate(value => {
      models.push(value);
    });

    return models;
  }

  async destroy(key) {
    await this.ready;

    if (!key) {
      throw new Error('Invalid key passed to store');
    }

    return this.localForage.removeItem(key);
  }

  async destroyAll() {
    await this.ready;

    const models = await this.findAll();
    return Promise.all(models.map(model => this.destroy(model)));
  }
}

export const store = new Store({ storeName: 'generic' });
export const modelStore = new Store({ storeName: 'models' });

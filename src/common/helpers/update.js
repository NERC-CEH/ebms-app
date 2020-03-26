/** ****************************************************************************
 * App update functionality.
 **************************************************************************** */

import CONFIG from 'config';
import appModel from 'app_model';
import Log from './log';
import Analytics from './analytics';

const MIN_UPDATE_TIME = 5000; // show updating dialog for minimum seconds

/**
 * https://gist.github.com/alexey-bass/1115557
 * Simply compares left version to right one.
 *
 * Example:
 * versionCompare('1.1', '1.2') => -1
 * versionCompare('1.1', '1.1') =>  0
 * versionCompare('1.2', '1.1') =>  1
 * versionCompare('2.23.3', '2.22.3') => 1
 *
 * Returns:
 * -1 = left is LOWER than right
 *  0 = they are equal
 *  1 = left is GREATER = right is LOWER
 *  And FALSE if one of input versions are not valid
 *
 * @function
 * @param {String} left  Version #1
 * @param {String} right Version #2
 * @return {Integer|Boolean}
 * @author Alexey Bass (albass)
 * @since 2011-07-14
 */
function versionCompare(left, right) {
  if (typeof left + typeof right !== 'stringstring') {
    return false;
  }

  const a = left.split('.');
  const b = right.split('.');
  const len = Math.max(a.length, b.length);

  for (let i = 0; i < len; i++) {
    if (
      (a[i] && !b[i] && parseInt(a[i], 10) > 0) ||
      parseInt(a[i], 10) > parseInt(b[i], 10)
    ) {
      return 1;
    }
    if (
      (b[i] && !a[i] && parseInt(b[i], 10) > 0) ||
      parseInt(a[i], 10) < parseInt(b[i], 10)
    ) {
      return -1;
    }
  }

  return 0;
}

export function updateSamples(samples, callback) {
  samples.each(sample => {
    const { group } = sample.attrs;
    if (group) {
      Log('Update: moving a sample group to activity');
      sample.set('activity', group);
      sample.unset('group');
      sample.save();
    }
  });

  callback();
}

const API = {
  /**
   * Main update function.
   */
  run(callback, silent = false) {
    appModel._init.then(() => {
      const currentVersion = appModel.attrs.appVersion;

      const newVersion = CONFIG.version;
      const currentBuild = appModel.attrs.appBuild;
      const newBuild = CONFIG.build;

      // when Beta testing we set training mode
      if (currentVersion !== newVersion || currentBuild !== newBuild) {
        appModel.set('useTraining', CONFIG.training);
      }

      let savePromise = Promise.resolve();
      if (currentBuild !== newBuild) {
        appModel.set('appBuild', newBuild);
        savePromise = appModel.save();
      }

      savePromise.then(() => {
        if (currentVersion !== newVersion) {
          // TODO: check for backward downgrade
          // set new app version
          appModel.set('appVersion', newVersion);
          appModel.save().then(() => {
            // first install
            if (!currentVersion) {
              callback();
              return;
            }

            API._initApplyUpdates(currentVersion, callback, silent);
          });
          return;
        }

        callback();
      });
    });
  },

  /**
   * The sequence of updates that should take place.
   * @type {string[]}
   */
  updatesSeq: [],

  /**
   * Update functions.
   * @type {{['1.1.0']: (())}}
   */
  updates: {},

  _initApplyUpdates(currentVersion, callback, silent) {
    // find first update
    const firstUpdate = API._findFirst(API.updatesSeq, currentVersion);
    if (firstUpdate < 0) {
      return callback();
    } // no update for this version

    // hide loader
    if (navigator && navigator.splashscreen) {
      navigator.splashscreen.hide();
    }

    if (!silent) {
      // radio.trigger('app:dialog:show', {
      //   title: 'Updating',
      //   body: 'This should take only a moment...',
      //   hideAllowed: false,
      // });
    }
    const startTime = Date.now();

    // apply all updates
    return API._applyUpdates(firstUpdate, error => {
      if (error) {
        if (!silent) {
          // radio.trigger(
          //   'app:dialog:error',
          //   'Sorry, an error has occurred while updating the app'
          // );
        }
        return null;
      }

      const timeDiff = Date.now() - startTime;
      if (timeDiff < MIN_UPDATE_TIME) {
        setTimeout(() => {
          if (!silent) {
            // radio.trigger('app:dialog:hide', true);
          }
          callback();
        }, MIN_UPDATE_TIME - timeDiff);
      } else {
        if (!silent) {
          // radio.trigger('app:dialog:hide', true);
        }
        callback();
      }

      Analytics.trackEvent('App', 'updated');
      return null;
    });
  },

  /**
   * Returns the index of the first found update in sequence.
   * @param updatesSeq
   * @param currentVersion
   * @returns {number}
   * @private
   */
  _findFirst(updatesSeq = API.updatesSeq, currentVersion) {
    if (!updatesSeq.length) {
      return -1;
    }

    let firstVersion = -1;
    API.updatesSeq.some((version, index) => {
      if (versionCompare(version, currentVersion) === 1) {
        firstVersion = index;
        return true;
      }
      return null;
    });

    return firstVersion;
  },

  /**
   * Recursively apply all updates.
   * @param updateIndex
   * @param callback
   * @private
   */
  _applyUpdates(updateIndex, callback) {
    const update = API.updates[API.updatesSeq[updateIndex]];

    if (typeof update !== 'function') {
      Log('Update: error with update function.', 'e');
      return callback();
    }

    let fullRestartRequired = false;
    return update((error, _fullRestartRequired) => {
      if (error) {
        callback(error);
        return null;
      }

      if (_fullRestartRequired) {
        fullRestartRequired = true;
      }

      // check if last update
      if (API.updatesSeq.length - 1 <= updateIndex) {
        if (!fullRestartRequired) {
          return callback();
        }
        // radio.trigger('app:restart');
        return null;
      }

      API._applyUpdates(updateIndex + 1, callback);
      return null;
    });
  },
};

export default API;

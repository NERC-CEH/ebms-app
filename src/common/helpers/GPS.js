import { Plugins, Modals } from '@capacitor/core';

const { BackgroundGeolocation, Geolocation } = Plugins;

const API = {
  _watchId: null,

  _clientCallbackId: 0,

  _clientCallbacks: {
    // _clientCallbackId: onPosition
  },

  _onWatchPosition(position, err) {
    const clientCallbacks = Object.values(API._clientCallbacks);

    if (err) {
      clientCallbacks.forEach(callback => callback(err));
      return;
    }

    const location = {
      latitude: position.latitude.toFixed(8),
      longitude: position.longitude.toFixed(8),
      accuracy: parseInt(position.accuracy, 10),
      altitude: parseInt(position.altitude, 10),
      altitudeAccuracy: parseInt(position.altitudeAccuracy, 10),
    };

    clientCallbacks.forEach(callback => callback(null, location));
  },

  async _clearWatch() {
    API._clearingWatch = Geolocation.clearWatch({ id: API._watchId });

    BackgroundGeolocation.removeWatcher({
      id: API._watchId,
    });

    API._watchId = null;
  },

  async _startWatch() {
    if (API._clearingWatch) {
      await API._clearingWatch;
    }

    // const watchOptions = {
    //   enableHighAccuracy: true,
    //   maximumAge: 0,
    // };

    // const watchId = Geolocation.watchPosition(
    //   watchOptions,
    //   API._onWatchPosition
    // );

    // To start listening for changes in the device's location, add a new watcher.
    // You do this by calling 'addWatcher' with an options object and a callback. An
    // ID is returned, which can be used to remove the watcher in the future. The
    // callback will be called every time a new location is available. Watchers can
    // not be paused, only removed. Multiple watchers may exist at the same time.
    const watchId = BackgroundGeolocation.addWatcher(
      {
        // If the "backgroundMessage" option is defined, the watcher will
        // provide location updates whether the app is in the background or the
        // foreground. If it is not defined, location updates are only
        // guaranteed in the foreground. This is true on both platforms.

        // On Android, a notification must be shown to continue receiving
        // location updates in the background. This option specifies the text of
        // that notification.
        backgroundMessage: 'Cancel to prevent battery drain.',

        // The title of the notification mentioned above. Defaults to "Using
        // your location".
        backgroundTitle: 'Tracking You.',

        // Whether permissions should be requested from the user automatically,
        // if they are not already granted. Defaults to "true".
        requestPermissions: true,

        // If "true", stale locations may be delivered while the device
        // obtains a GPS fix. You are responsible for checking the "time"
        // property. If "false", locations are guaranteed to be up to date.
        // Defaults to "false".
        stale: false,

        // The minimum number of metres between subsequent locations. Defaults
        // to 0.
        // distanceFilter: 50,
      },
      function callback(location, error) {
        if (error) {
          if (error.code === 'NOT_AUTHORIZED') {
            Modals.confirm({
              title: 'Location Required',
              message:
                'This app needs your location, ' +
                'but does not have permission.\n\n' +
                'Open settings now?',
            }).then(function ({ value }) {
              if (value) {
                // It can be useful to direct the user to their device's
                // settings when location permissions have been denied.
                // The plugin provides 'openSettings' to do exactly
                // this.
                BackgroundGeolocation.openSettings();
              }
            });
          }
          return console.error(error);
        }

        return API._onWatchPosition(location);
      }
    );

    API._watchId = watchId;
  },

  start(onPosition) {
    if (typeof onPosition !== 'function') {
      throw new Error('GPS start callback is missing');
    }

    if (!API._watchId) {
      API._startWatch();
    }

    API._clientCallbackId++;

    API._clientCallbacks[API._clientCallbackId] = onPosition;

    return API._clientCallbackId;
  },

  stop(id) {
    if (!id) {
      throw new Error('GPS stop callback id is missing');
    }

    delete API._clientCallbacks[id];

    const clientCallbacks = Object.values(API._clientCallbacks);
    if (!clientCallbacks.length) {
      API._clearWatch();
    }
  },
};

export { API as default };

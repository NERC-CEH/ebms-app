import { Plugins, Modals } from '@capacitor/core';
import { isPlatform } from '@ionic/react';

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
      if (err.code === 'NOT_AUTHORIZED') {
        const openSettings = ({ value }) =>
          value && BackgroundGeolocation.openSettings();
        Modals.confirm({
          title: 'Location Required',
          message:
            'This app needs your location, ' +
            'but does not have permission.\n\n' +
            'Open settings now?',
        }).then(openSettings);
      }

      console.error(err);
      clientCallbacks.forEach(callback => callback(err));
      return;
    }

    if (!isPlatform('hybrid')) {
      position = position.coords; // eslint-disable-line
    }

    const accuracy = parseInt(position.accuracy, 10);
    const altitude = parseInt(position.altitude, 10);
    const altitudeAccuracy = parseInt(position.altitudeAccuracy, 10);

    if (accuracy > 50) return;

    const location = {
      latitude: position.latitude.toFixed(8),
      longitude: position.longitude.toFixed(8),
      accuracy,
      altitude,
      altitudeAccuracy,
    };

    clientCallbacks.forEach(callback => callback(null, location));
  },

  async _clearWatch() {
    if (!isPlatform('hybrid')) {
      Geolocation.clearWatch({ id: API._watchId });
      API._watchId = null;
      return;
    }

    BackgroundGeolocation.removeWatcher({
      id: API._watchId,
    });

    API._watchId = null;
  },

  async _startWatch() {
    if (!isPlatform('hybrid')) {
      API._watchId = Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          maximumAge: 0,
        },
        API._onWatchPosition
      );
      return;
    }

    API._watchId = BackgroundGeolocation.addWatcher(
      {
        backgroundMessage: 'Cancel to prevent battery drain.',
        requestPermissions: true,
        stale: false,
        distanceFilter: 20,
      },
      API._onWatchPosition
    );
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

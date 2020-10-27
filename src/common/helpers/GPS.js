import { Plugins } from '@capacitor/core';

const { Geolocation } = Plugins;

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
      latitude: position.coords.latitude.toFixed(8),
      longitude: position.coords.longitude.toFixed(8),
      accuracy: parseInt(position.coords.accuracy, 10),
      altitude: parseInt(position.coords.altitude, 10),
      altitudeAccuracy: parseInt(position.coords.altitudeAccuracy, 10),
    };

    clientCallbacks.forEach(callback => callback(null, location));
  },

  async _clearWatch() {
    if (API._clearingWatch) {
      await API._clearingWatch;
    }

    // Stop watching if no listeners
    const clearWait = () => {
      delete API._clearingWatch;
    };

    API._clearingWatch = Geolocation.clearWatch({ id: API._watchId })
      .then(clearWait)
      .catch(clearWait);

    API._watchId = null;
  },

  async _startWatch() {
    if (API._clearingWatch) {
      await API._clearingWatch;
    }

    const watchOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
    };

    const watchId = Geolocation.watchPosition(
      watchOptions,
      API._onWatchPosition
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

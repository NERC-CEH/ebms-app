import { Plugins } from '@capacitor/core';

const { Geolocation } = Plugins;

const API = {
  GPS_ACCURACY_LIMIT: 100, // meters

  running: false,

  start(options = {}) {
    const { callback, onUpdate } = options;
    const accuracyLimit = options.accuracyLimit || API.GPS_ACCURACY_LIMIT;

    // geolocation config
    const GPSoptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
    };

    const onPosition = (position, err) => {
      if (err) {
        callback && callback(new Error(err.message));
        return;
      }

      const location = {
        latitude: position.coords.latitude.toFixed(8),
        longitude: position.coords.longitude.toFixed(8),
        accuracy: parseInt(position.coords.accuracy, 10),
        altitude: parseInt(position.coords.altitude, 10),
        altitudeAccuracy: parseInt(position.coords.altitudeAccuracy, 10),
      };

      if (location.accuracy <= accuracyLimit) {
        callback && callback(null, location);
      } else {
        onUpdate && onUpdate(location);
      }
    };

    return Geolocation.watchPosition(GPSoptions, onPosition);
  },

  stop(id) {
    Geolocation.clearWatch({ id });
  },
};

export { API as default };

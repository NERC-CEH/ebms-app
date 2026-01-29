import i18n from 'i18next';
import {
  BackgroundGeolocationPlugin,
  CallbackError,
  Location,
} from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';
import { Geolocation, Position as CapPosition } from '@capacitor/geolocation';
import { isPlatform } from '@ionic/react';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
  'BackgroundGeolocation'
);

export const GPS_DISABLED_ERROR_MESSAGE = 'Location services are not enabled';

type Position = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  bearing: number | null;
  speed: number | null;
  time: number | null;
};

let watchId: string | null = null;

let clientCallbackId = 0;

type Callback = (err: Error | null, location?: Position) => void;

// only one watch per app, multiple clients can register callbacks
const clientCallbacks: Record<any, Callback> = {};

function onWatchPosition(
  pos: Location | CapPosition | null | undefined,
  err?: CallbackError
) {
  const callbacks = Object.values(clientCallbacks);

  if (err) {
    callbacks.forEach(callback => callback(err));
    return;
  }

  let position: Position;

  if (!isPlatform('hybrid')) {
    const p = pos as CapPosition;
    position = {
      latitude: parseFloat(p.coords.latitude.toFixed(8)),
      longitude: parseFloat(p.coords.longitude.toFixed(8)),
      accuracy: p.coords.accuracy,
      altitude: p.coords.altitude,
      altitudeAccuracy: p.coords.altitudeAccuracy ?? null,
      bearing: p.coords.heading,
      speed: p.coords.speed,
      time: p.timestamp,
    };
  } else {
    const p = pos as Location;
    position = {
      latitude: parseFloat(p.latitude.toFixed(8)),
      longitude: parseFloat(p.longitude.toFixed(8)),
      accuracy: p.accuracy,
      altitude: p.altitude,
      altitudeAccuracy: p.altitudeAccuracy,
      bearing: p.bearing,
      speed: p.speed,
      time: p.time,
    };
  }

  if (position.accuracy > 50) return;

  callbacks.forEach(callback => callback(null, position));
}

async function clearWatch() {
  if (!watchId) throw new Error('GPS watch is not started');

  !isPlatform('hybrid')
    ? await Geolocation.clearWatch({ id: watchId })
    : await BackgroundGeolocation.removeWatcher({ id: watchId });

  watchId = null;
}

async function startWatch() {
  if (!isPlatform('hybrid')) {
    watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, maximumAge: 0 },
      onWatchPosition
    );
    return;
  }

  watchId = await BackgroundGeolocation.addWatcher(
    {
      backgroundTitle: i18n.t('Using your location.'),
      backgroundMessage: i18n.t('Cancel to prevent battery drain.'),
      requestPermissions: true,
      stale: false,
    },
    onWatchPosition
  );
}

function start(onPosition: Callback) {
  if (!watchId) startWatch();

  clientCallbackId++;
  clientCallbacks[clientCallbackId] = onPosition;

  return clientCallbackId;
}

function stop(id: number) {
  if (!id) throw new Error('GPS stop callback id is missing');

  delete clientCallbacks[id];

  const callbacks = Object.values(clientCallbacks);
  if (!callbacks.length && watchId) clearWatch();
}

export default { start, stop };

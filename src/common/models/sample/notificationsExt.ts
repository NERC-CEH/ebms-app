import i18n from 'i18next';
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { hashCode } from '@flumens/utils/dist/uuid';

const COUNT_CHANNEL_ID = 'countdown';
const HIGH_IMPORTANCE = 4;
const VIBRATION_DURATION_MS = 2000;
const POLLING_INTERVAL_MS = 1000;
const WARNING_THRESHOLD_MS = 3 * 60 * 1000;

type CountdownModel = {
  cid: string;
  isTimerFinished: () => boolean;
  getTimerEndTime: () => number;
  isTimerPaused: () => boolean;
};

export type Extension = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

const hapticsVibrate = () =>
  Haptics.vibrate({ duration: VIBRATION_DURATION_MS });

const initialise = (model: CountdownModel): Extension => {
  const id = hashCode(`countdown:${model.cid}`); // Stable across reloads so finishing/deleting a restored draft cancels its alarm.
  let enabled = false;
  let exactAlarmScheduled = false;
  let requestedExactPermission = false;
  let timeoutVibrated = false;
  let below3minsVibrated = false;
  let counterId: ReturnType<typeof setInterval> | undefined;
  let pending = Promise.resolve();

  const canSchedule = () =>
    enabled &&
    !model.isTimerPaused() &&
    !model.isTimerFinished() &&
    Number.isFinite(model.getTimerEndTime()) &&
    model.getTimerEndTime() > Date.now();

  const stopPushNote = async () => {
    await LocalNotifications.cancel({ notifications: [{ id }] });
    exactAlarmScheduled = false;
  };

  // Recheck canSchedule after each await so pause, delete, or expiry cannot
  // continue into permission prompts, Android settings, or scheduling.
  const startPushNote = async () => {
    await stopPushNote();

    if (!canSchedule()) return;

    let perms = await LocalNotifications.checkPermissions();
    if (
      perms.display === 'prompt' ||
      perms.display === 'prompt-with-rationale'
    ) {
      perms = await LocalNotifications.requestPermissions();
    }
    if (perms.display !== 'granted') return;

    if (!canSchedule()) return;

    let isExactNotification = true;

    if (Capacitor.getPlatform() === 'android') {
      let exactPerms = await LocalNotifications.checkExactNotificationSetting();
      if (exactPerms.exact_alarm !== 'granted' && !requestedExactPermission) {
        requestedExactPermission = true;
        exactPerms = await LocalNotifications.changeExactNotificationSetting();
      }

      isExactNotification = exactPerms.exact_alarm === 'granted';

      if (!canSchedule()) return;

      // Omitting a custom sound keeps Android's default notification sound.
      await LocalNotifications.createChannel({
        id: COUNT_CHANNEL_ID,
        name: i18n.t('common.minCount'),
        importance: HIGH_IMPORTANCE,
        vibration: true,
      });
    }

    if (!canSchedule()) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: i18n.t('common.minCount'),
          body: i18n.t('area.timeSUp'),
          channelId: COUNT_CHANNEL_ID,
          sound: 'default',
          foreground: true,
          isExactNotification,
          schedule: {
            at: new Date(model.getTimerEndTime()),
            allowWhileIdle: true,
          },
        },
      ],
    });
    // Without exact-alarm permission, keep the on-time foreground vibration fallback.
    exactAlarmScheduled = isExactNotification;
  };

  const queuePushNote = (update: () => Promise<void>) => {
    if (!Capacitor.isNativePlatform()) return Promise.resolve();

    // Serialize native calls: a pause/delete must also cancel an in-flight schedule.
    pending = pending.then(update).catch(error => {
      exactAlarmScheduled = false;
      console.error('Could not update count notification', error);
    });

    return pending;
  };

  return {
    start() {
      console.log('SampleModel:Notifications: start.');
      clearInterval(counterId);
      enabled = true;
      const scheduling = queuePushNote(startPushNote);

      const vibrateOnThresholds = () => {
        if (model.isTimerFinished()) {
          if (timeoutVibrated) return;

          timeoutVibrated = true;
          // Leave the native alarm intact: it may be delivered just after this tick.
          clearInterval(counterId);
          counterId = undefined;

          if (Capacitor.isNativePlatform() && !exactAlarmScheduled) {
            hapticsVibrate();
          }

          return;
        }

        const timeLeft = model.getTimerEndTime() - Date.now();

        if (timeLeft <= WARNING_THRESHOLD_MS && !model.isTimerPaused()) {
          if (below3minsVibrated) return;

          below3minsVibrated = true;
          Capacitor.isNativePlatform() && hapticsVibrate();
        }
      };
      counterId = setInterval(vibrateOnThresholds, POLLING_INTERVAL_MS);

      return scheduling;
    },

    stop() {
      enabled = false;
      clearInterval(counterId);
      counterId = undefined;

      return queuePushNote(stopPushNote);
    },
  };
};

export default initialise;

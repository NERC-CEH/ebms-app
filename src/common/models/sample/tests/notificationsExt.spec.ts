/* eslint-disable @typescript-eslint/naming-convention -- Capacitor uses the external exact_alarm permission key. */
import i18n from 'i18next';
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import translations from '../../../translations/interface/en.json';
import initialise from '../notificationsExt';

jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => true),
    getPlatform: jest.fn(() => 'android'),
  },
}));

jest.mock('@capacitor/haptics', () => ({
  Haptics: { vibrate: jest.fn(() => Promise.resolve()) },
}));

jest.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    cancel: jest.fn(() => Promise.resolve()),
    checkPermissions: jest.fn(() => Promise.resolve({ display: 'granted' })),
    requestPermissions: jest.fn(() => Promise.resolve({ display: 'granted' })),
    checkExactNotificationSetting: jest.fn(() =>
      Promise.resolve({ exact_alarm: 'granted' })
    ),
    changeExactNotificationSetting: jest.fn(() =>
      Promise.resolve({ exact_alarm: 'denied' })
    ),
    createChannel: jest.fn(() => Promise.resolve()),
    schedule: jest.fn(() => Promise.resolve({ notifications: [] })),
  },
}));

const START_TIME = new Date('2026-01-01T12:00:00Z');
const COUNT_DURATION = 15 * 60 * 1000;
const PAUSE_DURATION = 60 * 1000;

const getModel = () => ({
  cid: 'count-1',
  isTimerFinished: jest.fn(() => false),
  getTimerEndTime: jest.fn(() => START_TIME.getTime() + COUNT_DURATION),
  isTimerPaused: jest.fn(() => false),
});

describe('Sample notifications', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(START_TIME);
    jest.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    jest.mocked(Capacitor.getPlatform).mockReturnValue('android');
    jest
      .mocked(LocalNotifications.checkPermissions)
      .mockResolvedValue({ display: 'granted' });
    jest
      .mocked(LocalNotifications.checkExactNotificationSetting)
      .mockResolvedValue({ exact_alarm: 'granted' });
    await i18n.init({
      lng: 'en',
      resources: { en: { translation: translations } },
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('starts an audible alarm, stops on pause, and shifts its deadline on resume', async () => {
    const model = getModel();
    const notifications = initialise(model);
    await notifications.start();
    expect(LocalNotifications.createChannel).toHaveBeenCalledWith({
      id: 'countdown',
      name: translations.common.minCount,
      importance: 4,
      vibration: true,
    });
    expect(LocalNotifications.schedule).toHaveBeenCalledWith({
      notifications: [
        expect.objectContaining({
          id: expect.any(Number),
          title: translations.common.minCount,
          body: translations.area.timeSUp,
          sound: 'default',
          foreground: true,
          channelId: 'countdown',
          schedule: {
            at: new Date(model.getTimerEndTime()),
            allowWhileIdle: true,
          },
        }),
      ],
    });
    expect(jest.getTimerCount()).toBe(1);
    const [{ id }] = jest.mocked(LocalNotifications.schedule).mock.calls[0][0]
      .notifications;

    model.isTimerPaused.mockReturnValue(true);
    await notifications.stop();
    expect(jest.getTimerCount()).toBe(0);
    expect(LocalNotifications.cancel).toHaveBeenLastCalledWith({
      notifications: [{ id }],
    });
    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);

    model.isTimerPaused.mockReturnValue(false);
    model.getTimerEndTime.mockReturnValue(
      model.getTimerEndTime() + PAUSE_DURATION
    );
    await notifications.start();
    expect(jest.getTimerCount()).toBe(1);
    expect(LocalNotifications.schedule).toHaveBeenLastCalledWith({
      notifications: [
        expect.objectContaining({
          id,
          schedule: {
            at: new Date(model.getTimerEndTime()),
            allowWhileIdle: true,
          },
        }),
      ],
    });
    await initialise(model).stop();
    expect(LocalNotifications.cancel).toHaveBeenLastCalledWith({
      notifications: [{ id }],
    });
  });

  test('iOS needs no channel and separate counts have separate stable alarm ids', async () => {
    jest.mocked(Capacitor.getPlatform).mockReturnValue('ios');
    await initialise(getModel()).start();
    await initialise({
      ...getModel(),
      cid: 'count-2',
    }).start();
    const [first, second] = jest.mocked(LocalNotifications.schedule).mock.calls;
    expect(first[0].notifications[0].id).not.toBe(
      second[0].notifications[0].id
    );
    expect(LocalNotifications.createChannel).not.toHaveBeenCalled();
  });

  test('requests permission when needed, but skips denied, expired, invalid, and browser counts', async () => {
    jest
      .mocked(LocalNotifications.checkPermissions)
      .mockResolvedValueOnce({ display: 'prompt' });
    await initialise(getModel()).start();
    expect(LocalNotifications.requestPermissions).toHaveBeenCalledTimes(1);

    jest
      .mocked(LocalNotifications.checkPermissions)
      .mockResolvedValueOnce({ display: 'denied' });
    await initialise(getModel()).start();
    const model = getModel();
    model.isTimerFinished.mockReturnValue(true);
    await initialise(model).start();
    model.isTimerFinished.mockReturnValue(false);
    model.getTimerEndTime.mockReturnValue(Number.NaN);
    await initialise(model).start();
    model.getTimerEndTime.mockReturnValue(START_TIME.getTime());
    await initialise(model).start();
    jest.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    const browserNotifications = initialise(getModel());
    await browserNotifications.start();
    jest.advanceTimersByTime(COUNT_DURATION);
    await browserNotifications.stop();
    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
    expect(Haptics.vibrate).not.toHaveBeenCalled();
  });

  test('stopping a count cancels even an in-flight native schedule and clears its timer', async () => {
    let finishSchedule!: (value: { notifications: [] }) => void;
    const scheduling = new Promise<{ notifications: [] }>(resolve => {
      finishSchedule = resolve;
    });
    let reachedSchedule!: () => void;
    const reached = new Promise<void>(resolve => {
      reachedSchedule = resolve;
    });
    jest.mocked(LocalNotifications.schedule).mockImplementationOnce(() => {
      reachedSchedule();
      return scheduling;
    });
    const notifications = initialise(getModel());
    const started = notifications.start();
    await reached;
    const stopped = notifications.stop();
    finishSchedule({ notifications: [] });
    await Promise.all([started, stopped]);
    expect(LocalNotifications.cancel).toHaveBeenCalledTimes(2);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('stopping while permission is pending prevents a late alarm', async () => {
    let grantPermission!: (value: { display: 'granted' }) => void;
    const granting = new Promise<{ display: 'granted' }>(resolve => {
      grantPermission = resolve;
    });
    let reachedPermission!: () => void;
    const reached = new Promise<void>(resolve => {
      reachedPermission = resolve;
    });
    jest
      .mocked(LocalNotifications.requestPermissions)
      .mockImplementationOnce(() => {
        reachedPermission();
        return granting;
      });
    jest
      .mocked(LocalNotifications.checkPermissions)
      .mockResolvedValueOnce({ display: 'prompt' });
    const notifications = initialise(getModel());
    const started = notifications.start();
    await reached;
    const stopped = notifications.stop();
    grantPermission({ display: 'granted' });
    await Promise.all([started, stopped]);
    expect(LocalNotifications.schedule).not.toHaveBeenCalled();
  });

  test('asks for exact alarms once and retains vibration fallback when Android denies them', async () => {
    jest
      .mocked(LocalNotifications.checkExactNotificationSetting)
      .mockResolvedValue({ exact_alarm: 'denied' });
    const model = getModel();
    const notifications = initialise(model);
    await notifications.start();
    await notifications.start();
    expect(jest.getTimerCount()).toBe(1);
    expect(
      LocalNotifications.changeExactNotificationSetting
    ).toHaveBeenCalledTimes(1);
    expect(LocalNotifications.schedule).toHaveBeenLastCalledWith({
      notifications: [expect.objectContaining({ isExactNotification: false })],
    });
    model.isTimerFinished.mockReturnValue(true);
    jest.advanceTimersByTime(1000);
    expect(Haptics.vibrate).toHaveBeenCalledTimes(1);
  });

  test('native failures are handled and allow retry', async () => {
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest
      .mocked(LocalNotifications.schedule)
      .mockRejectedValueOnce(new Error('Native error'));
    const notifications = initialise(getModel());
    await notifications.start();
    expect(errorLog).toHaveBeenCalled();
    await notifications.start();
    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(2);
    errorLog.mockRestore();
  });

  test('retains the one-time warning across pause/resume and vibrates at timeout when denied', async () => {
    jest
      .mocked(LocalNotifications.checkPermissions)
      .mockResolvedValue({ display: 'denied' });
    const model = getModel();
    model.getTimerEndTime.mockReturnValue(START_TIME.getTime() + 1000);
    const notifications = initialise(model);
    await notifications.start();
    jest.advanceTimersByTime(2000);
    expect(Haptics.vibrate).toHaveBeenCalledTimes(1);

    model.isTimerPaused.mockReturnValue(true);
    await notifications.stop();
    jest.advanceTimersByTime(PAUSE_DURATION);
    expect(Haptics.vibrate).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);

    model.isTimerPaused.mockReturnValue(false);
    model.getTimerEndTime.mockReturnValue(
      model.getTimerEndTime() + PAUSE_DURATION
    );
    await notifications.start();
    jest.advanceTimersByTime(1000);
    expect(Haptics.vibrate).toHaveBeenCalledTimes(1);

    model.isTimerFinished.mockReturnValue(true);
    jest.advanceTimersByTime(1000);
    expect(Haptics.vibrate).toHaveBeenCalledTimes(2);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('native expiry does not duplicate vibration or cancel the native alarm', async () => {
    const model = getModel();
    const notifications = initialise(model);
    await notifications.start();
    model.isTimerFinished.mockReturnValue(true);
    jest.advanceTimersByTime(1000);
    expect(Haptics.vibrate).not.toHaveBeenCalled();
    expect(LocalNotifications.cancel).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);

    // Explicit finish/delete still cancels, even after the polling timer stopped.
    await notifications.stop();
    expect(LocalNotifications.cancel).toHaveBeenCalledTimes(2);
  });
});

import { Haptics } from '@capacitor/haptics';
import initVibrateExtension from './vibrateExt';

jest.mock('@capacitor/haptics', () => ({
  Haptics: { vibrate: jest.fn(() => Promise.resolve()) },
}));

jest.mock('@ionic/react', () => ({ isPlatform: () => true }));

describe('Vibrate extension', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('vibrates once near the end and stops after timeout', () => {
    jest.useFakeTimers();
    const model = {
      isTimerFinished: jest.fn(() => false),
      getTimerEndTime: jest.fn(() => Date.now() + 1000),
      isTimerPaused: jest.fn(() => false),
    };
    const vibrate = initVibrateExtension(model);

    vibrate.start();
    jest.advanceTimersByTime(2000);

    expect(Haptics.vibrate).toHaveBeenCalledTimes(1);
    expect(vibrate.below3minsVibrated).toBe(true);

    model.isTimerFinished.mockReturnValue(true);
    jest.advanceTimersByTime(1000);

    expect(Haptics.vibrate).toHaveBeenCalledTimes(2);
    expect(vibrate.timeoutVibrated).toBe(true);
    expect(vibrate.counterId).toBeUndefined();
  });
});

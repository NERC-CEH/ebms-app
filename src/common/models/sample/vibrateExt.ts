import { observable } from 'mobx';
import { Haptics } from '@capacitor/haptics';
import { isPlatform } from '@ionic/react';

const hapticsVibrate = async () => {
  await Haptics.vibrate({ duration: 2000 });
};

type ExtensionModel = {
  isTimerFinished: () => boolean;
  getTimerEndTime: () => number;
  isTimerPaused: () => boolean;
};

export type Extension = {
  timeoutVibrated: boolean;
  below3minsVibrated: boolean;
  counterId?: ReturnType<typeof setInterval>;
  start: () => void;
  stop: () => void;
};

const initVibrateExtension = (model: ExtensionModel): Extension =>
  observable({
    timeoutVibrated: false,
    below3minsVibrated: false,
    counterId: undefined,

    start() {
      console.log('SampleModel:Vibrate: start.');

      const vibrateOnThresholds = () => {
        if (model.isTimerFinished()) {
          if (this.timeoutVibrated) return;

          console.log('SampleModel:Vibrate: vibrating!');
          this.timeoutVibrated = true;
          this.stop();

          isPlatform('hybrid') && hapticsVibrate();
          return;
        }

        const timeLeft = (model.getTimerEndTime() - Date.now()) / 60;
        const isBelow3mins = timeLeft <= 3000;
        if (isBelow3mins && !model.isTimerPaused()) {
          if (this.below3minsVibrated) return;

          console.log('SampleModel:Vibrate: vibrating!');
          this.below3minsVibrated = true;
          isPlatform('hybrid') && hapticsVibrate();
        }
      };
      this.counterId = setInterval(vibrateOnThresholds, 1000);
    },

    stop() {
      if (this.counterId === undefined) return;

      console.log('SampleModel:Vibrate: stop.');
      clearInterval(this.counterId);
      this.counterId = undefined;
    },
  } as Extension);

export default initVibrateExtension;

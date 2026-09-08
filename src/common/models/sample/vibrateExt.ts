import { Haptics } from '@capacitor/haptics';
import { isPlatform } from '@ionic/react';

const hapticsVibrate = async () => {
  await Haptics.vibrate({ duration: 2000 });
};

type ExtensionThis = {
  timeoutVibrated?: boolean;
  below3minsVibrated?: boolean;
  counterId?: ReturnType<typeof setInterval>;
  isTimerFinished: () => boolean;
  getTimerEndTime: () => number;
  isTimerPaused: () => boolean;
  stopVibrateCounter: () => void;
};

const extension = {
  startVibrateCounter(this: ExtensionThis) {
    console.log('SampleModel:Vibrate: start.');

    const vibrateOnThresholds = () => {
      if (this.isTimerFinished()) {
        if (this.timeoutVibrated) return;

        console.log('SampleModel:Vibrate: vibrating!');
        this.timeoutVibrated = true;
        this.stopVibrateCounter();

        isPlatform('hybrid') && hapticsVibrate();
        return;
      }

      const timeLeft = (this.getTimerEndTime() - Date.now()) / 60;
      const isBelow3mins = timeLeft <= 3000;
      if (isBelow3mins && !this.isTimerPaused()) {
        if (this.below3minsVibrated) return;

        console.log('SampleModel:Vibrate: vibrating!');
        this.below3minsVibrated = true;
        isPlatform('hybrid') && hapticsVibrate();
      }
    };
    this.counterId = setInterval(vibrateOnThresholds, 1000);
  },

  stopVibrateCounter(this: ExtensionThis) {
    if (this.counterId) {
      console.log('SampleModel:Vibrate: stop.');
      clearInterval(this.counterId);
    }
  },
};

export default extension;

import { Haptics } from '@capacitor/haptics';
import { isPlatform } from '@ionic/react';

const hapticsVibrate = async () => {
  await Haptics.vibrate({ duration: 2000 });
};

const extension = {
  startVibrateCounter() {
    console.log('SampleModel:Vibrate: start.');
    const that = this as any;

    const vibrateOnThresholds = () => {
      if (that.isTimerFinished()) {
        if (that._timeoutVibrated) return;

        console.log('SampleModel:Vibrate: vibrating!');
        that._timeoutVibrated = true;
        that.stopVibrateCounter();

        isPlatform('hybrid') && hapticsVibrate();
        return;
      }

      const timeLeft = (that.getTimerEndTime() - Date.now()) / 60;
      const isBelow3mins = timeLeft <= 3000;
      if (isBelow3mins && !that.isTimerPaused()) {
        if (that._below3minsVibrated) return;

        console.log('SampleModel:Vibrate: vibrating!');
        that._below3minsVibrated = true;
        isPlatform('hybrid') && hapticsVibrate();
      }
    };
    that.counterId = setInterval(vibrateOnThresholds, 1000);
  },

  stopVibrateCounter() {
    const that = this as any;

    if (that.counterId) {
      console.log('SampleModel:Vibrate: stop.');
      clearInterval(that.counterId);
    }
  },
};

export { extension as default };

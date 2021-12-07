import { isPlatform } from '@ionic/react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const hapticsImpact = async () => {
  await Haptics.impact({ style: ImpactStyle.Heavy });
};

const extension = {
  startVibrateCounter() {
    console.log('SampleModel:Vibrate: start.');

    const vibrateOnThresholds = () => {
      if (this.isTimerFinished()) {
        if (this._timeoutVibrated) return;

        console.log('SampleModel:Vibrate: vibrating!');
        this._timeoutVibrated = true;
        this.stopVibrateCounter();

        isPlatform('hybrid') && hapticsImpact();
        return;
      }

      const timeLeft = (this.getTimerEndTime() - Date.now()) / 60;
      const isBelow3mins = timeLeft <= 3000;
      if (isBelow3mins && !this.isTimerPaused()) {
        if (this._below3minsVibrated) return;

        console.log('SampleModel:Vibrate: vibrating!');
        this._below3minsVibrated = true;
        isPlatform('hybrid') && hapticsImpact();
      }
    };
    this.counterId = setInterval(vibrateOnThresholds, 1000);
  },

  stopVibrateCounter() {
    if (this.counterId) {
      console.log('SampleModel:Vibrate: stop.');
      clearInterval(this.counterId);
    }
  },
};

export { extension as default };

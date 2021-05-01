import config from 'config';
import { Plugins } from '@capacitor/core';
import { isPlatform } from '@ionic/react';

const { Haptics } = Plugins;

const extension = {
  startVibrateCounter() {
    console.log('SampleModel:Vibrate: start.');

    this.counterId = setInterval(() => {
      const startTime = new Date(this.attrs.surveyStartTime);

      const countdown =
        startTime.getTime() +
        config.DEFAULT_SURVEY_TIME +
        this.metadata.pausedTime;

      const timeLeft = (countdown - Date.now()) / 60;
      const isBelow3mins = timeLeft <= 3000;
      const isTimeout = timeLeft <= 0;

      if (isTimeout && !this._timeoutVibrated) {
        console.log('SampleModel:Vibrate: vibrating!');
        isPlatform('hybrid') && Haptics.vibrate();
        this._timeoutVibrated = true;
        this.stopVibrateCounter();
      }

      if (isBelow3mins && !this._below3minsVibrated) {
        console.log('SampleModel:Vibrate: vibrating!');
        isPlatform('hybrid') && Haptics.vibrate();
        this._below3minsVibrated = true;
      }
    }, 1000);
  },

  stopVibrateCounter() {
    if (this.counterId) {
      console.log('SampleModel:Vibrate: stop.');
      clearInterval(this.counterId);
    }
  },
};

export { extension as default };

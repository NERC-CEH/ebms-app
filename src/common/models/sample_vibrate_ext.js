import config from 'config';

const extension = {
  startVibrateCounter() {
    this.counterId = setInterval(() => {
      const startTime = new Date(this.get('surveyStartTime'));

      const countdown =
        startTime.getTime() +
        config.DEFAULT_SURVEY_TIME +
        this.metadata.pausedTime;

      const timeLeft = (countdown - Date.now()) / 60;
      const isBelow3mins = timeLeft <= 1000;
      const isTimeout = timeLeft <= 0;

      if (isTimeout && !this._timeoutVibrated) {
        navigator.vibrate(1000);
        this._timeoutVibrated = true;
        this.stopVibrateCounter();
      }
      if (isBelow3mins && !this._below3minsVibrated) {
        navigator.vibrate(1000);
        this._below3minsVibrated = true;
      }
    }, 1000);
  },

  stopVibrateCounter() {
    if (this.counterId) {
      clearInterval(this.counterId);
    }
  },
};

export { extension as default };

import React from 'react';
import PropTypes from 'prop-types';
import Countdown, { zeroPad } from 'react-countdown-now';
import { IonLabel } from '@ionic/react';

function CountdownClock({ isPaused, countdown }) {
  const CountdownRenderer = ({ minutes, seconds, completed }) => {
    if (completed) {
      return t(`Time's up!`);
    }
    return (
      <span className={minutes < 3 ? 'warn' : ''}>
        {`${zeroPad(minutes)}:${zeroPad(seconds)}`}
      </span>
    );
  };

  CountdownRenderer.propTypes = {
    minutes: PropTypes.number.isRequired,
    seconds: PropTypes.number.isRequired,
    completed: PropTypes.bool.isRequired,
  };

  return (
    <IonLabel id="countdown" slot="end">
      {isPaused ? (
        <span className="paused">{t('Paused')}</span>
      ) : (
        <Countdown date={countdown} renderer={CountdownRenderer} />
      )}
    </IonLabel>
  );
}

CountdownClock.propTypes = {
  isPaused: PropTypes.bool,
  countdown: PropTypes.number,
};

export default CountdownClock;

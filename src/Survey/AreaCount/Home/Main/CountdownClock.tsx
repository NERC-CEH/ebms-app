import Countdown, { zeroPad } from 'react-countdown-now';
import { useTranslation } from 'react-i18next';
import { IonLabel } from '@ionic/react';

type Props = {
  isPaused?: boolean;
  countdown?: string | number | Date;
};

function CountdownClock({ isPaused, countdown }: Props) {
  const { t } = useTranslation();
  const countdownRenderer = ({ minutes, seconds, completed }: any) => {
    if (completed) return t("Time's up!");

    return (
      <span className={minutes < 3 ? 'text-danger' : ''}>{`${zeroPad(
        minutes
      )}:${zeroPad(seconds)}`}</span>
    );
  };

  return (
    <IonLabel id="countdown" slot="end">
      {isPaused ? (
        <span className="text-warning">{t('Paused')}</span>
      ) : (
        <Countdown date={countdown} renderer={countdownRenderer} />
      )}
    </IonLabel>
  );
}

export default CountdownClock;

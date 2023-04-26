import { FC, useState, useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Main, Attr, InfoMessage, useAlert } from '@flumens';
import Sample from 'models/sample';
import { Trans as T } from 'react-i18next';
import { informationCircleOutline } from 'ionicons/icons';
import { NavContext, IonButton, isPlatform } from '@ionic/react';
import CompassModal from './CompassModal';
import './styles.scss';

const unsupportedDevice = (alert: any) => {
  alert({
    header: 'Unsupported device',
    message: (
      <T>
        Unfortunately, it looks like your device doesn't have the necessary
        sensor for the compass to function correctly. The compass relies on this
        sensor to detect the earth's magnetic field and determine your device's
        orientation relative to magnetic north. Thus, you will not be able to
        use compass on this device.
      </T>
    ),
    buttons: [
      {
        text: 'OK, got it',
        cssClass: 'primary',
      },
    ],
  });
};

type Props = {
  sample: Sample;
};

const Direction: FC<Props> = ({ sample }) => {
  const alert = useAlert();
  const { goBack } = useContext(NavContext);
  let rotation = 0;

  function normalizeValue(newDirection: any) {
    let newAngle;
    rotation = rotation || 0;
    newAngle = rotation % 360;

    if (newAngle < 0) {
      newAngle += 360;
    }
    if (newAngle < 180 && newDirection > newAngle + 180) {
      rotation -= 360;
    }
    if (newAngle >= 180 && newDirection <= newAngle - 180) {
      rotation += 360;
    }

    rotation += newDirection - newAngle;
    return rotation;
  }

  const [rotationValue, setRotationValue] = useState(0);
  const [startCompass, setStartCompass] = useState(false);

  const sampleConfig = sample.getSurvey();
  const { attrProps } = sampleConfig.attrs.direction.pageProps;

  const onValueChange = (directionValue: any) => {
    // eslint-disable-next-line no-param-reassign
    sample.attrs.direction = directionValue;
    sample.save();

    goBack();
  };

  const handler = (e: any) => {
    const direction = e.alpha >= 359 ? 359 : Math.round(e.alpha);

    const normalizeDirection = normalizeValue(direction);
    setRotationValue(normalizeDirection);
  };

  const addDeviceOrientationEvent = () => {
    if (
      window.DeviceOrientationEvent &&
      (DeviceOrientationEvent as any).requestPermission
    ) {
      if ('absolute' in DeviceOrientationEvent) {
        window.addEventListener('deviceorientationabsolute', handler);
      } else {
        unsupportedDevice(alert);
      }
    } else {
      unsupportedDevice(alert);
    }
  };

  useEffect(() => {
    const onStartCompass = () => {
      if (!startCompass) return;

      addDeviceOrientationEvent();
    };

    onStartCompass();

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('deviceorientationabsolute', handler);
    };
  }, [startCompass, setStartCompass]);

  const toggleModal = () => {
    if (isPlatform('ios')) {
      (DeviceOrientationEvent as any).requestPermission();
    }

    setStartCompass(!startCompass);
  };

  const showCompassModal = () => (
    <IonButton onClick={toggleModal}>
      <T>Compass</T>
    </IonButton>
  );
  return (
    <>
      <Page id="survey-area-count-detail-edit">
        {startCompass && (
          <CompassModal hideCompass={toggleModal} value={rotationValue} />
        )}
        <Header title="Direction" rightSlot={showCompassModal()} />

        <Main>
          <InfoMessage className="blue" icon={informationCircleOutline}>
            Please add the direction.
          </InfoMessage>

          <Attr
            attr="direction"
            model={sample}
            onChange={onValueChange}
            {...attrProps}
          />
        </Main>
      </Page>
    </>
  );
};

export default observer(Direction);

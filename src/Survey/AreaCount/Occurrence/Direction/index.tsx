import { useState, useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import {
  Page,
  Header,
  Main,
  Attr,
  useAlert,
  AttrPropsExtended,
  useSample,
} from '@flumens';
import { NavContext, IonButton, isPlatform } from '@ionic/react';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import CompassModal from './CompassModal';
import './styles.scss';

const unsupportedDevice = (alert: ReturnType<typeof useAlert>) => {
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

const Direction = () => {
  const alert = useAlert();
  const { goBack } = useContext(NavContext);

  const { occurrence } = useSample<Sample, Occurrence>();
  if (!occurrence) throw new Error('Occurrence is missing');

  let rotation = 0;

  function normalizeValue(newDirection: number) {
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

  const occurrenceConfig = occurrence.getSurvey();
  const attrProps = occurrenceConfig.attrs!.direction.pageProps!
    .attrProps as AttrPropsExtended;

  const onValueChange = (directionValue: number) => {
    occurrence.data.direction = directionValue;
    occurrence.save();

    goBack();
  };

  const handler = (e: DeviceOrientationEvent) => {
    if (e.alpha === null) {
      unsupportedDevice(alert);
      return;
    }

    const direction = e.alpha >= 359 ? 359 : Math.round(e.alpha);

    const normalizeDirection = normalizeValue(direction);
    setRotationValue(normalizeDirection);
  };

  type PermissionedDeviceOrientationEvent = typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<'denied' | 'granted'>;
  };
  const deviceOrientationEvent =
    window.DeviceOrientationEvent as PermissionedDeviceOrientationEvent;

  const addDeviceOrientationEvent = () => {
    if (isPlatform('android')) {
      window.addEventListener('deviceorientationabsolute', handler);
      return;
    }

    if (
      window.DeviceOrientationEvent &&
      deviceOrientationEvent.requestPermission
    ) {
      window.addEventListener('deviceorientation', handler);
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

    return () => {
      window.removeEventListener('deviceorientationabsolute', handler);
      window.removeEventListener('deviceorientation', handler);
    };
  }, [startCompass, setStartCompass]);

  const toggleModal = () => {
    if (isPlatform('ios') && deviceOrientationEvent.requestPermission) {
      deviceOrientationEvent.requestPermission();
    }

    setStartCompass(!startCompass);
  };

  const showCompassModal = () => (
    <IonButton onClick={toggleModal}>
      <T>Compass</T>
    </IonButton>
  );
  return (
    <Page id="survey-area-count-detail-edit">
      {startCompass && (
        <CompassModal hideCompass={toggleModal} value={rotationValue} />
      )}
      <Header title="Direction" rightSlot={showCompassModal()} />

      <Main className="pb-ion-s-10">
        <Attr
          attr="direction"
          model={occurrence}
          onChange={onValueChange}
          {...attrProps}
        />
      </Main>
    </Page>
  );
};

export default observer(Direction);

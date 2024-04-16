import { FC, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Header, Toggle, useAlert } from '@flumens';
import { IonTitle, IonToolbar, isPlatform } from '@ionic/react';
import GPSPermissionSubheader from 'Survey/common/GPSPermissionSubheader';
import './styles.scss';

type Props = {
  isGPSTracking: boolean;
  toggleGPStracking: any;
  isDisabled: boolean;
  isAreaShape: boolean;
  infoText: any;
};

const HeaderComponent: FC<Props> = ({
  isGPSTracking: isGPSTrackingProp,
  toggleGPStracking,
  isDisabled,
  infoText,
  isAreaShape,
}) => {
  const toggleRef = useRef<HTMLLabelElement>(null);

  const [isGPSTracking, setIsGPSTracking] = useState(isGPSTrackingProp);
  useEffect(() => {
    setIsGPSTracking(isGPSTrackingProp);
  }, [isGPSTrackingProp]);
  const alert = useAlert();

  const onToggle = (runGPS: boolean) => {
    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    if (runGPS === isGPSTracking) return;

    if (isGPSTracking && !runGPS) {
      alert({
        header: 'Warning',
        message: 'Are you sure you want to turn off the GPS tracking?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              setIsGPSTracking(true);
            },
          },
          {
            text: 'Turn off',
            cssClass: 'secondary',
            handler: () => {
              setIsGPSTracking(false);
              toggleGPStracking(false);
            },
          },
        ],
      });
      return;
    }

    if (!isGPSTracking && isAreaShape) {
      alert({
        header: 'Warning',
        message:
          'To resume the GPS tracking, you must first remove the drawn area from the map.',
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
            handler: () => setIsGPSTracking(false),
          },
        ],
      });
      return;
    }

    setIsGPSTracking(runGPS);
    toggleGPStracking(runGPS);
  };

  const GPSToggle = !isDisabled && (
    <Toggle
      ref={toggleRef}
      label="GPS"
      className="border-none bg-transparent [--form-value-color:var(--ion-color-success)] [&>div>label]:text-white"
      isSelected={isGPSTracking}
      onChange={onToggle}
      isDisabled={isDisabled}
      skipTranslation
    />
  );

  const subheader = (
    <>
      {!isDisabled && <GPSPermissionSubheader />}
      <IonToolbar id="area-edit-toolbar">
        <IonTitle size="small">{infoText}</IonTitle>
      </IonToolbar>
    </>
  );

  return <Header title="Area" rightSlot={GPSToggle} subheader={subheader} />;
};

export default observer(HeaderComponent);

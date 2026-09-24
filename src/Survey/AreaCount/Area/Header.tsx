import { useEffect, useRef, useState, type ReactNode } from 'react';
import { observer } from 'mobx-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Header, Toggle, useAlert } from '@flumens';
import { IonTitle, IonToolbar, isPlatform } from '@ionic/react';
import GPSPermissionSubheader from 'Survey/common/GPSPermissionSubheader';
import './styles.scss';

type Props = {
  isGPSTracking: boolean;
  toggleGPStracking: (state: boolean) => void;
  isDisabled: boolean;
  isAreaShape: boolean;
  infoText: ReactNode;
};

const HeaderComponent = ({
  isGPSTracking: isGPSTrackingProp,
  toggleGPStracking,
  isDisabled,
  infoText,
  isAreaShape,
}: Props) => {
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
        header: 'common.warning',
        message: 'area.confirmTurnOff',
        buttons: [
          {
            text: 'common.cancel',
            role: 'cancel',
            handler: () => {
              setIsGPSTracking(true);
            },
          },
          {
            text: 'area.turnOff',
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
        header: 'common.warning',
        message: 'area.resumeGpsTracking',
        buttons: [
          {
            text: 'common.ok',
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
      className="border-none bg-transparent [--form-value-color:var(--ion-color-success)] [&>div>div>label]:text-white"
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

  return (
    <Header title="common.area" rightSlot={GPSToggle} subheader={subheader} />
  );
};

export default observer(HeaderComponent);

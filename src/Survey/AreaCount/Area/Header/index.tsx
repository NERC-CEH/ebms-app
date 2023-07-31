import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Header, MenuAttrToggle, useAlert } from '@flumens';
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
  isGPSTracking,
  toggleGPStracking,
  isDisabled,
  infoText,
  isAreaShape,
}) => {
  const [id, rerender] = useState(0);
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
            handler: () => rerender(id + 1),
          },
          {
            text: 'Turn off',
            cssClass: 'secondary',
            handler: () => toggleGPStracking(false),
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
            handler: () => rerender(id + 1),
          },
        ],
      });
      return;
    }

    toggleGPStracking(runGPS);
  };

  const GPSToggle = !isDisabled && (
    <MenuAttrToggle
      label="GPS"
      className="survey-gps-toggle"
      value={isGPSTracking}
      onChange={onToggle}
      disabled={isDisabled}
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

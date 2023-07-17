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
  areaPretty: any;
};

const HeaderComponent: FC<Props> = ({
  isGPSTracking,
  toggleGPStracking,
  isDisabled,
  areaPretty,
}) => {
  const [id, rerender] = useState(0);
  const alert = useAlert();

  const onToggle = (on: boolean) => {
    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    if (on === isGPSTracking) {
      return;
    }

    if (isGPSTracking && !on) {
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

    toggleGPStracking(on);
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
        <IonTitle slot="start">{areaPretty}</IonTitle>
      </IonToolbar>
    </>
  );

  return <Header title="Area" rightSlot={GPSToggle} subheader={subheader} />;
};

export default observer(HeaderComponent);

import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Header, MenuAttrToggle, useAlert } from '@flumens';
import GPSPermissionSubheader from 'Survey/common/GPSPermissionSubheader';
import './styles.scss';

type Props = {
  isGPSTracking: boolean;
  toggleGPStracking: any;
  isDisabled: boolean;
};

const HeaderComponent: FC<Props> = ({
  isGPSTracking,
  toggleGPStracking,
  isDisabled,
}) => {
  const [id, rerender] = useState(0);
  const alert = useAlert();

  const onToggle = (on: boolean) => {
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
    />
  );

  const gpsPermissionSubheader = !isDisabled && <GPSPermissionSubheader />;

  return (
    <Header
      title="Area"
      rightSlot={GPSToggle}
      subheader={gpsPermissionSubheader}
    />
  );
};

export default observer(HeaderComponent);

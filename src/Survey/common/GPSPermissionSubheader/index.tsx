import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import AppModel from 'models/app';
import { Trans as T } from 'react-i18next';
import { useToast } from '@flumens/ionic/dist/hooks';
import { Geolocation } from '@capacitor/geolocation';
import './styles.scss';

type Props = {
  appModel: typeof AppModel;
};

const GPSPermissionSubheader: FC<Props> = ({ appModel }) => {
  const toast = useToast();
  const { hasGPSPermission } = appModel.attrs;

  const checkGPSPermissionStatus = () => {
    const getPermissionStatus = async () => {
      const permission = await Geolocation.checkPermissions();

      if (permission.coarseLocation === 'granted') {
        appModel.attrs.hasGPSPermission = true;
        appModel.save();
      } else {
        appModel.attrs.hasGPSPermission = false;
        appModel.save();
        toast.error(
          'Warning! GPS permissions is disabled, please turn it on manually!',
          { duration: 3000, position: 'middle' }
        );
      }
    };
    getPermissionStatus();
  };

  useEffect(checkGPSPermissionStatus);

  if (hasGPSPermission || hasGPSPermission === null) return null;

  return (
    <div className="gps-permission">
      <T>GPS permission denied</T>
    </div>
  );
};

export default observer(GPSPermissionSubheader);

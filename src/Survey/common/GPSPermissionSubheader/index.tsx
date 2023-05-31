import { useEffect, useState } from 'react';
import { IonTitle, IonToolbar } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { HandledError } from '@flumens';
import { GPS_DISABLED_ERROR_MESSAGE } from 'helpers/GPS';
import { Geolocation } from '@capacitor/geolocation';
import './styles.scss';

const GPSPermissionSubheader = () => {
  const [permission, setPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const hasPermission = async () => {
      let perm;

      try {
        perm = await Geolocation.checkPermissions();
      } catch (error: any) {
        if (error?.message === GPS_DISABLED_ERROR_MESSAGE) {
          throw new HandledError(GPS_DISABLED_ERROR_MESSAGE);
        }
      }

      if (perm?.coarseLocation === 'granted') {
        setPermission(true);
      } else {
        setPermission(false);
      }

      return null;
    };

    hasPermission();
  }, []);

  if (permission) return null;

  const permissionDisabled = permission === false;
  return (
    <>
      {permissionDisabled && (
        <IonToolbar className="gps-subheader">
          <IonTitle className="gps-permission">
            <T>Location Services (GPS) are disabled</T>
          </IonTitle>
        </IonToolbar>
      )}
    </>
  );
};

export default GPSPermissionSubheader;

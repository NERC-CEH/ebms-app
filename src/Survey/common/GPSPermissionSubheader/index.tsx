import { useEffect, useState } from 'react';
import { IonTitle, IonToolbar } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { Geolocation } from '@capacitor/geolocation';
import './styles.scss';

export const getGPSPermissionStatus = async (toast: any) => {
  const permission = await Geolocation.checkPermissions();

  if (permission.coarseLocation !== 'granted') {
    toast.warn(
      'Your Location Services (GPS) seems to be disabled. You can enable this in your device settings.',
      { duration: 3000, position: 'bottom' }
    );
  }
};

const GPSPermissionSubheader = () => {
  const [permission, setPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const hasPermission = async () => {
      const perm = await Geolocation.checkPermissions();

      if (perm.coarseLocation === 'granted') {
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

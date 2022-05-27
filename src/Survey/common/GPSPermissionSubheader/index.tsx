import { useEffect, useState } from 'react';
import { Trans as T } from 'react-i18next';
import { Geolocation } from '@capacitor/geolocation';
import './styles.scss';

export const getGPSPermissionStatus = async (toast: any) => {
  const permission = await Geolocation.checkPermissions();

  if (permission.coarseLocation !== 'granted') {
    toast.warn(
      'Warning! GPS permissions is disabled, please turn it on manually!',
      { duration: 3000, position: 'middle' }
    );
  }
};

const GPSPermissionSubheader = () => {
  const [permission, setPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const hasPermission = async () => {
      const permission = await Geolocation.checkPermissions();

      if (permission.coarseLocation === 'granted') {
        setPermission(true);
      }

      return null;
    };

    hasPermission();
  }, []);

  if (permission) return null;

  return (
    <div className="gps-permission">
      <T>GPS permission denied</T>
    </div>
  );
};

export default GPSPermissionSubheader;

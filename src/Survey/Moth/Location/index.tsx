import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Main, device, useToast, useSample } from '@flumens';
import { NavContext } from '@ionic/react';
import locations, { byType } from 'common/models/collections/locations';
import MothTrap, { LocationType, useValidateCheck } from 'models/location';
import Sample, { MothTrapLocation } from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import GPSPermissionSubheader from 'Survey/common/GPSPermissionSubheader';
import Map from './Map';

const Location = () => {
  const validateLocation = useValidateCheck();
  const checkUserStatus = useUserStatusCheck();
  const toast = useToast();
  const { navigate, goBack } = useContext(NavContext);

  const { sample } = useSample<Sample>();

  const isDisabled = sample?.isDisabled;

  const refreshMothTrapsWrap = () => {
    if (isDisabled || !userModel.isLoggedIn() || !userModel.data.verified)
      return;

    locations.fetchRemote();
  };
  useEffect(refreshMothTrapsWrap, []);

  if (!sample) return null;

  const gpsPermissionSubheader = !isDisabled && <GPSPermissionSubheader />;

  const onLocationSelect = (newTrap: MothTrap) => {
    if (isDisabled) return;
    sample.data.location = newTrap.toJSON() as any as MothTrapLocation;

    goBack();
  };

  const onLocationDelete = (location: MothTrap) => {
    location.destroy();
    locations.remove(location);
  };

  const onLocationUpload = async (location: MothTrap) => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const invalids = validateLocation(location);
    if (invalids) return;

    location.saveRemote().catch(toast.error);
  };

  const onLocationCreate = () => navigate('/location/moth-trap');

  const mothTraps = locations.filter(byType(LocationType.MothTrap));

  return (
    <Page id="moth-survey-location">
      <Header title="Moth traps" subheader={gpsPermissionSubheader} />
      <Main className="[--padding-bottom:0] [--padding-top:0]">
        <Map
          sample={sample}
          mothTraps={mothTraps}
          isFetchingTraps={locations.isSynchronising}
          isDisabled={isDisabled}
          onLocationSelect={onLocationSelect}
          onLocationDelete={onLocationDelete}
          onLocationUpload={onLocationUpload}
          onLocationCreate={onLocationCreate}
        />
      </Main>
    </Page>
  );
};

export default observer(Location);

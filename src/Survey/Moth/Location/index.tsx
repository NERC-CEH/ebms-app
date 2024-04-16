import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Main, device, useToast } from '@flumens';
import { NavContext } from '@ionic/react';
import locations, { byType } from 'common/models/collections/locations';
import MothTrap, { MOTH_TRAP_TYPE, useValidateCheck } from 'models/location';
import Sample, { MothTrapLocation } from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import GPSPermissionSubheader from 'Survey/common/GPSPermissionSubheader';
import Map from './Map';
import './styles.scss';

interface Props {
  sample: Sample;
}

const Location = ({ sample }: Props) => {
  const validateLocation = useValidateCheck();
  const checkUserStatus = useUserStatusCheck();
  const toast = useToast();
  const { navigate, goBack } = useContext(NavContext);

  const isDisabled = sample.isUploaded();

  const refreshMothTrapsWrap = () => {
    if (isDisabled || !userModel.isLoggedIn() || !userModel.attrs.verified)
      return;

    locations.fetch();
  };
  useEffect(refreshMothTrapsWrap, []);

  const gpsPermissionSubheader = !isDisabled && <GPSPermissionSubheader />;

  const onLocationSelect = (newTrap: MothTrap) => {
    if (isDisabled) return;

    // eslint-disable-next-line no-param-reassign
    sample.attrs.location = newTrap as any as MothTrapLocation;

    goBack();
  };

  const onLocationDelete = (location: MothTrap) => {
    location.destroy();
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

  const onLocationCreate = () => navigate('/location');

  const mothTraps = locations.filter(byType(MOTH_TRAP_TYPE));

  return (
    <Page id="moth-survey-location">
      <Header title="Moth traps" subheader={gpsPermissionSubheader} />
      <Main>
        <Map
          sample={sample}
          mothTraps={mothTraps}
          isFetchingTraps={locations.fetching.isFetching}
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

import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Main, device, useToast } from '@flumens';
import { NavContext } from '@ionic/react';
import locations from 'common/models/collections/locations';
import MothTrap, { useValidateCheck } from 'models/location';
import Sample from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import GPSPermissionSubheader from 'Survey/common/GPSPermissionSubheader';
import HeaderButton from 'Survey/common/HeaderButton';
import Map from './Components/Map';
import './styles.scss';

interface Props {
  sample: Sample;
}

const Location: FC<Props> = ({ sample }) => {
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

  const newTrapButton = !isDisabled && (
    <HeaderButton onClick={() => navigate('/location')}>Add</HeaderButton>
  );

  const gpsPermissionSubheader = !isDisabled && <GPSPermissionSubheader />;

  const onLocationSelect = (newTrap: MothTrap) => {
    if (isDisabled) return;

    // eslint-disable-next-line no-param-reassign
    sample.attrs.location = newTrap;

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

  return (
    <Page id="moth-survey-location">
      <Header
        title="Moth traps"
        rightSlot={newTrapButton}
        subheader={gpsPermissionSubheader}
      />
      <Main>
        <Map
          sample={sample}
          locations={locations}
          isFetchingTraps={locations.fetching.isFetching}
          isDisabled={isDisabled}
          onLocationSelect={onLocationSelect}
          onLocationDelete={onLocationDelete}
          onLocationUpload={onLocationUpload}
        />
      </Main>
    </Page>
  );
};

export default observer(Location);

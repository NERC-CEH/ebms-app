import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Page, Header, Main, device, useToast } from '@flumens';
import { IonButton, IonLabel, NavContext } from '@ionic/react';
import locations from 'common/models/collections/locations';
import MothTrap, { useValidateCheck } from 'models/location';
import Sample from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import GPSPermissionSubheader from 'Survey/common/GPSPermissionSubheader';
import Map from './Components/Map';
import './styles.scss';

interface Props {
  sample: Sample;
}

const Location: FC<Props> = ({ sample }) => {
  const validateLocation = useValidateCheck();
  const checkUserStatus = useUserStatusCheck();
  const toast = useToast();
  const { goBack } = useContext(NavContext);

  const isDisabled = sample.isUploaded();

  const refreshMothTrapsWrap = () => {
    if (isDisabled || !userModel.isLoggedIn() || !userModel.attrs.verified)
      return;

    locations.fetch();
  };
  useEffect(refreshMothTrapsWrap, []);

  const newTrapButton = !isDisabled && (
    <IonButton className="primary-button" routerLink="/location">
      <IonLabel>
        <T>Add New</T>
      </IonLabel>
    </IonButton>
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

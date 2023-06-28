import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Page, Header, Main } from '@flumens';
import { IonButton, IonLabel } from '@ionic/react';
import locations from 'common/models/collections/locations';
import Sample from 'models/sample';
import userModel from 'models/user';
import GPSPermissionSubheader from 'Survey/common/GPSPermissionSubheader';
import Map from './Components/Map';
import './styles.scss';

interface Props {
  sample: Sample;
}

const Location: FC<Props> = ({ sample }) => {
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
        />
      </Main>
    </Page>
  );
};

export default observer(Location);

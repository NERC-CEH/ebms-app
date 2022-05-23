import React, { FC, useEffect } from 'react';
import { Page, Header, Main } from '@apps';
import locations from 'common/models/collections/locations';
import { IonButton } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { observer } from 'mobx-react';
import Sample from 'models/sample';
import appModel from 'models/appModel';
import Map from './Components/Map';
import './styles.scss';

interface Props {
  sample: typeof Sample;
}

const Location: FC<Props> = ({ sample }) => {
  const isDisabled = sample.isUploaded();

  const refreshMothTrapsWrap = () => {
    !isDisabled && locations.fetch();
  };
  useEffect(refreshMothTrapsWrap, []);

  const newTrapButton = appModel.attrs.useExperiments && (
    <IonButton routerLink="/location">
      <T>Add New</T>
    </IonButton>
  );

  return (
    <Page id="moth-survey-location">
      <Header title="Moth traps" rightSlot={!isDisabled && newTrapButton} />
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

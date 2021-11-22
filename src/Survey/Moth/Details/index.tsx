import React, { FC, useContext } from 'react';
import Sample from 'models/sample';
import { observer } from 'mobx-react';
import { Page, Header, showInvalidsMessage } from '@apps';
import { IonButton, NavContext } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import Main from './Main';
import './styles.scss';

type Props = {
  sample: typeof Sample;
};

const DetailsController: FC<Props> = ({ sample }) => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();

  const onFinish = () => {
    const invalids = sample.validateRemote();

    if (invalids) {
      showInvalidsMessage(invalids);
      return;
    }

    sample.metadata.completedDetails = true; // eslint-disable-line
    sample.save();

    const url = match.url.replace('/edit', '');
    navigate(url, 'none', 'replace');
  };

  const getNextButton = sample.metadata.completedDetails ? null : (
    <IonButton onClick={onFinish}>
      <T>Next</T>
    </IonButton>
  );

  return (
    <Page id="survey-moth-detail">
      <Header title="Survey Details" rightSlot={getNextButton} />
      <Main sample={sample} />
    </Page>
  );
};

export default observer(DetailsController);

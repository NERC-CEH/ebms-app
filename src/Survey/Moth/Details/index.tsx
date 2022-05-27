import { FC, useContext, useEffect } from 'react';
import Sample, { useValidateCheck } from 'models/sample';
import { getGPSPermissionStatus } from 'Survey/common/GPSPermissionSubheader';
import { observer } from 'mobx-react';
import { Page, Header, useToast } from '@flumens';
import { IonButton, NavContext } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import Main from './Main';
import './styles.scss';

type Props = {
  sample: Sample;
};

const DetailsController: FC<Props> = ({ sample }) => {
  const isDisabled = sample.isUploaded();
  const toast = useToast();
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();
  const checkSampleStatus = useValidateCheck(sample);

  const onFinish = () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.metadata.completedDetails = true; // eslint-disable-line
    sample.save();

    const url = match.url.replace('/edit', '');

    navigate(url, 'forward', 'pop');
  };

  const checkGPSPermissionStatus = () => {
    if (isDisabled) return;

    getGPSPermissionStatus(toast);
  };

  useEffect(checkGPSPermissionStatus, []);

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

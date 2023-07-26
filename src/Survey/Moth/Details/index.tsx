import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import SunCalc from 'suncalc';
import { Page, Header } from '@flumens';
import { IonButton, NavContext, IonLabel } from '@ionic/react';
import Sample, { useValidateCheck } from 'models/sample';
import Main from './Main';
import './styles.scss';

type Props = {
  sample: Sample;
};

const DetailsController: FC<Props> = ({ sample }) => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();
  const checkSampleStatus = useValidateCheck(sample);

  const onFinish = () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.metadata.completedDetails = true; // eslint-disable-line
    sample.save();

    const url = match.url.replace('/details', '');

    navigate(url, 'forward', 'pop');
  };

  const setDefaultTime = () => {
    const { surveyStartTime } = sample.attrs;
    if (surveyStartTime) return;

    const { latitude, longitude } =
      sample.attrs.location?.attrs?.location || {};
    if (!latitude || !longitude) return;

    const nextDay = new Date(
      new Date(sample.attrs.date).setDate(
        new Date(sample.attrs.date).getDate() + 1
      )
    );

    const { sunset } = SunCalc.getTimes(
      new Date(sample.attrs.date),
      latitude,
      longitude
    );
    const { sunrise } = SunCalc.getTimes(nextDay, latitude, longitude);

    // eslint-disable-next-line no-param-reassign
    sample.attrs.surveyStartTime = new Date(sunset).toISOString(); // saugoti tik valandas
    // eslint-disable-next-line no-param-reassign
    sample.attrs.surveyEndTime = new Date(sunrise).toISOString();
    sample.save();
  };
  useEffect(setDefaultTime, [sample.attrs.location]);

  const getNextButton = sample.isDetailsComplete() ? null : (
    <IonButton
      fill="solid"
      shape="round"
      className="primary-button"
      onClick={onFinish}
      color={!sample.validateRemote() ? 'secondary' : 'medium'}
    >
      <IonLabel>
        <T>Next</T>
      </IonLabel>
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

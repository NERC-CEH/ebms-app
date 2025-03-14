import { useContext, useState } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch, useLocation } from 'react-router';
import { Page, Header, useOnBackButton, useAlert, useSample } from '@flumens';
import { IonButton, NavContext, IonButtons } from '@ionic/react';
import Sample, { useValidateCheck } from 'models/sample';
import HeaderButton from 'Survey/common/HeaderButton';
import Main from './Main';

function useDeleteSurveyPrompt(alert: any) {
  const deleteSurveyPromt = (resolve: (param: boolean) => void) => {
    alert({
      header: 'Delete Survey',
      message:
        'Warning - This will discard the survey information you have entered so far.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => resolve(false),
        },
        {
          text: 'Discard',
          role: 'destructive',
          handler: () => resolve(true),
        },
      ],
    });
  };

  const deleteSurveyPromtWrap = () => new Promise(deleteSurveyPromt);

  return deleteSurveyPromtWrap;
}

const cancelButtonWrap = (onDeleteSurvey: any) => {
  return (
    <IonButtons slot="start">
      <IonButton onClick={onDeleteSurvey}>
        <T>Cancel</T>
      </IonButton>
    </IonButtons>
  );
};

const DetailsController = () => {
  const alert = useAlert();
  const { navigate, goBack } = useContext(NavContext);
  const { url } = useRouteMatch();
  const location = useLocation();
  const [isAlertPresent, setIsAlertPresent] = useState(false);
  const shouldDeleteSurvey = useDeleteSurveyPrompt(alert);

  const { sample } = useSample<Sample>();
  if (!sample) throw new Error('Sample is missing');

  const checkSampleStatus = useValidateCheck(sample);

  const hasTimerStarted = sample?.data?.surveyStartTime;

  const onChangeCounter = (value: number | null) => {
    if (!Number.isFinite(value)) return;
    // eslint-disable-next-line no-param-reassign
    sample.data.recorders = value as number;
    sample.save();
  };

  const onChangeSensitivityStatus = (value: boolean) => {
    // eslint-disable-next-line no-param-reassign
    sample.data.privacyPrecision = value ? 0 : undefined;
    sample.save();
  };

  // Entering details/:attr page, but match still showing details page match.url.
  const isDetailsPage = url !== location.pathname;

  const onDeleteSurvey = async () => {
    if (!sample.isPreciseSingleSpeciesSurvey()) {
      goBack();
      return;
    }

    if (isAlertPresent || isDetailsPage || hasTimerStarted) {
      goBack();
      return;
    }

    setIsAlertPresent(true);

    const change = await shouldDeleteSurvey();
    if (change) {
      await sample.destroy();

      setIsAlertPresent(false);
      navigate('/home/user-surveys', 'root', 'push', undefined, {
        unmount: true,
      });
      return;
    }

    setIsAlertPresent(false);
  };
  useOnBackButton(onDeleteSurvey);

  const onStartTimer = () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    // eslint-disable-next-line no-param-reassign
    sample.data.surveyStartTime = new Date().toISOString();
    sample.startVibrateCounter();
    sample.save();

    const path = url.replace('/details', '');
    navigate(path, 'forward', 'replace');
  };

  const isInvalid = sample?.validateRemote();

  const startTimerButton = !hasTimerStarted && (
    <HeaderButton onClick={onStartTimer} isInvalid={isInvalid}>
      Start Count
    </HeaderButton>
  );

  // When deleted the sample will be missing
  if (!sample) return null;

  return (
    <Page id="survey-area-count-detail-edit">
      <Header
        title="Additional Details"
        BackButton={
          !hasTimerStarted ? () => cancelButtonWrap(onDeleteSurvey) : undefined
        }
        rightSlot={startTimerButton}
      />
      <Main
        sample={sample}
        onChangeCounter={onChangeCounter}
        onChangeSensitivityStatus={onChangeSensitivityStatus}
      />
    </Page>
  );
};

export default observer(DetailsController);

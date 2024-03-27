import { FC, useContext, useState } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch, useLocation } from 'react-router';
import { Page, Header, useOnBackButton, useAlert } from '@flumens';
import { IonButton, NavContext, IonButtons, IonLabel } from '@ionic/react';
import Sample, { useValidateCheck } from 'models/sample';
import Main from './Main';
import './styles.scss';

type Props = {
  sample: Sample;
};

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

const DetailsController: FC<Props> = ({ sample }) => {
  const alert = useAlert();
  const { navigate, goBack } = useContext(NavContext);
  const { url } = useRouteMatch();
  const location = useLocation();
  const [isAlertPresent, setIsAlertPresent] = useState(false);
  const shouldDeleteSurvey = useDeleteSurveyPrompt(alert);
  const checkSampleStatus = useValidateCheck(sample);

  const hasTimerStarted = sample.attrs.surveyStartTime;

  const onChangeCounter = (value: number) => {
    // eslint-disable-next-line no-param-reassign
    sample.attrs.recorders = value;
    sample.save();
  };

  const onChangeSensitivityStatus = (value: boolean) => {
    // eslint-disable-next-line no-param-reassign
    sample.attrs.privacyPrecision = value ? 0 : undefined;
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
    sample.attrs.surveyStartTime = new Date().toISOString();
    sample.startVibrateCounter();
    sample.save();

    const path = url.replace('/details', '');
    navigate(path, 'forward', 'replace');
  };

  const isValid = !sample.validateRemote();

  const startTimerButton = !hasTimerStarted && (
    <IonButton
      onClick={onStartTimer}
      color={isValid ? 'secondary' : 'medium'}
      fill="solid"
      shape="round"
      className="start-count-button"
    >
      <IonLabel>
        <T>Start Count</T>
      </IonLabel>
    </IonButton>
  );

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
